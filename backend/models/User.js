const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['admin', 'pharmacist', 'cashier'],
      default: 'pharmacist',
    },
    isActive: { type: Boolean, default: true },
    // Identifies which pharmacy's data this account can see. An admin who
    // self-registers is the root of their own pharmacy, so their tenantId
    // is their own _id. A staff member invited by an admin inherits that
    // admin's tenantId, so they share the same pharmacy's data.
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    tenantId: this.tenantId,
  };
};

module.exports = mongoose.model('User', userSchema);
