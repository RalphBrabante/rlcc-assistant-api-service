"use strict";

const { Role } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const payload = req.body?.role || {};
  const name = typeof payload.name === "string" ? payload.name.trim() : "";

  if (!name.length) {
    return next({
      status: 400,
      message: "Role name is required.",
    });
  }

  try {
    const existing = await Role.findOne({ where: { name } });
    if (existing) {
      return next({
        status: 409,
        message: "Role already exists.",
      });
    }

    res.locals.rolePayload = { name };
    return next();
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { rolePayload } = res.locals;

  try {
    const role = await Role.create(rolePayload);

    res.send({
      status: 201,
      data: {
        role,
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
