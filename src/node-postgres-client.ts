import Postgres from 'pg'
import { Client, Message, MessageOptions } from './api.js'
import {
  BEGIN_SQL,
  COMMIT_SQL,
  CREATE_MESSAGES_TABLE_SQL,
  CREATE_SCHEMA_SQL,
  DELETE_MESSAGE_SQL,
  DROP_SCHEMA_SQL,
  GET_MESSAGES_SQL,
  LIST_QUEUES_SQL,
  MESSAGES_TABLE,
  MESSAGES_VIEW,
  PURGE_ALL_QUEUES_SQL,
  PURGE_QUEUE_SQL,
  QUEUES_VIEW
} from './sql.js'
import { generateUUID, serializeMessageBody } from './utils.js'

type PostgresAPI = Postgres.Pool | Postgres.Client

export class NodePostgresClient implements Client {
  api: PostgresAPI

  constructor(connector: PostgresAPI) {
    this.api = connector
  }

  async bootstrapDatabase() {
    await this.api.query(CREATE_SCHEMA_SQL)
    await this.api.query(CREATE_MESSAGES_TABLE_SQL)
    await this.api.query(MESSAGES_VIEW)
    await this.api.query(QUEUES_VIEW)
  }

  async resetDatabase() {
    await this.api.query(DROP_SCHEMA_SQL)
    await this.bootstrapDatabase()
  }

  async send(queueName: string, messageBody: unknown, messageOptions?: MessageOptions) {
    const data = {
      id: generateUUID(),
      queue_name: queueName,
      body: serializeMessageBody(messageBody),
      visibility_timeout: messageOptions?.visbilityTimeout,
      max_attempts: messageOptions?.maxAttempts,
      priority: messageOptions?.priority
    }
    const columnList: string[] = []
    const valueList: unknown[] = []
    for (const [key, val] of Object.entries(data)) {
      if (val) {
        columnList.push(key)
        valueList.push(val)
      }
    }
    const sql = `
        insert into ${MESSAGES_TABLE} (${columnList.join(',')})
        values (${valueList.map((v, i) => `$${i + 1}`).join(', ')})
    `
    await this.api.query(sql, valueList)
  }

  async sendBatch(queueName: string, messageBodies: unknown[], messageOptions?: MessageOptions) {
    // TODO: Optimize to use one statement
    for (const body of messageBodies) {
      this.send(queueName, body, messageOptions)
    }
  }

  async get(queueName: string): Promise<Message | null> {
    const messages = await this.getBatch(queueName, 1)
    if (messages.length) {
      return messages[0]
    } else {
      return null
    }
  }

  async getBatch(queueName: string, batchSize: number): Promise<Message[]> {
    if (batchSize < 1) {
      throw new Error('Batch size cannot be less than 1')
    }
    const rows = await this.queryWithTransaction(GET_MESSAGES_SQL, [batchSize, queueName])
    return rows.map(row => {
      return {
        id: row.id,
        body: row.body,
        visibilityTimeout: row.visibility_timeout,
        maxAttempts: row.max_attempts,
        priority: row.priority,
        attempts: row.attempts + 1
      }
    })
  }

  async delete(messageID: string) {
    await this.api.query(DELETE_MESSAGE_SQL, [messageID])
  }

  async deleteBatch(messageIDs: string[]) {
    // TODO: Optimize to use one statement
    for (const messageID of messageIDs) {
      this.delete(messageID)
    }
  }

  async listQueues(): Promise<string[]> {
    const rs = await this.api.query(LIST_QUEUES_SQL)
    return rs.rows.map(row => row.queue_name)
  }

  async purgeQueue(queueName: string) {
    await this.api.query(PURGE_QUEUE_SQL, [queueName])
  }

  async purgeAllQueues() {
    await this.api.query(PURGE_ALL_QUEUES_SQL)
  }

  async queryWithTransaction(query: string, params: unknown[]) {
    await this.api.query(BEGIN_SQL)

    const rs = await this.api.query(query, params)
    const rows = rs.rows

    await this.api.query(COMMIT_SQL)

    return rows
  }
}
