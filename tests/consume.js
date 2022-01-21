import { pool, client, queue1 } from './common.js'
import { createWorker } from 'sql-mq'

let targetCount = 500
let count = 0

async function main() {
    console.log('Begin consume')
    const startTime = Date.now()
    createWorker({
        client,
        queueName: queue1,
        callback: async m => {
            try { 
                await pool.query(`
                    INSERT INTO sql_mq.test_output values ($1)
                `, [m.id])
                count++
                if (count === targetCount) {
                    console.log(`Finished ${targetCount} messages after ${(Date.now() - startTime) / 1_000} seconds`)
                    await pool.end()
                    process.exit()
                }
                if (count % 100 === 0) {
                    console.log('Inserted ' + count)
                }
            } catch (e) {
                console.log('DUPLICATE')
            }
        }
    }).start()
}

main()