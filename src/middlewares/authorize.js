"use strict";

/**
 *
 * @param {*} allowedPermissions - allowed permissions lie create_tithe
 * @returns
 *
 */

module.exports = (allowedPermissions) => {
  return async (req, res, next) => {
    const { user } = res.locals;

    const userPermissions = user.permissions;

    // check if ALL required permissions exist in userPermissions
    const hasPermissions = allowedPermissions.every((p) =>
      userPermissions.includes(p)
    );

    if (!hasPermissions) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
