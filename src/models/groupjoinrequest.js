'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GroupJoinRequest extends Model {
    static associate(models) {
      GroupJoinRequest.belongsTo(models.Group, {
        foreignKey: 'groupId',
        as: 'group',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      GroupJoinRequest.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'requester',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      GroupJoinRequest.belongsTo(models.User, {
        foreignKey: 'reviewedBy',
        as: 'reviewer',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  GroupJoinRequest.init(
    {
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'GroupJoinRequest',
    }
  );

  return GroupJoinRequest;
};
