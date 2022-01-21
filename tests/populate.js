import { client, pool, queue1 } from './common.js'

async function main() {
    console.log('Begin populate')
    const amount = 10_000
    for (let i = 0; i < amount; i++) {
        await client.send(queue1, 'test message')
    }
    console.log(`Sent ${amount} messages`)
    await pool.end()
}

main()