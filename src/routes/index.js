const express = require('express');
const authRoutes = require('./auth.routes');
const walletRoutes = require('./wallet.routes');
const transactionRoutes = require('./transaction.routes');

const router = express.Router();

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/wallet', walletRoutes);
router.use('/transactions', transactionRoutes);

module.exports = router;
