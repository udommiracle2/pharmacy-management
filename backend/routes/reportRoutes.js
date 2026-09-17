const express = require('express');
const { getSummary, getSalesReport, getStockReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/sales', getSalesReport);
router.get('/stock', getStockReport);

module.exports = router;
