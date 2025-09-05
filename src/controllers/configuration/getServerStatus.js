const { Configuration } = require("../../models");

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  next();
};

module.exports.invoke = async (req, res, next) => {

  try {
    const serverConfigurations = await Configuration.findAll({
    
    });

    res.send({
      status: 200,
      serverConfigurations,
    });

    next();
  } catch (error) {
    return next({
      status: 401,
      message: error.message,
    });
  }
};
