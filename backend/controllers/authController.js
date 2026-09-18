// const asyncHandler = require('../middleware/asyncHandler');
// const User = require('../models/User');
// const generateToken = require('../utils/generateToken');

// // @desc    Register a new staff member
// // @route   POST /api/auth/register
// // @access  Private/Admin (or open only when no users exist yet, e.g. first setup)
// const registerStaff = asyncHandler(async (req, res) => {
//   const { name, email, password, role } = req.body;

//   if (!name || !email || !password) {
//     res.status(400);
//     throw new Error('Name, email and password are required');
//   }

//   const userCount = await User.countDocuments();
//   // Once at least one account exists, only an authenticated admin may create more staff
//   if (userCount > 0 && (!req.user || req.user.role !== 'admin')) {
//     res.status(403);
//     throw new Error('Only an admin can register new staff accounts');
//   }

//   const existing = await User.findOne({ email });
//   if (existing) {
//     res.status(400);
//     throw new Error('An account with that email already exists');
//   }

//   const user = await User.create({
//     name,
//     email,
//     password,
//     // The very first account created becomes an admin automatically
//     role: userCount === 0 ? 'admin' : role || 'pharmacist',
//   });

//   res.status(201).json({
//     success: true,
//     data: user.toSafeObject(),
//     token: generateToken(user._id),
//   });
// });

// // @desc    Staff login
// // @route   POST /api/auth/login
// // @access  Public
// const loginStaff = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     res.status(400);
//     throw new Error('Email and password are required');
//   }

//   const user = await User.findOne({ email });

//   if (!user || !(await user.matchPassword(password))) {
//     res.status(401);
//     throw new Error('Invalid email or password');
//   }

//   if (!user.isActive) {
//     res.status(403);
//     throw new Error('This account has been deactivated');
//   }

//   res.json({
//     success: true,
//     data: user.toSafeObject(),
//     token: generateToken(user._id),
//   });
// });

// // @desc    Get the logged-in staff member's profile
// // @route   GET /api/auth/me
// // @access  Private
// const getMe = asyncHandler(async (req, res) => {
//   res.json({ success: true, data: req.user.toSafeObject() });
// });

// // @desc    List all staff accounts
// // @route   GET /api/auth/staff
// // @access  Private/Admin
// const listStaff = asyncHandler(async (req, res) => {
//   const staff = await User.find().select('-password').sort({ createdAt: -1 });
//   res.json({ success: true, count: staff.length, data: staff });
// });

// module.exports = { registerStaff, loginStaff, getMe, listStaff };












const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Sale = require('../models/Sale');
const generateToken = require('../utils/generateToken');

// Roles a logged-in admin may assign when inviting a staff member into
// their own pharmacy. "admin" is excluded — that can only be claimed by
// self-registering (which starts a brand new, independent pharmacy).
const SELF_SERVICE_ROLES = ['pharmacist', 'cashier'];

// @desc    Register an account. What happens depends on context:
//            - anyone signing up on the public form starts a brand new,
//              independent pharmacy and becomes its admin automatically
//              (their tenantId is their own _id)
//            - a logged-in admin may instead use this route to invite a
//              staff member into their *own* pharmacy; that staff member
//              inherits the admin's tenantId and role (pharmacist/cashier)
// @route   POST /api/auth/register
// @access  Public (self sign-up) / Private-Admin (inviting staff)
const registerStaff = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('An account with that email already exists');
  }

  const invitingAdmin = req.user && req.user.role === 'admin' ? req.user : null;

  const user = await User.create({
    name,
    email,
    password,
    role: invitingAdmin ? (SELF_SERVICE_ROLES.includes(role) ? role : 'pharmacist') : 'admin',
    // Staff invited by an admin join that admin's pharmacy. Anyone signing
    // up on their own starts a new pharmacy, so they are their own tenant
    // root — filled in just below once we know their own _id.
    tenantId: invitingAdmin ? invitingAdmin.tenantId : undefined,
  });

  if (!invitingAdmin) {
    user.tenantId = user._id;
    await user.save();
  }

  res.status(201).json({
    success: true,
    data: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @desc    Staff login
// @route   POST /api/auth/login
// @access  Public
const loginStaff = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }

  res.json({
    success: true,
    data: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @desc    Get the logged-in staff member's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toSafeObject() });
});

// @desc    List all staff accounts
// @route   GET /api/auth/staff
// @access  Private/Admin
const listStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({ tenantId: req.user.tenantId })
    .select('-password')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: staff.length, data: staff });
});

// @desc    Delete the logged-in user's account.
//            - If this account is the pharmacy's admin (the tenant root),
//              this permanently deletes the whole pharmacy: every staff
//              account, every medicine and every sale tied to it.
//            - If this account is a staff member, only that one account
//              is removed; the pharmacy's data and other staff are
//              untouched.
//          Irreversible.
// @route   DELETE /api/auth/me
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const isTenantRoot = req.user.role === 'admin';

  if (isTenantRoot) {
    const tenantId = req.user.tenantId;
    await Promise.all([
      User.deleteMany({ tenantId }),
      Medicine.deleteMany({ tenantId }),
      Sale.deleteMany({ tenantId }),
    ]);
  } else {
    await User.deleteOne({ _id: req.user._id });
  }

  res.json({ success: true, data: { deletedWholePharmacy: isTenantRoot } });
});

module.exports = { registerStaff, loginStaff, getMe, listStaff, deleteAccount };
