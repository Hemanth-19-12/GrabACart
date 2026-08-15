// Grab A Cart - Authentication & Address Management Routes
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authenticateJWT = require('../middleware/authMiddleware');
const db = require('../data/db');
const emailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'grab_a_cart_super_secret_jwt_token_key_2026';

// Helper to create JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * @route   POST /api/auth/send-register-otp
 * @desc    Send 6-digit OTP to verify user during registration
 */
router.post('/send-register-otp', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are all required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const emailNormalized = email.trim().toLowerCase();
    const existingUser = db.findUserByEmail(emailNormalized);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in or reset your password.'
      });
    }

    // Generate 6-digit OTP
    const otp = db.generateOTP(emailNormalized, 'register', {
      name: name.trim(),
      email: emailNormalized,
      password: password
    });

    return res.json({
      success: true,
      message: `A 6-digit OTP verification code has been dispatched to ${emailNormalized}.`,
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('Send register OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to dispatch registration OTP.'
    });
  }
});

/**
 * @route   POST /api/auth/verify-register-otp
 * @desc    Verify OTP and complete user registration
 */
router.post('/verify-register-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit OTP code are required.'
      });
    }

    const result = db.verifyOTP(email, otp, 'register');
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    const pendingData = result.payload;
    const newUser = await db.createUser({
      name: pendingData.name,
      email: pendingData.email,
      password: pendingData.password
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Email verified successfully! Welcome to Grab A Cart.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        addresses: newUser.addresses,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Verify register OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify registration OTP.'
    });
  }
});

/**
 * @route   POST /api/auth/send-login-otp
 * @desc    Send 6-digit OTP for secure OTP-based login or 2FA
 */
router.post('/send-login-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = db.findUserByEmail(emailNormalized);

    if (!user) {
      return res.status(404).json({
        success: false,
        notFound: true,
        message: 'No account found with this email. Please register first.'
      });
    }

    const otp = db.generateOTP(emailNormalized, 'login', { userId: user.id });

    return res.json({
      success: true,
      message: `6-digit login verification OTP sent to ${emailNormalized}.`,
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('Send login OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to dispatch login OTP.'
    });
  }
});

/**
 * @route   POST /api/auth/verify-login-otp
 * @desc    Verify OTP and log in user
 */
router.post('/verify-login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit OTP are required.'
      });
    }

    const result = db.verifyOTP(email, otp, 'login');
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'OTP verified! Welcome back to Grab A Cart.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses || []
      }
    });
  } catch (error) {
    console.error('Verify login OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify login OTP.'
    });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Direct register (legacy / fallback)
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are all required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const emailNormalized = email.trim().toLowerCase();
    const existingUser = db.findUserByEmail(emailNormalized);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in or use Forgot Password.'
      });
    }

    const newUser = await db.createUser({
      name: name.trim(),
      email: emailNormalized,
      password: password
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully! Welcome to Grab A Cart.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        addresses: newUser.addresses,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while registering user.'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Log in user with strict password verification and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = db.findUserByEmail(emailNormalized);

    if (!user) {
      return res.status(404).json({
        success: false,
        notFound: true,
        message: 'No account found with this email address. Please register a new account.'
      });
    }

    const isMatch = await db.verifyPassword(user, password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your credentials or click "Forgot Password?" to reset.'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: `Welcome back to Grab A Cart, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses || [],
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while logging in.'
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate a temporary reset password/OTP and send via secure email dispatch
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.'
      });
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = db.findUserByEmail(emailNormalized);

    if (!user) {
      return res.status(404).json({
        success: false,
        notFound: true,
        message: 'No registered Grab A Cart account found with this email. Redirecting to registration...'
      });
    }

    // Generate secure 6-digit temporary code
    const tempCode = 'TEMP-' + Math.floor(100000 + Math.random() * 900000);
    db.setTemporaryPassword(emailNormalized, tempCode, 15);

    // Send email via emailService (supports automated virtual inbox and simulated console dispatch)
    const emailResult = await emailService.sendPasswordResetEmail(user.email, user.name, tempCode);

    return res.json({
      success: true,
      message: `A temporary password reset code has been sent securely to ${user.email}.`,
      previewUrl: emailResult.previewUrl || null
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing password reset.'
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using temporary code
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, tempCode, newPassword } = req.body;

    if (!email || !tempCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, temporary reset code, and new password are all required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = db.findUserByEmail(emailNormalized);

    if (!user) {
      return res.status(404).json({
        success: false,
        notFound: true,
        message: 'User account not found.'
      });
    }

    if (!user.tempPassword || user.tempPassword !== tempCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid temporary reset code. Please check the code sent to your email or request a new one.'
      });
    }

    if (Date.now() > user.tempPasswordExpires) {
      return res.status(400).json({
        success: false,
        message: 'Temporary reset code has expired. Please request a new code.'
      });
    }

    await db.updatePassword(user.id, newPassword);

    return res.json({
      success: true,
      message: 'Your password has been successfully updated! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating password.'
    });
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Update password for authenticated user
 */
router.put('/change-password', authenticateJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are both required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password.'
      });
    }

    await db.updatePassword(user.id, newPassword);

    return res.json({
      success: true,
      message: 'Password updated successfully!'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating password.'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user's profile and addresses
 */
router.get('/me', authenticateJWT, (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found.'
    });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      addresses: user.addresses || [],
      createdAt: user.createdAt
    }
  });
});

/**
 * @route   GET /api/auth/addresses
 * @desc    Get user's saved addresses
 */
router.get('/addresses', authenticateJWT, (req, res) => {
  const addresses = db.getUserAddresses(req.user.id);
  res.json({
    success: true,
    addresses
  });
});

/**
 * @route   POST /api/auth/addresses
 * @desc    Add a new address to user profile
 */
router.post('/addresses', authenticateJWT, (req, res) => {
  const { fullName, phone, address, city, zipCode, country, label, isDefault } = req.body;

  if (!fullName || !address || !city || !zipCode) {
    return res.status(400).json({
      success: false,
      message: 'Full name, address, city, and postal code are required.'
    });
  }

  const newAddress = db.addUserAddress(req.user.id, {
    fullName,
    phone,
    address,
    city,
    zipCode,
    country,
    label,
    isDefault
  });

  if (!newAddress) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save address.'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Address added successfully!',
    address: newAddress
  });
});

/**
 * @route   PUT /api/auth/addresses/:id
 * @desc    Update an existing address
 */
router.put('/addresses/:id', authenticateJWT, (req, res) => {
  const updatedAddress = db.updateUserAddress(req.user.id, req.params.id, req.body);

  if (!updatedAddress) {
    return res.status(404).json({
      success: false,
      message: 'Address not found or update failed.'
    });
  }

  res.json({
    success: true,
    message: 'Address updated successfully!',
    address: updatedAddress
  });
});

/**
 * @route   DELETE /api/auth/addresses/:id
 * @desc    Delete a saved address
 */
router.delete('/addresses/:id', authenticateJWT, (req, res) => {
  const success = db.deleteUserAddress(req.user.id, req.params.id);

  if (!success) {
    return res.status(404).json({
      success: false,
      message: 'Address not found.'
    });
  }

  res.json({
    success: true,
    message: 'Address deleted successfully!'
  });
});

module.exports = router;
