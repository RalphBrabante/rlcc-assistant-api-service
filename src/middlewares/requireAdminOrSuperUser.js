"use strict";

module.exports = (req, res, next) => {
  const roles = Array.isArray(res.locals?.user?.roles) ? res.locals.user.roles : [];

  if (roles.includes("SUPERUSER") || roles.includes("ADMINISTRATOR")) {
    return next();
  }

  return next({
    status: 403,
    message: "Forbidden. Administrator or superuser access is required.",
  });
};
