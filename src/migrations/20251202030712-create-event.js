'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      description: {
        type: Sequelize.TEXT('medium'),
        allowNull:false
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull:true
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull:true
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull:true
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull:true
      },
      isAllDay: {
        type: Sequelize.BOOLEAN,
        allowNull:true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Events');
  }
};