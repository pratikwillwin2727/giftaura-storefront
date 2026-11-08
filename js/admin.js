/**
 * GiftAura (@gifts.aura_) - Host Admin Dashboard Logic
 * Kalyan, Maharashtra
 */

let currentAdminTab = "orders";
let orderSearchQuery = "";
let orderStatusFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();
  setupAuthEventListeners();
  setupTabEventListeners();
});

/* --------------------------------------------------------------------------
   Admin PIN Authentication
   -------------------------------------------------------------------------- */
function checkAdminAuth() {
  const session = sessionStorage.getItem("giftaura_admin_authenticated");
  const authOverlay = document.getElementById("adminAuthOverlay");
  const dashboardContainer = document.getElementById("adminDashboardContainer");

  if (session === "true") {
    if (authOverlay) authOverlay.style.display = "none";
    if (dashboardContainer) dashboardContainer.style.display = "block";
    loadDashboardData();
  } else {
    if (authOverlay) authOverlay.style.display = "flex";
    if (dashboardContainer) dashboardContainer.style.display = "none";
    const pinInput = document.getElementById("adminPinInput");
    if (pinInput) setTimeout(() => pinInput.focus(), 150);
  }
}

function setupAuthEventListeners() {
  const loginForm = document.getElementById("adminLoginForm");
  const logoutBtn = document.getElementById("adminLogoutBtn");
  const changePinForm = document.getElementById("changePinForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const enteredPin = document.getElementById("adminPinInput").value.trim();
      const expectedPin = window.StorageService ? window.StorageService.getAdminPin() : "1234";

      if (enteredPin === expectedPin) {
        sessionStorage.setItem("giftaura_admin_authenticated", "true");
        showAdminToast("✨ Welcome back, GiftAura Host!");
        checkAdminAuth();
      } else {
        const errorMsg = document.getElementById("adminPinError");
        if (errorMsg) {
          errorMsg.style.display = "block";
          errorMsg.textContent = "Incorrect Host PIN. Default PIN is 1234.";
        }
        document.getElementById("adminPinInput").value = "";
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("giftaura_admin_authenticated");
      showAdminToast("Logged out successfully");
      checkAdminAuth();
    });
  }

  if (changePinForm) {
    changePinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newPin = document.getElementById("newPinInput").value.trim();
      if (newPin.length < 4) {
        alert("PIN must be at least 4 digits");
        return;
      }
      if (window.StorageService) {
        window.StorageService.setAdminPin(newPin);
        showAdminToast("🔐 Admin PIN updated successfully!");
        document.getElementById("newPinInput").value = "";
      }
    });
  }
}

/* --------------------------------------------------------------------------
   Tabs & Navigation
   -------------------------------------------------------------------------- */
function setupTabEventListeners() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tabId = btn.dataset.tab;
      currentAdminTab = tabId;

      document.querySelectorAll(".admin-tab-pane").forEach(pane => {
        pane.style.display = "none";
      });

      const activePane = document.getElementById(`tabPane_${tabId}`);
      if (activePane) activePane.style.display = "block";
    });
  });

  // Search & Filter orders
  const searchInput = document.getElementById("orderSearchInput");
  const statusFilter = document.getElementById("orderStatusFilter");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      orderSearchQuery = e.target.value.toLowerCase().trim();
      renderOrdersTable();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", (e) => {
      orderStatusFilter = e.target.value;
      renderOrdersTable();
    });
  }

  // Setup Add Product Form
  const addProductForm = document.getElementById("addNewProductForm");
  if (addProductForm) {
    addProductForm.addEventListener("submit", handleAddNewProduct);
  }

  // Image file preview
  const imgFileInput = document.getElementById("newProductImageFile");
  if (imgFileInput) {
    imgFileInput.addEventListener("change", handleProductImageFilePreview);
  }
}

/* --------------------------------------------------------------------------
   Load & Refresh Dashboard Data
   -------------------------------------------------------------------------- */
function loadDashboardData() {
  updateKPICards();
  renderOrdersTable();
  renderPriceEditorTable();
}

function updateKPICards() {
  const orders = window.StorageService ? window.StorageService.getOrders() : [];
  const products = window.StorageService ? window.StorageService.getProducts() : [];

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "Order Placed" || o.status === "Packed with Love").length;
  const totalValue = orders.filter(o => o.status !== "Cancelled").reduce((sum, o) => sum + Number(o.total || 0), 0);
  const activeProducts = products.filter(p => p.inStock !== false).length;

  document.getElementById("kpiTotalOrders").textContent = totalOrders;
  document.getElementById("kpiPendingOrders").textContent = pendingOrders;
  document.getElementById("kpiTotalValue").textContent = `₹${totalValue.toLocaleString("en-IN")}`;
  document.getElementById("kpiActiveProducts").textContent = activeProducts;
}

/* --------------------------------------------------------------------------
   Live COD Order Management Table
   -------------------------------------------------------------------------- */
function renderOrdersTable() {
  const tbody = document.getElementById("adminOrdersTbody");
  if (!tbody) return;

  const orders = window.StorageService ? window.StorageService.getOrders() : [];

  let filtered = orders;

  if (orderStatusFilter !== "all") {
    filtered = filtered.filter(o => o.status === orderStatusFilter);
  }

  if (orderSearchQuery) {
    filtered = filtered.filter(o => 
      o.id.toLowerCase().includes(orderSearchQuery) ||
      o.customerName.toLowerCase().includes(orderSearchQuery) ||
      o.customerPhone.includes(orderSearchQuery) ||
      (o.instagramHandle && o.instagramHandle.toLowerCase().includes(orderSearchQuery))
    );
  }

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
          No COD orders match your criteria.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(order => {
    const tr = document.createElement("tr");

    // Format date
    const dateObj = new Date(order.createdAt || Date.now());
    const dateFormatted = dateObj.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

    // Items summary
    const itemsSummary = (order.items || []).map(i => `${i.name} &times; ${i.quantity}`).join("<br>");

    // Status class
    const statusClassMap = {
      "Order Placed": "status-placed",
      "Packed with Love": "status-packed",
      "Out for Delivery": "status-delivery",
      "Delivered": "status-delivered",
      "Cancelled": "status-cancelled"
    };

    const statusPillClass = statusClassMap[order.status] || "status-placed";

    tr.innerHTML = `
      <td>
        <strong style="font-family: var(--font-serif); font-size: 0.95rem;">${order.id}</strong>
        <div style="font-size: 0.75rem; color: var(--text-light);">${dateFormatted}</div>
      </td>
      <td>
        <div style="font-weight: 600;">${order.customerName}</div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">📞 ${order.customerPhone}</div>
        ${order.instagramHandle && order.instagramHandle !== "Not provided" ? `
          <div style="font-size: 0.75rem; color: var(--accent-gold-hover); font-weight: 600;">IG: ${order.instagramHandle}</div>
        ` : ""}
      </td>
      <td>
        <div style="font-size: 0.82rem; font-weight: 600; color: var(--text-primary);">${order.deliveryZone}</div>
        <div style="font-size: 0.78rem; color: var(--text-secondary); max-width: 220px;">${order.address}, PIN: ${order.pincode}</div>
      </td>
      <td style="font-size: 0.82rem;">
        ${itemsSummary}
      </td>
      <td>
        <button class="btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.76rem; min-height: unset;" onclick="viewGiftNote('${order.id}')">
          💌 View Note
        </button>
      </td>
      <td>
        <strong style="color: var(--text-primary); font-size: 0.95rem;">₹${order.total}</strong>
        <div style="font-size: 0.72rem; color: var(--text-secondary);">${order.paymentMethod || "COD"}</div>
      </td>
      <td>
        <select class="form-select status-dropdown ${statusPillClass}" style="padding: 0.35rem 0.5rem; font-size: 0.8rem; width: auto;" onchange="handleStatusChange('${order.id}', this.value)">
          <option value="Order Placed" ${order.status === "Order Placed" ? "selected" : ""}>Order Placed</option>
          <option value="Packed with Love" ${order.status === "Packed with Love" ? "selected" : ""}>Packed with Love</option>
          <option value="Out for Delivery" ${order.status === "Out for Delivery" ? "selected" : ""}>Out for Delivery</option>
          <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
          <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </td>
      <td>
        <button class="cart-item-remove" title="Delete order" onclick="handleDeleteOrder('${order.id}')">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function handleStatusChange(orderId, newStatus) {
  if (window.StorageService) {
    window.StorageService.updateOrderStatus(orderId, newStatus);
    showAdminToast(`Updated ${orderId} to "${newStatus}"`);
    updateKPICards();
    renderOrdersTable();
  }
}

function handleDeleteOrder(orderId) {
  if (confirm(`Are you sure you want to permanently delete order ${orderId}?`)) {
    const orders = window.StorageService ? window.StorageService.getOrders() : [];
    const remaining = orders.filter(o => o.id !== orderId);
    window.StorageService.saveOrders(remaining);
    showAdminToast(`Deleted order ${orderId}`);
    updateKPICards();
    renderOrdersTable();
  }
}

function viewGiftNote(orderId) {
  const orders = window.StorageService ? window.StorageService.getOrders() : [];
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  alert(`💌 Handwritten Gift Note for Order ${order.id} (${order.customerName}):\n\n"${order.giftNote || 'No special note requested.'}"`);
}

function exportOrdersCSV() {
  const orders = window.StorageService ? window.StorageService.getOrders() : [];
  if (orders.length === 0) {
    alert("No orders to export.");
    return;
  }

  const headers = ["Order ID", "Date", "Customer Name", "Phone", "Instagram", "Zone", "Address", "Pincode", "Gift Note", "Total ₹", "Status"];
  const rows = orders.map(o => [
    o.id,
    o.createdAt,
    `"${(o.customerName || '').replace(/"/g, '""')}"`,
    o.customerPhone,
    o.instagramHandle,
    `"${(o.deliveryZone || '').replace(/"/g, '""')}"`,
    `"${(o.address || '').replace(/"/g, '""')}"`,
    o.pincode,
    `"${(o.giftNote || '').replace(/"/g, '""')}"`,
    o.total,
    o.status
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `GiftAura_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* --------------------------------------------------------------------------
   Quick Price & Inventory Editor
   -------------------------------------------------------------------------- */
function renderPriceEditorTable() {
  const tbody = document.getElementById("adminProductsTbody");
  if (!tbody) return;

  const products = window.StorageService ? window.StorageService.getProducts() : [];
  tbody.innerHTML = "";

  products.forEach(product => {
    const tr = document.createElement("tr");
    tr.id = `prod_row_${product.id}`;

    tr.innerHTML = `
      <td>
        <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; border-radius: 10px; object-fit: cover; background: #FAF5F2;">
      </td>
      <td>
        <input 
          type="text" 
          class="form-input" 
          id="title_${product.id}" 
          value="${product.name}" 
          style="padding: 0.4rem 0.65rem; font-size: 0.88rem; width: 100%; min-width: 200px;">
        <div style="font-size: 0.72rem; color: var(--text-light); margin-top: 0.2rem;">ID: ${product.id} • ${product.category}</div>
      </td>
      <td>
        <span class="product-badge" style="position: static; font-size: 0.72rem;">${product.category}</span>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <span style="font-weight: 700; color: var(--accent-gold-hover);">₹</span>
          <input 
            type="number" 
            class="inline-price-input" 
            id="price_${product.id}" 
            value="${product.price}" 
            min="1" 
            step="1">
        </div>
      </td>
      <td>
        <select class="form-select" id="stock_${product.id}" style="padding: 0.35rem 0.5rem; font-size: 0.8rem; width: auto;">
          <option value="true" ${product.inStock !== false ? "selected" : ""}>In Stock</option>
          <option value="false" ${product.inStock === false ? "selected" : ""}>Sold Out</option>
        </select>
      </td>
      <td>
        <button 
          class="btn-primary" 
          style="padding: 0.45rem 0.85rem; font-size: 0.8rem; min-height: unset;" 
          onclick="saveSingleProductPrice('${product.id}')">
          💾 Save
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function saveSingleProductPrice(productId) {
  const products = window.StorageService ? window.StorageService.getProducts() : [];
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const newTitle = document.getElementById(`title_${productId}`)?.value.trim();
  const newPrice = Number(document.getElementById(`price_${productId}`)?.value);
  const inStockVal = document.getElementById(`stock_${productId}`)?.value === "true";

  if (!newTitle) {
    alert("Product title cannot be empty.");
    return;
  }

  if (isNaN(newPrice) || newPrice <= 0) {
    alert("Please enter a valid price in ₹.");
    return;
  }

  product.name = newTitle;
  product.price = newPrice;
  product.inStock = inStockVal;

  window.StorageService.saveProducts(products);
  showAdminToast(`✨ Saved changes for "${product.name}" (₹${newPrice})! Live on storefront.`);
  updateKPICards();
}

function resetToDefaultCatalog() {
  if (confirm("Reset all products and prices to the initial factory seed catalog?")) {
    if (window.INITIAL_PRODUCTS && window.StorageService) {
      window.StorageService.saveProducts(window.INITIAL_PRODUCTS);
      showAdminToast("Catalog restored to initial seed products!");
      renderPriceEditorTable();
      updateKPICards();
    }
  }
}

/* --------------------------------------------------------------------------
   Add New Product Form
   -------------------------------------------------------------------------- */
let newProductImageBase64 = null;

function handleProductImageFilePreview(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      newProductImageBase64 = evt.target.result;
      const preview = document.getElementById("newProductImagePreview");
      if (preview) {
        preview.src = newProductImageBase64;
        preview.style.display = "block";
      }
    };
    reader.readAsDataURL(file);
  }
}

function handleAddNewProduct(e) {
  e.preventDefault();

  const name = document.getElementById("newProductName").value.trim();
  const category = document.getElementById("newProductCategory").value;
  const price = Number(document.getElementById("newProductPrice").value);
  const originalPrice = Number(document.getElementById("newProductOriginalPrice").value) || price + 80;
  const badge = document.getElementById("newProductBadge").value.trim() || "New";
  const description = document.getElementById("newProductDesc").value.trim() || "Handcrafted with love in Kalyan. Anti-tarnish & skin-friendly.";
  const urlInput = document.getElementById("newProductImageUrl").value.trim();

  // Use uploaded file base64 or URL or fallback to an existing asset
  const image = newProductImageBase64 || urlInput || "assets/images/bracelet-pink.jpeg";

  if (!name || isNaN(price) || price <= 0) {
    alert("Please enter a valid product name and price.");
    return;
  }

  const newId = `GA-ITEM-${Date.now().toString().slice(-4)}`;

  const newProduct = {
    id: newId,
    name: name,
    category: category,
    price: price,
    originalPrice: originalPrice,
    badge: badge,
    badgeType: "new",
    image: image,
    inStock: true,
    description: description,
    details: [
      "18K Gold Plated anti-tarnish finish",
      "Handcrafted in Kalyan, Maharashtra",
      "Free gift packaging & note card"
    ]
  };

  const products = window.StorageService ? window.StorageService.getProducts() : [];
  products.push(newProduct);
  window.StorageService.saveProducts(products);

  showAdminToast(`✨ Added new product: "${name}" at ₹${price}!`);
  
  // Reset form
  document.getElementById("addNewProductForm").reset();
  newProductImageBase64 = null;
  const preview = document.getElementById("newProductImagePreview");
  if (preview) preview.style.display = "none";

  // Refresh
  updateKPICards();
  renderPriceEditorTable();

  // Switch to Price & Inventory Tab
  const priceTabBtn = document.querySelector('[data-tab="products"]');
  if (priceTabBtn) priceTabBtn.click();
}

/* --------------------------------------------------------------------------
   Admin Toast Notifications
   -------------------------------------------------------------------------- */
function showAdminToast(message) {
  let container = document.getElementById("adminToastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "adminToastContainer";
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

// Global exposure
window.handleStatusChange = handleStatusChange;
window.handleDeleteOrder = handleDeleteOrder;
window.viewGiftNote = viewGiftNote;
window.exportOrdersCSV = exportOrdersCSV;
window.saveSingleProductPrice = saveSingleProductPrice;
window.resetToDefaultCatalog = resetToDefaultCatalog;
