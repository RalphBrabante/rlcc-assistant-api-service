const amqp = require("amqplib");

async function initAMQP() {
  try {
    const connection = await amqp.connect(
      "amqp://admin:admin@rlcc-assistant-amqp-service"
    ); // use rabbitmq if docker
    const channel = await connection.createChannel();

    channel.assertQueue("titheForCreation");

    console.log("✅ AMQP connected");

    return { connection, channel };
  } catch (error) {
    console.log("X AMQP disconnected");
    return null;
  }
}

module.exports = initAMQP;
