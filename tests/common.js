import Postgres from 'pg'
import { createClient } from 'sql-mq'

export const pool = new Postgres.Pool({
    user: 'postgres',
    password: 'password',
    host: 'localhost',
    database: 'sql_mq',
    port: 6666,
})

export const client = createClient({
    type: 'node-postgres',
    api: pool
})

export const queue1 = 'queue1'