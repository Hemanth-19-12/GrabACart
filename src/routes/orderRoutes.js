// Grab A Cart - Orders Routes & Controller (Indian Rupee & Delivery Validation)
const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authMiddleware');
const db = require('../data/db');

/**
 * @route   POST /api/orders
 * @desc    Create / Place a new order with Indian address validation
 * @access  Private (JWT Protected)
 */
router.post('/', authenticateJWT, (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      deliveryOption,
      deliveryNotes,
      couponCode,
      discount,
      subtotal,
      shippingFee,
      total,
      expectedDeliveryDate
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address information is required.'
      });
    }

    const country = (shippingAddress.country || 'India').trim();
    const pin = (shippingAddress.zipCode || '').trim();

    // Check if delivery address is outside India
    if (country.toLowerCase() !== 'india' || !/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        internationalDelivery: false,
        message: "We'll soon deliver outside India! Grab A Cart currently delivers exclusively across India with valid 6-digit Pincodes."
      });
    }

    // Generate readable Grab A Cart order number and tracking code
    const orderNumber = 'GAC-' + Math.floor(100000 + Math.random() * 900000);
    const trackingCode = 'GAC-TRK-' + Math.floor(10000000 + Math.random() * 90000000);
    const now = new Date();

    // Calculate delivery date if not supplied
    const isExpress = (deliveryOption || '').toLowerCase().includes('express');
    const daysToAdd = isExpress ? 2 : 4;
    const estDate = expectedDeliveryDate || new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
    });

    const newOrder = {
      id: 'ord_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      orderNumber,
      trackingCode,
      carrier: isExpress ? 'GrabExpress Air Priority (Blue Dart / Delhivery)' : 'GrabExpress Ground Logistics (India Post / Shadowfax)',
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      currency: 'INR',
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        total: (item.price * item.quantity).toFixed(2)
      })),
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone || 'N/A',
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state || '',
        zipCode: shippingAddress.zipCode,
        country: 'India'
      },
      delivery: {
        option: isExpress ? 'Express Delivery (1-2 Days)' : 'Standard Delivery (3-5 Days)',
        notes: deliveryNotes || 'None',
        expectedDate: estDate
      },
      paymentMethod: paymentMethod || 'UPI (Google Pay / PhonePe / Paytm)',
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
      statusTimeline: [
        { status: 'Order Placed', timestamp: now.toISOString(), completed: true },
        { status: 'Payment Confirmed', timestamp: now.toISOString(), completed: true },
        { status: 'Processing at Hub', timestamp: new Date(now.getTime() + 3600000).toISOString(), completed: false },
        { status: 'Dispatched with Courier', timestamp: new Date(now.getTime() + 86400000).toISOString(), completed: false },
        { status: 'Delivered', timestamp: new Date(now.getTime() + (isExpress ? 172800000 : 345600000)).toISOString(), completed: false }
      ],
      pricing: {
        subtotal: parseFloat(subtotal || 0).toFixed(2),
        discount: parseFloat(discount || 0).toFixed(2),
        couponApplied: couponCode || null,
        shippingFee: parseFloat(shippingFee || 0).toFixed(2),
        total: parseFloat(total || 0).toFixed(2)
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const savedOrder = db.createOrder(newOrder);

    return res.status(201).json({
      success: true,
      message: `Order #${savedOrder.orderNumber} placed successfully!`,
      order: savedOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to place order. Please try again.'
    });
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get current user's order history
 * @access  Private (JWT Protected)
 */
router.get('/', authenticateJWT, (req, res) => {
  try {
    const orders = db.getOrdersByUser(req.user.id);
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders.'
    });
  }
});

/**
 * @route   GET /api/orders/:orderNumber
 * @desc    Track order by Order Number
 * @access  Public / Private
 */
router.get('/:orderNumber', (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = db.getOrderByNumber(orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderNumber} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Track order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error tracking order.'
    });
  }
});

module.exports = router;
