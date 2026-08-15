// Grab A Cart - Product Catalog Routes & Controller (With Seller Management)
const express = require('express');
const router = express.Router();
const initialProducts = require('../data/productsData');
const authenticateJWT = require('../middleware/authMiddleware');

// In-memory catalog state
let products = [...initialProducts];

/**
 * @route   GET /api/products/categories
 * @desc    Get all available product categories
 */
router.get('/categories', (req, res) => {
  const categories = ['All', ...new Set(products.map(p => p.category))];
  res.json({
    success: true,
    categories
  });
});

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, search & sorting
 * @query   search, category, sortBy, minPrice, maxPrice
 */
router.get('/', (req, res) => {
  let { search, category, sortBy, minPrice, maxPrice } = req.query;
  let results = [...products];

  // 1. Filter by category
  if (category && category.toLowerCase() !== 'all') {
    results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // 2. Filter by search query
  if (search) {
    const q = search.toLowerCase().trim();
    results = results.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.badge && p.badge.toLowerCase().includes(q))
    );
  }

  // 3. Price range filtering
  if (minPrice) {
    results = results.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    results = results.filter(p => p.price <= parseFloat(maxPrice));
  }

  // 4. Sorting
  if (sortBy) {
    switch (sortBy) {
      case 'price-asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'name-asc':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
  }

  res.json({
    success: true,
    count: results.length,
    products: results
  });
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 */
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Product with ID ${req.params.id} not found.`
    });
  }

  res.json({
    success: true,
    product
  });
});

/**
 * @route   POST /api/products
 * @desc    Add a new product to the catalog (Seller Only)
 * @access  Private (Seller/Admin Protected)
 */
router.post('/', authenticateJWT, authenticateJWT.requireSeller, (req, res) => {
  try {
    const { name, category, price, originalPrice, stock, badge, image, desc, specs } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Product name, category, and price (₹) are required.'
      });
    }

    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      name: name.trim(),
      category: category.trim(),
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      rating: 5.0,
      reviewsCount: 1,
      stock: stock ? parseInt(stock) : 20,
      badge: badge ? badge.trim() : 'New Arrival',
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      desc: desc || 'Premium quality product verified by Grab A Cart merchant.',
      specs: specs || { "Quality": "100% Genuine", "Warranty": "1 Year Brand Warranty" },
      sellerId: req.user.id,
      sellerName: req.user.name,
      createdAt: new Date().toISOString()
    };

    products.unshift(newProduct);

    return res.status(201).json({
      success: true,
      message: `Product "${newProduct.name}" listed successfully in Grab A Cart catalog!`,
      product: newProduct
    });
  } catch (error) {
    console.error('Add product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list product.'
    });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update product pricing, stock, details (Seller Only)
 * @access  Private (Seller/Admin Protected)
 */
router.put('/:id', authenticateJWT, authenticateJWT.requireSeller, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const prodIndex = products.findIndex(p => p.id === id);

    if (prodIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Product #${id} not found.`
      });
    }

    const { name, category, price, originalPrice, stock, badge, image, desc, specs } = req.body;

    if (price !== undefined && (isNaN(price) || parseFloat(price) <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Valid price (₹) is required.'
      });
    }

    const existing = products[prodIndex];
    products[prodIndex] = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      category: category !== undefined ? category.trim() : existing.category,
      price: price !== undefined ? parseFloat(price) : existing.price,
      originalPrice: originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : existing.originalPrice,
      stock: stock !== undefined ? parseInt(stock) : existing.stock,
      badge: badge !== undefined ? badge.trim() : existing.badge,
      image: image !== undefined ? image.trim() : existing.image,
      desc: desc !== undefined ? desc.trim() : existing.desc,
      specs: specs !== undefined ? specs : existing.specs,
      updatedAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      message: `Product #${id} (${products[prodIndex].name}) updated successfully!`,
      product: products[prodIndex]
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product details.'
    });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product from catalog (Seller Only)
 * @access  Private (Seller/Admin Protected)
 */
router.delete('/:id', authenticateJWT, authenticateJWT.requireSeller, (req, res) => {
  const id = parseInt(req.params.id);
  const initialCount = products.length;
  products = products.filter(p => p.id !== id);

  if (products.length === initialCount) {
    return res.status(404).json({
      success: false,
      message: `Product #${id} not found.`
    });
  }

  res.json({
    success: true,
    message: `Product #${id} removed from catalog.`
  });
});

module.exports = router;
