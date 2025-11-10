const express = require('express');
const router = express.Router();
const Account = require('../models/account');

// Index - Get all accounts
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

// Create - Add new account
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

// Show - Get single account by ID
router.get('/:accountId', async (req, res) => {
    try {
        const account = await Account.findOne({ 
            _id: req.params.accountId, 
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

// Update - Edit account
router.put('/:accountId', async (req, res) => {
    try {
        const { accountName, accountType, accountNumber, balance } = req.body;
        
        const account = await Account.findById(req.params.accountId);
        
        if (!account) {
            console.log("Account not found");
            return res.status(404).json({ error: 'Account not found' });
        }
        
        if (!account.owner.equals(req.user._id)) {
            console.log("Permission denied");
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        console.log("Permission granted - updating the account");
        
        const updatedAccount = await Account.findByIdAndUpdate(
            req.params.accountId,
            { accountName, accountType, accountNumber, balance },
            { new: true }
        ); 
        
        console.log("Updated");
        res.json(updatedAccount);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update account' });
    }
});

// Delete - Remove account
router.delete('/:accountId', async (req, res) => {
    try {
        const account = await Account.findById(req.params.accountId);
        
        if (!account) {
            console.log("Account not found");
            return res.status(404).json({ error: 'Account not found' });
        }
        
        if (!account.owner.equals(req.user._id)) {
            console.log("Permission denied - user does not own this account");
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        console.log("Permission granted - deleting account");
        
        await account.deleteOne();
        
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

module.exports = router;