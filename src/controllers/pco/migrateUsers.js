"use strict";

const axios = require("axios");
module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const { lastName } = req.query;

  if(!lastName){
    return next({
      status:401,
      message: "Last name query is required."
    })
  }
  try {
    const response = await axios.get(
      `https://api.planningcenteronline.com/people/v2/people?where[last_name]=${lastName}`,
      {
        auth: {
          username: process.env.PCO_USERNAME,
          password: process.env.PCO_PASSWORD,
        },
      }
    );

    req.amqp.channel.assertQueue("usersMigrationQueue");

    const users = response.data.data.map((u) => {
      return u;
    });

    // send each user on queue
    for (const user of users) {
      req.amqp.channel.sendToQueue(
        "usersMigrationQueue",
        Buffer.from(JSON.stringify(user)),
        {
          persistent: true, // message survives broker restart if durable queue
        }
      );
    }

    res.send({
      status: 200,
      message: "Users adeded to queue",
    });
  } catch (error) {
    return next({
      status: 520,
      message: error.message,
    });
  }
};
