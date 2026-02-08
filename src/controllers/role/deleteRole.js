"use strict";

const { Role } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const roleId = Number(req.params.id);

  if (!Number.isInteger(roleId) || roleId < 1) {
    return next({
      status: 400,
      message: "Invalid role id.",
    });
  }

  try {
    const role = await Role.findByPk(roleId, {
      attributes: ["id", "name"],
    });

    if (!role) {
      return next({
        status: 404,
        message: "Role not found.",
      });
    }

    if (role.name === "SUPERUSER") {
      return next({
        status: 403,
        message: "The SUPERUSER role cannot be deleted.",
      });
    }

    res.locals.role = role;
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { role } = res.locals;

  try {
    await role.destroy();

    res.send({
      status: 200,
      data: {
        id: role.id,
        deleted: true,
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
