const express = require('express');
const router = express.Router();
const Budget = require('../models/budget');
const Transaction = require('../models/transaction');

// Get all budgets for the logged-in user
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Create a new budget
router.post('/', async (req, res) => {
  try {
    const { name, periodType, startDate, endDate, currency, alertThresholdPercent, items } = req.body;
    const newBudget = new Budget({
      userId: req.user._id,
      name,
      periodType,
      startDate,
      endDate,
      currency,
      alertThresholdPercent,
      items
    });
    const savedBudget = await newBudget.save();
    res.json(savedBudget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Get single budget by ID
router.get('/:budgetId', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.budgetId, 
      userId: req.user._id
    });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// Update budget by ID
router.put('/:budgetId', async (req, res) => {
  try {
    const { name, periodType, startDate, endDate, currency, alertThresholdPercent, items } = req.body;

    const budget = await Budget.findById(req.params.budgetId);
    if (!budget) return res.status(404).json({ error: 'Budget not found' });

    if (!budget.userId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.budgetId, 
      { name, periodType, startDate, endDate, currency, alertThresholdPercent, items }, 
      { new: true }
    );

    res.json(updatedBudget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// Delete budget by ID
router.delete('/:budgetId', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId);
    if (!budget) return res.status(404).json({ error: 'Budget not found' });

    if (!budget.userId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await budget.deleteOne();
    res.json({ message: 'Budget deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

// GET budget report with transactions grouped by account and category
router.get('/:budgetId/report', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.budgetId,
      userId: req.user._id
    });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const transactions = await Transaction.find({
      owner: req.user._id,
      transactionDate: { $gte: budget.startDate, $lte: budget.endDate },
      isExcluded: { $ne: true },
      isRefund: { $ne: true },
      type: 'expense'
    })
    .populate('account', 'accountName')
    .populate('category', 'name')
    .sort({ transactionDate: 1 });

    let totalSpent = 0;
    const spentByAccount = {};

    transactions.forEach(tx => {
      const accountName = tx.account ? tx.account.accountName : 'Unknown Account';
      const categoryName = tx.category ? tx.category.name : 'Uncategorized';

      if (!spentByAccount[accountName]) spentByAccount[accountName] = { total: 0, categories: {} };
      if (!spentByAccount[accountName].categories[categoryName]) {
        spentByAccount[accountName].categories[categoryName] = { total: 0, transactions: [] };
      }

      spentByAccount[accountName].categories[categoryName].transactions.push(tx);
      spentByAccount[accountName].categories[categoryName].total += tx.amount;
      spentByAccount[accountName].total += tx.amount;
      totalSpent += tx.amount;
    });

    res.json({
      budget,
      totalSpent,
      spentByAccount,
      transactions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate budget report' });
  }
});

module.exports = router;
