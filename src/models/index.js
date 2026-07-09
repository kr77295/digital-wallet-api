const sequelize = require('../config/database');
const User = require('./user.model');
const Wallet = require('./wallet.model');
const Transaction = require('./transaction.model');


User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

Wallet.hasMany(Transaction, { foreignKey: 'walletId' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId' });

Transaction.belongsTo(User, { foreignKey: 'counterpartyId', as: 'counterparty' });

module.exports = { sequelize, User, Wallet, Transaction };
