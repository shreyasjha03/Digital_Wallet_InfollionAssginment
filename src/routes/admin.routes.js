const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { adminAuth } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const FraudService = require('../services/fraud.service');

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({
      status: 'success',
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get user details
router.get('/users/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, '-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update user status
router.patch('/users/:userId/status',
  adminAuth,
  [
    body('isActive').isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      user.isActive = req.body.isActive;
      await user.save();

      res.json({
        status: 'success',
        data: { user: user.getPublicProfile() }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Get flagged transactions
router.get('/transactions/flagged', adminAuth, async (req, res) => {
  try {
    const transactions = await Transaction.getFlaggedTransactions();
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
});

// Get daily fraud report
router.get('/reports/fraud', adminAuth, async (req, res) => {
  try {
    const report = await FraudService.getDailyFraudReport();
    res.json({
      status: 'success',
      data: { report }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get system statistics
router.get('/statistics', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalVolume
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Transaction.countDocuments(),
      Transaction.aggregate([
        { $match: { status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      status: 'success',
      data: {
        totalUsers,
        activeUsers,
        totalTransactions,
        totalVolume: totalVolume[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router; 