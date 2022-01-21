export interface CreateClient {
    (options: CreateClientOptions): Client;
}
export interface CreateClientOptions {
    type: 'node-postgres';
    api: any;
}
export interface Client {
    send: (queueName: string, messageBody: unknown, options?: MessageOptions) => Promise<void>;
    sendBatch: (queueName: string, messageBodies: unknown[], options?: MessageOptions) => Promise<void>;
    get: (queueName: string) => Promise<Message | null>;
    getBatch: (queueName: string, batchSize: number) => Promise<Message[]>;
    delete: (messageID: string) => Promise<void>;
    deleteBatch: (messageIDs: string[]) => Promise<void>;
    purgeQueue: (queueName: string) => Promise<void>;
    bootstrapDatabase: () => Promise<void>;
    resetDatabase: () => Promise<void>;
    purgeAllQueues: () => Promise<void>;
    listQueues: () => Promise<string[]>;
}
export interface MessageOptions {
    retentionPeriod?: number;
    visbilityTimeout?: number;
    maxAttempts?: number;
    priority?: number;
}
export interface Message {
    id: string;
    body: string;
}
export interface QueueStatistics {
    numberOfMessages: number;
    numberOfMessagesVisible: number;
    numberOfMessagesNotVisible: number;
}
export interface CreateWorker {
    (options: CreateWorkerOptions): QueueWorker;
}
export interface CreateWorkerOptions {
    client: Client;
    queueName: string;
    callback: QueueWorkerCallback;
    frequency?: number;
    batchSize?: number;
}
export interface QueueWorker {
    client: Client;
    queueName: string;
    frequency: number;
    batchSize: number;
    callback: QueueWorkerCallback;
    start: () => void;
    stop: () => void;
}
export declare type QueueWorkerCallback = (message: Message) => Promise<void | boolean>;
