"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tithe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tithe.belongsTo(models.TitheType, {
        foreignKey: "titheTypeId",
        as: "titheType",
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      });

      Tithe.belongsTo(models.User, {
        foreignKey: "userId",
        as: "encoder",
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      });

      Tithe.belongsTo(models.User, {
        foreignKey: "memberId",
        as: "giver",
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      });
    }
  }
  Tithe.init(
    {
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      },
      memberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      titheTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "TitheType",
          key: "id",
        },
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      },
      dateReceived: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Tithe",
    }
  );
  return Tithe;
};
