// ================================
// APP.JS - Frontend Logic
// ================================

// Config
const API_URL = '/api';
const WHATSAPP_NUMBER = "6281234567890"; // Ganti dengan nomor WA kamu

// State
let allProducts = [];
let filteredProducts = [];
let currentFilter = "all";
let displayedProducts = 8;

// DOM Elements
const productsGrid = document.getElementById("productsGrid");
const filterBtns = document.querySelectorAll(".filter-btn");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchToggle = document.getElementById("searchToggle");
const searchBar = document.getElementById("searchBar");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.querySelector(".nav-menu");
const modal = document.getElementById("productModal");
const modalClose = document.getElementById("modalClose");
const backToTop = document.getElementById("backToTop");
const navbar = document.querySelector(".navbar");

// ================================
// INITIALIZE
// ================================
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    initEventListeners();
    initScrollEffects();
    initCategoryCards();
});

// ================================
// FETCH PRODUCTS
// ================================
async function loadProducts() {
    showLoading();

    try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        allProducts = await response.json();
        filteredProducts = [...allProducts];
        renderProducts();
    } catch (error) {
        console.error("Error loading products:", error);
        // Jika API belum ready, tampilkan dummy data
        loadDummyProducts();
    }
}

// Dummy Products (untuk testing tanpa backend)
function loadDummyProducts() {
    allProducts = [
        {
            id: 1,
            name: "iPhone 15 Pro Max 256GB",
            category: "iphone",
            price: 21999000,
            stock: 15,
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=400&hei=400&fmt=png-alpha",
            description:
                "iPhone 15 Pro Max dengan chip A17 Pro, kamera 48MP, dan titanium design. Performa maksimal untuk gaming dan produktivitas.",
            badge: "new",
            specs: {
                Layar: "6.7 inch Super Retina XDR",
                Chip: "A17 Pro",
                Kamera: "48MP + 12MP + 12MP",
                Baterai: "4441 mAh",
                Storage: "256GB",
            },
        },
        {
            id: 2,
            name: "iPhone 15 Pro 128GB",
            category: "iphone",
            price: 18999000,
            stock: 20,
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=400&hei=400&fmt=png-alpha",
            description:
                "iPhone 15 Pro dengan desain titanium premium dan Action Button. Cocok untuk content creator.",
            badge: "hot",
            specs: {
                Layar: "6.1 inch Super Retina XDR",
                Chip: "A17 Pro",
                Kamera: "48MP + 12MP + 12MP",
                Baterai: "3274 mAh",
                Storage: "128GB",
            },
        },
        {
            id: 3,
            name: "iPhone 15 128GB",
            category: "iphone",
            price: 14999000,
            stock: 30,
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=400&hei=400&fmt=png-alpha",
            description:
                "iPhone 15 dengan Dynamic Island dan USB-C. Pilihan tepat untuk upgrade dari iPhone lama.",
            badge: "",
            specs: {
                Layar: "6.1 inch Super Retina XDR",
                Chip: "A16 Bionic",
                Kamera: "48MP + 12MP",
                Baterai: "3349 mAh",
                Storage: "128GB",
            },
        },
        {
            id: 4,
            name: "iPhone 14 128GB",
            category: "iphone",
            price: 12499000,
            stock: 25,
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-blue?wid=400&hei=400&fmt=png-alpha",
            description:
                "iPhone 14 dengan kamera ganda 12MP dan mode Action. Performa handal dengan harga terjangkau.",
            badge: "sale",
            specs: {
                Layar: "6.1 inch Super Retina XDR",
                Chip: "A15 Bionic",
                Kamera: "12MP + 12MP",
                Baterai: "3279 mAh",
                Storage: "128GB",
            },
        },
        {
            id: 5,
            name: "MagSafe Case iPhone 15 Pro",
            category: "casing",
            price: 799000,
            stock: 50,
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MT473?wid=400&hei=400&fmt=png-alpha",
            description:
                "Case silicone original Apple dengan MagSafe built-in. Proteksi maksimal dengan sentuhan premium.",
            badge: "",
            specs: {
                Material: "Silicone",
                Kompatibilitas: "iPhone 15 Pro",
                MagSafe: "Ya",
                Warna: "Storm Blue",
            },
        },
        {
            id: 6,
            name: "Clear Case iPhone 15",
            category: "casing",
            price: 699000,
            stock: 45,
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MT203?wid=400&hei=400&fmt=png-alpha",
            description:
                "Clear case transparan yang memperlihatkan keindahan warna iPhone kamu. Anti-yellowing.",
            badge: "hot",
            specs: {
                Material: "Polycarbonate + TPU",
                Kompatibilitas: "iPhone 15",
                MagSafe: "Ya",
                Warna: "Clear",
            },
        },
        {
            id: 7,
            name: "20W USB-C Power Adapter",
            category: "charger",
            price: 349000,
            stock: 100,
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MHJA3?wid=400&hei=400&fmt=png-alpha",
            description:
                "Charger 20W original Apple untuk fast charging iPhone. Compact dan travel-friendly.",
            badge: "",
            specs: {
                Output: "20W",
                Port: "USB-C",
                "Fast Charging": "Ya",
                Kompatibilitas: "iPhone 8 ke atas",
            },
        },
        {
            id: 8,
            name: "MagSafe Charger",
            category: "charger",
            price: 599000,
            stock: 60,
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MHXH3?wid=400&hei=400&fmt=png-alpha",
            description:
                "Wireless charger MagSafe untuk charging tanpa kabel. Snap langsung ke iPhone.",
            badge: "new",
            specs: {
                Output: "15W",
                Koneksi: "MagSafe",
                "Panjang Kabel": "1m",
                Kompatibilitas: "iPhone 12 ke atas",
            },
        },
        {
            id: 9,
            name: "AirPods Pro (2nd Gen)",
            category: "aksesoris",
            price: 3999000,
            stock: 35,
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=400&hei=400&fmt=png-alpha",
            description:
                "AirPods Pro generasi kedua dengan Active Noise Cancellation dan Adaptive Audio.",
            badge: "hot",
            specs: {
                ANC: "Ya",
                "Transparency Mode": "Ya",
                Baterai: "6 jam (30 jam dengan case)",
                Koneksi: "Bluetooth 5.3",
            },
        },
        {
            id: 10,
            name: "AirPods (3rd Gen)",
            category: "aksesoris",
            price: 2799000,
            stock: 40,
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MME73?wid=400&hei=400&fmt=png-alpha",
            description:
                "AirPods generasi ketiga dengan Spatial Audio dan desain baru yang lebih nyaman.",
            badge: "",
            specs: {
                "Spatial Audio": "Ya",
                Baterai: "6 jam (30 jam dengan case)",
                "Tahan Air": "IPX4",
                Koneksi: "Bluetooth 5.0",
            },
        },
        {
            id: 11,
            name: "USB-C to Lightning Cable 1m",
            category: "aksesoris",
            price: 299000,
            stock: 150,
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MM0A3?wid=400&hei=400&fmt=png-alpha",
            description:
                "Kabel original Apple USB-C ke Lightning untuk charging dan sync data.",
            badge: "",
            specs: {
                Panjang: "1 meter",
                Input: "USB-C",
                Output: "Lightning",
                "Fast Charging": "Ya",
            },
        },
        {
            id: 12,
            name: "Leather Case iPhone 15 Pro Max",
            category: "casing",
            price: 1999000,
            stock: 20,
            image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MT4U3?wid=400&hei=400&fmt=png-alpha",
            description:
                "FineWoven case premium dengan tekstur leather yang elegan. MagSafe compatible.",
            badge: "new",
            specs: {
                Material: "FineWoven",
                Kompatibilitas: "iPhone 15 Pro Max",
                MagSafe: "Ya",
                Warna: "Mulberry",
            },
        },
    ];

    filteredProducts = [...allProducts];
    renderProducts();
}

// ================================
// RENDER PRODUCTS
// ================================
function renderProducts() {
    const productsToShow = filteredProducts.slice(0, displayedProducts);

    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <h3>Produk tidak ditemukan</h3>
                <p>Coba kata kunci lain atau pilih kategori berbeda</p>
            </div>
        `;
        loadMoreBtn.style.display = "none";
        return;
    }

    productsGrid.innerHTML = productsToShow
        .map((product) => createProductCard(product))
        .join("");

    // Show/hide load more button
    loadMoreBtn.style.display =
        displayedProducts >= filteredProducts.length ? "none" : "inline-flex";

    // Add click events to detail buttons
    document.querySelectorAll(".btn-detail").forEach((btn) => {
        btn.addEventListener("click", () => {
            const productId = parseInt(btn.dataset.id);
            openProductModal(productId);
        });
    });

    // Add click events to quick view buttons
    document
        .querySelectorAll('.action-btn[data-action="view"]')
        .forEach((btn) => {
            btn.addEventListener("click", () => {
                const productId = parseInt(btn.dataset.id);
                openProductModal(productId);
            });
        });
}

function createProductCard(product) {
    const stockStatus = getStockStatus(product.stock);
    const formattedPrice = formatPrice(product.price);
    const badgeClass = product.badge ? `badge-${product.badge}` : "";

    return `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                ${product.badge ? `<span class="product-badge ${badgeClass}">${product.badge}</span>` : ""}
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-actions">
                    <button class="action-btn" data-action="view" data-id="${product.id}" title="Lihat Detail">
                        <i class="fas fa-eye"></i>
                    </button>
                    <a href="${generateWhatsappLink(product)}" target="_blank" class="action-btn" title="Hubungi via WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="price-current">${formattedPrice}</span>
                </div>
                <div class="product-meta">
                    <span class="product-stock">
                        <span class="stock-indicator ${stockStatus.class}"></span>
                        ${stockStatus.text}
                    </span>
                    <button class="btn-detail" data-id="${product.id}">
                        Detail
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ================================
// FILTER PRODUCTS
// ================================
function filterProducts(category) {
    currentFilter = category;
    displayedProducts = 8;

    if (category === "all") {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter((p) => p.category === category);
    }

    renderProducts();
}

// ================================
// SEARCH PRODUCTS
// ================================
function searchProducts(query) {
    const searchTerm = query.toLowerCase().trim();

    if (searchTerm === "") {
        filterProducts(currentFilter);
        return;
    }

    filteredProducts = allProducts.filter((product) => {
        const matchName = product.name.toLowerCase().includes(searchTerm);
        const matchCategory = product.category
            .toLowerCase()
            .includes(searchTerm);
        const matchDescription = product.description
            .toLowerCase()
            .includes(searchTerm);

        return matchName || matchCategory || matchDescription;
    });

    if (currentFilter !== "all") {
        filteredProducts = filteredProducts.filter(
            (p) => p.category === currentFilter,
        );
    }

    displayedProducts = 8;
    renderProducts();
}

// ================================
// MODAL
// ================================
function openProductModal(productId) {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    // Populate modal content
    document.getElementById("modalImage").src = product.image;
    document.getElementById("modalImage").alt = product.name;
    document.getElementById("modalBadge").textContent = product.badge || "";
    document.getElementById("modalBadge").style.display = product.badge
        ? "block"
        : "none";
    document.getElementById("modalCategory").textContent = product.category;
    document.getElementById("modalTitle").textContent = product.name;
    document.getElementById("modalDescription").textContent =
        product.description;
    document.getElementById("modalPrice").textContent = formatPrice(
        product.price,
    );

    const stockStatus = getStockStatus(product.stock);
    document.getElementById("modalStock").innerHTML = `
        <span class="stock-indicator ${stockStatus.class}"></span>
        ${stockStatus.text}
    `;

    // Populate specs
    const specsContainer = document.getElementById("modalSpecs");
    if (product.specs) {
        specsContainer.innerHTML = `
            <h4>Spesifikasi</h4>
            ${Object.entries(product.specs)
                .map(
                    ([key, value]) => `
                <div class="spec-item">
                    <span>${key}</span>
                    <span>${value}</span>
                </div>
            `,
                )
                .join("")}
        `;
    } else {
        specsContainer.innerHTML = "";
    }

    // Set WhatsApp link
    document.getElementById("modalWhatsapp").href =
        generateWhatsappLink(product);

    // Share button
    document.getElementById("modalShare").onclick = () => shareProduct(product);

    // Show modal
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeProductModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
}

// ================================
// HELPERS
// ================================
function formatPrice(price) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

function getStockStatus(stock) {
    if (stock === 0) {
        return { text: "Habis", class: "stock-empty" };
    } else if (stock <= 5) {
        return { text: `Sisa ${stock}`, class: "stock-low" };
    } else {
        return { text: "Tersedia", class: "stock-available" };
    }
}

function generateWhatsappLink(product) {
    const message = `Halo, saya tertarik dengan produk:\n\n*${product.name}*\nHarga: ${formatPrice(product.price)}\n\nApakah masih tersedia?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function shareProduct(product) {
    if (navigator.share) {
        navigator.share({
            title: product.name,
            text: `Lihat ${product.name} di iStore - ${formatPrice(product.price)}`,
            url: window.location.href,
        });
    } else {
        // Fallback: copy to clipboard
        const text = `${product.name} - ${formatPrice(product.price)} | iStore`;
        navigator.clipboard.writeText(text);
        alert("Link produk berhasil disalin!");
    }
}

function showLoading() {
    productsGrid.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Memuat produk...</p>
        </div>
    `;
}

// ================================
// EVENT LISTENERS
// ================================
function initEventListeners() {
    // Filter buttons
    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            filterProducts(btn.dataset.filter);
        });
    });

    // Load more
    loadMoreBtn.addEventListener("click", () => {
        displayedProducts += 8;
        renderProducts();
    });

    // Search
    searchToggle.addEventListener("click", () => {
        searchBar.classList.toggle("active");
        if (searchBar.classList.contains("active")) {
            searchInput.focus();
        }
    });

    searchBtn.addEventListener("click", () => {
        searchProducts(searchInput.value);
    });

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchProducts(searchInput.value);
        }
    });

    // Debounced search
    let searchTimeout;
    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchProducts(searchInput.value);
        }, 300);
    });

    // Mobile menu
    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        menuToggle.innerHTML = navMenu.classList.contains("active")
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    });

    // Close mobile menu on link click
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });

    // Modal close
    modalClose.addEventListener("click", closeProductModal);
    document
        .querySelector(".modal-overlay")
        .addEventListener("click", closeProductModal);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            closeProductModal();
        }
    });

    // Back to top
    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ================================
// SCROLL EFFECTS
// ================================
function initScrollEffects() {
    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;

        // Navbar shadow
        if (scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

        // Back to top visibility
        if (scrollY > 500) {
            backToTop.classList.add("visible");
        } else {
            backToTop.classList.remove("visible");
        }

        // Active nav link based on scroll position
        updateActiveNavLink();
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll("section[id]");
    const scrollY = window.scrollY + 100;

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            document.querySelectorAll(".nav-link").forEach((link) => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${sectionId}`) {
                    link.classList.add("active");
                }
            });
        }
    });
}

// ================================
// CATEGORY CARDS CLICK
// ================================
function initCategoryCards() {
    document.querySelectorAll(".category-card").forEach((card) => {
        card.addEventListener("click", () => {
            const category = card.dataset.category;

            // Update filter buttons
            filterBtns.forEach((btn) => {
                btn.classList.remove("active");
                if (btn.dataset.filter === category) {
                    btn.classList.add("active");
                }
            });

            // Filter products
            filterProducts(category);

            // Scroll to products section
            document
                .getElementById("products")
                .scrollIntoView({ behavior: "smooth" });
        });
    });
}

// ================================
// CSS for No Products (add to styles.css)
// ================================
/*
.no-products {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 20px;
    color: var(--text-secondary);
}

.no-products i {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.3;
}

.no-products h3 {
    font-size: 20px;
    margin-bottom: 8px;
    color: var(--text-primary);
}
*/
