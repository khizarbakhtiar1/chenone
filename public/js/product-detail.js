/**
 * Product Detail Page JavaScript
 * Handles dynamic product loading from API and cart functionality
 */

// Current product data
let currentProduct = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    const productId = getProductIdFromURL();
    if (productId) {
        loadProductDetails(productId);
    } else {
        showError('Product ID not found in URL');
    }
    
    updateCartCount();
    setupEventListeners();
});

/**
 * Get product ID from URL parameters
 * @returns {string|null} - Product ID or null if not found
 */
function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Load product details from API
 * @param {string} productId - Product ID
 */
async function loadProductDetails(productId) {
    try {
        showLoadingState();
        
        const response = await fetch(`/api/product?id=${productId}`);
        const result = await response.json();
        
        if (result.success) {
            currentProduct = result.data;
            renderProductDetails(currentProduct);
            loadRelatedProducts(currentProduct.category, currentProduct.id);
            console.log('Loaded product details:', currentProduct.name);
        } else {
            throw new Error(result.error || 'Product not found');
        }
    } catch (error) {
        console.error('Error loading product details:', error);
        showError(error.message);
    }
}

/**
 * Render product details on the page
 * @param {Object} product - Product data
 */
function renderProductDetails(product) {
    // Update page title
    document.title = `${product.name} - ChenOne`;
    
    // Update breadcrumb
    updateBreadcrumb(product);
    
    // Update product badge
    const badge = document.querySelector('.product-badge');
    if (badge) {
        badge.textContent = product.featured ? 'Featured' : formatCategory(product.category);
    }
    
    // Update product image with beautiful placeholder
    const productImage = document.querySelector('.product-image');
    if (productImage) {
        productImage.innerHTML = `
            <div class="product-badge">${product.featured ? 'Featured' : formatCategory(product.category)}</div>
            <div class="product-placeholder" style="background: ${getProductColor(product.category)}">
                <div class="product-icon">${getProductIcon(product.category)}</div>
                <div class="product-placeholder-text">${product.name}</div>
            </div>
        `;
    }
    
    // Update product info
    updateElement('.product-category', formatCategory(product.category));
    updateElement('.product-title', product.name);
    updateElement('.product-brand', `by ${formatBrand(product.brand)}`);
    updateElement('.product-price', `$${product.price.toFixed(2)}`);
    updateElement('.product-description p', product.description);
    
    // Update product options
    updateProductOptions(product);
    
    // Update product meta
    updateProductMeta(product);
    
    // Update stock status
    updateStockStatus(product);
    
    hideLoadingState();
}

/**
 * Update breadcrumb navigation
 * @param {Object} product - Product data
 */
function updateBreadcrumb(product) {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <a href="/">Home</a> > 
            <a href="/products">Products</a> > 
            <a href="/products">${formatCategory(product.category)}</a> > 
            ${product.name}
        `;
    }
}

/**
 * Update product options (colors, sizes, nib sizes)
 * @param {Object} product - Product data
 */
function updateProductOptions(product) {
    // Update color options
    const colorSelect = document.getElementById('colorSelect');
    if (colorSelect && product.colors) {
        colorSelect.innerHTML = product.colors.map(color => 
            `<option value="${color}">${formatOption(color)}</option>`
        ).join('');
    }
    
    // Update size options (for notebooks, art supplies)
    const sizeSelect = document.getElementById('sizeSelect');
    if (sizeSelect && product.sizes) {
        sizeSelect.innerHTML = product.sizes.map(size => 
            `<option value="${size}">${formatOption(size)}</option>`
        ).join('');
    }
    
    // Update nib size options (for pens)
    const nibSelect = document.getElementById('nibSelect');
    if (nibSelect && product.nibSizes) {
        nibSelect.innerHTML = product.nibSizes.map(nib => 
            `<option value="${nib}">${formatOption(nib)}</option>`
        ).join('');
    }
    
    // Hide option groups that don't apply to this product
    if (!product.colors) {
        const colorGroup = document.querySelector('#colorSelect')?.closest('.option-group');
        if (colorGroup) colorGroup.style.display = 'none';
    }
    
    if (!product.sizes) {
        const sizeGroup = document.querySelector('#sizeSelect')?.closest('.option-group');
        if (sizeGroup) sizeGroup.style.display = 'none';
    }
    
    if (!product.nibSizes) {
        const nibGroup = document.querySelector('#nibSelect')?.closest('.option-group');
        if (nibGroup) nibGroup.style.display = 'none';
    }
}

/**
 * Update product metadata
 * @param {Object} product - Product data
 */
function updateProductMeta(product) {
    const metaItems = document.querySelectorAll('.meta-item');
    if (metaItems.length >= 3) {
        metaItems[0].innerHTML = `<strong>SKU:</strong> ${product.category.toUpperCase()}-${product.brand.toUpperCase()}-${product.id.padStart(3, '0')}`;
        metaItems[1].innerHTML = `<strong>Category:</strong> ${formatCategory(product.category)}`;
        metaItems[2].innerHTML = `<strong>Brand:</strong> ${formatBrand(product.brand)}`;
    }
}

/**
 * Update stock status
 * @param {Object} product - Product data
 */
function updateStockStatus(product) {
    const stockStatus = document.querySelector('.stock-status');
    if (stockStatus && product.stock !== undefined) {
        if (product.stock > 0) {
            stockStatus.innerHTML = `✓ In Stock (${product.stock} available)`;
            stockStatus.style.color = '#27ae60';
        } else {
            stockStatus.innerHTML = '✗ Out of Stock';
            stockStatus.style.color = '#e74c3c';
            
            // Disable add to cart button
            const addToCartBtn = document.querySelector('.add-to-cart');
            if (addToCartBtn) {
                addToCartBtn.disabled = true;
                addToCartBtn.textContent = 'Out of Stock';
            }
        }
    }
}

/**
 * Load related products
 * @param {string} category - Product category
 * @param {string} excludeId - Product ID to exclude
 */
async function loadRelatedProducts(category, excludeId) {
    try {
        const response = await fetch(`/api/products?category=${category}`);
        const result = await response.json();
        
        if (result.success) {
            // Filter out current product and limit to 3
            const relatedProducts = result.data
                .filter(product => product.id !== excludeId)
                .slice(0, 3);
            
            renderRelatedProducts(relatedProducts);
        }
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

/**
 * Render related products
 * @param {Array} products - Related products
 */
function renderRelatedProducts(products) {
    const relatedGrid = document.querySelector('.related-grid');
    if (!relatedGrid) return;
    
    relatedGrid.innerHTML = products.map(product => `
        <article class="related-card">
            <div class="related-image">
                <div class="product-placeholder" style="background: ${getProductColor(product.category)}">
                    <div class="product-icon">${getProductIcon(product.category)}</div>
                </div>
            </div>
            <h3 class="related-name">${product.name}</h3>
            <p class="related-price">$${product.price.toFixed(2)}</p>
            <button class="related-btn" onclick="viewProduct('${product.id}')">View Details</button>
        </article>
    `).join('');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Quantity controls
    const increaseBtn = document.querySelector('.quantity-btn[onclick="increaseQuantity()"]');
    const decreaseBtn = document.querySelector('.quantity-btn[onclick="decreaseQuantity()"]');
    
    if (increaseBtn) increaseBtn.addEventListener('click', increaseQuantity);
    if (decreaseBtn) decreaseBtn.addEventListener('click', decreaseQuantity);
    
    // Add to cart button
    const addToCartBtn = document.querySelector('.add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
    
    // Thumbnail clicks
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

/**
 * Increase quantity
 */
function increaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (input) {
        const currentValue = parseInt(input.value);
        const maxValue = parseInt(input.getAttribute('max')) || 10;
        
        if (currentValue < maxValue) {
            input.value = currentValue + 1;
        }
    }
}

/**
 * Decrease quantity
 */
function decreaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (input) {
        const currentValue = parseInt(input.value);
        const minValue = parseInt(input.getAttribute('min')) || 1;
        
        if (currentValue > minValue) {
            input.value = currentValue - 1;
        }
    }
}

/**
 * Add product to cart
 */
function addToCart() {
    if (!currentProduct) {
        console.error('No product data available');
        return;
    }
    
    const quantity = parseInt(document.getElementById('quantityInput')?.value || 1);
    const color = document.getElementById('colorSelect')?.value;
    const size = document.getElementById('sizeSelect')?.value;
    const nibSize = document.getElementById('nibSelect')?.value;
    
    const cartItem = {
        id: currentProduct.id,
        name: currentProduct.name,
        brand: currentProduct.brand,
        price: currentProduct.price,
        quantity: quantity,
        color: color,
        size: size,
        nibSize: nibSize,
        image: currentProduct.image,
        addedAt: new Date().toISOString()
    };
    
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item already exists in cart with same options
    const existingItemIndex = cart.findIndex(item => 
        item.id === cartItem.id && 
        item.color === cartItem.color && 
        item.size === cartItem.size &&
        item.nibSize === cartItem.nibSize
    );
    
    if (existingItemIndex !== -1) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.push(cartItem);
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showSuccessMessage();
}

/**
 * Update cart count in navigation
 */
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

/**
 * Show success message
 */
function showSuccessMessage() {
    const message = document.getElementById('successMessage');
    if (message) {
        message.classList.add('show');
        
        setTimeout(() => {
            message.classList.remove('show');
        }, 3000);
    }
}

/**
 * Navigate to product page
 * @param {string} productId - Product ID
 */
function viewProduct(productId) {
    window.location.href = `/product?id=${productId}`;
}

/**
 * Show loading state
 */
function showLoadingState() {
    const productDetail = document.querySelector('.product-detail');
    if (productDetail) {
        productDetail.style.opacity = '0.5';
        productDetail.style.pointerEvents = 'none';
    }
    
    // Add loading spinner to main image
    const productImage = document.querySelector('.product-image');
    if (productImage) {
        productImage.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                <div style="font-size: 2rem;">⏳</div>
            </div>
        `;
    }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const productDetail = document.querySelector('.product-detail');
    if (productDetail) {
        productDetail.style.opacity = '1';
        productDetail.style.pointerEvents = 'auto';
    }
}

/**
 * Show error state
 * @param {string} message - Error message
 */
function showError(message) {
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                <div style="font-size: 4rem; color: #e74c3c; margin-bottom: 1rem;">❌</div>
                <h2 style="color: #2c3e50; margin-bottom: 1rem;">Product Not Found</h2>
                <p style="color: #7f8c8d; margin-bottom: 2rem;">${message}</p>
                <a href="/products" style="background: #3498db; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: 600;">Browse Products</a>
            </div>
        `;
    }
}

/**
 * Update element text content
 * @param {string} selector - CSS selector
 * @param {string} content - Content to set
 */
function updateElement(selector, content) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = content;
    }
}

/**
 * Format category name
 * @param {string} category - Category slug
 * @returns {string} - Formatted category name
 */
function formatCategory(category) {
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Format brand name
 * @param {string} brand - Brand name
 * @returns {string} - Formatted brand name
 */
function formatBrand(brand) {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
}

/**
 * Format option name
 * @param {string} option - Option value
 * @returns {string} - Formatted option name
 */
function formatOption(option) {
    if (!option) return '';
    return option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Get product color based on category
 * @param {string} category - Product category
 * @returns {string} - Color gradient
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

/**
 * Get product icon based on category
 * @param {string} category - Product category
 * @returns {string} - Icon emoji
 */
function getProductIcon(category) {
    const icons = {
        'pens': '✒️',
        'notebooks': '📓',
        'art-supplies': '🎨',
        'desk-accessories': '🗂️'
    };
    return icons[category] || '📝';
}

// Export functions for global access
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCart = addToCart;
window.viewProduct = viewProduct; 