"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PasswordResetToken extends Model {
    static associate(models) {
      PasswordResetToken.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  PasswordResetToken.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tokenHash: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      consumedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PasswordResetToken",
    }
  );

  return PasswordResetToken;
};

