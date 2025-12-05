export interface CodeEditMessage {
    projectId: string;
    userId: string;
    path: string;
    content: string;
    token?: string | null;
}

export interface RunCodeRequestWS {
    projectId: string;
    userId: string;
    filename: string;
    timeoutSeconds: number;
    token: string | null;
}

export interface RunCodeBroadcastMessage {
    output: string;
    exitCode: number;
    triggeredBy: string;
}
