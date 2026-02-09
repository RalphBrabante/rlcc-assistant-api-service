module.exports = (req, res, next) => {
  if (!req.amqp || !req.amqp.channel) {
    return next({
      status: 503,
      message:
        "Queue service is temporarily unavailable. Please try again in a few moments.",
    });
  }

  return next();
};
