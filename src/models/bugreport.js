"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BugReport extends Model {
    static associate(models) {
      BugReport.belongsTo(models.User, {
        foreignKey: "userId",
        as: "reporter",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }
  }

  BugReport.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "User",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      pageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      scope: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "client",
      },
      severity: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "medium",
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "open",
      },
    },
    {
      sequelize,
      modelName: "BugReport",
    }
  );

  return BugReport;
};
