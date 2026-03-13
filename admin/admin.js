// ========================================
// ADMIN DASHBOARD - iStore
// ========================================

const API_URL = '/api';

// Inline SVG Placeholder (no external dependency!)
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%23999'%3ENo Image%3C/text%3E%3Cpath d='M70 90 L85 105 L95 95 L110 110 L130 90' stroke='%23ccc' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='75' cy='75' r='8' fill='%23ccc'/%3E%3C/svg%3E";

const ERROR_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23ffe0e0' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%23cc0000'%3EError%3C/text%3E%3C/svg%3E";

let editingProductId = null;
let allProducts = [];

// ========================================
// INITIALIZE
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadProducts();
  setupEventListeners();
});

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
  // Navigation Sidebar
  const navItems = document.querySelectorAll('.nav-item[data-page]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.getAttribute('data-page');
      showPage(pageId);
    });
  });

  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarClose = document.getElementById('sidebarClose');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('active');
    });
  }

  if (sidebarClose && sidebar) {
    sidebarClose.addEventListener('click', () => {
      sidebar.classList.remove('active');
    });
  }

  // Form Submit
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', handleFormSubmit);
  }

  // Image File Preview
  const imageFileInput = document.getElementById('productImageFile');
  if (imageFileInput) {
    imageFileInput.addEventListener('change', handleImagePreview);
  }

  // Image URL Input
  const imageUrlInput = document.getElementById('productImage');
  if (imageUrlInput) {
    imageUrlInput.addEventListener('input', handleImageUrlPreview);
  }

  // Filter & Search
  const filterCategory = document.getElementById('filterCategory');
  if (filterCategory) {
    filterCategory.addEventListener('change', loadProducts);
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(loadProducts, 500));
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', loadProducts);
  }

  // Cancel Edit
  const cancelEditBtn = document.getElementById('cancelEdit');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', resetForm);
  }
}

// ========================================
// NAVIGATION
// ========================================
function showPage(pageId) {
  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-page') === pageId) {
      item.classList.add('active');
    }
  });

  // Update page visibility
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Close sidebar on mobile
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.remove('active');
  }

  // Title update
  const titles = {
    'dashboard': 'Dashboard - iStore Admin',
    'products': 'Kelola Produk - iStore Admin',
    'categories': 'Kelola Kategori - iStore Admin'
  };
  if (titles[pageId]) {
    document.title = titles[pageId];
  }
}

function navigateToProducts() {
  showPage('products');
  resetForm();
  document.getElementById('productName').focus();
}

// ========================================
// IMAGE PREVIEW
// ========================================
function handleImagePreview(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('imagePreview');

  if (file) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ Ukuran file maksimal 5MB!');
      e.target.value = '';
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('❌ File harus berupa gambar!');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `
        <img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #ddd;">
        <p style="margin-top: 5px; color: #666; font-size: 12px;">📸 ${file.name} (${(file.size / 1024).toFixed(2)} KB)</p>
      `;
    };
    reader.readAsDataURL(file);

    // Clear URL input
    document.getElementById('productImage').value = '';
  } else {
    preview.innerHTML = '';
  }
}

function handleImageUrlPreview(e) {
  const url = e.target.value.trim();
  const preview = document.getElementById('imagePreview');

  if (url) {
    preview.innerHTML = `
      <img src="${url}" alt="Preview" 
           style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #ddd;"
           onerror="this.src='${ERROR_IMAGE}'">
      <p style="margin-top: 5px; color: #666; font-size: 12px;">🔗 URL Gambar</p>
    `;

    // Clear file input
    document.getElementById('productImageFile').value = '';
  } else {
    preview.innerHTML = '';
  }
}

// ========================================
// FORM SUBMIT
// ========================================
async function handleFormSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

  try {
    // Collect form data
    const productData = {
      name: document.getElementById('productName').value.trim(),
      category: document.getElementById('productCategory').value,
      price: parseInt(document.getElementById('productPrice').value),
      stock: parseInt(document.getElementById('productStock').value),
      description: document.getElementById('productDescription').value.trim(),
      badge: document.getElementById('productBadge').value,
      specs: null
    };

    // Validate required fields
    if (!productData.name || !productData.category || !productData.price) {
      throw new Error('Nama, kategori, dan harga harus diisi!');
    }

    // Handle Image Upload
    const imageFile = document.getElementById('productImageFile').files[0];
    const imageUrl = document.getElementById('productImage').value.trim();

    if (imageFile) {
      // Upload file to server
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadRes = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error(uploadData.message || 'Gagal upload gambar');
      }

      productData.image = uploadData.imageUrl;
    } else if (imageUrl) {
      // Use URL directly
      productData.image = imageUrl;
    } else {
      productData.image = '';
    }

    // Parse specs (optional JSON)
    const specsInput = document.getElementById('productSpecs')?.value.trim();
    if (specsInput && specsInput !== "" && specsInput !== "null") {
      try {
        // Coba perbaiki jika user pakai kutip satu ' ganti ke kutip dua "
        const fixedJson = specsInput.replace(/'/g, '"');
        productData.specs = JSON.parse(fixedJson);
      } catch (err) {
        console.error("JSON Parse Error:", err);
        throw new Error('Format Spesifikasi salah! Gunakan format: {"Layar": "6.7 inci", "RAM": "8GB"}. Pastikan menggunakan tanda kutip dua (").');
      }
    } else {
      productData.specs = null;
    }

    // API Request
    const url = editingProductId 
      ? `${API_URL}/products/${editingProductId}` 
      : `${API_URL}/products`;
    const method = editingProductId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    const result = await response.json();

    if (result.success || response.ok) {
      showToast(
        editingProductId ? '✅ Produk berhasil diupdate!' : '✅ Produk berhasil ditambahkan!',
        'success'
      );
      resetForm();
      loadProducts();
      loadStats();
    } else {
      throw new Error(result.message || 'Gagal menyimpan produk');
    }

  } catch (error) {
    console.error('Error:', error);
    showToast('❌ ' + error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// ========================================
// LOAD PRODUCTS
// ========================================
async function loadProducts() {
  try {
    const category = document.getElementById('filterCategory')?.value || 'all';
    const search = document.getElementById('searchInput')?.value || '';
    const sort = document.getElementById('sortSelect')?.value || 'newest';

    const params = new URLSearchParams();
    if (category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);

    const response = await fetch(`${API_URL}/products?${params}`);
    const products = await response.json();

    allProducts = products;
    displayProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
    showToast('❌ Gagal memuat produk', 'error');
  }
}

// ========================================
// DISPLAY PRODUCTS
// ========================================
function displayProducts(products) {
  const tbody = document.getElementById('productsTableBody');
  const productCount = document.getElementById('productCount');

  if (!tbody) return;

  // Update count
  if (productCount) {
    productCount.textContent = `${products.length} produk`;
  }

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
          <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
          <h3 style="margin: 10px 0;">Tidak ada produk</h3>
          <p>Silakan tambah produk baru atau ubah filter pencarian</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = products.map(product => {
    const stockClass = product.stock === 0 ? 'out-of-stock' : product.stock <= 5 ? 'low-stock' : '';
    const stockBadge = product.stock === 0 ? '❌ Habis' : product.stock <= 5 ? `⚠️ ${product.stock}` : `✅ ${product.stock}`;

    return `
      <tr>
        <td style="text-align: center;">${product.id}</td>
        <td style="text-align: center;">
          <img src="${product.image || PLACEHOLDER_IMAGE}"
               alt="${product.name}" 
               style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid #eee;"
               onerror="this.src='${ERROR_IMAGE}'">
        </td>
        <td>
          <strong>${product.name}</strong>
          ${product.description ? `<br><small style="color: #666;">${product.description.substring(0, 50)}...</small>` : ''}
        </td>
        <td>
          <span class="badge badge-${product.category}">${product.category}</span>
        </td>
        <td style="text-align: right;">
          <strong>Rp ${product.price.toLocaleString('id-ID')}</strong>
        </td>
        <td style="text-align: center;">
          <span class="stock-badge ${stockClass}">${stockBadge}</span>
        </td>
        <td style="text-align: center;">
          ${product.badge ? `<span class="badge badge-special">${product.badge}</span>` : '-'}
        </td>
        <td style="text-align: center;">
          <button onclick="editProduct(${product.id})" class="btn btn-sm btn-edit" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="deleteProduct(${product.id}, '${product.name.replace(/'/g, "\\'")}'')" class="btn btn-sm btn-delete" title="Hapus">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ========================================
// EDIT PRODUCT
// ========================================
async function editProduct(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    const product = await response.json();

    editingProductId = id;

    // Fill form
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImage').value = product.image || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productBadge').value = product.badge || '';

    // Specs
    if (product.specs) {
      document.getElementById('productSpecs').value = JSON.stringify(product.specs, null, 2);
    } else {
      document.getElementById('productSpecs').value = '';
    }

    // Show preview if image exists
    if (product.image) {
      document.getElementById('imagePreview').innerHTML = `
        <img src="${product.image}" alt="Current" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #ddd;">
        <p style="margin-top: 5px; color: #666; font-size: 12px;">📸 Gambar saat ini</p>
      `;
    }

    // Update UI
    document.getElementById('formTitle').textContent = '✏️ Edit Produk';
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Update Produk';
    document.getElementById('cancelEdit').style.display = 'inline-block';

    // Scroll to form
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });

  } catch (error) {
    console.error('Error:', error);
    showToast('❌ Gagal memuat data produk', 'error');
  }
}

// ========================================
// DELETE PRODUCT
// ========================================
async function deleteProduct(id, name) {
  if (!confirm(`⚠️ Yakin hapus produk "${name}"?\n\nTindakan ini tidak dapat dibatalkan!`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      showToast('✅ Produk berhasil dihapus!', 'success');
      loadProducts();
      loadStats();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('❌ Gagal menghapus produk', 'error');
  }
}

// ========================================
// RESET FORM
// ========================================
function resetForm() {
  document.getElementById('productForm').reset();
  document.getElementById('imagePreview').innerHTML = '';
  editingProductId = null;

  document.getElementById('formTitle').textContent = '➕ Tambah Produk Baru';
  document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Simpan Produk';
  document.getElementById('cancelEdit').style.display = 'none';
}

// ========================================
// LOAD STATS
// ========================================
async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/stats/summary`);
    const result = await response.json();

    if (result.success) {
      const stats = result.data;

      // Update stats cards
      document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
      document.getElementById('lowStockCount').textContent = stats.lowStock || 0;
      document.getElementById('outOfStockCount').textContent = stats.outOfStock || 0;

      // Calculate available products
      const available = stats.totalProducts - stats.outOfStock;
      const availableEl = document.getElementById('availableProducts');
      if (availableEl) {
        availableEl.textContent = available;
      }

      // Category breakdown
      const categoryBreakdown = document.getElementById('categoryBreakdown');
      if (categoryBreakdown && stats.byCategory) {
        const categoryIcons = {
          'iphone': '📱',
          'casing': '🛡️',
          'charger': '🔌',
          'aksesoris': '🎧'
        };

        categoryBreakdown.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            ${stats.byCategory.map(cat => `
              <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">
                  ${categoryIcons[cat.category] || '📦'}
                </div>
                <div style="font-size: 24px; font-weight: bold; color: #1a73e8;">
                  ${cat.count}
                </div>
                <div style="color: #666; text-transform: capitalize; margin-top: 5px;">
                  ${cat.category}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = 'success') {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.toast-notification');
  existingToasts.forEach(toast => toast.remove());

  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  `;

  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ========================================
// UTILITIES
// ========================================
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function logout() {
  if (confirm('Yakin ingin logout?')) {
    sessionStorage.clear();
    window.location.href = '/admin';
  }
}

// ========================================
// CSS ANIMATIONS
// ========================================
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
  }

  .badge-iphone { background: #e3f2fd; color: #1976d2; }
  .badge-casing { background: #f3e5f5; color: #7b1fa2; }
  .badge-charger { background: #fff3e0; color: #e65100; }
  .badge-aksesoris { background: #e8f5e9; color: #2e7d32; }
  .badge-special { background: #ffebee; color: #c62828; }

  .stock-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .stock-badge.low-stock {
    background: #fff3cd;
    color: #856404;
  }

  .stock-badge.out-of-stock {
    background: #f8d7da;
    color: #721c24;
  }

  .btn-sm {
    padding: 6px 12px;
    font-size: 13px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    margin: 0 3px;
  }

  .btn-edit {
    background: #3b82f6;
    color: white;
  }

  .btn-edit:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }

  .btn-delete {
    background: #ef4444;
    color: white;
  }

  .btn-delete:hover {
    background: #dc2626;
    transform: translateY(-2px);
  }
`;
document.head.appendChild(style);

// ========================================
// INITIALIZE ON LOAD
// ========================================
console.log('✅ Admin Panel Loaded');
console.log('📊 API URL:', API_URL);
