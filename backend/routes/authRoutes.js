const express = require('express');
const { registerStaff, loginStaff, getMe, listStaff } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginStaff);

router.post('/register', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
}, registerStaff);
router.get('/me', protect, getMe);
router.get('/staff', protect, authorize('admin'), listStaff);

module.exports = router;
