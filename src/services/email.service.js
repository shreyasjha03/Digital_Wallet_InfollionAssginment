const winston = require('winston');

class EmailService {
  static async sendEmail(to, subject, html) {
    try {
      // Mock email sending
      const mockEmailId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Log the mock email details
      winston.info('Mock Email Sent:', {
        to,
        subject,
        emailId: mockEmailId,
        timestamp: new Date().toISOString()
      });

      // In development, log the email content
      if (process.env.NODE_ENV !== 'production') {
        winston.debug('Mock Email Content:', {
          to,
          subject,
          html
        });
      }

      return {
        messageId: mockEmailId,
        to,
        subject,
        timestamp: new Date()
      };
    } catch (error) {
      winston.error('Error in mock email sending:', error);
      throw error;
    }
  }

  static async sendTransactionAlert(user, transaction) {
    const subject = 'Suspicious Transaction Alert';
    const html = `
      <h2>Suspicious Transaction Alert</h2>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>A suspicious transaction has been detected on your account:</p>
      <ul>
        <li>Type: ${transaction.type}</li>
        <li>Amount: ${transaction.amount} ${transaction.currency}</li>
        <li>Date: ${transaction.createdAt}</li>
        <li>Fraud Score: ${transaction.fraudScore}</li>
        <li>Flags: ${transaction.fraudFlags.join(', ')}</li>
      </ul>
      <p>Please review this transaction and contact support if you did not authorize it.</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  static async sendLargeTransactionAlert(user, transaction) {
    const subject = 'Large Transaction Alert';
    const html = `
      <h2>Large Transaction Alert</h2>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>A large transaction has been processed on your account:</p>
      <ul>
        <li>Type: ${transaction.type}</li>
        <li>Amount: ${transaction.amount} ${transaction.currency}</li>
        <li>Date: ${transaction.createdAt}</li>
      </ul>
      <p>If you did not authorize this transaction, please contact support immediately.</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Helper method to check if a transaction is large
  static isLargeTransaction(amount, currency = 'USD') {
    const largeAmountThresholds = {
      'USD': parseInt(process.env.LARGE_TRANSACTION_THRESHOLD_USD) || 10000,
      'EUR': parseInt(process.env.LARGE_TRANSACTION_THRESHOLD_EUR) || 8500,
      'GBP': parseInt(process.env.LARGE_TRANSACTION_THRESHOLD_GBP) || 7500
    };
    return amount >= (largeAmountThresholds[currency] || largeAmountThresholds['USD']);
  }
}

module.exports = EmailService; 