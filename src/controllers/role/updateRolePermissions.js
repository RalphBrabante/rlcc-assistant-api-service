"use strict";

const { Role, Permission } = require("../../models");

module.exports.validate = async (req, res, next) => {
  const roleId = Number(req.params.id);
  const permissionIds = req.body?.permissionIds;

  if (!Number.isInteger(roleId) || roleId < 1) {
    return next({
      status: 400,
      message: "Invalid role id.",
    });
  }

  if (!Array.isArray(permissionIds)) {
    return next({
      status: 400,
      message: "permissionIds must be an array.",
    });
  }

  const uniquePermissionIds = [...new Set(permissionIds.map((id) => Number(id)))].filter(
    (id) => Number.isInteger(id) && id > 0
  );

  if (uniquePermissionIds.length !== permissionIds.length) {
    return next({
      status: 400,
      message: "permissionIds must contain valid numeric ids.",
    });
  }

  try {
    const role = await Role.findByPk(roleId);

    if (!role) {
      return next({
        status: 404,
        message: "Role not found.",
      });
    }

    const permissions = await Permission.findAll({
      where: { id: uniquePermissionIds },
      attributes: ["id"],
    });

    if (permissions.length !== uniquePermissionIds.length) {
      return next({
        status: 400,
        message: "One or more permissions do not exist.",
      });
    }

    res.locals.role = role;
    res.locals.permissions = permissions;
    return next();
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

module.exports.invoke = async (req, res, next) => {
  const { role, permissions } = res.locals;

  try {
    await role.setPermissions(permissions);

    const updatedRole = await Role.findByPk(role.id, {
      attributes: ["id", "name"],
      include: [
        {
          model: Permission,
          as: "permissions",
          attributes: ["id", "name", "method", "resource"],
          through: { attributes: [] },
        },
      ],
      order: [[{ model: Permission, as: "permissions" }, "name", "ASC"]],
    });

    res.send({
      status: 200,
      data: {
        role: updatedRole,
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
