const amqplib = require('amqplib');

let channel, connection;

async function connect(){
    if(connection) return;
    try{
        connection = await amqplib.connect(process.env.RABBIT_URL);
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
    }catch(err){
        console.error('Error connecting to RabbitMQ:', err);
    }
}

async function publishToQueue(queueName, data = {}){
    try{
        if(!channel || !connection){
            await connect();
        }
        await channel.assertQueue(queueName, {durable: true});
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {persistent: true});
        console.log(`Message published to queue ${queueName} ${JSON.stringify(data)}`);
    }
    catch(err){
        console.error('Error publishing message to queue:', err);
    }
}

async function subscribeToQueue(queueName, callback){
    if(!channel || !connection){
        await connect();
    }

    await channel.assertQueue(queueName, {durable: true});

    channel.consume(queueName, async (msg) => {
        if(msg !== null){
            const data = JSON.parse(msg.content.toString());
            await callback(data);
            channel.ack(msg);
        }
    })
}

module.exports = {
    channel,
    connection,
    connect,
    publishToQueue,
    subscribeToQueue
};