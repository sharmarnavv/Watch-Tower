export interface SignupIncomingMessage {
    ip: string;
    publicKey: string;
    signedMessage: string;
    callbackID: string;
}

export interface ValidateIncomingMessage {
    callbackID: string;
    signedMessage: string;
    status: 'UP' | 'DOWN';
    latency: number;
    websiteID: string;
    validatorID: string;
}

export interface SignupOutgoingMessage {
    validatorID: string;
    callbackID: string
}

export interface ValidateOutgoingMessage {
    url: string;
    callbackID: string;
    websiteID: string;
}


export type IncomingMessage = {
    type : 'Signup',
    data : SignupIncomingMessage
} | {
    type : 'Validate',
    data : ValidateIncomingMessage
}

export type OutgoingMessage = { 
    type : 'signup',
    data : SignupOutgoingMessage
} | {
    type : 'validate',
    data : ValidateOutgoingMessage
}