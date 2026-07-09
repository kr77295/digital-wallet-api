const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define(
  'Transaction',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    walletId: {
      field: 'wallet_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      field: 'user_id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('credit', 'debit', 'transfer_in', 'transfer_out', 'withdrawal'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
  
    amountInUSD: {
      field: 'amount_in_usd',
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    balanceAfter: {
      field: 'balance_after',
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    counterpartyId: {
      field: 'counterparty_id',
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('success', 'failed', 'blocked'),
      defaultValue: 'success',
    },
    description: {
      type: DataTypes.STRING(255),
      defaultValue: '',
    },
  },
  {
    tableName: 'transactions',
    indexes: [{ fields: ['user_id', 'created_at'] }],
  }
);

module.exports = Transaction;
