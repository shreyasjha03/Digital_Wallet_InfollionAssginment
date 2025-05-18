const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth.middleware');
const WalletService = require('../services/wallet.service');

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
  try {
    const balance = await WalletService.getBalance(req.user._id);
    res.json({
      status: 'success',
      data: { balance }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Deposit funds
router.post('/deposit',
  auth,
  [
    body('amount').isFloat({ min: 0.01 }),
    body('currency').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, currency } = req.body;
      const result = await WalletService.deposit(req.user._id, amount, currency);

      if (result.status === 'FLAGGED') {
        return res.status(400).json({
          status: 'error',
          message: 'Transaction flagged for suspicious activity',
          data: { transaction: result.transaction }
        });
      }

      res.json({
        status: 'success',
        data: { transaction: result.transaction }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Withdraw funds
router.post('/withdraw',
  auth,
  [
    body('amount').isFloat({ min: 0.01 }),
    body('currency').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, currency } = req.body;
      const result = await WalletService.withdraw(req.user._id, amount, currency);

      if (result.status === 'FLAGGED') {
        return res.status(400).json({
          status: 'error',
          message: 'Transaction flagged for suspicious activity',
          data: { transaction: result.transaction }
        });
      }

      res.json({
        status: 'success',
        data: { transaction: result.transaction }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Transfer funds
router.post('/transfer',
  auth,
  [
    body('toUserId').isMongoId(),
    body('amount').isFloat({ min: 0.01 }),
    body('currency').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { toUserId, amount, currency } = req.body;
      const result = await WalletService.transfer(req.user._id, toUserId, amount, currency);

      if (result.status === 'FLAGGED') {
        return res.status(400).json({
          status: 'error',
          message: 'Transaction flagged for suspicious activity',
          data: { transaction: result.transaction }
        });
      }

      res.json({
        status: 'success',
        data: { transaction: result.transaction }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Get transaction history
router.get('/transactions',
  auth,
  [
    body('limit').optional().isInt({ min: 1, max: 100 }),
    body('skip').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      const { limit = 10, skip = 0 } = req.query;
      const transactions = await WalletService.getTransactionHistory(
        req.user._id,
        parseInt(limit),
        parseInt(skip)
      );

      res.json({
        status: 'success',
        data: { transactions }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

module.exports = router; 