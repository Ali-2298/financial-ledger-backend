const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    type: {
      type: String,
      required: true
    },
    category: {
      type: String
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    transactionDate: {
      type: Date,
      required: true
    },
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', required: true 
    },
    account: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account', 
      required: true
    },
    currency: {
      type: String,
      default: 'BHD'
    }
});

module.exports = mongoose.model("Transaction", transactionSchema);