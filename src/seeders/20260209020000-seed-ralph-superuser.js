"use strict";

const bcrypt = require("bcrypt");

const EMAIL = "ralphjohnbrabante@gmail.com";
const DEFAULT_PASSWORD = "Default123!";
const FIRST_NAME = "Ralph John";
const LAST_NAME = "Brabante";
const ROLE_NAME = "SUPERUSER";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const [roles] = await queryInterface.sequelize.query(
      "SELECT id FROM `Roles` WHERE `name` = :roleName LIMIT 1",
      { replacements: { roleName: ROLE_NAME } }
    );

    if (!roles.length) {
      throw new Error(
        "SUPERUSER role not found. Run role seeders first (db:seed:all)."
      );
    }

    const superUserRoleId = roles[0].id;

    const [users] = await queryInterface.sequelize.query(
      "SELECT id FROM `Users` WHERE `emailAddress` = :email LIMIT 1",
      { replacements: { email: EMAIL } }
    );

    let userId;

    if (users.length) {
      userId = users[0].id;
      await queryInterface.sequelize.query(
        `
          UPDATE \`Users\`
          SET
            \`firstName\` = :firstName,
            \`lastName\` = :lastName,
            \`password\` = :password,
            \`isActive\` = true,
            \`updatedAt\` = :updatedAt
          WHERE \`id\` = :id
        `,
        {
          replacements: {
            id: userId,
            firstName: FIRST_NAME,
            lastName: LAST_NAME,
            password: hashedPassword,
            updatedAt: now,
          },
        }
      );
    } else {
      await queryInterface.bulkInsert("Users", [
        {
          firstName: FIRST_NAME,
          lastName: LAST_NAME,
          emailAddress: EMAIL,
          password: hashedPassword,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      const [createdUsers] = await queryInterface.sequelize.query(
        "SELECT id FROM `Users` WHERE `emailAddress` = :email LIMIT 1",
        { replacements: { email: EMAIL } }
      );

      userId = createdUsers[0].id;
    }

    const [userRoles] = await queryInterface.sequelize.query(
      `
        SELECT id FROM \`UserRoles\`
        WHERE \`userId\` = :userId AND \`roleId\` = :roleId
        LIMIT 1
      `,
      {
        replacements: {
          userId,
          roleId: superUserRoleId,
        },
      }
    );

    if (!userRoles.length) {
      await queryInterface.bulkInsert("UserRoles", [
        {
          userId,
          roleId: superUserRoleId,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    const [users] = await queryInterface.sequelize.query(
      "SELECT id FROM `Users` WHERE `emailAddress` = :email LIMIT 1",
      { replacements: { email: EMAIL } }
    );

    if (!users.length) return;

    const userId = users[0].id;

    await queryInterface.bulkDelete("UserRoles", { userId }, {});
    await queryInterface.bulkDelete("Users", { id: userId }, {});
  },
};
