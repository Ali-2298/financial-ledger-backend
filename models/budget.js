const mongoose = require('mongoose');
const { Schema } = mongoose;

const BudgetItemSchema = new Schema({
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  limitAmount: { type: Number, required: true, min: 0 },
});

const BudgetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  name: { type: String, required: true },

  periodType: { 
    type: String, 
    enum: ['monthly', 'weekly', 'custom'], 
    required: true 
  },

  startDate: { type: Date, required: true },

  endDate: { type: Date, required: true },

  currency: { type: String, default: 'BHD' },

  alertThresholdPercent: { type: Number, default: 80 },

  items: [BudgetItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Budget', BudgetSchema);

