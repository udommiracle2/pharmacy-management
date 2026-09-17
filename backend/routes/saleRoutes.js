const express = require('express');
const { createSale, getSales, getSaleById } = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSales)
  .post(createSale);

router.get('/:id', getSaleById);

module.exports = router;
