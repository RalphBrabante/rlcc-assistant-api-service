"use strict";
const { Token, User } = require("../../models");

const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../../utils/jwtSecret");

function extractBearerToken(authorization = "") {
  const [scheme, value] = authorization.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !value) return null;
  return value;
}

module.exports.validate = async (req, res, next) => {
  const token =
    req.query?.token ||
    req.body?.token ||
    extractBearerToken(req.headers.authorization || "");

  if (!token) {
    return next({
      status: 400,
      message: "Token is required.",
    });
  }

  res.locals.token = token;

  next();
};

module.exports.invoke = async (req, res, next) => {
  const { token } = res.locals;
  const jwtSecret = getJwtSecret();

  try {
    const decoded = jwt.verify(token, jwtSecret);

    const tokenFromDb = await Token.findOne({
      where: {
        token,
      },
      include: {
        model: User,
        as: "owner",
        attributes: ["id", "username"],
      },
    });

    if (!tokenFromDb) {
      return next({
        status: 401,
        message: "Token no longer exists.",
      });
    }

    // delete token and renew
    await Token.destroy({ where: { token } });

    const tokenPayload = {
      id: decoded.id || tokenFromDb.owner?.id,
      name: decoded.name || tokenFromDb.owner?.username,
      permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
      roles: Array.isArray(decoded.roles) ? decoded.roles : [],
    };

    const newGeneratedToken = jwt.sign(
      tokenPayload,
      jwtSecret,
      { expiresIn: "5 hours" }
    );

    // create token in db
    const newToken = await Token.create({ token: newGeneratedToken });

    res.send({
      status: 200,
      data: { token: newToken },
    });

    next();
  } catch (error) {
    await Token.destroy({ where: { token } });

    if (error.name === "TokenExpiredError") {
      return next({
        status: 401,
        message: "Session is expired.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return next({
        status: 401,
        message: "Authentication error.",
      });
    }

    return next({
      status: 500,
      message: error.message,
    });
  }
};
