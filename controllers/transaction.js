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
      transactionDate,
      owner: req.user._id
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

// Update - Edit a transaction

router.put('/:transactionId', async (req, res) => {
  try {
    const { type, category, description, amount, transactionDate } = req.body;

    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction) {
      console.log("Transaction not found");
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (!transaction.owner.equals(req.user._id)) {
      console.log("Permission denied");
      return res.status(403).json({ error: 'Permission denied' });
    }

    if (transaction.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.transactionId,
      { type, category, description, amount, transactionDate },
      { new: true }
    );

    console.log("Updated");
    res.json(updatedTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete - Delete a Transaction

router.delete('/:transactionId', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.transactionId);
        
        if (!transaction) {
            console.log("Transaction not found");
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        if (!transaction.owner.equals(req.user._id)) {
            console.log("Permission denied - user does not own this transaction");
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        console.log("Permission granted - deleting transaction");
        
        await transaction.deleteOne();
        
        res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});