"use strict";
const { Token, User } = require("../../models");

const jwt = require("jsonwebtoken");

module.exports.validate = async (req, res, next) => {
  const { token } = req.query;

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

  try {
    //check if token is valid
    jwt.verify(token, "secretKey", (err, decoded) => {
      if (err) {
        if (err.name === "JsonWebTokenError") {
          throw new Error("Authentication Error.");
        } else if (err.name === "TokenExpiredError") {
          throw new Error("Session is expired.");
        } else if (err.name === "JsonWebTokenError") {
          throw new Error("Session server error.");
        } else {
          throw new Error("Server error.");
        }
      }
    });

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
      throw new Error("Token no longer exist.");
    }

    // delete token and renew
    await Token.destroy({ where: { token } });

    const newGeneratedToken = jwt.sign(
      { user: tokenFromDb.user },
      "secretKey",
      { expiresIn: "1 hour" }
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

    return next({
      status: 404,
      message: error.message,
    });
  }
};