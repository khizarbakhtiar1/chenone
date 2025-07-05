/**
 * Products Page JavaScript
 * Handles product loading, filtering, sorting, pagination, and modern UI interactions
 */

// Global state
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let productsPerPage = 12;
let currentView = 'grid';
let currentSort = 'default';
let activeFilters = {
    search: '',
    categories: [],
    priceRanges: [],
    brands: []
};

// DOM elements
let productsGrid = null;
let productsCount = null;
let sortSelect = null;
let noResults = null;

// Initialize products page
document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
});

/**
 * Initialize the products page
 */
function initializeProductsPage() {
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }

    // Load products
    loadProducts();
    
    // Initialize UI components
    initializeFilters();
    initializeSearch();
    initializeSorting();
    initializeViewToggle();
    initializePagination();
    initializeMobileFilters();
    
    // Update cart count
    updateCartCount();
    
    // Handle URL parameters
    handleURLParameters();
}

/**
 * Load products from API
 */
async function loadProducts() {
    try {
        showLoadingState();
        
        const response = await fetch('/api/products');
        const result = await response.json();
        
        if (result.success) {
            allProducts = result.data;
            filteredProducts = [...allProducts];
            
            // Initialize brand filter options
            initializeBrandFilters();
            
            // Update filter counts
            updateFilterCounts();
            
            // Apply any URL filters
            applyURLFilters();
            
            // Render products
            renderProducts();
            
            console.log(`✓ Loaded ${allProducts.length} products`);
        } else {
            showErrorState('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showErrorState('Error loading products. Please try again.');
    }
}

/**
 * Initialize filter functionality
 */
function initializeFilters() {
    // Filter toggle buttons
    const filterToggles = document.querySelectorAll('.filter-toggle');
    filterToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
    
    // Category filters
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', handleCategoryFilter);
    });
    
    // Price filters
    const priceFilters = document.querySelectorAll('.price-filter');
    priceFilters.forEach(filter => {
        filter.addEventListener('change', handlePriceFilter);
    });
    
    // Brand filters
    const brandFilters = document.querySelectorAll('.brand-filter');
    brandFilters.forEach(filter => {
        filter.addEventListener('change', handleBrandFilter);
    });
    
    // Clear filters button
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
}

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                activeFilters.search = e.target.value.toLowerCase().trim();
                applyFilters();
            }, 300); // Debounce search
        });
    }
}

/**
 * Initialize sorting functionality
 */
function initializeSorting() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function(e) {
            currentSort = e.target.value;
            sortProducts();
            renderProducts();
        });
    }
}

/**
 * Initialize view toggle functionality
 */
function initializeViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            viewBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update view
            currentView = this.dataset.view;
            const productsGrid = document.getElementById('productsGrid');
            
            if (currentView === 'list') {
                productsGrid.classList.add('list-view');
            } else {
                productsGrid.classList.remove('list-view');
            }
            
            // Re-render products to apply new view
            renderProducts();
        });
    });
}

/**
 * Initialize pagination
 */
function initializePagination() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
                scrollToTop();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts();
                scrollToTop();
            }
        });
    }
}

/**
 * Initialize mobile filters
 */
function initializeMobileFilters() {
    const filtersToggle = document.getElementById('filtersToggle');
    const filtersClose = document.getElementById('filtersClose');
    const filtersSidebar = document.getElementById('filtersSidebar');
    
    if (filtersToggle && filtersSidebar) {
        filtersToggle.addEventListener('click', () => {
            filtersSidebar.classList.add('show');
            showFiltersOverlay();
        });
    }
    
    if (filtersClose && filtersSidebar) {
        filtersClose.addEventListener('click', () => {
            filtersSidebar.classList.remove('show');
            hideFiltersOverlay();
        });
    }
    
    // Close filters when clicking overlay
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('filters-overlay')) {
            filtersSidebar.classList.remove('show');
            hideFiltersOverlay();
        }
    });
}

/**
 * Show filters overlay for mobile
 */
function showFiltersOverlay() {
    let overlay = document.querySelector('.filters-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'filters-overlay';
        document.body.appendChild(overlay);
    }
    overlay.classList.add('show');
}

/**
 * Hide filters overlay
 */
function hideFiltersOverlay() {
    const overlay = document.querySelector('.filters-overlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

/**
 * Initialize brand filters dynamically
 */
function initializeBrandFilters() {
    const brands = [...new Set(allProducts.map(product => product.brand))].sort();
    const brandFiltersContainer = document.getElementById('brandFilters');
    
    if (brandFiltersContainer) {
        brandFiltersContainer.innerHTML = brands.map(brand => `
            <label class="filter-option">
                <input type="checkbox" value="${brand.toLowerCase()}" class="brand-filter">
                <span class="checkmark"></span>
                <span class="option-text">${brand}</span>
                <span class="option-count">(0)</span>
            </label>
        `).join('');
        
        // Add event listeners to new brand filters
        const brandFilters = brandFiltersContainer.querySelectorAll('.brand-filter');
        brandFilters.forEach(filter => {
            filter.addEventListener('change', handleBrandFilter);
        });
    }
}

/**
 * Handle category filter changes
 */
function handleCategoryFilter(e) {
    const category = e.target.value;
    
    if (e.target.checked) {
        if (!activeFilters.categories.includes(category)) {
            activeFilters.categories.push(category);
        }
    } else {
        activeFilters.categories = activeFilters.categories.filter(c => c !== category);
    }
    
    applyFilters();
}

/**
 * Handle price filter changes
 */
function handlePriceFilter(e) {
    const priceRange = e.target.value;
    
    if (e.target.checked) {
        if (!activeFilters.priceRanges.includes(priceRange)) {
            activeFilters.priceRanges.push(priceRange);
        }
    } else {
        activeFilters.priceRanges = activeFilters.priceRanges.filter(p => p !== priceRange);
    }
    
    applyFilters();
}

/**
 * Handle brand filter changes
 */
function handleBrandFilter(e) {
    const brand = e.target.value;
    
    if (e.target.checked) {
        if (!activeFilters.brands.includes(brand)) {
            activeFilters.brands.push(brand);
        }
    } else {
        activeFilters.brands = activeFilters.brands.filter(b => b !== brand);
    }
    
    applyFilters();
}

/**
 * Apply all active filters
 */
function applyFilters() {
    filteredProducts = allProducts.filter(product => {
        // Search filter
        if (activeFilters.search) {
            const searchTerms = activeFilters.search.split(' ');
            const productText = `${product.name} ${product.brand} ${product.category} ${product.description}`.toLowerCase();
            const matchesSearch = searchTerms.every(term => productText.includes(term));
            if (!matchesSearch) return false;
        }
        
        // Category filter
        if (activeFilters.categories.length > 0) {
            if (!activeFilters.categories.includes(product.category)) return false;
        }
        
        // Price filter
        if (activeFilters.priceRanges.length > 0) {
            const matchesPrice = activeFilters.priceRanges.some(range => {
                const [min, max] = range.split('-').map(Number);
                return product.price >= min && product.price <= max;
            });
            if (!matchesPrice) return false;
        }
        
        // Brand filter
        if (activeFilters.brands.length > 0) {
            if (!activeFilters.brands.includes(product.brand.toLowerCase())) return false;
        }
        
        return true;
    });
    
    // Reset to first page
    currentPage = 1;
    
    // Sort products
    sortProducts();
    
    // Update UI
    updateFilterCounts();
    updateActiveFiltersDisplay();
    renderProducts();
}

/**
 * Sort products based on current sort option
 */
function sortProducts() {
    switch (currentSort) {
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'featured':
            filteredProducts.sort((a, b) => (b.featured || false) - (a.featured || false));
            break;
        case 'newest':
            // Assuming products have an id that reflects creation order
            filteredProducts.sort((a, b) => parseInt(b.id) - parseInt(a.id));
            break;
        default:
            // Default order (as received from API)
            break;
    }
}

/**
 * Update filter counts
 */
function updateFilterCounts() {
    // Update category counts
    const categoryOptions = document.querySelectorAll('#categoryFilters .option-count');
    categoryOptions.forEach((option, index) => {
        const category = option.parentElement.querySelector('input').value;
        const count = allProducts.filter(p => p.category === category).length;
        option.textContent = `(${count})`;
    });
    
    // Update price range counts
    const priceOptions = document.querySelectorAll('#priceFilters .option-count');
    priceOptions.forEach((option, index) => {
        const range = option.parentElement.querySelector('input').value;
        const [min, max] = range.split('-').map(Number);
        const count = allProducts.filter(p => p.price >= min && p.price <= max).length;
        option.textContent = `(${count})`;
    });
    
    // Update brand counts
    const brandOptions = document.querySelectorAll('#brandFilters .option-count');
    brandOptions.forEach((option, index) => {
        const brand = option.parentElement.querySelector('input').value;
        const count = allProducts.filter(p => p.brand.toLowerCase() === brand).length;
        option.textContent = `(${count})`;
    });
}

/**
 * Update active filters display
 */
function updateActiveFiltersDisplay() {
    const activeFiltersContainer = document.getElementById('activeFilters');
    if (!activeFiltersContainer) return;
    
    const tags = [];
    
    // Search tag
    if (activeFilters.search) {
        tags.push(`Search: "${activeFilters.search}"`);
    }
    
    // Category tags
    activeFilters.categories.forEach(category => {
        tags.push(formatCategory(category));
    });
    
    // Price range tags
    activeFilters.priceRanges.forEach(range => {
        const [min, max] = range.split('-');
        if (max === '999') {
            tags.push(`$${min}+`);
        } else {
            tags.push(`$${min} - $${max}`);
        }
    });
    
    // Brand tags
    activeFilters.brands.forEach(brand => {
        tags.push(formatBrand(brand));
    });
    
    if (tags.length > 0) {
        activeFiltersContainer.innerHTML = tags.map(tag => `
            <span class="filter-tag">
                ${tag}
                <button class="filter-tag-remove" onclick="removeFilterTag('${tag}')">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `).join('');
        activeFiltersContainer.classList.add('show');
    } else {
        activeFiltersContainer.classList.remove('show');
    }
}

/**
 * Render products in the grid
 */
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const productsCount = document.getElementById('productsCount');
    const noResults = document.getElementById('noResults');
    const pagination = document.getElementById('pagination');
    
    if (!productsGrid) return;
    
    // Calculate pagination
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, totalProducts);
    const currentProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Update products count
    if (productsCount) {
        if (totalProducts === 0) {
            productsCount.textContent = 'No products found';
        } else if (totalProducts === allProducts.length) {
            productsCount.textContent = `Showing all ${totalProducts} products`;
        } else {
            productsCount.textContent = `Showing ${startIndex + 1}-${endIndex} of ${totalProducts} products`;
        }
    }
    
    // Show/hide no results
    if (totalProducts === 0) {
        productsGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        if (pagination) pagination.style.display = 'none';
        return;
    } else {
        productsGrid.style.display = 'grid';
        if (noResults) noResults.style.display = 'none';
    }
    
    // Render products
    productsGrid.innerHTML = currentProducts.map(product => `
        <article class="product-card" onclick="viewProduct('${product.id}')" data-aos="fade-up">
            <div class="product-image">
                <div class="product-category">${formatCategory(product.category)}</div>
                <div class="product-placeholder" style="background: ${getProductColor(product.category)}">
                    <div class="product-icon">
                        <i class="${getProductIcon(product.category)}"></i>
                    </div>
                    <div class="product-placeholder-text">${product.name}</div>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${formatBrand(product.brand)}</p>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="add-to-cart" onclick="event.stopPropagation(); addToCart('${product.id}')">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                    <button class="product-quick-view" onclick="event.stopPropagation(); quickViewProduct('${product.id}')" title="Quick View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </article>
    `).join('');
    
    // Update pagination
    renderPagination(totalPages);
    
    // Refresh AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

/**
 * Render pagination controls
 */
function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');
    
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    // Update prev/next buttons
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
    }
    
    // Generate page numbers
    if (pageNumbers) {
        const pages = [];
        const showPages = 5; // Show 5 page numbers at most
        
        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
        let endPage = Math.min(totalPages, startPage + showPages - 1);
        
        // Adjust start page if we're near the end
        if (endPage - startPage < showPages - 1) {
            startPage = Math.max(1, endPage - showPages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(`
                <button class="page-number ${i === currentPage ? 'active' : ''}" 
                        onclick="goToPage(${i})">
                    ${i}
                </button>
            `);
        }
        
        pageNumbers.innerHTML = pages.join('');
    }
}

/**
 * Go to specific page
 */
function goToPage(page) {
    currentPage = page;
    renderProducts();
    scrollToTop();
}

/**
 * Clear all filters
 */
function clearAllFilters() {
    // Reset active filters
    activeFilters = {
        search: '',
        categories: [],
        priceRanges: [],
        brands: []
    };
    
    // Clear UI
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    const checkboxes = document.querySelectorAll('.category-filter, .price-filter, .brand-filter');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.value = 'default';
        currentSort = 'default';
    }
    
    // Apply filters (which will show all products)
    applyFilters();
}

/**
 * Handle URL parameters for deep linking
 */
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Category filter from URL
    const category = urlParams.get('category');
    if (category) {
        activeFilters.categories = [category];
        const categoryCheckbox = document.querySelector(`input[value="${category}"].category-filter`);
        if (categoryCheckbox) {
            categoryCheckbox.checked = true;
        }
    }
    
    // Search from URL
    const search = urlParams.get('search');
    if (search) {
        activeFilters.search = search.toLowerCase();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = search;
        }
    }
}

/**
 * Apply URL filters after products are loaded
 */
function applyURLFilters() {
    if (activeFilters.categories.length > 0 || activeFilters.search) {
        applyFilters();
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p>Loading products...</p>
            </div>
        `;
    }
}

/**
 * Show error state
 */
function showErrorState(message) {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="no-results">
                <div class="no-results-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Products</h3>
                <p>${message}</p>
                    <button class="btn btn-primary" onclick="loadProducts()">
                        <i class="fas fa-redo"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * Scroll to top of products section
 */
function scrollToTop() {
    const productsSection = document.querySelector('.products-section');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Add product to cart
 */
async function addToCart(productId) {
    try {
        const response = await fetch(`/api/product?id=${productId}`);
        const result = await response.json();
        
        if (!result.success) {
            showMessage('Product not found', 'error');
            return;
        }
        
        const product = result.data;
        
        // Get existing cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            const cartItem = {
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                quantity: 1,
                image: product.image,
                category: product.category,
                addedAt: new Date().toISOString()
            };
            cart.push(cartItem);
        }
        
        // Save updated cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Show success message
        showMessage(`${product.name} added to cart!`, 'success');
        
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'add_to_cart', {
                'event_category': 'ecommerce',
                'event_label': product.name,
                'value': product.price
            });
        }
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showMessage('Error adding to cart', 'error');
    }
}

/**
 * View product details
 */
function viewProduct(productId) {
    window.location.href = `/product?id=${productId}`;
}

/**
 * Quick view product (modal or overlay)
 */
function quickViewProduct(productId) {
    // In a real implementation, this would open a modal with product details
    showMessage('Quick view feature coming soon!', 'info');
    
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'quick_view', {
            'event_category': 'engagement',
            'event_label': productId
        });
    }
}

/**
 * Update cart count in navigation
 */
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.querySelector('.cart-count');
    
    if (cartCount) {
        cartCount.textContent = totalItems;
        
        // Add animation
        cartCount.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartCount.style.transform = 'scale(1)';
        }, 200);
    }
}

/**
 * Utility functions from index.js
 */
function getProductColor(category) {
    const colors = {
        'pens': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'notebooks': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'art-supplies': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'desk-accessories': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    };
    return colors[category] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

function getProductIcon(category) {
    const icons = {
        'pens': 'fas fa-pen-fancy',
        'notebooks': 'fas fa-book',
        'art-supplies': 'fas fa-palette',
        'desk-accessories': 'fas fa-desktop'
    };
    return icons[category] || 'fas fa-box';
}

function formatCategory(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatBrand(brand) {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
}

function showMessage(message, type) {
    // Reuse the showMessage function from index.js
    if (window.showMessage) {
        window.showMessage(message, type);
    } else {
        // Fallback simple alert
        alert(message);
    }
} 