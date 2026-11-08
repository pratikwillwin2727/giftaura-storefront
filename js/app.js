/**
 * GiftAura (@gifts.aura_) - Storefront Logic & Interactive Features
 * Kalyan, Maharashtra
 */

// Cart State
let cart = [];
let currentFilter = "All";
let activeCustomizerVariant = null;

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  loadCartFromStorage();
  initCustomizerShowcase();
  renderProducts();
  setupFilterEventListeners();
  setupCartEventListeners();
  setupCheckoutModal();
  setupTrackModal();
  setupSyncListeners();
});

/* --------------------------------------------------------------------------
   Product Rendering & Filtering
   -------------------------------------------------------------------------- */
function getActiveProducts() {
  return window.StorageService ? window.StorageService.getProducts() : (window.INITIAL_PRODUCTS || []);
}

function renderProducts() {
  const container = document.getElementById("productsGrid");
  if (!container) return;

  const allProducts = getActiveProducts();
  let filtered = allProducts;

  if (currentFilter === "Bracelets") {
    filtered = allProducts.filter(p => p.category === "Bracelets");
  } else if (currentFilter === "Necklaces") {
    filtered = allProducts.filter(p => p.category === "Necklaces");
  } else if (currentFilter === "Under ₹199") {
    filtered = allProducts.filter(p => Number(p.price) < 199);
  }

  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem;">
        <p style="color: var(--text-secondary); font-size: 1.1rem;">No jewellery found in this category.</p>
        <button class="btn-secondary" style="margin-top: 1rem;" onclick="setFilter('All')">View All Products</button>
      </div>
    `;
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    
    // Check if in stock
    const isAvailable = product.inStock !== false;
    const badgeText = product.badge || (isAvailable ? "Popular" : "Sold Out");
    const badgeClass = product.badgeType ? `badge-${product.badgeType}` : "badge-bestseller";

    card.innerHTML = `
      <div class="product-image-wrapper">
        <span class="product-badge ${badgeClass}">${badgeText}</span>
        <img src="${product.image}" alt="${product.name}" class="product-card-img" loading="lazy">
      </div>
      <div class="product-card-body">
        <div class="product-category">${product.category}</div>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-pricing">
          <span class="price-current">₹${product.price}</span>
          ${product.originalPrice ? `<span class="price-strike">₹${product.originalPrice}</span>` : ""}
        </div>
        <button 
          class="card-action-btn" 
          ${isAvailable ? "" : "disabled"} 
          onclick="handleAddToCart('${product.id}')"
          style="${isAvailable ? "" : "opacity: 0.6; cursor: not-allowed;"}">
          ${isAvailable ? `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            Add to Bag
          ` : 'Sold Out'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function setupFilterEventListeners() {
  const pills = document.querySelectorAll(".filter-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentFilter = pill.dataset.filter || "All";
      renderProducts();
    });
  });
}

function setFilter(category) {
  currentFilter = category;
  const pills = document.querySelectorAll(".filter-pill");
  pills.forEach(p => {
    if (p.dataset.filter === category) {
      p.classList.add("active");
    } else {
      p.classList.remove("active");
    }
  });
  renderProducts();
}

/* --------------------------------------------------------------------------
   Special UI Feature: Interactive 6-Gemstone Aurelia Vine Customizer
   -------------------------------------------------------------------------- */
function initCustomizerShowcase() {
  const allProducts = getActiveProducts();
  // Filter the 6 Aurelia crystal bracelets
  const aureliaVariants = allProducts.filter(p => p.variantSeriesId === "aurelia-vine" || p.name.includes("Aurelia"));

  if (!aureliaVariants || aureliaVariants.length === 0) return;

  // Set default to Emerald Green (or first)
  activeCustomizerVariant = aureliaVariants[0];
  renderCustomizerUI(aureliaVariants);
}

function renderCustomizerUI(variants) {
  const previewImg = document.getElementById("customizerPreviewImg");
  const titleElem = document.getElementById("customizerTitle");
  const priceElem = document.getElementById("customizerPrice");
  const originalPriceElem = document.getElementById("customizerOriginalPrice");
  const badgeElem = document.getElementById("customizerBadge");
  const selectedColorElem = document.getElementById("selectedColorName");
  const swatchesContainer = document.getElementById("customizerSwatches");

  if (!previewImg || !activeCustomizerVariant) return;

  // Update text
  titleElem.textContent = activeCustomizerVariant.name;
  priceElem.textContent = `₹${activeCustomizerVariant.price}`;
  if (originalPriceElem) {
    originalPriceElem.textContent = activeCustomizerVariant.originalPrice ? `₹${activeCustomizerVariant.originalPrice}` : "";
  }
  badgeElem.textContent = activeCustomizerVariant.badge || "Bestseller";
  selectedColorElem.textContent = activeCustomizerVariant.colorName || "Emerald Green";

  // Render Swatch buttons
  if (swatchesContainer) {
    swatchesContainer.innerHTML = "";
    variants.forEach(variant => {
      const btn = document.createElement("button");
      btn.className = `swatch-dot-btn ${variant.id === activeCustomizerVariant.id ? "active" : ""}`;
      btn.setAttribute("aria-label", variant.colorName);
      btn.setAttribute("title", variant.colorName);
      btn.innerHTML = `<span class="swatch-color-inner" style="background-color: ${variant.colorHex || '#1B5E20'};"></span>`;

      btn.addEventListener("click", () => {
        // Cross-fade animation
        previewImg.style.opacity = "0.2";
        previewImg.style.transform = "scale(0.97)";
        
        setTimeout(() => {
          activeCustomizerVariant = variant;
          previewImg.src = variant.image;
          previewImg.alt = variant.name;
          titleElem.textContent = variant.name;
          priceElem.textContent = `₹${variant.price}`;
          if (originalPriceElem) {
            originalPriceElem.textContent = variant.originalPrice ? `₹${variant.originalPrice}` : "";
          }
          badgeElem.textContent = variant.badge || "Bestseller";
          selectedColorElem.textContent = variant.colorName;

          // Update active class on buttons
          document.querySelectorAll(".swatch-dot-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");

          previewImg.style.opacity = "1";
          previewImg.style.transform = "scale(1)";
        }, 180);
      });

      swatchesContainer.appendChild(btn);
    });
  }

  // Set initial image
  previewImg.src = activeCustomizerVariant.image;
  previewImg.alt = activeCustomizerVariant.name;
}

function handleAddCustomizerToBag() {
  if (activeCustomizerVariant) {
    handleAddToCart(activeCustomizerVariant.id);
  }
}

/* --------------------------------------------------------------------------
   Slide-Out Cart System
   -------------------------------------------------------------------------- */
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem("giftaura_cart");
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    cart = [];
  }
  updateCartBadge();
}

function saveCartToStorage() {
  localStorage.setItem("giftaura_cart", JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

function handleAddToCart(productId) {
  const allProducts = getActiveProducts();
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      quantity: 1
    });
  }

  saveCartToStorage();
  openCartDrawer();
  showToast(`✨ Added "${product.name}" to your bag!`);
}

function updateQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  saveCartToStorage();
}

function removeCartItem(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCartToStorage();
  showToast("Item removed from bag");
}

function renderCartDrawer() {
  const list = document.getElementById("cartItemsList");
  const subtotalElem = document.getElementById("cartSubtotal");
  const shippingElem = document.getElementById("cartShipping");
  const totalElem = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("cartCheckoutBtn");

  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="cart-empty-state">
        <span class="cart-empty-icon">🎁</span>
        <h4 style="font-family: var(--font-serif); font-size: 1.25rem;">Your Gift Bag is Empty</h4>
        <p style="color: var(--text-secondary); font-size: 0.88rem;">Add some dainty golden pieces to make someone or yourself smile!</p>
        <button class="btn-primary" style="margin-top: 0.5rem;" onclick="closeCartDrawer()">Start Shopping</button>
      </div>
    `;
    if (subtotalElem) subtotalElem.textContent = "₹0";
    if (shippingElem) shippingElem.textContent = "Free";
    if (totalElem) totalElem.textContent = "₹0";
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  list.innerHTML = "";
  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" title="Remove item" onclick="removeCartItem('${item.id}')">✕</button>
    `;
    list.appendChild(row);
  });

  // Local Kalyan delivery is FREE promo; standard free above 499
  const shipping = subtotal >= 499 ? 0 : 0; // Default local is free
  const total = subtotal + shipping;

  if (subtotalElem) subtotalElem.textContent = `₹${subtotal}`;
  if (shippingElem) shippingElem.textContent = shipping === 0 ? "FREE (Local Promo)" : `₹${shipping}`;
  if (totalElem) totalElem.textContent = `₹${total}`;
  if (checkoutBtn) checkoutBtn.disabled = false;
}

function openCartDrawer() {
  const overlay = document.getElementById("cartDrawerOverlay");
  renderCartDrawer();
  if (overlay) overlay.classList.add("open");
}

function closeCartDrawer() {
  const overlay = document.getElementById("cartDrawerOverlay");
  if (overlay) overlay.classList.remove("open");
}

function setupCartEventListeners() {
  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const overlay = document.getElementById("cartDrawerOverlay");

  if (openCartBtn) openCartBtn.addEventListener("click", openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartDrawer);

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeCartDrawer();
    });
  }
}

/* --------------------------------------------------------------------------
   On-Site COD Checkout System
   -------------------------------------------------------------------------- */
function setupCheckoutModal() {
  const checkoutBtn = document.getElementById("cartCheckoutBtn");
  const modalOverlay = document.getElementById("checkoutModalOverlay");
  const closeBtn = document.getElementById("closeCheckoutBtn");
  const form = document.getElementById("codCheckoutForm");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) return;
      closeCartDrawer();
      openCheckoutModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeCheckoutModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeCheckoutModal();
    });
  }

  if (form) {
    form.addEventListener("submit", handlePlaceCodOrder);
  }

  // Update total badge when delivery zone changes
  const zoneSelect = document.getElementById("checkoutDeliveryZone");
  if (zoneSelect) {
    zoneSelect.addEventListener("change", updateCheckoutSummary);
  }
}

function openCheckoutModal() {
  const overlay = document.getElementById("checkoutModalOverlay");
  if (!overlay) return;

  updateCheckoutSummary();
  overlay.classList.add("open");
}

function closeCheckoutModal() {
  const overlay = document.getElementById("checkoutModalOverlay");
  if (overlay) overlay.classList.remove("open");
}

function updateCheckoutSummary() {
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const zone = document.getElementById("checkoutDeliveryZone")?.value || "local";
  
  let shipping = 0;
  if (zone === "standard") {
    shipping = subtotal >= 499 ? 0 : 40;
  } else {
    shipping = 0; // Local Kalyan is free
  }

  const total = subtotal + shipping;

  const summaryElem = document.getElementById("checkoutTotalSummary");
  const badgeElem = document.getElementById("checkoutCodBadgeTotal");

  if (summaryElem) summaryElem.textContent = `₹${total}`;
  if (badgeElem) badgeElem.textContent = `Pay ₹${total} in cash when your GiftAura box arrives.`;
}

function handlePlaceCodOrder(e) {
  e.preventDefault();

  const name = document.getElementById("checkoutName").value.trim();
  const phone = document.getElementById("checkoutPhone").value.trim();
  const insta = document.getElementById("checkoutInsta").value.trim();
  const zoneSelect = document.getElementById("checkoutDeliveryZone");
  const zoneText = zoneSelect.options[zoneSelect.selectedIndex].text;
  const address = document.getElementById("checkoutAddress").value.trim();
  const landmark = document.getElementById("checkoutLandmark").value.trim();
  const pincode = document.getElementById("checkoutPincode").value.trim();
  const note = document.getElementById("checkoutGiftNote").value.trim();

  // Validate 10-digit phone
  const phoneClean = phone.replace(/\D/g, "");
  if (phoneClean.length !== 10) {
    showToast("⚠️ Please enter a valid 10-digit Indian mobile number.");
    document.getElementById("checkoutPhone").focus();
    return;
  }

  // Validate pincode 6 digits
  const pinClean = pincode.replace(/\D/g, "");
  if (pinClean.length !== 6) {
    showToast("⚠️ Please enter a valid 6-digit Pincode.");
    document.getElementById("checkoutPincode").focus();
    return;
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const zoneVal = zoneSelect.value;
  const shippingFee = (zoneVal === "standard" && subtotal < 499) ? 40 : 0;
  const total = subtotal + shippingFee;

  // Generate unique Order ID e.g. GA-8492
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const orderId = `GA-${randomNum}`;

  const orderData = {
    id: orderId,
    createdAt: new Date().toISOString(),
    customerName: name,
    customerPhone: phoneClean,
    instagramHandle: insta || "Not provided",
    deliveryZone: zoneText,
    address: address,
    landmark: landmark || "None",
    pincode: pinClean,
    giftNote: note || "No special gift note requested.",
    items: [...cart],
    subtotal: subtotal,
    shippingFee: shippingFee,
    total: total,
    paymentMethod: "Cash on Delivery (COD)",
    status: "Order Placed"
  };

  // Save order to persistent storage
  if (window.StorageService) {
    window.StorageService.addOrder(orderData);
  }

  // Clear cart
  cart = [];
  saveCartToStorage();

  // Close checkout modal
  closeCheckoutModal();

  // Reset form
  document.getElementById("codCheckoutForm").reset();

  // Show Order Confirmed Receipt Modal
  showOrderReceipt(orderData);
}

/* --------------------------------------------------------------------------
   Order Receipt & Confirmation Modal
   -------------------------------------------------------------------------- */
function showOrderReceipt(order) {
  const modal = document.getElementById("receiptModalOverlay");
  if (!modal) return;

  document.getElementById("receiptOrderId").textContent = order.id;
  document.getElementById("receiptCustomerName").textContent = order.customerName;
  document.getElementById("receiptAddress").textContent = `${order.address}, ${order.landmark ? order.landmark + ', ' : ''}PIN: ${order.pincode}`;
  document.getElementById("receiptTotal").textContent = `₹${order.total}`;
  document.getElementById("receiptItemsCount").textContent = `${order.items.reduce((acc, i) => acc + i.quantity, 0)} Items`;

  const itemsContainer = document.getElementById("receiptItemsList");
  if (itemsContainer) {
    itemsContainer.innerHTML = order.items.map(i => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
        <span>${i.name} (x${i.quantity})</span>
        <span style="font-weight: 600;">₹${i.price * i.quantity}</span>
      </div>
    `).join("");
  }

  // Set action to track this order
  const trackBtn = document.getElementById("receiptTrackBtn");
  if (trackBtn) {
    trackBtn.onclick = () => {
      modal.classList.remove("open");
      openTrackModalWithId(order.id);
    };
  }

  modal.classList.add("open");
}

function closeReceiptModal() {
  const modal = document.getElementById("receiptModalOverlay");
  if (modal) modal.classList.remove("open");
}

function copyReceiptOrderId() {
  const id = document.getElementById("receiptOrderId")?.textContent;
  if (id) {
    navigator.clipboard.writeText(id).then(() => {
      showToast(`Copied Order ID: ${id}`);
    }).catch(() => {
      showToast(`Order ID: ${id}`);
    });
  }
}

/* --------------------------------------------------------------------------
   On-Site "Track My Order" Lookup System
   -------------------------------------------------------------------------- */
function setupTrackModal() {
  const trackNavBtn = document.getElementById("navTrackOrderBtn");
  const modal = document.getElementById("trackModalOverlay");
  const closeBtn = document.getElementById("closeTrackModalBtn");
  const form = document.getElementById("trackOrderForm");

  if (trackNavBtn) {
    trackNavBtn.addEventListener("click", () => {
      openTrackModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeTrackModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeTrackModal();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("trackOrderIdInput").value.trim().toUpperCase();
      searchAndDisplayOrder(input);
    });
  }
}

function openTrackModal() {
  const modal = document.getElementById("trackModalOverlay");
  if (modal) {
    document.getElementById("trackDetailsContainer").style.display = "none";
    document.getElementById("trackNotFoundMsg").style.display = "none";
    modal.classList.add("open");
    setTimeout(() => {
      document.getElementById("trackOrderIdInput").focus();
    }, 100);
  }
}

function openTrackModalWithId(orderId) {
  openTrackModal();
  document.getElementById("trackOrderIdInput").value = orderId;
  searchAndDisplayOrder(orderId);
}

function closeTrackModal() {
  const modal = document.getElementById("trackModalOverlay");
  if (modal) modal.classList.remove("open");
}

function searchAndDisplayOrder(orderId) {
  const orders = window.StorageService ? window.StorageService.getOrders() : [];
  const order = orders.find(o => o.id.toUpperCase() === orderId.toUpperCase());

  const detailsContainer = document.getElementById("trackDetailsContainer");
  const notFoundMsg = document.getElementById("trackNotFoundMsg");

  if (!order) {
    detailsContainer.style.display = "none";
    notFoundMsg.style.display = "block";
    notFoundMsg.innerHTML = `
      <div style="background: #FFF5F5; border: 1px solid #FFCDD2; border-radius: 12px; padding: 1rem; color: #C62828;">
        <strong>Order not found (${orderId})</strong><br>
        Please verify your Order ID (format: <code>GA-XXXX</code>) or message us on Instagram <a href="https://instagram.com/gifts.aura_" target="_blank" style="text-decoration: underline;">@gifts.aura_</a>.
      </div>
    `;
    return;
  }

  notFoundMsg.style.display = "none";
  detailsContainer.style.display = "block";

  // Display details
  document.getElementById("trackDisplayId").textContent = order.id;
  document.getElementById("trackDisplayStatus").textContent = order.status;
  document.getElementById("trackDisplayCustomer").textContent = order.customerName;
  document.getElementById("trackDisplayZone").textContent = order.deliveryZone;
  document.getElementById("trackDisplayTotal").textContent = `₹${order.total}`;

  // Update Stepper
  const steps = ["Order Placed", "Packed with Love", "Out for Delivery", "Delivered"];
  const stepElements = document.querySelectorAll(".tracker-step");
  const statusIndex = steps.indexOf(order.status);

  stepElements.forEach((el, idx) => {
    el.classList.remove("completed", "active");
    if (order.status === "Cancelled") {
      // Cancelled state
      return;
    }
    if (idx < statusIndex) {
      el.classList.add("completed");
    } else if (idx === statusIndex) {
      el.classList.add("active");
    }
  });

  // Render items list inside tracking
  const itemsContainer = document.getElementById("trackOrderItemsList");
  if (itemsContainer) {
    itemsContainer.innerHTML = order.items.map(i => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid #EFE6DE;">
        <span>${i.name} &times; ${i.quantity}</span>
        <span style="font-weight: 600;">₹${i.price * i.quantity}</span>
      </div>
    `).join("");
  }
}

/* --------------------------------------------------------------------------
   Real-Time Synchronization with Host Admin Dashboard
   -------------------------------------------------------------------------- */
function setupSyncListeners() {
  // When products are updated via admin.html in the same or another tab
  window.addEventListener("giftaura_products_updated", () => {
    initCustomizerShowcase();
    renderProducts();
  });

  window.addEventListener("storage", (e) => {
    if (e.key === "giftaura_products_v1") {
      initCustomizerShowcase();
      renderProducts();
    }
    if (e.key === "giftaura_cart") {
      loadCartFromStorage();
    }
  });
}

/* --------------------------------------------------------------------------
   Toast Notifications
   -------------------------------------------------------------------------- */
function showToast(message) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast success";
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Global exposure for inline HTML event handlers
window.handleAddToCart = handleAddToCart;
window.handleAddCustomizerToBag = handleAddCustomizerToBag;
window.updateQuantity = updateQuantity;
window.removeCartItem = removeCartItem;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.closeReceiptModal = closeReceiptModal;
window.copyReceiptOrderId = copyReceiptOrderId;
window.openTrackModal = openTrackModal;
window.closeTrackModal = closeTrackModal;
window.setFilter = setFilter;
