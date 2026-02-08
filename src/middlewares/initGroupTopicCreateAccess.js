"use strict";

module.exports = async (req, res, next) => {
  const { user, group } = res.locals;

  if (!user || !group) {
    return next({
      status: 401,
      message: "Unauthorized.",
    });
  }

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const isPrivileged = roles.includes("SUPERUSER") || roles.includes("ADMINISTRATOR");
  const isLeader = Number(group.leaderId) === Number(user.id);

  if (!isPrivileged && !isLeader) {
    return next({
      status: 403,
      message:
        "Forbidden. Only superusers, administrators, or the circle leader can create topics.",
    });
  }

  return next();
};
