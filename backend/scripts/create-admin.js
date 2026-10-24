const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI?.trim() || process.env.MONGODB_URI?.trim();
const ADMIN_NAME = process.env.ADMIN_NAME?.trim();
const ADMIN_USERNAME = process.env.ADMIN_USERNAME?.trim();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function validateConfiguration() {
  if (!MONGO_URI) throw new Error('Set MONGO_URI before creating the admin account.');
  const uri = new URL(MONGO_URI);
  if (!['mongodb:', 'mongodb+srv:'].includes(uri.protocol)) {
    throw new Error('MONGO_URI must use mongodb:// or mongodb+srv://.');
  }
  if (decodeURIComponent(uri.pathname.replace(/^\/+/, '')) !== 'viatech') {
    throw new Error('Refusing to create an admin outside the isolated viatech database.');
  }
  if (!ADMIN_NAME || !ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_NAME, ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL)) {
    throw new Error('ADMIN_EMAIL must be a valid email address.');
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
  }
}

async function createAdmin() {
  validateConfiguration();
  await mongoose.connect(MONGO_URI);

  const users = mongoose.connection.db.collection('users');
  if (await users.countDocuments({ role: 'admin' })) {
    throw new Error('An admin already exists in this database; no account was created.');
  }

  if (await users.findOne({ $or: [{ email: ADMIN_EMAIL }, { username: ADMIN_USERNAME }] })) {
    throw new Error('That email or username already exists; no account was created.');
  }

  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ username: 1 }, { unique: true });

  const now = new Date();
  await users.insertOne({
    name: ADMIN_NAME,
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    password: await bcrypt.hash(ADMIN_PASSWORD, 12),
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  });
  console.log('Viatech admin account created successfully.');
}

createAdmin()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Admin account creation failed.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
