const express = require('express');
const router = express.Router();
const Budget = require('../models/budget');
const Transaction = require('../models/transaction');  // Add this

// Index - Get all budgets
router.get('/', async (req, res) => {
    console.log('GET /api/budgets hit!');
    try {
        const budgets = await Budget.find({ userId: req.user._id });  // teh mistake i used owner and it should be user id 
        res.json(budgets);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
});

// Create - Add new budget
router.post('/', async (req, res) => {
    console.log('POST /api/budget hit!');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    try {
        const { name, periodType, startDate, endDate, currency, alertThresholdPercent, items } = req.body;  // Added items and alertThresholdPercent
        
        const newBudget = new Budget({
            userId: req.user._id,  // Fixed: userId
            name,
            periodType,
            startDate,
            endDate,
            currency,
            alertThresholdPercent,//it will warn the user when he reached 80% of his budget not sure about it still 
            items
        });
        
        const savedBudget = await newBudget.save();
        res.json(savedBudget);
    } catch (err) {
        console.error('Error creating budget:', err);
        res.status(500).json({ error: 'Failed to create budget' });
    }
});

// Show - Get single budget by ID
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

// Update - Edit budget
router.put('/:budgetId', async (req, res) => {
    try {
        const { name, periodType, startDate, endDate, currency, alertThresholdPercent, items } = req.body;  
        
        const budget = await Budget.findById(req.params.budgetId); 
        
        if (!budget) {
            console.log("Budget not found");
            return res.status(404).json({ error: 'Budget not found' });
        }
        
        if (!budget.userId.equals(req.user._id)) {  
            console.log("Permission denied");
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        console.log("Permission granted - updating the budget");
        
        const updatedBudget = await Budget.findByIdAndUpdate(
            req.params.budgetId,
            { name, periodType, startDate, endDate, currency, alertThresholdPercent, items },  
            { new: true }
        ); 
        
        console.log("Updated");
        res.json(updatedBudget);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update budget' });
    }
});

// Delete - Remove budget
router.delete('/:budgetId', async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.budgetId);
        
        if (!budget) {
            console.log("Budget not found");
            return res.status(404).json({ error: 'Budget not found' });
        }
        
        if (!budget.userId.equals(req.user._id)) {  
            console.log("Permission denied - user does not own this budget");
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        console.log("Permission granted - deleting budget");
        
        await budget.deleteOne();
        
        res.json({ message: 'Budget deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete budget' });
    }
});

// GET /:budgetId/report - Get budget report with calculations
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
            user: req.user._id,
            date: { $gte: budget.startDate, $lte: budget.endDate },
            isExcluded: { $ne: true },
            isRefund: { $ne: true },
            type: 'expense'
        }).populate('account', 'accountName').populate('category', 'name').sort({ date: 1 });
        
        let totalSpent = 0;
        const spentByAccount = {};
        
        transactions.forEach(tx => {
            const accountName = tx.account ? tx.account.accountName : 'Unknown Account';
            const categoryName = tx.category ? tx.category.name : 'Uncategorized';
            
            if (!spentByAccount[accountName]) {
                spentByAccount[accountName] = { total: 0, categories: {} };
            }
            
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
