import { randomUUIDv7} from "bun";
import type { OutgoingMessage, SignupOutgoingMessage, ValidateOutgoingMessage } from "common";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";
import WebSocket from 'ws';

const CALLBACKS: {[callbackID: string]: (data: SignupOutgoingMessage) => void} = {}

let validatorID: string | null = null;

async function main() {
    const keypair = Keypair.fromSecretKey(
        Uint8Array.from(Buffer.from(process.env.PRIVATE_KEY!, 'hex'))
    );
    const ws = new WebSocket("ws://localhost:8081");

    ws.onmessage = async (event) => {
        const data: OutgoingMessage = JSON.parse(event.data.toString());
        if (data.type === 'signup') {
            CALLBACKS[data.data.callbackID]?.(data.data)
            delete CALLBACKS[data.data.callbackID];
        } else if (data.type === 'validate') {
            await validateHandler(ws, data.data, keypair);
        }
    }

    ws.onopen = async () => {
        const callbackID = randomUUIDv7();
        CALLBACKS[callbackID] = (data: SignupOutgoingMessage) => {
            validatorID = data.validatorID;
        }
        const signedMessage = await signMessage(`Signed message for ${callbackID}, ${keypair.publicKey}`, keypair);

        ws.send(JSON.stringify({
            type: 'signup',
            data: {
                callbackID,
                ip: '127.0.0.1',
                publicKey: keypair.publicKey,
                signedMessage,
            },
        }));
    }
}

async function validateHandler(ws: WebSocket, { url, callbackID, websiteID }: ValidateOutgoingMessage, keypair: Keypair) {
    console.log(`Validating ${url}`);
    const startTime = Date.now();
    const signature = await signMessage(`Replying to ${callbackID}`, keypair);

    try {
        const response = await fetch(url);
        const endTime = Date.now();
        const latency = endTime - startTime;
        const status = response.status;

        console.log(url);
        console.log(status);
        ws.send(JSON.stringify({
            type: 'validate',
            data: {
                callbackID,
                status: status === 200 ? 'Good' : 'Bad',
                latency,
                websiteID,
                validatorID,
                signedMessage: signature,
            },
        }));
    } catch (error) {
        ws.send(JSON.stringify({
            type: 'validate',
            data: {
                callbackID,
                status:'Bad',
                latency: 1000,
                websiteID,
                validatorID,
                signedMessage: signature,
            },
        }));
        console.error(error);
    }
}

async function signMessage(message: string, keypair: Keypair) {
    const messageBytes = nacl_util.decodeUTF8(message);
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);

    return JSON.stringify(Array.from(signature));
}

main();

setInterval(async () => {

}, 10000);
