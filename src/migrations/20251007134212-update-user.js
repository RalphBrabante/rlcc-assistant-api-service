"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.changeColumn("Users", "emailAddress", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true, // 👈 ensures uniqueness at the DB level
    });

    await queryInterface.addColumn("Users", "pcoId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      unique: true,
      after: "isActive",
    });

    await queryInterface.addColumn("Users", "nickName", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "pcoId",
    });

    await queryInterface.addColumn("Users", "gender", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "nickName",
    });

    await queryInterface.addColumn("Users", "anniversary", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "gender",
    });

    await queryInterface.addColumn("Users", "avatar", {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: "anniversary",
    });

    await queryInterface.addColumn("Users", "birthDate", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "avatar",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    // Normalize data first so NOT NULL + UNIQUE rollback does not fail.
    const [rows] = await queryInterface.sequelize.query(
      "SELECT id, emailAddress FROM Users ORDER BY id ASC"
    );

    const normalizeEmail = (value, id) => {
      const email = (value || "").trim().toLowerCase();
      if (!email) {
        return `rollback_user_${id}@local.invalid`;
      }

      const atIndex = email.indexOf("@");
      if (atIndex <= 0 || atIndex === email.length - 1) {
        return `rollback_user_${id}@local.invalid`;
      }

      return email;
    };

    const seen = new Map();
    for (const row of rows) {
      const normalized = normalizeEmail(row.emailAddress, row.id);
      const count = seen.get(normalized) || 0;
      seen.set(normalized, count + 1);

      let finalEmail = normalized;
      if (count > 0) {
        const atIndex = normalized.indexOf("@");
        const local = normalized.slice(0, atIndex);
        const domain = normalized.slice(atIndex + 1);
        finalEmail = `${local}+dup${row.id}@${domain}`;
      }

      if (finalEmail !== row.emailAddress) {
        await queryInterface.sequelize.query(
          "UPDATE Users SET emailAddress = :email WHERE id = :id",
          {
            replacements: { email: finalEmail, id: row.id },
          }
        );
      }
    }

    await queryInterface.changeColumn("Users", "emailAddress", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true, // 👈 ensures uniqueness at the DB level
    });
    
    await queryInterface.removeColumn("Users", "pcoId");
    await queryInterface.removeColumn("Users", "nickName");
    await queryInterface.removeColumn("Users", "gender");
    await queryInterface.removeColumn("Users", "anniversary");
    await queryInterface.removeColumn("Users", "avatar");
    await queryInterface.removeColumn("Users", "birthDate");
  },
};
