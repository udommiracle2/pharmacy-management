const asyncHandler = require('../middleware/asyncHandler');
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');

// @desc    High-level dashboard summary
// @route   GET /api/reports/summary
// @access  Private
const getSummary = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const tenantId = req.user.tenantId;

  const [totalMedicines, medicines, todaySales, lowStockCount] = await Promise.all([
    Medicine.countDocuments({ tenantId }),
    Medicine.find({ tenantId }),
    Sale.find({ tenantId, createdAt: { $gte: startOfToday } }),
    Medicine.countDocuments({ tenantId, $expr: { $lte: ['$quantityInStock', '$reorderLevel'] } }),
  ]);

  const now = new Date();
  const warningDate = new Date();
  warningDate.setDate(now.getDate() + (Number(process.env.EXPIRY_WARNING_DAYS) || 30));

  const expiringSoonCount = medicines.filter(
    (m) => m.expiryDate > now && m.expiryDate <= warningDate
  ).length;
  const expiredCount = medicines.filter((m) => m.expiryDate <= now).length;

  const stockValue = medicines.reduce((sum, m) => sum + m.costPrice * m.quantityInStock, 0);
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

  res.json({
    success: true,
    data: {
      totalMedicines,
      lowStockCount,
      expiringSoonCount,
      expiredCount,
      stockValue,
      todaySalesCount: todaySales.length,
      todayRevenue,
    },
  });
});

// @desc    Sales report over a date range, grouped by day, plus top sellers
// @route   GET /api/reports/sales?from=&to=
// @access  Private
const getSalesReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = { tenantId: req.user.tenantId };
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }

  const dailyTotals = await Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalRevenue: { $sum: '$totalAmount' },
        salesCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const topSellers = await Sale.aggregate([
    { $match: match },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.medicine',
        name: { $first: '$items.name' },
        quantitySold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.subtotal' },
      },
    },
    { $sort: { quantitySold: -1 } },
    { $limit: 10 },
  ]);

  res.json({
    success: true,
    data: {
      dailyTotals: dailyTotals.map((d) => ({ date: d._id, totalRevenue: d.totalRevenue, salesCount: d.salesCount })),
      topSellers,
    },
  });
});

// @desc    Current stock valuation report
// @route   GET /api/reports/stock
// @access  Private
const getStockReport = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({ tenantId: req.user.tenantId }).sort({ category: 1, name: 1 });

  const byCategory = {};
  for (const m of medicines) {
    const key = m.category || 'Uncategorized';
    if (!byCategory[key]) {
      byCategory[key] = { category: key, itemCount: 0, totalUnits: 0, stockValue: 0 };
    }
    byCategory[key].itemCount += 1;
    byCategory[key].totalUnits += m.quantityInStock;
    byCategory[key].stockValue += m.costPrice * m.quantityInStock;
  }

  res.json({
    success: true,
    data: {
      totalStockValue: medicines.reduce((sum, m) => sum + m.costPrice * m.quantityInStock, 0),
      byCategory: Object.values(byCategory),
      medicines,
    },
  });
});

module.exports = { getSummary, getSalesReport, getStockReport };
