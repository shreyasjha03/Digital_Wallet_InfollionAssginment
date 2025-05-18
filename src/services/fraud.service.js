const Transaction = require('../models/transaction.model');

class FraudService {
  static async analyzeTransaction(transaction) {
    let fraudScore = 0;
    const fraudFlags = [];

    // Check for high frequency transactions
    const recentTransactions = await Transaction.find({
      fromUser: transaction.fromUser,
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    });

    if (recentTransactions.length > 10) {
      fraudScore += 30;
      fraudFlags.push('HIGH_FREQUENCY');
    }

    // Check for large amount
    const largeAmountThreshold = 10000; // $10,000
    if (transaction.amount > largeAmountThreshold) {
      fraudScore += 40;
      fraudFlags.push('LARGE_AMOUNT');
    }

    // Check for unusual time (transactions between 1 AM and 5 AM)
    const hour = new Date().getHours();
    if (hour >= 1 && hour <= 5) {
      fraudScore += 20;
      fraudFlags.push('UNUSUAL_TIME');
    }

    // Check for multiple accounts
    if (transaction.type === 'TRANSFER') {
      const uniqueRecipients = await Transaction.distinct('toUser', {
        fromUser: transaction.fromUser,
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      });

      if (uniqueRecipients.length > 5) {
        fraudScore += 25;
        fraudFlags.push('MULTIPLE_ACCOUNTS');
      }
    }

    // Update transaction with fraud analysis
    transaction.fraudScore = Math.min(fraudScore, 100);
    transaction.fraudFlags = fraudFlags;
    
    if (transaction.isSuspicious()) {
      transaction.status = 'FLAGGED';
    }

    return transaction;
  }

  static async getDailyFraudReport() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const flaggedTransactions = await Transaction.find({
      status: 'FLAGGED',
      createdAt: { $gte: yesterday }
    }).populate('fromUser', 'email firstName lastName')
      .populate('toUser', 'email firstName lastName');

    const report = {
      totalFlagged: flaggedTransactions.length,
      totalAmount: flaggedTransactions.reduce((sum, t) => sum + t.amount, 0),
      byFlagType: {},
      transactions: flaggedTransactions
    };

    // Count by flag type
    flaggedTransactions.forEach(transaction => {
      transaction.fraudFlags.forEach(flag => {
        report.byFlagType[flag] = (report.byFlagType[flag] || 0) + 1;
      });
    });

    return report;
  }
}

module.exports = FraudService; 