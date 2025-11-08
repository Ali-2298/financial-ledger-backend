const mongoose = require('mongoose');//This page for creating the database for the Transaction
const Account = require('./Account.js');
const User = require('./User.js');
const TransactionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  transactionDate: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
});
const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;