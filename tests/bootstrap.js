import { client, pool } from './common.js'

async function main() {
    console.log('Begin bootstrap')
    await client.resetDatabase()
    await pool.query(`
        create table sql_mq.test_output (
            value VARCHAR PRIMARY KEY NOT NULL
        )
    `)
    await pool.end()
}

main()