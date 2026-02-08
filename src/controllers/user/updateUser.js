"use strict";

const bcrypt = require("bcrypt");

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]*$/;
const LOCATION_PATTERN = /^[A-Za-z][A-Za-z\s.'-]*$/;
const POSTAL_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/;
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,100}$/;
const PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "addressLine1",
  "addressLine2",
  "city",
  "province",
  "postalCode",
  "password",
  "confirmPassword",
];

module.exports.cacheRead = async (req, res, next) => {
  next();
};

module.exports.validate = async (req, res, next) => {
  const userPayload = req.body?.user;

  if (!userPayload || typeof userPayload !== "object") {
    return next({
      status: 400,
      message: "Invalid user payload.",
    });
  }

  const deltaUser = {};

  PROFILE_FIELDS.forEach((field) => {
    if (Object.hasOwn(userPayload, field)) {
      deltaUser[field] = userPayload[field];
    }
  });

  const normalizeNullable = (value) => {
    if (value === null || value === undefined) {
      return null;
    }
    const trimmed = String(value).trim();
    return trimmed ? trimmed : null;
  };

  const normalizeRequired = (value) => String(value ?? "").trim();
  const validateRegexField = (value, pattern, fieldLabel) => {
    if (value && !pattern.test(value)) {
      throw new Error(`Invalid ${fieldLabel}.`);
    }
  };

  try {
    if (Object.hasOwn(deltaUser, "firstName")) {
      deltaUser.firstName = normalizeRequired(deltaUser.firstName);
      if (!deltaUser.firstName || !NAME_PATTERN.test(deltaUser.firstName)) {
        throw new Error(
          "First name is required and must contain only valid characters."
        );
      }
      if (deltaUser.firstName.length > 60) {
        throw new Error("First name must be 60 characters or fewer.");
      }
    }

    if (Object.hasOwn(deltaUser, "lastName")) {
      deltaUser.lastName = normalizeRequired(deltaUser.lastName);
      if (!deltaUser.lastName || !NAME_PATTERN.test(deltaUser.lastName)) {
        throw new Error(
          "Last name is required and must contain only valid characters."
        );
      }
      if (deltaUser.lastName.length > 60) {
        throw new Error("Last name must be 60 characters or fewer.");
      }
    }

    if (Object.hasOwn(deltaUser, "addressLine1")) {
      deltaUser.addressLine1 = normalizeNullable(deltaUser.addressLine1);
      if (deltaUser.addressLine1 && deltaUser.addressLine1.length > 120) {
        throw new Error("Address line 1 must be 120 characters or fewer.");
      }
    }

    if (Object.hasOwn(deltaUser, "addressLine2")) {
      deltaUser.addressLine2 = normalizeNullable(deltaUser.addressLine2);
      if (deltaUser.addressLine2 && deltaUser.addressLine2.length > 120) {
        throw new Error("Address line 2 must be 120 characters or fewer.");
      }
    }

    if (Object.hasOwn(deltaUser, "city")) {
      deltaUser.city = normalizeNullable(deltaUser.city);
      if (deltaUser.city && deltaUser.city.length > 80) {
        throw new Error("City must be 80 characters or fewer.");
      }
      validateRegexField(deltaUser.city, LOCATION_PATTERN, "city");
    }

    if (Object.hasOwn(deltaUser, "province")) {
      deltaUser.province = normalizeNullable(deltaUser.province);
      if (deltaUser.province && deltaUser.province.length > 80) {
        throw new Error("Province/State must be 80 characters or fewer.");
      }
      validateRegexField(deltaUser.province, LOCATION_PATTERN, "province/state");
    }

    if (Object.hasOwn(deltaUser, "postalCode")) {
      deltaUser.postalCode = normalizeNullable(deltaUser.postalCode);
      if (deltaUser.postalCode && deltaUser.postalCode.length > 10) {
        throw new Error("Postal code must be 10 characters or fewer.");
      }
      validateRegexField(deltaUser.postalCode, POSTAL_CODE_PATTERN, "postal code");
    }

    const password = normalizeRequired(deltaUser.password);
    const confirmPassword = normalizeRequired(deltaUser.confirmPassword);

    if (password || confirmPassword) {
      if (!password) {
        throw new Error("Password is required when confirming password.");
      }
      if (!confirmPassword) {
        throw new Error("Confirm password is required.");
      }
      if (password !== confirmPassword) {
        throw new Error("Password and confirm password do not match.");
      }
      if (!PASSWORD_PATTERN.test(password)) {
        throw new Error(
          "Password must include uppercase, lowercase, number, symbol, and be at least 8 characters."
        );
      }

      deltaUser.password = password;
      deltaUser.confirmPassword = confirmPassword;
    } else {
      delete deltaUser.password;
      delete deltaUser.confirmPassword;
    }
  } catch (error) {
    return next({
      status: 400,
      message: error.message,
    });
  }

  res.locals.deltaUser = deltaUser;
  next();
};

module.exports.invoke = async (req, res, next) => {
  const { user } = res.locals;
  const { deltaUser } = res.locals;

  try {
    if (deltaUser.password) {
      deltaUser.password = await bcrypt.hash(deltaUser.password, 10);
    } else {
      delete deltaUser.password;
    }

    delete deltaUser.confirmPassword;
    user.set(deltaUser);

    await user.save();

    res.send({
      status: 200,
      id: user.id,
    });

    next();
  } catch (error) {
    return next({
      status: 520,
      message: error.message,
    });
  }
};
