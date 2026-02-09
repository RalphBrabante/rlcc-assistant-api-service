"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PasswordResetTokens", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tokenHash: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      consumedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("PasswordResetTokens", ["userId"], {
      name: "password_reset_tokens_user_id_idx",
    });
    await queryInterface.addIndex("PasswordResetTokens", ["tokenHash"], {
      unique: true,
      name: "password_reset_tokens_token_hash_uidx",
    });
    await queryInterface.addIndex("PasswordResetTokens", ["expiresAt"], {
      name: "password_reset_tokens_expires_at_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("PasswordResetTokens");
  },
};

