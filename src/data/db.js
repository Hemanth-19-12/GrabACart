// Grab A Cart - Persistent Database Layer & OTP Service
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'database.json');

// Default initial state with customer and admin-provisioned seller
const initialData = {
  users: [
    {
      id: 'usr_demo123',
      name: 'Demo Shopper',
      email: 'demo@grabacart.com',
      passwordHash: bcrypt.hashSync('password123', 8),
      role: 'customer',
      addresses: [
        {
          id: 'addr_1',
          label: 'Home',
          fullName: 'Demo Shopper',
          phone: '+91 98765 43210',
          address: '42, 80 Feet Road, 4th Block, Koramangala',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560034',
          country: 'India',
          isDefault: true
        }
      ],
      tempPassword: null,
      tempPasswordExpires: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_seller789',
      name: 'Grab A Cart Verified Merchant',
      email: 'seller@grabacart.com',
      passwordHash: bcrypt.hashSync('seller123', 8),
      role: 'seller', // Admin-provisioned seller
      storeName: 'Grab A Cart Official Flagship Store',
      gstin: '29ABCDE1234F1Z5',
      sellerRating: 4.9,
      fulfillmentHub: 'Bengaluru Express Logistics Hub',
      addresses: [
        {
          id: 'addr_seller_1',
          label: 'Warehouse & Fulfillment Hub',
          fullName: 'Grab A Cart Logistics',
          phone: '+91 80 4123 9999',
          address: 'Plot 18, Electronic City Phase 1',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560100',
          country: 'India',
          isDefault: true
        }
      ],
      tempPassword: null,
      tempPasswordExpires: null,
      createdAt: new Date().toISOString()
    }
  ],
  orders: []
};

// In-memory OTP storage
const otpStore = new Map();

// In-memory cache
let db = { ...initialData };

// Load database from file or initialize
function initDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(raw);
      if (!db.users.find(u => u.email === 'seller@grabacart.com')) {
        db.users.push(initialData.users[1]);
        saveDB();
      }
      console.log('📦 Grab A Cart Database loaded from disk.');
    } else {
      saveDB();
      console.log('📦 Initialized new Grab A Cart Database on disk.');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
    db = { ...initialData };
  }
}

// Save database to file
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database to disk:', err);
  }
}

// Initialize on require
initDB();

const dbService = {
  // --- USERS ---
  findUserByEmail: (email) => {
    if (!email) return null;
    return db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  },

  findUserById: (id) => {
    return db.users.find(u => u.id === id) || null;
  },

  createUser: async (userData) => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      passwordHash,
      role: 'customer',
      addresses: userData.addresses || [],
      tempPassword: null,
      tempPasswordExpires: null,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB();
    return newUser;
  },

  verifyPassword: (user, password) => {
    if (!user || !user.passwordHash) return false;
    return bcrypt.compareSync(password, user.passwordHash);
  },

  setTempPassword: (user, tempCode, expiresInMinutes = 15) => {
    user.tempPassword = tempCode;
    user.tempPasswordExpires = Date.now() + (expiresInMinutes * 60 * 1000);
    saveDB();
    return user;
  },

  updatePassword: async (user, newPassword) => {
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.tempPassword = null;
    user.tempPasswordExpires = null;
    saveDB();
    return user;
  },

  // --- OTP GENERATION & VERIFICATION ---
  generateOTP: (email, type = 'register', payload = null) => {
    const emailKey = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expires = Date.now() + (10 * 60 * 1000); // 10 minutes
    otpStore.set(emailKey, { otp, expires, type, payload });
    console.log(`\n========================================`);
    console.log(`🔐 [GRAB A CART OTP DISPATCH - ${type.toUpperCase()}]`);
    console.log(`Recipient: ${emailKey}`);
    console.log(`6-Digit Verification Code: ${otp}`);
    console.log(`Expires In: 10 Minutes`);
    console.log(`========================================\n`);
    return otp;
  },

  verifyOTP: (email, inputOtp, type = 'register') => {
    const emailKey = email.trim().toLowerCase();
    const record = otpStore.get(emailKey);
    if (!record) return { valid: false, message: 'No OTP requested or OTP has expired. Please request a new code.' };
    if (Date.now() > record.expires) {
      otpStore.delete(emailKey);
      return { valid: false, message: 'OTP has expired. Please request a new code.' };
    }
    if (record.type !== type) return { valid: false, message: 'Invalid OTP type.' };
    if (record.otp !== inputOtp.toString().trim()) {
      return { valid: false, message: 'Incorrect 6-digit OTP. Please check and try again.' };
    }
    const payload = record.payload;
    otpStore.delete(emailKey);
    return { valid: true, payload };
  },

  // --- ADDRESS BOOK ---
  getUserAddresses: (userId) => {
    const user = dbService.findUserById(userId);
    return user ? (user.addresses || []) : [];
  },

  addUserAddress: (userId, addressData) => {
    const user = dbService.findUserById(userId);
    if (!user) return null;
    if (!user.addresses) user.addresses = [];

    const newAddress = {
      id: 'addr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      label: addressData.label || 'Home',
      fullName: addressData.fullName,
      phone: addressData.phone,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state || '',
      zipCode: addressData.zipCode,
      country: addressData.country || 'India',
      isDefault: addressData.isDefault || user.addresses.length === 0
    };

    if (newAddress.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }

    user.addresses.push(newAddress);
    saveDB();
    return newAddress;
  },

  updateUserAddress: (userId, addressId, updatedData) => {
    const user = dbService.findUserById(userId);
    if (!user || !user.addresses) return null;

    const addrIndex = user.addresses.findIndex(a => a.id === addressId);
    if (addrIndex === -1) return null;

    if (updatedData.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }

    user.addresses[addrIndex] = {
      ...user.addresses[addrIndex],
      ...updatedData
    };
    saveDB();
    return user.addresses[addrIndex];
  },

  deleteUserAddress: (userId, addressId) => {
    const user = dbService.findUserById(userId);
    if (!user || !user.addresses) return false;

    const initialLen = user.addresses.length;
    user.addresses = user.addresses.filter(a => a.id !== addressId);
    saveDB();
    return user.addresses.length < initialLen;
  },

  setDefaultAddress: (userId, addressId) => {
    const user = dbService.findUserById(userId);
    if (!user || !user.addresses) return false;

    user.addresses.forEach(a => {
      a.id === addressId ? (a.isDefault = true) : (a.isDefault = false);
    });
    saveDB();
    return true;
  },

  // --- ORDERS ---
  createOrder: (orderData) => {
    db.orders.push(orderData);
    saveDB();
    return orderData;
  },

  getOrdersByUser: (userId) => {
    return db.orders.filter(o => o.userId === userId);
  },

  getOrderByNumber: (orderNumber) => {
    return db.orders.find(o => o.orderNumber.toUpperCase() === orderNumber.toUpperCase()) || null;
  },

  getAllOrders: () => {
    return db.orders;
  }
};

module.exports = dbService;
