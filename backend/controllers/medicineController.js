const asyncHandler = require('../middleware/asyncHandler');
const Medicine = require('../models/Medicine');

const EXPIRY_WARNING_DAYS = Number(process.env.EXPIRY_WARNING_DAYS) || 30;

// @desc    List medicines, with optional search + filters
// @route   GET /api/medicines?q=&category=&filter=low-stock|expiring|expired
// @access  Private
const getMedicines = asyncHandler(async (req, res) => {
  const { q, category, filter } = req.query;
  const query = { tenantId: req.user.tenantId };

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { genericName: { $regex: q, $options: 'i' } },
      { sku: { $regex: q, $options: 'i' } },
      { manufacturer: { $regex: q, $options: 'i' } },
    ];
  }

  if (category) {
    query.category = category;
  }

  let medicines = await Medicine.find(query).sort({ name: 1 });

  const now = new Date();
  const warningDate = new Date();
  warningDate.setDate(now.getDate() + EXPIRY_WARNING_DAYS);

  if (filter === 'low-stock') {
    medicines = medicines.filter((m) => m.quantityInStock <= m.reorderLevel);
  } else if (filter === 'expiring') {
    medicines = medicines.filter((m) => m.expiryDate > now && m.expiryDate <= warningDate);
  } else if (filter === 'expired') {
    medicines = medicines.filter((m) => m.expiryDate <= now);
  }

  res.json({ success: true, count: medicines.length, data: medicines });
});

// @desc    Get a single medicine
// @route   GET /api/medicines/:id
// @access  Private
const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  res.json({ success: true, data: medicine });
});

// @desc    Add a new medicine
// @route   POST /api/medicines
// @access  Private
const createMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.create({
    ...req.body,
    createdBy: req.user._id,
    tenantId: req.user.tenantId,
  });
  res.status(201).json({ success: true, data: medicine });
});

// @desc    Update a medicine
// @route   PUT /api/medicines/:id
// @access  Private
const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  // Never let the request body move a medicine into a different pharmacy.
  const { tenantId, ...updates } = req.body;
  Object.assign(medicine, updates);
  await medicine.save();

  res.json({ success: true, data: medicine });
});

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Private
const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  await medicine.deleteOne();
  res.json({ success: true, data: { _id: req.params.id } });
});

// @desc    Alert list: medicines at or below their reorder level
// @route   GET /api/medicines/alerts/low-stock
// @access  Private
const getLowStockAlerts = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({
    tenantId: req.user.tenantId,
    $expr: { $lte: ['$quantityInStock', '$reorderLevel'] },
  }).sort({ quantityInStock: 1 });

  res.json({ success: true, count: medicines.length, data: medicines });
});

// @desc    Alert list: medicines expired or expiring within the warning window
// @route   GET /api/medicines/alerts/expiring
// @access  Private
const getExpiryAlerts = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || EXPIRY_WARNING_DAYS;
  const now = new Date();
  const warningDate = new Date();
  warningDate.setDate(now.getDate() + days);

  const medicines = await Medicine.find({
    tenantId: req.user.tenantId,
    expiryDate: { $lte: warningDate },
  }).sort({ expiryDate: 1 });

  const data = medicines.map((m) => ({
    ...m.toObject(),
    status: m.expiryDate <= now ? 'expired' : 'expiring-soon',
  }));

  res.json({ success: true, count: data.length, data });
});

module.exports = {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getLowStockAlerts,
  getExpiryAlerts,
};