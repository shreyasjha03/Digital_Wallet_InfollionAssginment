const cron = require('node-cron');
const winston = require('winston');
const FraudService = require('./fraud.service');
const EmailService = require('./email.service');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');

class SchedulerService {
  static initScheduledTasks() {
    // Daily fraud scan at midnight
    cron.schedule('0 0 * * *', async () => {
      try {
        winston.info('Starting daily fraud scan...');
        const report = await FraudService.getDailyFraudReport();
        
        // Send email to admin users with the report
        await EmailService.sendEmail(
          'admin@digitalwallet.com',
          'Daily Fraud Report',
          `
            <h2>Daily Fraud Report</h2>
            <p>Date: ${new Date().toISOString()}</p>
            <p>Total Flagged Transactions: ${report.flaggedTransactions.length}</p>
            <p>Total Amount in Flagged Transactions: ${report.totalAmount}</p>
            <h3>Flagged Transactions:</h3>
            <ul>
              ${report.flaggedTransactions.map(tx => `
                <li>
                  Transaction ID: ${tx._id}<br>
                  Amount: ${tx.amount} ${tx.currency}<br>
                  Type: ${tx.type}<br>
                  Fraud Score: ${tx.fraudScore}<br>
                  Flags: ${tx.fraudFlags.join(', ')}
                </li>
              `).join('')}
            </ul>
          `
        );
        
        winston.info('Daily fraud scan completed');
      } catch (error) {
        winston.error('Error in daily fraud scan:', error);
      }
    });

    // Weekly transaction cleanup (every Sunday at 1 AM)
    cron.schedule('0 1 * * 0', async () => {
      try {
        winston.info('Starting weekly transaction cleanup...');
        const cleanupDays = parseInt(process.env.TRANSACTION_CLEANUP_DAYS) || 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - cleanupDays);

        const result = await Transaction.updateMany(
          {
            status: 'completed',
            createdAt: { $lt: cutoffDate },
            isDeleted: false
          },
          {
            $set: {
              isDeleted: true,
              deletedAt: new Date()
            }
          }
        );

        winston.info(`Transaction cleanup completed. Soft deleted ${result.modifiedCount} transactions.`);
      } catch (error) {
        winston.error('Error in transaction cleanup:', error);
      }
    });
  }
}

module.exports = SchedulerService; 