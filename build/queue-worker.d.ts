import { Client, QueueWorker, QueueWorkerCallback } from './api.js';
export declare class QueueWorkerImpl implements QueueWorker {
    client: Client;
    queueName: string;
    callback: QueueWorkerCallback;
    frequency: number;
    batchSize: number;
    running: boolean;
    constructor(client: Client, queueName: string, callback: QueueWorkerCallback);
    start(): void;
    stop(): void;
    private poll;
}
