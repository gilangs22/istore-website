document.addEventListener('DOMContentLoaded', () => {
    initCursorGlow();
    loadProducts();
    setupEventListeners();
    initDarkMode();
    setTimeout(initScrollReveal, 200);
});

// Cursor Spotlight
function initCursorGlow() {
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
}

let allProducts = [];

async function loadProducts(category = 'all', search = '') {
    const grid = document.getElementById('productGrid');
    
    // Show Skeletons
    grid.innerHTML = Array(4).fill(0).map(() => `
        <div class="skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-price"></div>
            <div class="shimmer"></div>
        </div>
    `).join('');

    try {
        const params = new URLSearchParams();
        if (category !== 'all') params.append('category', category);
        if (search) params.append('search', search);

        const response = await fetch(`/api/products?${params}`);
        const products = await response.json();
        allProducts = products;

        // Simulate slight delay for better feel
        setTimeout(() => {
            displayProducts(products);
        }, 500);
    } catch (error) {
        console.error('Error:', error);
        grid.innerHTML = '<div class="error">Gagal memuat produk.</div>';
    }
}

function displayProducts(products) {
    const grid = document.getElementById('productGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="no-results">Stok sedang kosong, bosku!</div>';
        return;
    }

    grid.innerHTML = products.map((p, index) => {
        const isSoldOut = p.stock <= 0;
        return `
            <div class="product-card reveal ${isSoldOut ? 'sold-out' : ''}" 
                 style="transition-delay: ${index * 0.1}s" 
                 onclick="${isSoldOut ? '' : `openDetail(${p.id})`}">
                
                <div class="glare"></div>
                ${isSoldOut ? '<div class="sold-badge">TERJUAL</div>' : ''}
                ${p.badge && !isSoldOut ? `<span class="card-badge">${p.badge}</span>` : ''}
                
                <div class="img-container">
                    <img src="${p.image || 'https://via.placeholder.com/400x400?text=iPhone'}" alt="${p.name}" class="product-thumb">
                </div>
                
                <div class="product-info">
                    <span class="product-cat">${p.category}</span>
                    <h3>${p.name}</h3>
                    <span class="product-price">Rp ${parseInt(p.price || 0).toLocaleString('id-ID')}</span>
                    
                    <div class="card-specs">
                        ${p.storage ? `<span class="spec-pill"><i class="fas fa-hdd"></i> ${p.storage}</span>` : ''}
                        ${p.bh ? `<span class="spec-pill"><i class="fas fa-battery-three-quarters"></i> BH ${p.bh}%</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    setTimeout(() => {
        initScrollReveal();
        initTiltEffect();
    }, 100);
}

function openDetail(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    const modal = document.getElementById('detailModal');
    const body = document.getElementById('modalBody');

    body.innerHTML = `
        <div class="detail-grid">
            <div class="detail-img">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="detail-info">
                <div class="detail-header">
                    <span class="hero-badge" style="margin-bottom: 10px;">iPhone Second Original</span>
                    <h2>${product.name}</h2>
                    <span class="detail-price">Rp ${parseInt(product.price).toLocaleString('id-ID')}</span>
                </div>
                
                <div class="detail-sections">
                    <div class="specs-group">
                        <h4><i class="fas fa-info-circle"></i> Kondisi & Kelengkapan</h4>
                        <div class="detail-list">
                            <div class="list-item"><i class="fas fa-battery-three-quarters"></i> <span>BH: <b>${product.bh || '-'}%</b></span></div>
                            <div class="list-item"><i class="fas fa-face-smile"></i> <span>Face ID: <b>${product.face_id || 'Normal'}</b></span></div>
                            <div class="list-item"><i class="fas fa-mobile-alt"></i> <span>Layar: <b>${product.screen || 'Mulus'}</b></span></div>
                            <div class="list-item"><i class="fas fa-mobile"></i> <span>Body: <b>${product.body_cond || 'Mulus'}</b></span></div>
                            <div class="list-item"><i class="fas fa-cloud"></i> <span>iCloud: <b>${product.icloud || 'Clean'}</b></span></div>
                            <div class="list-item"><i class="fas fa-signal"></i> <span>IMEI: <b>${product.imei || 'Aman'}</b></span></div>
                            <div class="list-item"><i class="fas fa-box-open"></i> <span>Kelengkapan: <b>${product.completeness || 'Unit + Kabel'}</b></span></div>
                        </div>
                    </div>

                    <div class="specs-group">
                        <h4><i class="fas fa-microchip"></i> Spesifikasi Teknis</h4>
                        <div class="detail-list">
                            <div class="list-item"><i class="fas fa-hdd"></i> <span>Penyimpanan: <b>${product.storage || '-'}</b></span></div>
                            <div class="list-item"><i class="fas fa-camera"></i> <span>Kamera: <b>${product.camera || 'Normal'}</b></span></div>
                            <div class="list-item"><i class="fas fa-calendar-alt"></i> <span>Tahun Rilis: <b>${product.release_year || '-'}</b></span></div>
                            <div class="list-item"><i class="fas fa-box"></i> <span>Stok: <b>${product.stock} Unit</b></span></div>
                        </div>
                    </div>
                </div>

                <div class="minus-section">
                    <p style="font-weight: 700; margin-bottom: 10px; color: #e02d2d;">Catatan Khusus / Minus:</p>
                    <div class="minus-box">
                        ${product.minus || 'Gak ada minus, bosku. Unit tinggal pakai!'}
                    </div>
                </div>

                <a href="https://wa.me/62895367072329?text=Halo Bakul iPhone, saya tertarik dengan unit ${product.name}. Boleh minta video detailnya?" 
                   target="_blank" 
                   class="wa-btn">
                    <i class="fab fa-whatsapp"></i> Tanya Detail via WhatsApp
                </a>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function initTiltEffect() {
    const cards = document.querySelectorAll('.product-card:not(.sold-out)');
    cards.forEach(card => {
        const glare = card.querySelector('.glare');
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;
            card.style.transition = 'none';
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            if (glare) {
                const glareX = (x / rect.width) * 100;
                const glareY = (y / rect.height) * 100;
                glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, transparent 80%)`;
                glare.style.opacity = '1';
            }
            card.style.zIndex = '10';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
            if (glare) glare.style.opacity = '0';
            card.style.zIndex = '1';
        });
    });
}

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .feature-card, .cta-content, .why-us h2');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));
}

function initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    const icon = toggle.querySelector('i');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        document.body.classList.remove('dark-mode');
        icon.classList.replace('fa-sun', 'fa-moon');
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (isDark) icon.classList.replace('fa-moon', 'fa-sun');
        else icon.classList.replace('fa-sun', 'fa-moon');
    });
}

function setupEventListeners() {
    const modal = document.getElementById('detailModal');
    const closeBtn = document.querySelector('.modal-close');
    const overlay = document.querySelector('.modal-overlay');
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };
    if (closeBtn) closeBtn.onclick = closeModal;
    if (overlay) overlay.onclick = closeModal;
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.onclick = () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadProducts(btn.dataset.category, document.getElementById('searchInput').value);
        };
    });
    let debounceTimer;
    document.getElementById('searchInput').oninput = (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const category = document.querySelector('.filter-btn.active').dataset.category;
            loadProducts(category, e.target.value);
        }, 400);
    };
}
