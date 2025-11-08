const mongoose = require('mongoose');
const AccountSchema = new mongoose.Schema({
  accountName: {
    type: String ,
    required: true,
  },
  accountType: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  accountNumber: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
const Account = mongoose.model('Account', AccountSchema);
module.exports = Account;