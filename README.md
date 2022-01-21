# SQL MQ for Node.js

Message queueing with the database you're already using.

## Features
* Turn your PostgreSQL database into a concurrent message queue
* Only once delivery
* Multiple concurrent consumers that never get the same message
* Priority and FIFO delivery
* Zero dependencies

## Installation
```bash
npm install sql-mq
```

# Full Example
```js
const { Pool } = require('pg')
const { createClient, createWorker } = require('sql-mq')

const queueName = 'work-queue'

// Create the client
const client = createClient({
    type: 'node-postgres',
    api: new Pool()
})

// Set up the database to store messages
client.bootstrapDatabase()

// Send messages to the queue
client.send(queueName, 'Message 1')
client.send(queueName, 'Message 2')
client.send(queueName, 'Message 3')

// Poll for messages and process them
createWorker({
    client: client,
    queueName: queueName,
    callback: m => {
        console.log(`Received message with id: ${m.id} and body: ${m.body}`)
    }
}).start()
```

# Docs

## Creating a Client
The `createClient` function returns a `Client` which is the main way to interact with queues. You must pass the client type (currently only the `pg` package is supported, so type must be `node-postgres`) and a database API. For node-postgres that means either a `Postgres.Client` or `Postgres.Pool`.

## Bootstrapping
The `bootstrapDatabase()` methon on `client` will create create all necessary tables and views in your database. This should be done before any other operations on the queues but only needs to be called once.

## Sending Messages
Send a message to a queue by specifying the queue name and message body. You can send a string or an object which will be saved as JSON.
```js
client.send('my-queue', 'Hello')

client.send('my-queue', {
    id: 123,
    name: 'Foo',
    isUrgent: true
})
```

## Getting messages
Once a message is received it will be marked invisible so other consumers can't get the same one. If there are no messages in the queue or they are all invisible then this will return null.
```js
// Get a message from the queue
const message = client.get('my-queue')

// You can also get multiple messages at once using the getBatch method
const messages = client.getBatch('my-queue')
```

## Deleting messages
After you are finished processing a message you must delete it from the queue. If the message is not deleted it will automatically become visible again after the visibility timeout
```js
const message = client.get('my-queue')

// Do something with the here message...

client.delete(message.id)
```

## Workers
Workers are a more convenient way to handle receiving and deleting messages. It will automatically poll a queue and delete messages after they have been consumed.

The callback is the code you want to run after receiving a message. The message will be deleted after the callback runs unless the callback function throws an exception or returns `false`. The worker won't begin polling until `start()` has been called on it. To end polling call the `stop()` method.
```js
const callback = message => console.log('Received a message!')
const worker = createWorker({
    queueName: 'my-queue',
    client: client,
    callback: callback
})
worker.start()
```

## License
[MIT](https://github.com/jegan321/sql-mq/blob/master/LICENSE)
