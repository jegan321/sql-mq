var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BEGIN_SQL, COMMIT_SQL, CREATE_MESSAGES_TABLE_SQL, CREATE_SCHEMA_SQL, DELETE_MESSAGE_SQL, DROP_SCHEMA_SQL, GET_MESSAGES_SQL, LIST_QUEUES_SQL, MESSAGES_TABLE, MESSAGES_VIEW, PURGE_ALL_QUEUES_SQL, PURGE_QUEUE_SQL, QUEUES_VIEW } from './sql.js';
import { generateUUID, serializeMessageBody } from './utils.js';
export class NodePostgresClient {
    constructor(connector) {
        this.api = connector;
    }
    bootstrapDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.api.query(CREATE_SCHEMA_SQL);
            yield this.api.query(CREATE_MESSAGES_TABLE_SQL);
            yield this.api.query(MESSAGES_VIEW);
            yield this.api.query(QUEUES_VIEW);
        });
    }
    resetDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.api.query(DROP_SCHEMA_SQL);
            yield this.bootstrapDatabase();
        });
    }
    send(queueName, messageBody, messageOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                id: generateUUID(),
                queue_name: queueName,
                body: serializeMessageBody(messageBody),
                visibility_timeout: messageOptions === null || messageOptions === void 0 ? void 0 : messageOptions.visbilityTimeout,
                max_attempts: messageOptions === null || messageOptions === void 0 ? void 0 : messageOptions.maxAttempts,
                priority: messageOptions === null || messageOptions === void 0 ? void 0 : messageOptions.priority
            };
            const columnList = [];
            const valueList = [];
            for (const [key, val] of Object.entries(data)) {
                if (val) {
                    columnList.push(key);
                    valueList.push(val);
                }
            }
            const sql = `
        insert into ${MESSAGES_TABLE} (${columnList.join(',')})
        values (${valueList.map((v, i) => `$${i + 1}`).join(', ')})
    `;
            yield this.api.query(sql, valueList);
        });
    }
    sendBatch(queueName, messageBodies, messageOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Optimize to use one statement
            for (const body of messageBodies) {
                this.send(queueName, body, messageOptions);
            }
        });
    }
    get(queueName) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield this.getBatch(queueName, 1);
            if (messages.length) {
                return messages[0];
            }
            else {
                return null;
            }
        });
    }
    getBatch(queueName, batchSize) {
        return __awaiter(this, void 0, void 0, function* () {
            if (batchSize < 1) {
                throw new Error('Batch size cannot be less than 1');
            }
            const rows = yield this.queryWithTransaction(GET_MESSAGES_SQL, [batchSize, queueName]);
            return rows.map(row => {
                return {
                    id: row.id,
                    body: row.body,
                    visibilityTimeout: row.visibility_timeout,
                    maxAttempts: row.max_attempts,
                    priority: row.priority,
                    attempts: row.attempts + 1
                };
            });
        });
    }
    delete(messageID) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.api.query(DELETE_MESSAGE_SQL, [messageID]);
        });
    }
    deleteBatch(messageIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Optimize to use one statement
            for (const messageID of messageIDs) {
                this.delete(messageID);
            }
        });
    }
    listQueues() {
        return __awaiter(this, void 0, void 0, function* () {
            const rs = yield this.api.query(LIST_QUEUES_SQL);
            return rs.rows.map(row => row.queue_name);
        });
    }
    purgeQueue(queueName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.api.query(PURGE_QUEUE_SQL, [queueName]);
        });
    }
    purgeAllQueues() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.api.query(PURGE_ALL_QUEUES_SQL);
        });
    }
    queryWithTransaction(query, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.api.query(BEGIN_SQL);
            const rs = yield this.api.query(query, params);
            const rows = rs.rows;
            yield this.api.query(COMMIT_SQL);
            return rows;
        });
    }
}
