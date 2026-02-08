"use strict";

module.exports = async (req, res, next) => {
  const { user, group } = res.locals;

  if (!user || !group) {
    return next({
      status: 401,
      message: "Unauthorized.",
    });
  }

  const permissionSet =
    user?.permissionSet instanceof Set
      ? user.permissionSet
      : new Set(Array.isArray(user?.permissions) ? user.permissions : []);
  const canDeleteByPermission = permissionSet.has("delete_group_topic");
  const isLeader = Number(group.leaderId) === Number(user.id);

  if (!canDeleteByPermission && !isLeader) {
    return next({
      status: 403,
      message:
        "Forbidden. Only ADMINISTRATOR, SUPERUSER, or the circle leader can delete topics.",
    });
  }

  return next();
};
