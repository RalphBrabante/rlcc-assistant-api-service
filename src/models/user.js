"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      User.hasMany(models.Token, {
        foreignKey: "userId",
        as: "tokens",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      User.belongsToMany(models.Role, {
        through: "UserRoles",
        foreignKey: "userId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      User.hasMany(models.Tithe, {
        foreignKey: "userId",
        as: "tithes",
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      });
    }
  }
  User.init(
    {
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [8, 100], // min 8 chars
            msg: "Password must be at least 8 characters long",
          },
          isStrong(value) {
            if (!/[a-z]/.test(value)) {
              throw new Error(
                "Password must contain at least one lowercase letter"
              );
            }
            if (!/[A-Z]/.test(value)) {
              throw new Error(
                "Password must contain at least one uppercase letter"
              );
            }
            if (!/[0-9]/.test(value)) {
              throw new Error("Password must contain at least one number");
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
              throw new Error(
                "Password must contain at least one special character"
              );
            }
          },
        },
      },
      emailAddress: {
        type: DataTypes.STRING,
        unique: true, // 👈 ensures uniqueness at the DB level
        validate: {
          isEmail: true, // 👈 validates correct email format
        },
      },
      addressLine1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      addressLine2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      province: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      postalCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
