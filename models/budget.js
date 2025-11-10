const mongoose = require('mongoose');
const BudgetSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
       description: {
    type: String,
    required: true,
  },
    transactionDate: {
    type: Date,
    required: true,
  },
   balance: {
    type: Number,
    required: true,
  },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
const Budget = mongoose.model('Budget', BudgetSchema);
module.exports = Budget;