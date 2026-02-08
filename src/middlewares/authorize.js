"use strict";

/**
 *
 * @param {*} allowedPermissions - allowed permissions lie create_tithe
 * @returns
 *
 */

module.exports = (allowedPermissions, options = {}) => {
  const required = Array.isArray(allowedPermissions)
    ? [...new Set(allowedPermissions.filter(Boolean))]
    : [];
  const match = options.match === "all" ? "all" : "any";

  return async (req, res, next) => {
    try {
      const { user } = res.locals;

      if (!user) {
        return next({ status: 401, message: "Unauthorized." });
      }

      if (required.length === 0) {
        return next();
      }

      const permissionSet =
        user.permissionSet instanceof Set
          ? user.permissionSet
          : new Set(Array.isArray(user.permissions) ? user.permissions : []);

      const hasPermissions =
        match === "all"
          ? required.every((permission) => permissionSet.has(permission))
          : required.some((permission) => permissionSet.has(permission));

      if (!hasPermissions) {
        return next({ status: 403, message: "Forbidden." });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
