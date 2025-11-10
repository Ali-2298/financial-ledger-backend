const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');

// Index - Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ transactionDate: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create - Add a new transaction
router.post('/', async (req, res) => {
  try {
    const { type, category, amount, description, transactionDate } = req.body;

    if (!type || !category || !amount || !description || !transactionDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newTransaction = new Transaction({
      type,
      category,
      amount,
      description,
      transactionDate
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;