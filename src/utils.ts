import crypto from 'crypto'

export function generateUUID() {
  return crypto.randomBytes(16).toString('hex')
}

export function serializeMessageBody(messageBody: unknown): string {
  if (!messageBody) {
    return ''
  }
  if (typeof messageBody === 'string') {
    return messageBody
  }
  if (typeof messageBody === 'number' || typeof messageBody === 'boolean') {
    return messageBody.toString()
  }
  if (typeof messageBody === 'function') {
    throw new Error('Message body cannot be a function')
  }
  return JSON.stringify(messageBody)
}

export async function sleep(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1_000))
}
