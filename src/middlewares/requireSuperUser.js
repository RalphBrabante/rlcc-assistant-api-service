"use strict";

module.exports = (req, res, next) => {
  const roles = Array.isArray(res.locals?.user?.roles) ? res.locals.user.roles : [];

  if (!roles.includes("SUPERUSER")) {
    return next({
      status: 403,
      message: "Forbidden. Super admin access is required.",
    });
  }

  return next();
};
