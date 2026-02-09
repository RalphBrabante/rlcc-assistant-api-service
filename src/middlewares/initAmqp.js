const amqp = require("amqplib");

const defaultAmqpUrl = "amqp://admin:admin@rlcc-assistant-amqp-service";

async function initAMQP() {
  const amqpUrl = process.env.AMQP_URL || defaultAmqpUrl;

  try {
    const connection = await amqp.connect(amqpUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue("titheForCreation", { durable: true });

    console.log(`✅ AMQP connected (${amqpUrl})`);

    return { connection, channel };
  } catch (error) {
    console.error("❌ AMQP unavailable at startup:", error.message);
    return null;
  }
}

module.exports = initAMQP;
