"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EventUsers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EventUsers.init(
    {
      role: {
        type: DataTypes.STRING,
        defaultValue: "attendee",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "invited",
      },
      checkedInAt: DataTypes.DATE,
      checkedOutAt: DataTypes.DATE,
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "EventUsers",
    }
  );
  return EventUsers;
};
