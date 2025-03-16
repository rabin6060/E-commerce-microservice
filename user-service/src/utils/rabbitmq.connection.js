const amqp = require('amqplib')
const { logger } = require('./logger')

let connection
let channel
const exchangeName = 'user'


const rabbitConnection = async()=>{
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL)
        logger.info("rabbitmq connnection successfully")
        channel = await connection.createChannel()
        return channel
    } catch (error) {
        logger.error("rabbitmq connection failed",error)
    }
}

const publish = async(routingKey,message)=>{
    try {
        if (!channel) {
            await rabbitConnection()
        }
        console.log(routingKey,message)
        await channel.assertExchange(exchangeName,'direct',{durable:true})
        await channel.publish(exchangeName,routingKey,Buffer.from(JSON.stringify(message)))
        logger.info("message published successfully")
    } catch (error) {
        logger.error("message published failed")
    }
}

module.exports = {rabbitConnection,publish}
