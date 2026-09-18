const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema(
  {
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    items: { type: [saleItemSchema], validate: (v) => Array.isArray(v) && v.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    customerName: { type: String, trim: true, default: 'Walk-in customer' },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer'],
      default: 'cash',
    },
    soldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Scopes this sale to one pharmacy, same as Medicine.tenantId.
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sale', saleSchema);
