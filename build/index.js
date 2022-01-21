import { NodePostgresClient } from './node-postgres-client.js';
import { QueueWorkerImpl } from './queue-worker.js';
export const createClient = (options) => {
    if (options.type === 'node-postgres') {
        return new NodePostgresClient(options.api);
    }
    throw new Error('Unsupported type: ' + options.type);
};
export const createWorker = (options) => {
    if (!options.client) {
        throw new Error('Client is required');
    }
    if (!options.queueName) {
        throw new Error('Queue name is required');
    }
    if (!options.callback) {
        throw new Error('Callback is required');
    }
    const worker = new QueueWorkerImpl(options.client, options.queueName, options.callback);
    if (options.frequency) {
        worker.frequency = options.frequency;
    }
    if (options.batchSize) {
        worker.batchSize = options.batchSize;
    }
    return worker;
};
