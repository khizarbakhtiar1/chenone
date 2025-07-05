/**
 * ChenOne Cart Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    initializeCart();
    
    // Add event listeners
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    const updateCartBtn = document.getElementById('updateCartBtn');
    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', updateCart);
    }
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
        console.log('Checkout button event listener added');
    }
    
    // Initialize mobile menu
    initializeMobileMenu();
});

/**
 * Initialize mobile menu functionality
 */
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = this.querySelector('i');
            
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = ''; // Re-enable scrolling
            }
        });
        
        // Close mobile menu when clicking on links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = ''; // Re-enable scrolling
            });
        });
    }
}

/**
 * Initialize cart functionality
 */
function initializeCart() {
    // Get cart from localStorage
    const cart = getCart();
    
    // Update cart display
    updateCartDisplay(cart);
    
    // Update cart count
    updateCartCount(cart);
    
    // Update cart summary
    updateSummary(cart);
    
    // Update progress bar
    updateProgressBar(cart);
}

/**
 * Get cart from localStorage
 */
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

/**
 * Save cart to localStorage
 */
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Update cart display
 */
function updateCartDisplay(cart) {
    const cartContent = document.getElementById('cartContent');
    const emptyCart = document.getElementById('emptyCart');
    const cartItems = document.getElementById('cartItems');
    
    if (!cart || cart.length === 0) {
        // Show empty cart message
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
        return;
    }
    
    // Show cart content
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartContent) cartContent.style.display = 'grid';
    
    // Clear cart items
    if (cartItems) {
        cartItems.innerHTML = '';
        
        // Add each item to the cart
        cart.forEach((item, index) => {
            const cartItemElement = createCartItemElement(item, index);
            cartItems.appendChild(cartItemElement);
        });
    }
}

/**
 * Create cart item element
 */
function createCartItemElement(item, index) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    
    const categoryLabel = formatCategory(item.category);
    const categoryColor = getCategoryColor(item.category);
    
    cartItem.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.image || `images/products/${item.category}/${item.id}.jpg`}" 
                 alt="${item.name}" 
                 onerror="this.onerror=null; this.src='images/placeholder.jpg';">
        </div>
        <div class="cart-item-details">
            <h3 class="cart-item-name">${item.name}</h3>
            <span class="cart-item-category" style="background-color: ${categoryColor}20; color: ${categoryColor};">${categoryLabel}</span>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateQuantityInput(${index}, this.value)">
                <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
        </div>
        <div class="cart-item-total">
            <div class="cart-item-subtotal">$${(item.price * item.quantity).toFixed(2)}</div>
            <button class="remove-btn" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
    `;
    
    return cartItem;
}

/**
 * Format category name
 */
function formatCategory(category) {
    if (!category) return 'Unknown';
    
    // Replace hyphens with spaces and capitalize each word
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Get category color
 */
function getCategoryColor(category) {
    const colors = {
        'pens': '#3a5a40',
        'notebooks': '#588157',
        'art-supplies': '#a3b18a',
        'desk-accessories': '#344e41'
    };
    
    return colors[category] || '#3a5a40';
}

/**
 * Update quantity
 */
function updateQuantity(index, change) {
    const cart = getCart();
    
    if (cart[index]) {
        cart[index].quantity = Math.max(1, cart[index].quantity + change);
        
        // Save updated cart
        saveCart(cart);
        
        // Update display
        updateCartDisplay(cart);
        updateCartCount(cart);
        updateSummary(cart);
        updateProgressBar(cart);
    }
}

/**
 * Update quantity from input
 */
function updateQuantityInput(index, value) {
    const cart = getCart();
    
    if (cart[index]) {
        cart[index].quantity = Math.max(1, parseInt(value) || 1);
        
        // Save updated cart
        saveCart(cart);
        
        // Update display
        updateCartDisplay(cart);
        updateCartCount(cart);
        updateSummary(cart);
        updateProgressBar(cart);
    }
}

/**
 * Remove item from cart
 */
function removeFromCart(index) {
    const cart = getCart();
    
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        
        // Save updated cart
        saveCart(cart);
        
        // Update display
        updateCartDisplay(cart);
        updateCartCount(cart);
        updateSummary(cart);
        updateProgressBar(cart);
        
        // Show notification
        showNotification('Item removed from cart', 'success');
    }
}

/**
 * Clear cart
 */
function clearCart() {
    // Confirm before clearing
    if (confirm('Are you sure you want to clear your cart?')) {
        // Clear cart in localStorage
        saveCart([]);
        
        // Update display
        updateCartDisplay([]);
        updateCartCount([]);
        updateSummary([]);
        updateProgressBar([]);
        
        // Show notification
        showNotification('Cart cleared', 'info');
    }
}

/**
 * Update cart
 */
function updateCart() {
    const cart = getCart();
    
    // Update display
    updateCartDisplay(cart);
    updateCartCount(cart);
    updateSummary(cart);
    updateProgressBar(cart);
    
    // Show notification
    showNotification('Cart updated', 'success');
}

/**
 * Update cart count
 */
function updateCartCount(cart) {
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    let totalItems = 0;
    cart.forEach(item => {
        totalItems += item.quantity;
    });
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

/**
 * Update summary
 */
function updateSummary(cart) {
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate shipping (free over $50)
    const shipping = subtotal >= 50 ? 0 : 5.99;
    
    // Calculate tax (7.5%)
    const tax = subtotal * 0.075;
    
    // Calculate total
    const total = subtotal + shipping + tax;
    
    // Update elements
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

/**
 * Update progress bar
 */
function updateProgressBar(cart) {
    const progressFill = document.getElementById('progressFill');
    const freeShippingRemaining = document.getElementById('freeShippingRemaining');
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Free shipping threshold
    const threshold = 50;
    
    // Calculate progress percentage (max 100%)
    const percentage = Math.min(100, (subtotal / threshold) * 100);
    
    // Update progress bar
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    // Update text
    if (freeShippingRemaining) {
        if (subtotal >= threshold) {
            freeShippingRemaining.parentElement.textContent = 'You qualify for free shipping!';
        } else {
            const remaining = threshold - subtotal;
            freeShippingRemaining.textContent = `$${remaining.toFixed(2)}`;
        }
    }
}

/**
 * Proceed to checkout
 */
function proceedToCheckout() {
    const cart = getCart();
    
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
    
    // Debug log
    console.log('Redirecting to checkout page');
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set content
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        transform: 'translateY(-20px)',
        opacity: '0',
        transition: 'all 0.3s ease',
        ...getNotificationStyle(type)
    });
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Get notification icon
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fas fa-check-circle';
        case 'error':
            return 'fas fa-exclamation-circle';
        case 'warning':
            return 'fas fa-exclamation-triangle';
        case 'info':
        default:
            return 'fas fa-info-circle';
    }
}

/**
 * Get notification style
 */
function getNotificationStyle(type) {
    switch (type) {
        case 'success':
            return {
                backgroundColor: '#dcfce7',
                color: '#166534',
                border: '1px solid #166534'
            };
        case 'error':
            return {
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #991b1b'
            };
        case 'warning':
            return {
                backgroundColor: '#fef3c7',
                color: '#92400e',
                border: '1px solid #92400e'
            };
        case 'info':
        default:
            return {
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                border: '1px solid #0369a1'
            };
    }
} 