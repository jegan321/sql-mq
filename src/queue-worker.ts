import { Client, QueueWorker, QueueWorkerCallback } from './api.js'
import { sleep } from './utils.js'

const DEFAULT_FREQUENCY = 1
const DEFAULT_BATCH_SIZE = 1

export class QueueWorkerImpl implements QueueWorker {
  client: Client
  queueName: string
  callback: QueueWorkerCallback
  frequency: number
  batchSize: number

  running: boolean = false

  constructor(client: Client, queueName: string, callback: QueueWorkerCallback) {
    this.client = client
    this.queueName = queueName
    this.callback = callback
    this.frequency = DEFAULT_FREQUENCY
    this.batchSize = DEFAULT_BATCH_SIZE
  }

  start() {
    this.running = true
    setImmediate(() => {
      this.poll()
    })
  }

  stop() {
    this.running = false
  }

  private async poll() {
    while (this.running) {
      const messages = await this.client.getBatch(this.queueName, this.batchSize)
      if (messages.length) {
        for (const message of messages) {
          const result = await this.callback(message)
          if (result !== false) {
            await this.client.delete(message.id)
          }
        }
      } else {
        await sleep(this.frequency)
      }
    }
  }
}
