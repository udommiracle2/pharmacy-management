const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    category: { type: String, trim: true, default: 'Uncategorized' },
    manufacturer: { type: String, trim: true },
    batchNumber: { type: String, trim: true },
    sku: { type: String, unique: true, sparse: true, trim: true },
    unit: { type: String, trim: true, default: 'unit' },
    costPrice: { type: Number, required: true, min: 0, default: 0 },
    sellingPrice: { type: Number, required: true, min: 0, default: 0 },
    quantityInStock: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, required: true, min: 0, default: 10 },
    expiryDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', genericName: 'text', sku: 'text' });

medicineSchema.virtual('isLowStock').get(function () {
  return this.quantityInStock <= this.reorderLevel;
});

medicineSchema.virtual('isExpired').get(function () {
  return this.expiryDate < new Date();
});

medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
