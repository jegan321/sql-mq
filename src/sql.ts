export const SCHEMA = 'sql_mq'
export const MESSAGES_TABLE = SCHEMA + '.sql_mq_messages'

export const BEGIN_SQL = 'begin'
export const COMMIT_SQL = 'commit'

export const DROP_SCHEMA_SQL = `
    drop schema if exists ${SCHEMA} cascade
`
export const CREATE_SCHEMA_SQL = `
    create schema if not exists ${SCHEMA}
`
export const CREATE_MESSAGES_TABLE_SQL = `
    create table if not exists ${MESSAGES_TABLE} (
        id VARCHAR PRIMARY KEY NOT NULL,
        queue_name VARCHAR NOT NULL,
        body VARCHAR NOT NULL,
        visibility_timeout INTEGER DEFAULT 5 NOT NULL,
        max_attempts INTEGER DEFAULT 3 NOT NULL,
        priority INTEGER DEFAULT 0 NOT NULL,
        attempts INTEGER DEFAULT 0 NOT NULL,
        created_timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
        last_received_timestamp TIMESTAMP
    )
`

export const GET_MESSAGES_SQL = `
    with sub as (
        select 
            _m.*
        from 
            ${MESSAGES_TABLE} as _m
        where
            (_m.last_received_timestamp is null or _m.last_received_timestamp < now() - interval '1 second' * _m.visibility_timeout)
            and 
            _m.attempts < _m.max_attempts
        order by priority desc, created_timestamp
        limit $1
        for update 
        skip locked
    )
    update 
        ${MESSAGES_TABLE}
    set 
        attempts = sub.attempts + 1,
        last_received_timestamp = now()
    from 
        sub
    where 
        ${MESSAGES_TABLE}.id = sub.id
        and
        ${MESSAGES_TABLE}.queue_name = $2
    returning 
        sub.id, sub.body, sub.visibility_timeout, sub.max_attempts, sub.priority, sub.attempts 
`
export const DELETE_MESSAGE_SQL = `
    delete from ${MESSAGES_TABLE} where id = $1
`
export const LIST_QUEUES_SQL = `
    select distinct queue_name as queue_name from ${MESSAGES_TABLE}
`
export const PURGE_QUEUE_SQL = `
    delete from ${MESSAGES_TABLE} where queue_name = $1
`
export const PURGE_ALL_QUEUES_SQL = `
    delete from ${MESSAGES_TABLE}
`

export const MESSAGES_VIEW = `
    create or replace view sql_mq_messages_view as (
        select 
            id, 
            queue_name, 
            body, 
            (last_received_timestamp is null or last_received_timestamp < now() - interval '1 second' * visibility_timeout) and attempts < max_attempts as visible,
            visibility_timeout, 
            max_attempts, 
            priority, 
            attempts, 
            created_timestamp, 
            last_received_timestamp 
        from 
            ${MESSAGES_TABLE}
        order by 
            priority desc, created_timestamp
    )
`
export const QUEUES_VIEW = `
    create or replace view sql_mq_queues_view as (
        select 
            distinct queue_name 
        from 
            ${MESSAGES_TABLE}
    )
`
