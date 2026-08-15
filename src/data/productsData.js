// Grab A Cart - Product Catalog Seed Data (INR / Indian Rupee)

const products = [
  {
    id: 1,
    name: "AuraWave ANC Wireless Headphones",
    category: "Electronics",
    price: 2499,
    originalPrice: 4999,
    rating: 4.8,
    reviewsCount: 342,
    stock: 24,
    badge: "Best Seller",
    icon: "fa-headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    desc: "Active noise cancelling with 40h battery life, plush memory foam ear cushions, and ultra-crisp Hi-Res audio tuned for Indian music lovers.",
    specs: {
      "Battery Life": "40 Hours",
      "Connectivity": "Bluetooth 5.3 + 3.5mm Aux",
      "Noise Cancellation": "Hybrid Active ANC",
      "Weight": "240g"
    }
  },
  {
    id: 2,
    name: "PulseFit Pro Smartwatch S9",
    category: "Gadgets",
    price: 3299,
    originalPrice: 5999,
    rating: 4.7,
    reviewsCount: 218,
    stock: 15,
    badge: "New Release",
    icon: "fa-clock",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    desc: "Continuous heart-rate, SpO2 sensor, built-in GPS, 1.9-inch AMOLED display with 10-day battery backup and Hindi language UI support.",
    specs: {
      "Display": "1.9\" AMOLED Curved",
      "Water Resistance": "5 ATM (50m)",
      "Sensors": "Heart Rate, SpO2, Sleep, GPS",
      "Battery": "Up to 10 Days"
    }
  },
  {
    id: 3,
    name: "Vortex Mech RGB Mechanical Keyboard",
    category: "Electronics",
    price: 2199,
    originalPrice: 3499,
    rating: 4.9,
    reviewsCount: 512,
    stock: 8,
    badge: "Hot Deal",
    icon: "fa-keyboard",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    desc: "Customizable per-key RGB backlighting, tactile hot-swappable switches, aircraft-grade aluminum top frame for intense gaming.",
    specs: {
      "Switch Type": "Gateron Hot-Swappable Blue/Red",
      "Layout": "87-Key Tenkeyless (TKL)",
      "Connection": "USB-C Detachable Braided Cable",
      "Keycaps": "Double-shot PBT"
    }
  },
  {
    id: 4,
    name: "UltraGlide Ergonomic Gaming Mouse",
    category: "Electronics",
    price: 1199,
    originalPrice: 1999,
    rating: 4.6,
    reviewsCount: 189,
    stock: 30,
    badge: "Popular",
    icon: "fa-mouse",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
    desc: "26,000 DPI optical sensor, ultra-lightweight honeycomb shell (58g), and flexible paracord cable.",
    specs: {
      "Sensor": "PixArt 3395 (26,000 DPI)",
      "Weight": "58 grams",
      "Buttons": "6 Programmable",
      "RGB": "16.8M Color Zones"
    }
  },
  {
    id: 5,
    name: "UrbanFlex Minimalist Laptop Backpack",
    category: "Fashion",
    price: 1499,
    originalPrice: 2499,
    rating: 4.8,
    reviewsCount: 275,
    stock: 19,
    badge: "Trending",
    icon: "fa-briefcase",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    desc: "Water-resistant ballistic nylon, dedicated 16-inch padded laptop compartment, and hidden anti-theft pocket for metro and office commutes.",
    specs: {
      "Capacity": "24 Liters",
      "Laptop Fit": "Up to 16.2-inch Laptops",
      "Material": "1000D Cordura Nylon",
      "Features": "Luggage Strap, USB Charging Passthrough"
    }
  },
  {
    id: 6,
    name: "Classic Chronograph Leather Watch",
    category: "Fashion",
    price: 3999,
    originalPrice: 6999,
    rating: 4.9,
    reviewsCount: 140,
    stock: 12,
    badge: "Premium",
    icon: "fa-gem",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
    desc: "Genuine handcrafted brown leather band, Japanese quartz chronograph movement, scratch-resistant sapphire crystal glass.",
    specs: {
      "Case Diameter": "42mm",
      "Band Material": "Full-Grain Leather",
      "Glass": "Sapphire Coated Crystal",
      "Movement": "Japanese Miyota Quartz"
    }
  },
  {
    id: 7,
    name: "PureBrew Artisan Pour-Over Kettle",
    category: "Home & Living",
    price: 1299,
    originalPrice: 1999,
    rating: 4.7,
    reviewsCount: 96,
    stock: 18,
    badge: "Choice",
    icon: "fa-mug-hot",
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80",
    desc: "Precision gooseneck spout for optimal tea and coffee brewing, built-in thermometer gauge, matte black stainless steel.",
    specs: {
      "Capacity": "1.0 Liter (1000ml)",
      "Material": "Food Grade 304 Stainless Steel",
      "Thermometer": "Integrated Lid Temperature Gauge",
      "Stove Compatibility": "Gas, Electric, Induction"
    }
  },
  {
    id: 8,
    name: "Nordic Ceramic Table Lamp",
    category: "Home & Living",
    price: 1699,
    originalPrice: 2499,
    rating: 4.6,
    reviewsCount: 112,
    stock: 14,
    badge: "Style",
    icon: "fa-lightbulb",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
    desc: "Handcrafted textured ceramic base, natural flax linen shade, 3-way touch dimming with warm LED bulb included.",
    specs: {
      "Dimensions": "16\" H x 10\" W",
      "Switch Type": "3-Level Touch Sensor",
      "Bulb Type": "E26 LED 2700K Warm White",
      "Cord Length": "6 Feet Fabric Braided"
    }
  },
  {
    id: 9,
    name: "Organic Single-Origin Chikmagalur Coffee Beans (1kg)",
    category: "Groceries",
    price: 799,
    originalPrice: 1199,
    rating: 4.9,
    reviewsCount: 620,
    stock: 45,
    badge: "Organic",
    icon: "fa-seedling",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80",
    desc: "100% Arabica shade-grown medium roast from the lush hills of Chikmagalur, Karnataka. Notes of dark chocolate and toasted caramel.",
    specs: {
      "Weight": "1000g (1 kg)",
      "Origin": "Chikmagalur, Karnataka, India",
      "Roast Level": "Medium Roast",
      "Certifications": "100% Organic Certified, Fair Trade"
    }
  },
  {
    id: 10,
    name: "Eco-Fresh Ayurvedic Superfood Blend (500g)",
    category: "Groceries",
    price: 599,
    originalPrice: 899,
    rating: 4.7,
    reviewsCount: 180,
    stock: 32,
    badge: "Healthy",
    icon: "fa-apple-alt",
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&auto=format&fit=crop&q=80",
    desc: "Traditional Ayurvedic botanical blend with Ashwagandha, Moringa, Amla, Spirulina, and Wheatgrass for daily vitality.",
    specs: {
      "Servings": "30 Servings",
      "Dietary": "100% Vegan, Gluten-Free, Non-GMO",
      "Protein per serving": "12g",
      "No Added Sugar": "100% Pure Herbs"
    }
  },
  {
    id: 11,
    name: "HyperCharge 100W GaN Fast Charger",
    category: "Gadgets",
    price: 1299,
    originalPrice: 1999,
    rating: 4.9,
    reviewsCount: 410,
    stock: 28,
    badge: "Must Have",
    icon: "fa-bolt",
    image: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600&auto=format&fit=crop&q=80",
    desc: "4-in-1 GaN III fast charger (3x USB-C, 1x USB-A) with BIS certification, compatible with Indian power surges and all devices.",
    specs: {
      "Max Output": "100W Power Delivery",
      "Ports": "3x USB-C PD 3.0 + 1x USB-A QC 4.0",
      "Technology": "Gallium Nitride (GaN III)",
      "Safety": "BIS Certified, Surge Protection"
    }
  },
  {
    id: 12,
    name: "HydroPure Insulated Steel Flask (1000ml)",
    category: "Home & Living",
    price: 799,
    originalPrice: 1199,
    rating: 4.8,
    reviewsCount: 388,
    stock: 40,
    badge: "Eco Friendly",
    icon: "fa-tint",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
    desc: "Double-wall vacuum insulation keeps water ice cold for 24 hours or piping hot for 12 hours. Rust-proof 18/8 food-grade steel.",
    specs: {
      "Capacity": "1000 ml (1 Liter)",
      "Insulation": "Vacuum Double Wall 18/8 Steel",
      "Lids": "Flip Sipper + Wide Mouth Cap",
      "Dishwasher Safe": "Yes"
    }
  }
];

module.exports = products;
