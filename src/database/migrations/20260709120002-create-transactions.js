'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      wallet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'wallets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('credit', 'debit', 'transfer_in', 'transfer_out', 'withdrawal'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },
      amount_in_usd: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      balance_after: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      counterparty_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('success', 'failed', 'blocked'),
        allowNull: false,
        defaultValue: 'success',
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // history is almost always queried per-user, sorted by date
    await queryInterface.addIndex('transactions', ['user_id', 'created_at'], {
      name: 'idx_transactions_user_created',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('transactions');
  },
};
