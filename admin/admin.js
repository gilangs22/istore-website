const API_URL = '/api';
let editingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    setupEventListeners();
});

function checkLogin() {
    if (sessionStorage.getItem('isAdminLogged') === 'true') {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('mainDashboard').style.display = 'grid';
        loadProducts();
    }
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('username').value === 'admin' && document.getElementById('password').value === 'admin123') {
        sessionStorage.setItem('isAdminLogged', 'true');
        location.reload();
    } else {
        alert('Login Gagal');
    }
});

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        const tbody = document.getElementById('productsTableBody');
        document.getElementById('productCount').textContent = `${data.length} unit`;
        tbody.innerHTML = data.map(p => `
            <tr>
                <td>#${p.id}</td>
                <td><img src="${p.image || ''}" style="width:50px; border-radius:8px;"></td>
                <td><strong>${p.name}</strong><br><small>${p.storage || '-'} | BH ${p.bh || '-'}%</small></td>
                <td>${p.category}</td>
                <td>Rp ${parseInt(p.price || 0).toLocaleString('id-ID')}</td>
                <td>${p.stock}</td>
                <td>
                    <button onclick="editProduct(${p.id})" class="btn-icon btn-edit"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProduct(${p.id})" class="btn-icon btn-delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    console.log("🚀 Submit dimulai...");
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;

    try {
        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseInt(document.getElementById('productPrice').value) || 0,
            stock: parseInt(document.getElementById('productStock').value) || 0,
            bh: parseInt(document.getElementById('productBH').value) || null,
            storage: document.getElementById('productStorage').value,
            camera: document.getElementById('productCamera').value,
            face_id: document.getElementById('productFaceId').value,
            screen: document.getElementById('productScreen').value,
            body_cond: document.getElementById('productBody').value,
            icloud: document.getElementById('productIcloud').value,
            imei: document.getElementById('productImei').value,
            completeness: document.getElementById('productCompleteness').value,
            release_year: document.getElementById('productReleaseYear').value,
            minus: document.getElementById('productMinus').value,
            image: document.getElementById('productImage').value
        };

        const imageFile = document.getElementById('productImageFile').files[0];
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            const upRes = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
            const upData = await upRes.json();
            if (upData.success) productData.image = upData.imageUrl;
        }

        const url = editingProductId ? `${API_URL}/products/${editingProductId}` : `${API_URL}/products`;
        const method = editingProductId ? 'PUT' : 'POST';

        console.log(`📡 Mengirim ${method} ke ${url}`);

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('✅ Berhasil Simpan Data!');
            resetForm();
            loadProducts();
        } else {
            alert('❌ Gagal: ' + (result.error || 'Unknown Error'));
        }
    } catch (err) {
        alert('❌ Error: ' + err.message);
    } finally {
        submitBtn.disabled = false;
    }
}

async function editProduct(id) {
    const res = await fetch(`${API_URL}/products/${id}`);
    const p = await res.json();
    editingProductId = id;
    document.getElementById('formTitle').textContent = 'Edit Produk #' + id;
    document.getElementById('productName').value = p.name || '';
    document.getElementById('productPrice').value = p.price || 0;
    document.getElementById('productStock').value = p.stock || 1;
    document.getElementById('productBH').value = p.bh || '';
    document.getElementById('productStorage').value = p.storage || '';
    document.getElementById('productCamera').value = p.camera || '';
    document.getElementById('productFaceId').value = p.face_id || '';
    document.getElementById('productScreen').value = p.screen || '';
    document.getElementById('productBody').value = p.body_cond || '';
    document.getElementById('productIcloud').value = p.icloud || '';
    document.getElementById('productImei').value = p.imei || '';
    document.getElementById('productCompleteness').value = p.completeness || '';
    document.getElementById('productReleaseYear').value = p.release_year || '';
    document.getElementById('productMinus').value = p.minus || '';
    document.getElementById('productImage').value = p.image || '';
    document.getElementById('submitBtn').textContent = 'Update Produk';
    document.getElementById('cancelEdit').style.display = 'inline-block';
    window.scrollTo(0,0);
}

async function deleteProduct(id) {
    if (confirm('Hapus?')) {
        await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        loadProducts();
    }
}

function resetForm() {
    editingProductId = null;
    document.getElementById('productForm').reset();
    document.getElementById('submitBtn').textContent = 'Simpan Produk';
    document.getElementById('cancelEdit').style.display = 'none';
}

function setupEventListeners() {
    document.getElementById('productForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancelEdit').addEventListener('click', resetForm);
}

function logout() {
    sessionStorage.clear();
    location.reload();
}
