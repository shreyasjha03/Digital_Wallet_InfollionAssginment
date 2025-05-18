const mongoose = require('mongoose');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const FraudService = require('./fraud.service');
const EmailService = require('./email.service');

class WalletService {
  static async deposit(userId, amount, currency = 'USD') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      if (amount <= 0) {
        throw new Error('Invalid deposit amount');
      }

      // Create transaction record
      const transaction = new Transaction({
        type: 'DEPOSIT',
        amount,
        currency,
        toUser: userId,
        status: 'PENDING',
        description: 'Wallet deposit'
      });

      // Analyze for fraud
      await FraudService.analyzeTransaction(transaction);

      if (transaction.status === 'FLAGGED') {
        await session.abortTransaction();
        // Send suspicious transaction alert
        await EmailService.sendTransactionAlert(user, transaction);
        return { transaction, status: 'FLAGGED' };
      }

      // Check for large transaction
      if (EmailService.isLargeTransaction(amount, currency)) {
        await EmailService.sendLargeTransactionAlert(user, transaction);
      }

      // Update user balance
      user.wallet.balance += amount;
      await user.save({ session });

      // Complete transaction
      transaction.status = 'COMPLETED';
      await transaction.save({ session });

      await session.commitTransaction();
      return { transaction, status: 'COMPLETED' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async withdraw(userId, amount, currency = 'USD') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      if (amount <= 0) {
        throw new Error('Invalid withdrawal amount');
      }

      if (user.wallet.balance < amount) {
        throw new Error('Insufficient funds');
      }

      // Create transaction record
      const transaction = new Transaction({
        type: 'WITHDRAWAL',
        amount,
        currency,
        fromUser: userId,
        status: 'PENDING',
        description: 'Wallet withdrawal'
      });

      // Analyze for fraud
      await FraudService.analyzeTransaction(transaction);

      if (transaction.status === 'FLAGGED') {
        await session.abortTransaction();
        // Send suspicious transaction alert
        await EmailService.sendTransactionAlert(user, transaction);
        return { transaction, status: 'FLAGGED' };
      }

      // Check for large transaction
      if (EmailService.isLargeTransaction(amount, currency)) {
        await EmailService.sendLargeTransactionAlert(user, transaction);
      }

      // Update user balance
      user.wallet.balance -= amount;
      await user.save({ session });

      // Complete transaction
      transaction.status = 'COMPLETED';
      await transaction.save({ session });

      await session.commitTransaction();
      return { transaction, status: 'COMPLETED' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async transfer(fromUserId, toUserId, amount, currency = 'USD') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [fromUser, toUser] = await Promise.all([
        User.findById(fromUserId).session(session),
        User.findById(toUserId).session(session)
      ]);

      if (!fromUser || !toUser) {
        throw new Error('User not found');
      }

      if (amount <= 0) {
        throw new Error('Invalid transfer amount');
      }

      if (fromUser.wallet.balance < amount) {
        throw new Error('Insufficient funds');
      }

      // Create transaction record
      const transaction = new Transaction({
        type: 'TRANSFER',
        amount,
        currency,
        fromUser: fromUserId,
        toUser: toUserId,
        status: 'PENDING',
        description: 'Wallet transfer'
      });

      // Analyze for fraud
      await FraudService.analyzeTransaction(transaction);

      if (transaction.status === 'FLAGGED') {
        await session.abortTransaction();
        // Send suspicious transaction alerts to both users
        await Promise.all([
          EmailService.sendTransactionAlert(fromUser, transaction),
          EmailService.sendTransactionAlert(toUser, transaction)
        ]);
        return { transaction, status: 'FLAGGED' };
      }

      // Check for large transaction
      if (EmailService.isLargeTransaction(amount, currency)) {
        await Promise.all([
          EmailService.sendLargeTransactionAlert(fromUser, transaction),
          EmailService.sendLargeTransactionAlert(toUser, transaction)
        ]);
      }

      // Update balances
      fromUser.wallet.balance -= amount;
      toUser.wallet.balance += amount;

      await Promise.all([
        fromUser.save({ session }),
        toUser.save({ session })
      ]);

      // Complete transaction
      transaction.status = 'COMPLETED';
      await transaction.save({ session });

      await session.commitTransaction();
      return { transaction, status: 'COMPLETED' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getBalance(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.wallet;
  }

  static async getTransactionHistory(userId, limit = 10, skip = 0) {
    return Transaction.getUserHistory(userId, limit, skip);
  }
}

module.exports = WalletService; 