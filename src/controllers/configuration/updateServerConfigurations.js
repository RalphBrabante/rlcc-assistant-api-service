"use strict";

const { Configuration } = require("../../models");

const ALLOWED_CONFIG_NAMES = new Set(["maintenance_mode", "dev_mode"]);

module.exports.validate = async (req, res, next) => {
  const configurations = req.body?.configurations;

  if (!Array.isArray(configurations) || !configurations.length) {
    return next({
      status: 400,
      message: "configurations must be a non-empty array.",
    });
  }

  const normalizedConfigurations = [];

  for (const item of configurations) {
    const name = String(item?.name || "").trim();
    const value = String(item?.value || "").trim().toLowerCase();

    if (!ALLOWED_CONFIG_NAMES.has(name)) {
      return next({
        status: 400,
        message: `Unsupported configuration: ${name || "unknown"}.`,
      });
    }

    if (!["true", "false"].includes(value)) {
      return next({
        status: 400,
        message: `Invalid value for ${name}. Use 'true' or 'false'.`,
      });
    }

    normalizedConfigurations.push({ name, value });
  }

  res.locals.configurations = Array.from(
    new Map(normalizedConfigurations.map((config) => [config.name, config])).values()
  );

  return next();
};

module.exports.invoke = async (req, res, next) => {
  const configurations = res.locals.configurations;

  try {
    for (const config of configurations) {
      const existing = await Configuration.findOne({
        where: { name: config.name },
        order: [
          ["updatedAt", "DESC"],
          ["id", "DESC"],
        ],
      });

      if (existing) {
        existing.value = config.value;
        await existing.save();
      } else {
        await Configuration.create({
          name: config.name,
          value: config.value,
        });
      }
    }

    const updatedConfigurations = await Configuration.findAll({
      where: {
        name: configurations.map((config) => config.name),
      },
      attributes: ["id", "name", "value", "createdAt", "updatedAt"],
      order: [
        ["updatedAt", "DESC"],
        ["id", "DESC"],
      ],
    });

    const firstByName = new Map();
    for (const config of updatedConfigurations) {
      if (!firstByName.has(config.name)) {
        firstByName.set(config.name, config);
      }
    }

    res.send({
      status: 200,
      data: {
        configurations: Array.from(firstByName.values()),
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
