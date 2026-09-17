const asyncHandler = require('../middleware/asyncHandler');
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');

// @desc    Record a sale and automatically reduce stock for each item sold
// @route   POST /api/sales
// @access  Private
const createSale = asyncHandler(async (req, res) => {
  const { items, customerName, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('A sale must include at least one item');
  }

  // First pass: load every medicine and make sure there is enough stock
  // before we commit to changing anything.
  const medicineDocs = {};
  for (const item of items) {
    if (!item.medicine || !item.quantity || item.quantity < 1) {
      res.status(400);
      throw new Error('Each sale item needs a medicine id and a quantity of at least 1');
    }

    const medicine = await Medicine.findById(item.medicine);
    if (!medicine) {
      res.status(404);
      throw new Error(`Medicine not found: ${item.medicine}`);
    }
    if (medicine.quantityInStock < item.quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${medicine.name}. Available: ${medicine.quantityInStock}`);
    }
    medicineDocs[item.medicine] = medicine;
  }

  // Second pass: build sale line items and reduce stock now that we know
  // every line is valid.
  const saleItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const medicine = medicineDocs[item.medicine];
    const unitPrice = medicine.sellingPrice;
    const subtotal = unitPrice * item.quantity;

    saleItems.push({
      medicine: medicine._id,
      name: medicine.name,
      quantity: item.quantity,
      unitPrice,
      subtotal,
    });

    totalAmount += subtotal;

    medicine.quantityInStock -= item.quantity;
    await medicine.save();
  }

  const sale = await Sale.create({
    items: saleItems,
    totalAmount,
    customerName,
    paymentMethod,
    soldBy: req.user._id,
  });

  res.status(201).json({ success: true, data: sale });
});

// @desc    List sales, optionally filtered by date range
// @route   GET /api/sales?from=&to=
// @access  Private
const getSales = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const query = {};

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const sales = await Sale.find(query)
    .populate('soldBy', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: sales.length, data: sales });
});

// @desc    Get a single sale
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate('soldBy', 'name email');
  if (!sale) {
    res.status(404);
    throw new Error('Sale not found');
  }
  res.json({ success: true, data: sale });
});

module.exports = { createSale, getSales, getSaleById };
