const { Tithe, TitheType, User } = require("../models");

const amqp = require("amqplib");
const nodemailer = require("nodemailer");
const emailTitheDetails = require("../utils/emailTitheDetails");

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "test@sysgage.com",
    pass: "[s1Vss9pIVp",
  },
});

async function titheConsumer() {
  try {
    // connect to RabbitMQ (use rabbitmq instead of localhost if docker-compose service name)
    const connection = await amqp.connect(
      "amqp://admin:admin@rlcc-assistant-amqp-service"
    );
    const channel = await connection.createChannel();

    // make sure the queue exists
    const queue = "createTitheQueue";
    await channel.assertQueue(queue, { durable: true });

    // ⚡ Limit consumer to one unacknowledged message at a time
    channel.prefetch(1);

    console.log(`👂 Waiting for messages in queue: ${queue}`);

    // consume messages
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          // parse JSON object
          const tithe = JSON.parse(msg.content.toString());
          console.log("📥 Received object:", tithe);

          const { amount, titheTypeId, userId, memberId, dateReceived } = tithe;
          const newTithe = await Tithe.create({
            amount,
            titheTypeId,
            userId,
            dateReceived,
            memberId,
          });

          // reload with associations
          await newTithe.reload({
            include: [
              { model: TitheType, as: "titheType", attributes: ["id", "name"] },
              {
                model: User,
                as: "giver",
                attributes: ["id", "firstName", "emailAddress"],
              },
            ],
          });
          emailTitheDetails(
            newTithe.giver.firstName,
            newTithe.giver.emailAddress,
            newTithe.amount,
            newTithe.titheType.name,
            newTithe.createdAt,
            transporter
          );
          channel.ack(msg);
        } catch (err) {
          console.error("❌ Failed to parse message:", msg.content.toString());
          channel.nack(msg, false, false); // discard if invalid
        }
      }
    });
  } catch (err) {
    console.error("❌ Consumer error:", err);
  }
}

module.exports = titheConsumer;
