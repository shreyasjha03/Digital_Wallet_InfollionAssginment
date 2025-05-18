const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'BONUS']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.type === 'TRANSFER' || this.type === 'WITHDRAWAL';
    }
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.type === 'TRANSFER';
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'FLAGGED'],
    default: 'PENDING'
  },
  description: {
    type: String,
    trim: true
  },
  fraudScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  fraudFlags: [{
    type: String,
    enum: [
      'HIGH_FREQUENCY',
      'LARGE_AMOUNT',
      'SUSPICIOUS_PATTERN',
      'UNUSUAL_TIME',
      'MULTIPLE_ACCOUNTS'
    ]
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  metadata: {
    ipAddress: String,
    deviceInfo: String,
    location: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ fromUser: 1, createdAt: -1 });
transactionSchema.index({ toUser: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ fraudScore: -1 });
transactionSchema.index({ isDeleted: 1 });

// Method to check if transaction is suspicious
transactionSchema.methods.isSuspicious = function() {
  return this.fraudScore >= 70 || this.fraudFlags.length > 0;
};

// Method to soft delete transaction
transactionSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Method to restore transaction
transactionSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

// Static method to get user's transaction history
transactionSchema.statics.getUserHistory = async function(userId, limit = 10, skip = 0) {
  return this.find({
    $or: [{ fromUser: userId }, { toUser: userId }],
    isDeleted: false
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('fromUser', 'email firstName lastName')
  .populate('toUser', 'email firstName lastName');
};

// Static method to get flagged transactions
transactionSchema.statics.getFlaggedTransactions = async function(limit = 10, skip = 0) {
  return this.find({
    $or: [
      { fraudScore: { $gte: 70 } },
      { fraudFlags: { $exists: true, $ne: [] } }
    ],
    isDeleted: false
  })
  .sort({ fraudScore: -1, createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('fromUser', 'email firstName lastName')
  .populate('toUser', 'email firstName lastName');
};

// Modify find queries to exclude soft-deleted transactions by default
transactionSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

transactionSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 