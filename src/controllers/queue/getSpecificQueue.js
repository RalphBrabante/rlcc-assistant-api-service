const axios = require("axios");

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const RABBITMQ_API = "http://rlcc-assistant-amqp-service:15672/api";
  const RABBITMQ_USER = "admin";
  const RABBITMQ_PASS = "admin";
  const { queueName } = req.params;
  try {
    // Call RabbitMQ Management API
    const response = await axios.post(
      `${RABBITMQ_API}/queues/%2f/${queueName}/get`,
      {
        count: 10, // number of messages to fetch
        ackmode: "ack_requeue_true", // ✅ required field
        encoding: "auto", // ✅ required field
        truncate: 50000,
      },
      {
        auth: {
          username: RABBITMQ_USER,
          password: RABBITMQ_PASS,
        },
        headers: { "Content-Type": "application/json" },
      }
    );

    const messages = response.data.map((msg) => ({
      exchange: msg.exchange,
      routing_key: msg.routing_key,
      redelivered: msg.redelivered,
      payload: msg.payload, // the actual message
    }));

    res.send(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
