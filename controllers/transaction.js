const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');
const Account = require('../models/account')

// Get All Transaction
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ owner: req.user._id })
      .populate('account', 'accountName') 
      .sort({ transactionDate: -1 });

    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create New Transaction
router.post('/', async (req, res) => {
  try {
    const { type, category, amount, description, transactionDate, accountId } = req.body;

    if (!type || !category || !amount || !description || !transactionDate || !accountId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const accountExists = await Account.findById(accountId);
    if (!accountExists) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const newTransaction = new Transaction({
      type,
      category,
      amount,
      description,
      transactionDate,
      account: accountId,
      owner: req.user._id
    });

    const savedTransaction = await newTransaction.save();

    await savedTransaction.populate('account', 'accountName');

    res.status(201).json(savedTransaction);
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update Transaction
router.put('/:transactionId', async (req, res) => {
  try {
    const { type, category, amount, description, transactionDate, accountId } = req.body;

    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (!transaction.owner.equals(req.user._id)) return res.status(403).json({ error: 'Permission denied' });

    if (!type || !category || !amount || !description || !transactionDate || !accountId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const accountExists = await Account.findById(accountId);
    if (!accountExists) {
      return res.status(404).json({ message: 'Account not found' });
    }

    transaction.type = type;
    transaction.category = category;
    transaction.amount = amount;
    transaction.description = description;
    transaction.transactionDate = transactionDate;
    transaction.account = accountId;

    const updatedTransaction = await transaction.save();
    await updatedTransaction.populate('account', 'accountName');

    res.json(updatedTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete a Transaction
router.delete('/:transactionId', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (!transaction.owner.equals(req.user._id)) return res.status(403).json({ error: 'Permission denied' });

    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;