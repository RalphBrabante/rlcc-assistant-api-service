module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;
  const { tithes } = req.body; //expects an array of tithes

  try {
    req.amqp.channel.assertQueue("createTitheQueue");

    const tithesWithUserId = tithes.map((t) => ({ ...t, userId: user.id }));

    if (tithes.length) {
      for (const tithe of tithesWithUserId) {
        // publish to queue
        req.amqp.channel.sendToQueue(
          "createTitheQueue",
          Buffer.from(JSON.stringify(tithe)),
          {
            persistent: true, // message survives broker restart if durable queue
          }
        );
      }
    }

    res.send({
      status: 201,
    });
    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
