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
        as: "roles",
        foreignKey: "userId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.hasMany(models.Tithe, {
        foreignKey: "userId",
        as: "tithes",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });

      User.hasMany(models.Group, {
        foreignKey: "userId",
        as: "createdGroups",
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      });

      User.hasMany(models.Group, {
        foreignKey: "leaderId",
        as: "managedGroups",
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      });

      User.belongsToMany(models.Group, {
        through: "GroupUsers",
        as: "assignedGroup",
        foreignKey: "userId",
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      });

      User.hasMany(models.GroupMessage, {
        foreignKey: "senderId",
        as: "sentGroupMessages",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      User.hasMany(models.GroupTopic, {
        foreignKey: "createdBy",
        as: "createdGroupTopics",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });

      User.hasMany(models.BugReport, {
        foreignKey: "userId",
        as: "bugReports",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });

      // event relationship
      User.belongsToMany(models.Event, {
        through: "EventUsers",
        foreignKey: "userId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
    // remove password from json response

    toJSON() {
      // Spread all attributes except password
      const attributes = { ...this.get() };
      delete attributes.password;
      return attributes;
    }
  }
  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
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
        // unique: true, // 👈 ensures uniqueness at the DB level
        validate: {
          isEmail: true, // 👈 validates correct email format
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      pcoId: {
        type: DataTypes.INTEGER,
        unique: true,
      },
      nickName: {
        type: DataTypes.STRING,

        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      anniversary: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      birthDate: {
        type: DataTypes.DATE,
        allowNull: true,
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
