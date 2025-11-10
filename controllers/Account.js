const express = require("express");
const router = express.Router();

const Account = require("../models/Account.js");

// Index
router.get("/", async (req,res)=>{ // so we can get all the transaction from our database
  try {
    const populatedAccounts = await Account.find({owner:req.session.user._id}).populate("owner")
   
    res.render("account/index.ejs",{populatedAccounts}) ;
  } catch(error) {
    console.log(error);
    res.redirect("/");
  }
});


// Create Form
router.get("/new",async(req,res)=>{ //for the transaction to add new\
  try {
    
    res.render("account/new.ejs");
  } catch (error) {
    
  }
});


// Create
router.post("/", async (req, res) => {
  
    req.body.owner = req.session.user._id;
   await Account.create(req.body);
    console.log(req.body);
    res.redirect("/accounts");
  
    
  
});



// Edit Form
router.get("/:accountId/edit", async (req, res) => {
  try {
    const account = await Account.findById(req.params.accountId);
    
    if (!account) {
      console.log("Account not found");
      return res.redirect("/accounts");
    }
    
    // Check ownership
    if (account.owner.equals(req.session.user._id)) {
      res.render("account/edit.ejs", { account });
    } else {
      console.log("Permission denied");
      res.redirect("/accounts");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});



// Update
router.put('/:accountId', async (req, res) => {
  try {
    const account = await Account.findById(req.params.accountId);
    
    if (!account) {
      console.log("Account not found ")
      
      return res.redirect("/accounts");
    }
    
    // Check if the user owns this account
    if (account.owner.equals(req.session.user._Id)) {
      console.log("Permission granted-updating the account ");
      await account.updateOne(req.body);
      
      console.log("Updated");
      res.redirect(`/accounts/${req.params.accountid}`);
    } else {
      console.log("Permission denied ");
      res.redirect("/accounts");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});


// Delete
router.delete('/:accountId', async (req, res) => {
  try {
    const account = await Account.findById(req.params.accountId);
    
    if (!account) {
      console.log("Account not found");
      
      return res.redirect("/accounts");
    }
    
    // Check if the user owns this account
    if (account.owner.equals(req.session.user._id)) {
      console.log("Permission granted - deleting account");
      
      // Uncomment below if you want to check for transactions
      // const Transaction = require("../models/Transaction.js");
      // const transactionCount = await Transaction.countDocuments({ 
      //   account: req.params.accountId 
      // });
      
      // if (transactionCount > 0) {
      //   console.log(`Cannot delete - ${transactionCount} transaction(s) associated`);
      //   return res.redirect("/accounts");
      // }
      
      console.log("Deleting account");
      await account.deleteOne();
      // FIXED: Changed /account to /accounts
      res.redirect("/accounts");
    } else {
      console.log("Permission denied - user does not own this account");
      res.redirect("/accounts");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});
    // Show
    router.get("/:accountId", async (req, res) => {
      try {
        const populatedAccount = await Account.findById(
          req.params.accountId
        ).populate("owner");

        if(populatedAccount.owner.equals(req.session.user._id)){
          res.render("account/show.ejs",{account:populatedAccount});
        }else{
          console.log("Permission Denied - not your account");
          res.redirect("/accounts")
        }
        
        
      } catch (error) {
        console.log(error);
        res.redirect("/");
      }
    });

    
module.exports = router;