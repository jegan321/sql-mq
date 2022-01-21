var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { sleep } from './utils.js';
const DEFAULT_FREQUENCY = 1;
const DEFAULT_BATCH_SIZE = 1;
export class QueueWorkerImpl {
    constructor(client, queueName, callback) {
        this.running = false;
        this.client = client;
        this.queueName = queueName;
        this.callback = callback;
        this.frequency = DEFAULT_FREQUENCY;
        this.batchSize = DEFAULT_BATCH_SIZE;
    }
    start() {
        this.running = true;
        setImmediate(() => {
            this.poll();
        });
    }
    stop() {
        this.running = false;
    }
    poll() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.running) {
                const messages = yield this.client.getBatch(this.queueName, this.batchSize);
                if (messages.length) {
                    for (const message of messages) {
                        const result = yield this.callback(message);
                        if (result !== false) {
                            yield this.client.delete(message.id);
                        }
                    }
                }
                else {
                    yield sleep(this.frequency);
                }
            }
        });
    }
}
