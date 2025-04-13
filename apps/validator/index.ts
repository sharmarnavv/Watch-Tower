import { randomUUIDv7} from "bun";
import type { OutgoingMessage, SignupOutgoingMessage, ValidateOutgoingMessage } from "common";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";
import WebSocket  from "ws";
import * as bs58 from "bs58";

const CALLBACKS: {[callbackID: string]: (data: SignupOutgoingMessage) => void} = {}

let validatorID: string | null = null;

async function main() {
    if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY environment variable is required');
    }

    try {
        const secretKey = bs58.default.decode(process.env.PRIVATE_KEY!.trim());
        const keypair = Keypair.fromSecretKey(secretKey);
        console.log("Public key:", keypair.publicKey.toBase58());
        
        const ws = new WebSocket("ws://localhost:8081");

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            // Implement reconnection logic if needed
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
            // Implement reconnection logic if needed
            setTimeout(() => main(), 5000); // Reconnect after 5 seconds
        };

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
    } catch (error) {
        console.error("Error decoding private key:", error);
    }
}

async function validateHandler(ws: WebSocket, { url, callbackID, websiteID }: ValidateOutgoingMessage, keypair: Keypair) {
    console.log(`Validating ${url} for website ${websiteID}`);
    const startTime = Date.now();
    const signature = await signMessage(`Replying to ${callbackID}`, keypair);

    try {
        const response = await fetch(url);
        const endTime = Date.now();
        const latency = endTime - startTime;
        const status = response.status;

        ws.send(JSON.stringify({
            type: 'validate',
            data: {
                callbackID,
                status: status === 200 ? 'UP' : 'DOWN',
                latency,
                validatorID,
                websiteID,  // Include websiteID in response
                signedMessage: signature,
            },
        }));
    } catch (error) {
        ws.send(JSON.stringify({
            type: 'validate',
            data: {
                callbackID,
                status: 'DOWN',
                latency: 1000,
                validatorID,
                websiteID,  // Include websiteID in response
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

// Remove this or implement needed functionality
setInterval(async () => {
}, 10000);
