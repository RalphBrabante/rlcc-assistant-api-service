"use strict";

const { Role, User } = require("../../models");
const { rotateUserToken } = require("../../utils/tokenRotation");

module.exports.validate = async (req, res, next) => {
  const userId = Number(req.params.userId);
  const roleIds = req.body?.roleIds;

  if (!Number.isInteger(userId) || userId < 1) {
    return next({
      status: 400,
      message: "Invalid user id.",
    });
  }

  if (!Array.isArray(roleIds)) {
    return next({
      status: 400,
      message: "roleIds must be an array.",
    });
  }

  const uniqueRoleIds = [...new Set(roleIds.map((id) => Number(id)))].filter(
    (id) => Number.isInteger(id) && id > 0
  );

  if (uniqueRoleIds.length !== roleIds.length) {
    return next({
      status: 400,
      message: "roleIds must contain valid numeric ids.",
    });
  }

  try {
    const targetUser = await User.findByPk(userId, {
      attributes: ["id", "firstName", "lastName", "emailAddress", "pcoId"],
    });

    if (!targetUser) {
      return next({
        status: 404,
        message: "User not found.",
      });
    }

    const roles = await Role.findAll({
      where: { id: uniqueRoleIds },
      attributes: ["id", "name"],
    });

    if (roles.length !== uniqueRoleIds.length) {
      return next({
        status: 400,
        message: "One or more roles do not exist.",
      });
    }

    res.locals.targetUser = targetUser;
    res.locals.roles = roles;
    return next();
  } catch (error) {
    return next({
      status: 500,
      message: error.message,
    });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { user: actor, targetUser, roles } = res.locals;

  try {
    await targetUser.setRoles(roles);

    const updatedUser = await User.findByPk(targetUser.id, {
      attributes: ["id", "firstName", "lastName", "emailAddress", "pcoId"],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
      order: [[{ model: Role, as: "roles" }, "name", "ASC"]],
    });

    const io = req.app.get("io");
    const rotatedTargetToken = await rotateUserToken(updatedUser.id, {
      io,
      reason: "role_updated",
    });
    const refreshedToken =
      Number(actor?.id) === Number(updatedUser?.id) ? rotatedTargetToken : null;

    res.send({
      status: 200,
      data: {
        user: updatedUser,
        token: refreshedToken,
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
