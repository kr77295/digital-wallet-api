const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.get('/', transactionController.getHistory);

module.exports = router;
