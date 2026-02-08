"use strict";

const { Configuration } = require("../../models");
const { parseBoolean } = require("../../utils/runtimeConfiguration");

const PUBLIC_SETTINGS = ["maintenance_mode", "dev_mode"];

module.exports.validate = async (req, res, next) => {
  return next();
};

module.exports.invoke = async (req, res, next) => {
  try {
    const configs = await Configuration.findAll({
      where: { name: PUBLIC_SETTINGS },
      attributes: ["name", "value"],
      order: [
        ["updatedAt", "DESC"],
        ["id", "DESC"],
      ],
    });

    const configMap = new Map();
    for (const config of configs) {
      if (!configMap.has(config.name)) {
        configMap.set(config.name, config.value);
      }
    }

    res.send({
      status: 200,
      data: {
        maintenanceMode: parseBoolean(configMap.get("maintenance_mode"), false),
        devMode: parseBoolean(configMap.get("dev_mode"), false),
      },
    });

    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};
