"use strict";

const { Configuration } = require("../models");

function parseBoolean(value, defaultValue = false) {
  if (typeof value !== "string") {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }

  return defaultValue;
}

async function getConfigValue(name, defaultValue = null) {
  const config = await Configuration.findOne({
    where: { name },
    attributes: ["value"],
    order: [
      ["updatedAt", "DESC"],
      ["id", "DESC"],
    ],
  });

  if (!config) {
    return defaultValue;
  }

  return config.value;
}

async function getBooleanConfig(name, defaultValue = false) {
  const value = await getConfigValue(name, defaultValue ? "true" : "false");
  return parseBoolean(value, defaultValue);
}

module.exports = {
  parseBoolean,
  getConfigValue,
  getBooleanConfig,
};
