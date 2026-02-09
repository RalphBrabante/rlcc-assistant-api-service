"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class GroupTopicComment extends Model {
    static associate(models) {
      GroupTopicComment.belongsTo(models.GroupTopic, {
        foreignKey: "groupTopicId",
        as: "topic",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      GroupTopicComment.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });

      GroupTopicComment.belongsTo(models.GroupTopicComment, {
        foreignKey: "parentCommentId",
        as: "parentComment",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      GroupTopicComment.hasMany(models.GroupTopicComment, {
        foreignKey: "parentCommentId",
        as: "replies",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  GroupTopicComment.init(
    {
      groupTopicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "GroupTopics",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      parentCommentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "GroupTopicComments",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "GroupTopicComment",
    }
  );

  return GroupTopicComment;
};
