import { randomUUIDv7, type ServerWebSocket } from "bun";
import type { IncomingMessage, SignupIncomingMessage } from "common";
import { prismaClient } from '../../packages/db/src/index';
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";

const availableValidators: Array<{
    validatorID: string;
    socket: ServerWebSocket<unknown>;
    publicKey: string;
}> = [];

const callbacks: {
    [callbackID: string]: (data: IncomingMessage) => void;
} = {};
const COST_PER_VALIDATION = 100 //in lamports

Bun.serve({
    fetch(req, server) {
        if (server.upgrade(req)) {
            return;
        }
        return new Response("Upgrade failed", { status: 500 });  //The browser does not support websockets
    },
    port: 8081,
    websocket: {
        async message(ws: ServerWebSocket<unknown>, message: string) {
            const data: IncomingMessage = JSON.parse(message);
            if (data.type === "Signup") {
                const verified = await verifyMessage(
                    `Signed message for ${data.data.callbackID}, ${data.data.publicKey}`,
                    data.data.publicKey,
                    data.data.signedMessage
                );
                if (verified) {
                    await signupHandler(ws, data.data);
                }
            } else if (data.type === 'Validate') {
                callbacks[data.data.callbackID]?.(data);
                delete callbacks[data.data.callbackID];
            }
        },
        async close(ws: ServerWebSocket<unknown>) {
            availableValidators.splice(availableValidators.findIndex(v => v.socket === ws), 1);
        }
    },
});

async function signupHandler(ws: ServerWebSocket<unknown>, { ip, publicKey, signedMessage, callbackID }: SignupIncomingMessage) {
    const validatorDb = await prismaClient.validator.findFirst({
        where: {
            publicKey,
        },
    });

    if (validatorDb) {
        ws.send(JSON.stringify({
            type: 'signup',
            data: {
                validatorID: validatorDb.id,
                callbackID,
            },
        }));

        availableValidators.push({
            validatorID: validatorDb.id,
            socket: ws,
            publicKey: validatorDb.publicKey,
        });
        return;
    }
    
    //TODO: Given the ip, return the location
    const validator = await prismaClient.validator.create({
        data: {
            ip,
            publicKey,
            location: 'unknown',
        },
    });

    ws.send(JSON.stringify({
        type: 'signup',
        data: {
            validatorID: validator.id,
            callbackID,
        },
    }));

    availableValidators.push({
        validatorID: validator.id,
        socket: ws,
        publicKey: validator.publicKey,
    });
}

async function verifyMessage(message: string, publicKey: string, signature: string) {
    const messageBytes = nacl_util.decodeUTF8(message);
    const result = nacl.sign.detached.verify(
        messageBytes,
        new Uint8Array(JSON.parse(signature)),
        new PublicKey(publicKey).toBytes(),
    );

    return result;
}

setInterval(async () => {
    const websitesToMonitor = await prismaClient.website.findMany({
        where: {
            disabled: false,
        },
    });

    for (const website of websitesToMonitor) {
        availableValidators.forEach(validator => {
            const callbackID = randomUUIDv7();
            console.log(`Sending validate to ${validator.validatorID} ${website.url}`);
            validator.socket.send(JSON.stringify({
                type: 'validate',
                data: {
                    url: website.url,
                    callbackID
                },
            }));

            callbacks[callbackID] = async (data: IncomingMessage) => {
                if (data.type === 'Validate') {
                    const { validatorID, status, latency, signedMessage } = data.data;
                    const verified = await verifyMessage(
                        `Replying to ${callbackID}`,
                        validator.publicKey,
                        signedMessage
                    );
                    if (!verified) {
                        return;
                    }

                    await prismaClient.$transaction(async (tx) => {
                        await tx.websiteTick.create({
                            data: {
                                websiteID: website.id,
                                validatorID,
                                status,
                                latency,
                                createdAt: new Date(),
                            },
                        });

                        await tx.validator.update({
                            where: { id: validatorID },
                            data: {
                                pendingPayouts: { increment: COST_PER_VALIDATION }
                            },
                        });
                    });
                }
            };
        });
    }
}, 60 * 1000);
