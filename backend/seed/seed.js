// Creates a first admin account so you can log in immediately.
// Run with: npm run seed  (from the backend folder, after setting up .env)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@pharmacy.local';
  const existing = await User.findOne({ email });

  if (existing) {
    console.log('Admin account already exists:', email);
  } else {
    await User.create({
      name: 'Pharmacy Admin',
      email,
      password: 'ChangeMe123!',
      role: 'admin',
    });
    console.log('Admin account created.');
    console.log('  email:    admin@pharmacy.local');
    console.log('  password: ChangeMe123!');
    console.log('Log in and change this password (or the user) right away.');
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
