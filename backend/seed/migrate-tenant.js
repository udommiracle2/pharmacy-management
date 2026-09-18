// One-time migration: backfills the new `tenantId` field on any User,
// Medicine, or Sale documents created before multi-pharmacy support was
// added. Safe to run more than once — anything that already has a
// tenantId is left untouched.
//
// Run with: node seed/migrate-tenant.js  (from the backend folder, after
// setting up .env and BEFORE deploying the updated backend code, or right
// after — either way, run it once).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Sale = require('../models/Sale');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // 1. Every pre-existing admin becomes the root of their own pharmacy.
  const admins = await User.find({ role: 'admin', tenantId: { $exists: false } });
  for (const admin of admins) {
    admin.tenantId = admin._id;
    await admin.save();
    console.log(`Admin ${admin.email} -> tenantId ${admin._id}`);
  }

  // 2. Any pre-existing non-admin staff join the first admin's pharmacy
  //    (best effort — this app had no multi-pharmacy concept before, so
  //    there's no record of which admin they originally worked under).
  const fallbackAdmin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
  if (fallbackAdmin) {
    const staffResult = await User.updateMany(
      { tenantId: { $exists: false } },
      { $set: { tenantId: fallbackAdmin._id } }
    );
    console.log(`Staff backfilled to tenant ${fallbackAdmin._id}: ${staffResult.modifiedCount}`);

    // 3. All pre-existing medicines and sales also move under that same
    //    pharmacy, since previously everyone shared one global dataset.
    const medResult = await Medicine.updateMany(
      { tenantId: { $exists: false } },
      { $set: { tenantId: fallbackAdmin._id } }
    );
    console.log(`Medicines backfilled: ${medResult.modifiedCount}`);

    const saleResult = await Sale.updateMany(
      { tenantId: { $exists: false } },
      { $set: { tenantId: fallbackAdmin._id } }
    );
    console.log(`Sales backfilled: ${saleResult.modifiedCount}`);
  } else {
    console.log('No admin account found yet — nothing to backfill medicines/sales to. Register your first account, then re-run this script if you still have old data to migrate.');
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
