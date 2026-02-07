// ================================
// ADMIN PANEL - JavaScript
// ================================

const API_URL = 'http://localhost:3000/api';

// State
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 10;
let editingProductId = null;

// DOM Elements
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const sidebarClose = document.getElementById('sidebarClose');
const productModal = document.getElementById('productModal');
const deleteModal = document.getElementById('deleteModal');

// ================================
// INITIALIZE
// ================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initEventListeners();
    loadDashboard();
});

// ================================
// AUTHENTICATION
// ================================
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    const userName = sessionStorage.getItem('adminUser') || 'Admin';
    document.getElementById('userName').textContent = userName;
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('adminUser');
    window.location.href = 'index.html';
}

// ================================
// EVENT LISTENERS
// ================================
function initEventListeners() {
    // Sidebar Toggle
    menuToggle?.addEventListener('click', () => sidebar.classList.add('active'));
    sidebarClose?.addEventListener('click', () => sidebar.classList.remove('active'));
    
    // Navigation
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            showPage(page);
            
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            sidebar.classList.remove('active');
        });
    });
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // Refresh
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
        loadDashboard();
        showToast('Data berhasil diperbarui', 'success');
    });
    
    // Add Product
    document.getElementById('addProductBtn')?.addEventListener('click', openAddModal);
    
    // Product Form
    document.getElementById('productForm')?.addEventListener('submit', handleProductSubmit);
    
    // Modal Close
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    document.querySelector('#productModal .modal-overlay')?.addEventListener('click', closeModal);
    
    // Filters
    document.getElementById('filterCategory')?.addEventListener('change', applyFilters);
    document.getElementById('filterStock')?.addEventListener('change', applyFilters);
    document.getElementById('filterSort')?.addEventListener('change', applyFilters);
    document.getElementById('searchProduct')?.addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('globalSearch')?.addEventListener('input', debounce(globalSearch, 300));
    
    // Image Preview
    document.getElementById('productImageFile')?.addEventListener('change', handleImageUpload);
    document.getElementById('productImage')?.addEventListener('input', handleImageUrlChange);
    
    // Select All
    document.getElementById('selectAll')?.addEventListener('change', (e) => {
        document.querySelectorAll('#productsTableBody input[type="checkbox"]').forEach(cb => {
            cb.checked = e.target.checked;
        });
    });
}

// ================================
// PAGE NAVIGATION
// ================================
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`page-${pageName}`)?.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
    });
    
    if (pageName === 'products') {
        loadProducts();
    } else if (pageName === 'categories') {
        loadCategories();
    } else if (pageName === 'dashboard') {
        loadDashboard();
    }
}

// ================================
// LOAD DATA
// ================================
async function loadDashboard() {
    try {
        // Load products
        const response = await fetch(`${API_URL}/products`);
        allProducts = await response.json();
        
        // Calculate stats
        const totalProducts = allProducts.length;
        const totalIphone = allProducts.filter(p => p.category === 'iphone').length;
        const lowStock = allProducts.filter(p => p.stock > 0 && p.stock <= 5).length;
        const outOfStock = allProducts.filter(p => p.stock === 0).length;
        
        // Update UI
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalIphone').textContent = totalIphone;
        document.getElementById('lowStock').textContent = lowStock;
        document.getElementById('outOfStock').textContent = outOfStock;
        
        // Recent Products
        loadRecentProducts();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Gagal memuat data dashboard', 'error');
    }
}

function loadRecentProducts() {
    const recentContainer = document.getElementById('recentProducts');
    const recent = allProducts.slice(0, 8);
    
    recentContainer.innerHTML = recent.map(product => `
        <div class="recent-product-card" onclick="viewProduct(${product.id})">
            <img src="${product.image || 'https://via.placeholder.com/100'}" alt="${product.name}">
            <div class="recent-product-info">
                <h4>${product.name}</h4>
                <p>${formatPrice(product.price)}</p>
            </div>
        </div>
    `).join('');
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        applyFilters();
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Gagal memuat produk', 'error');
    }
}

async function loadCategories() {
    const categories = ['iphone', 'casing', 'charger', 'aksesoris'];
    const icons = {
        iphone: 'fa-mobile-alt',
        casing: 'fa-shield-alt',
        charger: 'fa-bolt',
        aksesoris: 'fa-headphones'
    };
    
    const categoriesGrid = document.getElementById('categoriesGrid');
    
    categoriesGrid.innerHTML = categories.map(cat => {
        const count = allProducts.filter(p => p.category === cat).length;
        return `
            <div class="category-card" onclick="filterByCategory('${cat}')">
                <div class="icon">
                    <i class="fas ${icons[cat]}"></i>
                </div>
                <h3>${cat}</h3>
                <div class="count">${count}</div>
                <p>Produk</p>
            </div>
        `;
    }).join('');
}

function filterByCategory(category) {
    showPage('products');
    document.getElementById('filterCategory').value = category;
    applyFilters();
}

// ================================
// FILTERS & SEARCH
// ================================
function applyFilters() {
    const category = document.getElementById('filterCategory')?.value || 'all';
    const stock = document.getElementById('filterStock')?.value || 'all';
    const sort = document.getElementById('filterSort')?.value || 'newest';
    const search = document.getElementById('searchProduct')?.value?.toLowerCase() || '';
    
    filteredProducts = allProducts.filter(product => {
        // Category filter
        if (category !== 'all' && product.category !== category) return false;
        
        // Stock filter
        if (stock === 'available' && product.stock <= 5) return false;
        if (stock === 'low' && (product.stock === 0 || product.stock > 5)) return false;
        if (stock === 'empty' && product.stock !== 0) return false;
        
        // Search filter
        if (search && !product.name.toLowerCase().includes(search)) return false;
        
        return true;
    });
    
    // Sort
    filteredProducts.sort((a, b) => {
        switch (sort) {
            case 'newest': return new Date(b.created_at) - new Date(a.created_at);
            case 'oldest': return new Date(a.created_at) - new Date(b.created_at);
            case 'name_asc': return a.name.localeCompare(b.name);
            case 'name_desc': return b.name.localeCompare(a.name);
            case 'price_asc': return a.price - b.price;
            case 'price_desc': return b.price - a.price;
            default: return 0;
        }
    });
    
    currentPage = 1;
    renderProductsTable();
}

function globalSearch(e) {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) return;
    
    showPage('products');
    document.getElementById('searchProduct').value = query;
    applyFilters();
}

// ================================
// RENDER TABLE
// ================================
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    if (pageProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="no-data">
                        <i class="fas fa-box-open"></i>
                        <h3>Tidak ada produk</h3>
                        <p>Coba ubah filter atau tambah produk baru</p>
                    </div>
                </td>
            </tr>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    tbody.innerHTML = pageProducts.map(product => {
        const stockClass = product.stock === 0 ? 'empty' : product.stock <= 5 ? 'low' : 'available';
        const stockText = product.stock === 0 ? 'Habis' : product.stock <= 5 ? `Sisa ${product.stock}` : product.stock;
        
        return `
            <tr>
                <td><input type="checkbox" data-id="${product.id}"></td>
                <td>
                    <img src="${product.image || 'https://via.placeholder.com/60'}" 
                         alt="${product.name}" 
                         class="product-image"
                         onerror="this.src='https://via.placeholder.com/60'">
                </td>
                <td><span class="product-name">${product.name}</span></td>
                <td><span class="category-badge ${product.category}">${product.category}</span></td>
                <td class="price-cell">${formatPrice(product.price)}</td>
                <td>
                    <div class="stock-cell">
                        <span class="stock-indicator ${stockClass}"></span>
                        <span>${stockText}</span>
                    </div>
                </td>
                <td class="badge-cell">
                    ${product.badge ? `<span class="badge ${product.badge}">${product.badge}</span>` : '-'}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="viewProduct(${product.id})" title="Lihat">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editProduct(${product.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="confirmDelete(${product.id}, '${product.name}')" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = `
        <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button onclick="goToPage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<button disabled>...</button>`;
        }
    }
    
    html += `
        <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = html;
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderProductsTable();
}

// ================================
// MODAL OPERATIONS
// ================================
function openAddModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Tambah Produk';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    resetImagePreview();
    productModal.classList.add('active');
}

function openEditModal(product) {
    editingProductId = product.id;
    document.getElementById('modalTitle').textContent = 'Edit Produk';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productBadge').value = product.badge || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productImage').value = product.image || '';
    
    // Specs
    if (product.specs) {
        const specs = typeof product.specs === 'string' ? product.specs : JSON.stringify(product.specs, null, 2);
        document.getElementById('productSpecs').value = specs;
    } else {
        document.getElementById('productSpecs').value = '';
    }
    
    // Image Preview
    if (product.image) {
        showImagePreview(product.image);
    } else {
        resetImagePreview();
    }
    
    productModal.classList.add('active');
}

function closeModal() {
    productModal.classList.remove('active');
    editingProductId = null;
}

// ================================
// CRUD OPERATIONS
// ================================
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('name', document.getElementById('productName').value);
        formData.append('category', document.getElementById('productCategory').value);
        formData.append('price', document.getElementById('productPrice').value);
        formData.append('stock', document.getElementById('productStock').value);
        formData.append('description', document.getElementById('productDescription').value);
        formData.append('badge', document.getElementById('productBadge').value);
        formData.append('image', document.getElementById('productImage').value);
        
        // Specs
        const specsValue = document.getElementById('productSpecs').value;
        if (specsValue) {
            try {
                JSON.parse(specsValue); // Validate JSON
                formData.append('specs', specsValue);
            } catch {
                showToast('Format specs JSON tidak valid', 'error');
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Produk';
                submitBtn.disabled = false;
                return;
            }
        }
        
        // File upload
        const fileInput = document.getElementById('productImageFile');
        if (fileInput.files.length > 0) {
            formData.append('image', fileInput.files[0]);
        }
        
        const url = editingProductId 
            ? `${API_URL}/products/${editingProductId}` 
            : `${API_URL}/products`;
        
        const method = editingProductId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success || response.ok) {
            showToast(editingProductId ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan', 'success');
            closeModal();
            loadProducts();
            loadDashboard();
        } else {
            throw new Error(result.message || 'Gagal menyimpan produk');
        }
        
    } catch (error) {
        console.error('Error saving product:', error);
        showToast(error.message || 'Gagal menyimpan produk', 'error');
    } finally {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Produk';
        submitBtn.disabled = false;
    }
}

function editProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (product) {
        openEditModal(product);
    }
}

function viewProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (product) {
        // Open frontend product detail (could also show a view modal)
        window.open(`../frontend/index.html#products`, '_blank');
    }
}

function confirmDelete(id, name) {
    document.getElementById('deleteProductName').textContent = name;
    document.getElementById('confirmDeleteBtn').onclick = () => deleteProduct(id);
    deleteModal.classList.add('active');
}

function closeDeleteModal() {
    deleteModal.classList.remove('active');
}

async function deleteProduct(id) {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghapus...';
    confirmBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Produk berhasil dihapus', 'success');
            closeDeleteModal();
            loadProducts();
            loadDashboard();
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Gagal menghapus produk', 'error');
    } finally {
        confirmBtn.innerHTML = '<i class="fas fa-trash"></i> Hapus';
        confirmBtn.disabled = false;
    }
}

// ================================
// IMAGE HANDLING
// ================================
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            showImagePreview(event.target.result);
        };
        reader.readAsDataURL(file);
        document.getElementById('productImage').value = ''; // Clear URL input
    }
}

function handleImageUrlChange(e) {
    const url = e.target.value;
    if (url) {
        showImagePreview(url);
        document.getElementById('productImageFile').value = ''; // Clear file input
    } else {
        resetImagePreview();
    }
}

function showImagePreview(src) {
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('previewImg');
    preview.classList.add('has-image');
    img.src = src;
    img.classList.add('show');
}

function resetImagePreview() {
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('previewImg');
    preview.classList.remove('has-image');
    img.src = '';
    img.classList.remove('show');
}

// ================================
// TOAST NOTIFICATIONS
// ================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
        <button class="close-toast" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// ================================
// HELPERS
// ================================
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeDeleteModal();
    }
});

// Close delete modal on overlay click
document.querySelector('#deleteModal .modal-overlay')?.addEventListener('click', closeDeleteModal);