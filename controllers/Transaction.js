const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Index
router.get("/", async (req, res) => { 
  try {
    const populatedTransactions = await Transaction.find({user:req.session._id}).populate("account");
    
    res.render("transaction/index.ejs", { populatedTransactions });
  } catch(error) {
    console.log(error);
    res.redirect("/");
  }
});




//create form 
router.get("/new",async(req,res)=>{ //for the transaction to add new\
  try {
    
    res.render("transaction/new.ejs");
  } catch (error) {
    
  }
});


//create
router.post("/", async (req, res) => {
  try {
    req.body.accountId = req.session.accountId._id;
    await Transaction.create(req.body);
    console.log(req.body);
    res.redirect("/transactions");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// Edit Form
router.get("/:transactionId/edit", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);
    
    if (!transaction) {
      console.log("Transaction not found");
      return res.redirect("/transactions");
    }
    
    // Check ownership
    if (transaction.user.equals(req.session.user._id)) {
      res.render("transaction/edit.ejs", { transaction });
    } else {
      console.log("Permission denied");
      res.redirect("/transactions");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});



//update router 

router.put('/:transactionId', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);
    
    if (!transaction) {
        console.log("Transaction not found ")
     
      return res.redirect("/transactions");
    }
    
    // check if the user owns this account
    if (transaction.user.equals(req.session.user._id)) {
      console.log("Permission granted-updating the transaction ");
      await transaction.updateOne(req.body);
    
      console.log("Updated");
      res.redirect(`/transactions/${req.params.transactionId}`);
    } else {
      console.log("Permission denied ");
      res.redirect("/transactions");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});



//Delete router 
router.delete('/:transactiontId', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactiontId);
    
    if (!transaction) {
      console.log("Transaction not found");
      return res.redirect("/transactions");
    }
    
    // Check if the user owns this account
    if (transaction.user.equals(req.session.user._id)) {
      console.log("Permission granted - checking for associated transactions");
      
      
          
          console.log("Deleting transaction");
          await transaction.deleteOne();
          res.redirect("/transactions");
        } else {
          document.getElementById('message').textContent = "Permission denied - user does not own this transaction";
          res.redirect("/transactions");
        }
      } catch (error) {
        console.log(error);
        res.redirect("/");
      }
    });
//show
router.get("/:transactionId", async (req, res) => {
  try {
    const populatedTransaction = await Transaction.findById(
      req.params.transactionId
    ).populate("account");
    
     if (!populatedTransaction.user.equals(req.session.user._id)) {
      console.log("Permission denied - not your transaction");
      return res.redirect("/transactions");
    }
    
    res.render("transaction/show.ejs", { transaction: populatedTransaction });
    
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});




module.exports = router;



