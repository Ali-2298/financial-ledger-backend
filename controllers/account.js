const express = require('express');
const router = express.Router();
const Account = require('../models/account');

router.post('/', async (req, res) => {
    console.log('POST /api/accounts hit!');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    try {
        const { accountName, accountType, accountNumber, balance } = req.body;
        
        const newAccount = new Account({
            accountName,
            accountType,
            accountNumber,
            balance: balance || 0,
            owner: req.user._id
        });
        
        const savedAccount = await newAccount.save();
        res.json(savedAccount);
    } catch (err) {
        console.error('Error creating account:', err);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

router.get('/', async (req, res) => {
    console.log('GET /api/accounts hit!');
    try {
        const accounts = await Account.find({ owner: req.user._id });
        res.json(accounts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const account = await Account.findOne({ 
            _id: req.params.id, 
            owner: req.user._id 
        });
        
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }
        
        res.json(account);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch account' });
    }
});

module.exports = router;