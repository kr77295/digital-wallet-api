const { Wallet, User, Transaction, sequelize } = require('../models');
const ApiError = require('../utils/apiError');
const currencyService = require('./currency.service');
const fraudService = require('./fraud.service');

const getWalletByUserId = async (userId) => {
  const wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) throw new ApiError(404, 'Wallet not found for this user.');
  return wallet;
};


const getBalance = async (userId, displayCurrency) => {
  const wallet = await getWalletByUserId(userId);
  const balance = Number(wallet.balance);

  if (!displayCurrency || displayCurrency === wallet.currency) {
    return { balance, currency: wallet.currency };
  }
  const converted = currencyService.convert(balance, wallet.currency, displayCurrency);
  return { balance: converted, currency: displayCurrency };
};


const addFunds = async (userId, amount, currency) => {
  return sequelize.transaction(async (t) => {
    const wallet = await Wallet.findOne({
      where: { userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!wallet) throw new ApiError(404, 'Wallet not found for this user.');

    const depositCurrency = currency || wallet.currency;
    const amountInWalletCurrency = currencyService.convert(amount, depositCurrency, wallet.currency);
    const amountInUSD = currencyService.toUSD(amount, depositCurrency);

    wallet.balance = Number(wallet.balance) + amountInWalletCurrency;
    await wallet.save({ transaction: t });

    const transaction = await Transaction.create(
      {
        walletId: wallet.id,
        userId,
        type: 'credit',
        amount: amountInWalletCurrency,
        currency: wallet.currency,
        amountInUSD,
        balanceAfter: wallet.balance,
        description: `Added funds (${amount} ${depositCurrency})`,
      },
      { transaction: t }
    );

    return { wallet, transaction };
  });
};


const withdrawFunds = async (userId, amount, currency) => {
  return sequelize.transaction(async (t) => {
    const wallet = await Wallet.findOne({
      where: { userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!wallet) throw new ApiError(404, 'Wallet not found for this user.');

    const withdrawCurrency = currency || wallet.currency;
    const amountInWalletCurrency = currencyService.convert(amount, withdrawCurrency, wallet.currency);
    const amountInUSD = currencyService.toUSD(amount, withdrawCurrency);

    if (amountInWalletCurrency > Number(wallet.balance)) {
      throw new ApiError(400, 'Insufficient wallet balance for this withdrawal.');
    }

    
    await fraudService.runPreTransactionChecks(userId, amountInUSD);

    wallet.balance = Number(wallet.balance) - amountInWalletCurrency;
    await wallet.save({ transaction: t });

    const transaction = await Transaction.create(
      {
        walletId: wallet.id,
        userId,
        type: 'withdrawal',
        amount: amountInWalletCurrency,
        currency: wallet.currency,
        amountInUSD,
        balanceAfter: wallet.balance,
        description: `Withdrawal (${amount} ${withdrawCurrency})`,
      },
      { transaction: t }
    );

    return { wallet, transaction };
  });
};


const transferFunds = async (senderId, recipientEmail, amount, currency) => {
  const recipient = await User.findOne({ where: { email: recipientEmail } });
  if (!recipient) throw new ApiError(404, 'Recipient not found.');
  if (recipient.id === senderId) {
    throw new ApiError(400, 'You cannot transfer funds to yourself.');
  }

  return sequelize.transaction(async (t) => {
   
    const [firstId, secondId] = [senderId, recipient.id].sort((a, b) => a - b);
    const wallets = await Wallet.findAll({
      where: { userId: [firstId, secondId] },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const senderWallet = wallets.find((w) => w.userId === senderId);
    const recipientWallet = wallets.find((w) => w.userId === recipient.id);

    if (!senderWallet || !recipientWallet) {
      throw new ApiError(404, 'Wallet not found.');
    }

    const transferCurrency = currency || senderWallet.currency;
    const amountInSenderCurrency = currencyService.convert(
      amount,
      transferCurrency,
      senderWallet.currency
    );
    const amountInUSD = currencyService.toUSD(amount, transferCurrency);

    if (amountInSenderCurrency > Number(senderWallet.balance)) {
      throw new ApiError(400, 'Insufficient wallet balance for this transfer.');
    }

    await fraudService.runPreTransactionChecks(senderId, amountInUSD);

    const amountInRecipientCurrency = currencyService.convert(
      amountInSenderCurrency,
      senderWallet.currency,
      recipientWallet.currency
    );

    senderWallet.balance = Number(senderWallet.balance) - amountInSenderCurrency;
    recipientWallet.balance = Number(recipientWallet.balance) + amountInRecipientCurrency;

    await senderWallet.save({ transaction: t });
    await recipientWallet.save({ transaction: t });

    const senderTxn = await Transaction.create(
      {
        walletId: senderWallet.id,
        userId: senderId,
        type: 'transfer_out',
        amount: amountInSenderCurrency,
        currency: senderWallet.currency,
        amountInUSD,
        balanceAfter: senderWallet.balance,
        counterpartyId: recipient.id,
        description: `Transfer to ${recipient.email}`,
      },
      { transaction: t }
    );

    await Transaction.create(
      {
        walletId: recipientWallet.id,
        userId: recipient.id,
        type: 'transfer_in',
        amount: amountInRecipientCurrency,
        currency: recipientWallet.currency,
        amountInUSD,
        balanceAfter: recipientWallet.balance,
        counterpartyId: senderId,
        description: 'Transfer from sender',
      },
      { transaction: t }
    );

    return { senderWallet, transaction: senderTxn };
  });
};

module.exports = { getWalletByUserId, getBalance, addFunds, withdrawFunds, transferFunds };
