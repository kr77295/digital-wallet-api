const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wallet = sequelize.define(
  'Wallet',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      field: 'user_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, 
    },
    balance: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
  },
  {
    tableName: 'wallets',
  }
);

module.exports = Wallet;
