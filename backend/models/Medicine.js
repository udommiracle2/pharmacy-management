const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    category: { type: String, trim: true, default: 'Uncategorized' },
    manufacturer: { type: String, trim: true },
    batchNumber: { type: String, trim: true },
    sku: { type: String, trim: true },
    unit: { type: String, trim: true, default: 'unit' },
    costPrice: { type: Number, required: true, min: 0, default: 0 },
    sellingPrice: { type: Number, required: true, min: 0, default: 0 },
    quantityInStock: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, required: true, min: 0, default: 10 },
    expiryDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Scopes this medicine to one pharmacy (a registered account and any
    // staff it invited). Every read/write is filtered by this field so
    // different pharmacies never see each other's inventory.
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', genericName: 'text', sku: 'text' });
// SKU only needs to be unique within one pharmacy, not across all pharmacies.
medicineSchema.index({ tenantId: 1, sku: 1 }, { unique: true, sparse: true });

medicineSchema.virtual('isLowStock').get(function () {
  return this.quantityInStock <= this.reorderLevel;
});

medicineSchema.virtual('isExpired').get(function () {
  return this.expiryDate < new Date();
});

medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
