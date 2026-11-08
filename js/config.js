/**
 * GiftAura (@gifts.aura_) - Configuration & Persistent Storage Controller
 * Kalyan, Maharashtra - Dainty Jewellery & Curated Gifting
 */

const GiftAuraConfig = {
  // Brand details
  brand: {
    name: "GiftAura",
    handle: "@gifts.aura_",
    instagramUrl: "https://instagram.com/gifts.aura_",
    location: "Kalyan, Maharashtra",
    tagline: "Dainty Handcrafted Jewellery & Curated Keepsakes",
    phoneDisplay: "Contact via Instagram DM @gifts.aura_", // Privacy-first: no personal phone on public web
    currency: "₹",
    shipping: {
      localZone: "Kalyan & Dombivli (Local Same-Day / Next-Day Delivery)",
      standardZone: "Standard Delivery (Maharashtra & Rest of India)",
      freeShippingThreshold: 499,
      localShippingFee: 0, // Free local delivery promo
      standardShippingFee: 40
    }
  },

  // Security & Admin Authentication
  admin: {
    defaultPin: "1234",
    sessionTimeoutMinutes: 60
  },

  // Storage Keys for 100% Offline / LocalStorage capability
  storageKeys: {
    products: "giftaura_products_v1",
    orders: "giftaura_orders_v1",
    adminAuth: "giftaura_admin_session",
    settings: "giftaura_settings_v1"
  },

  // Optional Third-Party Webhook / Integrations
  // Web3Forms: Sends new order notifications directly to the store owner's email without backend code
  web3Forms: {
    enabled: false,
    accessKey: "YOUR_WEB3FORMS_ACCESS_KEY_HERE"
  },

  // Optional Firebase Firestore Config Placeholder (for multi-device cloud persistence)
  firebase: {
    enabled: false,
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "giftaura-store.firebaseapp.com",
    projectId: "giftaura-store",
    storageBucket: "giftaura-store.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
  }
};

// Storage helper functions
const StorageService = {
  getProducts: function() {
    try {
      const data = localStorage.getItem(GiftAuraConfig.storageKeys.products);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Error reading products from localStorage:", e);
    }
    // Fallback to default catalog from products.js
    if (typeof INITIAL_PRODUCTS !== "undefined") {
      this.saveProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return [];
  },

  saveProducts: function(products) {
    try {
      localStorage.setItem(GiftAuraConfig.storageKeys.products, JSON.stringify(products));
      // Dispatch custom event for real-time synchronization across views
      window.dispatchEvent(new CustomEvent("giftaura_products_updated", { detail: products }));
      return true;
    } catch (e) {
      console.error("Error saving products:", e);
      return false;
    }
  },

  getOrders: function() {
    try {
      const data = localStorage.getItem(GiftAuraConfig.storageKeys.orders);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Error reading orders from localStorage:", e);
    }
    // Return empty array if none, or seed initial demo orders
    const seed = this.getSeedOrders();
    this.saveOrders(seed);
    return seed;
  },

  saveOrders: function(orders) {
    try {
      localStorage.setItem(GiftAuraConfig.storageKeys.orders, JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent("giftaura_orders_updated", { detail: orders }));
      return true;
    } catch (e) {
      console.error("Error saving orders:", e);
      return false;
    }
  },

  addOrder: function(newOrder) {
    const orders = this.getOrders();
    orders.unshift(newOrder); // newest first
    this.saveOrders(orders);
    return newOrder;
  },

  updateOrderStatus: function(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();
      this.saveOrders(orders);
      return true;
    }
    return false;
  },

  getAdminPin: function() {
    const settings = this.getSettings();
    return settings.adminPin || GiftAuraConfig.admin.defaultPin;
  },

  setAdminPin: function(newPin) {
    const settings = this.getSettings();
    settings.adminPin = newPin;
    localStorage.setItem(GiftAuraConfig.storageKeys.settings, JSON.stringify(settings));
    return true;
  },

  getSettings: function() {
    try {
      const data = localStorage.getItem(GiftAuraConfig.storageKeys.settings);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  // Seed realistic orders for demonstration
  getSeedOrders: function() {
    return [
      {
        id: "GA-8492",
        createdAt: "2026-11-08T14:30:00.000Z",
        customerName: "Pooja Deshmukh",
        customerPhone: "9820145678",
        instagramHandle: "@pooja_d",
        deliveryZone: "Kalyan / Dombivli Local Delivery",
        address: "Flat 402, Shree Ram Krupa, Gandhinagar, Kalyan West",
        landmark: "Near Syndicate Bus Stop",
        pincode: "421301",
        giftNote: "Happy 21st Birthday Di! Hope you love this emerald vine bracelet as much as I do 💖✨",
        items: [
          {
            id: "GA-BR-01",
            name: "Aurelia Crystal Vine Bracelet - Emerald Green",
            price: 110,
            quantity: 1,
            image: "assets/images/bracelet-emerald.jpeg"
          },
          {
            id: "GA-NK-01",
            name: "Coquette Gold Bow Snake-Chain Necklace",
            price: 249,
            quantity: 1,
            image: "assets/images/necklace-bow.jpeg"
          }
        ],
        subtotal: 359,
        shippingFee: 0,
        total: 359,
        paymentMethod: "Cash on Delivery (COD)",
        status: "Packed with Love"
      },
      {
        id: "GA-7104",
        createdAt: "2026-11-08T11:15:00.000Z",
        customerName: "Ananya Sharma",
        customerPhone: "9930284712",
        instagramHandle: "@ananya.s",
        deliveryZone: "Standard Delivery",
        address: "Bungalow No 7, Silver Oak Society, Baner",
        landmark: "Opposite Orchid School",
        pincode: "411045",
        giftNote: "Self-love reminder: shine bright always! 🌸",
        items: [
          {
            id: "GA-BR-02",
            name: "Aurelia Crystal Vine Bracelet - Rose Quartz Pink",
            price: 110,
            quantity: 2,
            image: "assets/images/bracelet-pink.jpeg"
          }
        ],
        subtotal: 220,
        shippingFee: 40,
        total: 260,
        paymentMethod: "Cash on Delivery (COD)",
        status: "Out for Delivery"
      }
    ];
  }
};

// Export to global scope
window.GiftAuraConfig = GiftAuraConfig;
window.StorageService = StorageService;
