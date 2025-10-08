"user strict";
const amqp = require("amqplib");
const bcrypt = require("bcrypt");

const { User } = require("../models");

async function usersMigration() {
  try {
    // connect to RabbitMQ (use rabbitmq instead of localhost if docker-compose service name)
    const connection = await amqp.connect(
      "amqp://admin:admin@rlcc-assistant-amqp-service"
    );
    const channel = await connection.createChannel();

    // make sure the queue exists
    const queue = "usersMigrationQueue";
    await channel.assertQueue(queue, { durable: true });

    // ⚡ Limit consumer to one unacknowledged message at a time
    channel.prefetch(1);

    console.log(`👂 Waiting for messages in queue: ${queue}`);

    // consume messages
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          // parse JSON object
          const qUser = JSON.parse(msg.content.toString());
          console.log("📥 Received object:", qUser.attributes.name);

          const dbUser = await User.findOne({
            where: { pcoId: qUser.id },
          });

          function generateRandomPassword(length = 10) {
            const chars =
              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
            let password = "";
            for (let i = 0; i < length; i++) {
              password += chars.charAt(
                Math.floor(Math.random() * chars.length)
              );
            }
            return password;
          }

          if (!dbUser) {
            const plainPassword = generateRandomPassword(12); // random 12-char password
            const saltRounds = 10;

            const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

            const user = await User.create({
              firstName: qUser.attributes.first_name,
              lastName: qUser.attributes.last_name,
              emailAddress: qUser?.attributes?.login_identifier
                ? qUser?.attributes?.login_identifier
                : null,
              password: hashedPassword,
              anniversary: qUser?.attributes?.anniversary
                ? new Date(qUser.attributes.anniversary)
                : null,
              gender: qUser.attributes.gender,
              nickname: qUser?.attributes?.nickname
                ? qUser?.attributes?.nickname
                : null,
              avatar: qUser.attributes.avatar,
              pcoId: qUser.id,
              birthDate: new Date(qUser.attributes.birthdate),
            });

            console.log(user.id + " " + user.firstName);
          } else {
            dbUser.set({
              firstName: qUser.attributes.first_name,
              lastName: qUser.attributes.last_name,
              emailAddress: qUser?.attributes?.login_identifier
                ? qUser?.attributes?.login_identifier
                : null,
              anniversary: qUser?.attributes?.anniversary
                ? new Date(qUser.attributes.anniversary)
                : null,
              gender: qUser.attributes.gender,
              nickname: qUser?.attributes?.nickname
                ? qUser?.attributes?.nickname
                : null,
              avatar: qUser.attributes.avatar,
              pcoId: qUser.id,
              birthDate: new Date(qUser.attributes.birthdate),
            });

            await dbUser.save();
          }

          channel.ack(msg);
        } catch (err) {
          console.log(err.message);
          console.error("❌ Failed to parse message:", msg.content.toString());
          channel.nack(msg, false, false); // discard if invalid
        }
      }
    });
  } catch (err) {
    console.error("❌ Consumer error:", err);
  }
}

module.exports = usersMigration;
