import Postgres from 'pg';
import { Client, Message, MessageOptions } from './api.js';
declare type PostgresAPI = Postgres.Pool | Postgres.Client;
export declare class NodePostgresClient implements Client {
    api: PostgresAPI;
    constructor(connector: PostgresAPI);
    bootstrapDatabase(): Promise<void>;
    resetDatabase(): Promise<void>;
    send(queueName: string, messageBody: unknown, messageOptions?: MessageOptions): Promise<void>;
    sendBatch(queueName: string, messageBodies: unknown[], messageOptions?: MessageOptions): Promise<void>;
    get(queueName: string): Promise<Message | null>;
    getBatch(queueName: string, batchSize: number): Promise<Message[]>;
    delete(messageID: string): Promise<void>;
    deleteBatch(messageIDs: string[]): Promise<void>;
    listQueues(): Promise<string[]>;
    purgeQueue(queueName: string): Promise<void>;
    purgeAllQueues(): Promise<void>;
    queryWithTransaction(query: string, params: unknown[]): Promise<any[]>;
}
export {};
