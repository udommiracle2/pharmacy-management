const express = require('express');
const {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getLowStockAlerts,
  getExpiryAlerts,
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/alerts/low-stock', getLowStockAlerts);
router.get('/alerts/expiring', getExpiryAlerts);

router.route('/')
  .get(getMedicines)
  .post(createMedicine);

router.route('/:id')
  .get(getMedicineById)
  .put(updateMedicine)
  .delete(authorize('admin', 'pharmacist'), deleteMedicine);

module.exports = router;
