/**
 * Checkout Page JavaScript
 * ChenOne Premium Stationery
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize checkout page
    initCheckout();
    
    // Setup event listeners
    setupEventListeners();
});

/**
 * Initialize the checkout page
 */
function initCheckout() {
    // Load cart data
    loadCartItems();
    
    // Calculate initial totals
    calculateTotals();
    
    // Update cart count in header
    updateCartCount();
    
    // Initialize form validation
    initFormValidation();
}

/**
 * Setup event listeners for the page
 */
function setupEventListeners() {
    // Shipping method selection
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    shippingOptions.forEach(option => {
        option.addEventListener('change', function() {
            calculateTotals();
        });
    });
    
    // Coupon code application
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', function() {
            applyCoupon();
        });
    }
    
    // Form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm()) {
                processCheckout();
            }
        });
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
}

/**
 * Load cart items from localStorage
 */
function loadCartItems() {
    const summaryItemsContainer = document.getElementById('summaryItems');
    if (!summaryItemsContainer) return;
    
    // Clear existing items
    summaryItemsContainer.innerHTML = '';
    
    // Get cart items from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    console.log('Loading cart items:', cart); // Debug log
    
    if (cart.length === 0) {
        // Show empty cart message
        summaryItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <p>Your cart is empty.</p>
                <a href="products.html" class="btn btn-outline">Continue Shopping</a>
            </div>
        `;
        
        // Disable the checkout button
        const checkoutButton = document.querySelector('button[type="submit"]');
        if (checkoutButton) {
            checkoutButton.disabled = true;
            checkoutButton.classList.add('disabled');
        }
        
        return;
    }
    
    // Render each cart item
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('summary-item');
        
        // Use default image path if image is not provided
        const imagePath = item.image || `images/products/${item.category}/${item.id}.jpg`;
        
        itemElement.innerHTML = `
            <div class="summary-item-image">
                <img src="${imagePath}" alt="${item.name}" onerror="this.onerror=null; this.src='images/placeholder.jpg';">
            </div>
            <div class="summary-item-details">
                <div class="summary-item-name">${item.name}</div>
                <div class="summary-item-variant">${item.variant || ''}</div>
            </div>
            <div class="summary-item-price">
                $${(item.price * item.quantity).toFixed(2)}
                <span class="summary-item-quantity">Qty: ${item.quantity}</span>
            </div>
        `;
        
        summaryItemsContainer.appendChild(itemElement);
    });
}

/**
 * Calculate order totals
 */
function calculateTotals() {
    // Get cart items from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calculate subtotal
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Get selected shipping method
    const selectedShipping = document.querySelector('input[name="shipping"]:checked');
    let shippingCost = 5.99; // Default to standard shipping
    
    if (selectedShipping) {
        const shippingValue = selectedShipping.value;
        
        switch (shippingValue) {
            case 'express':
                shippingCost = 12.99;
                break;
            case 'overnight':
                shippingCost = 24.99;
                break;
            default:
                shippingCost = 5.99; // Standard shipping
        }
    }
    
    // Calculate tax (7.5%)
    const taxRate = 0.075;
    const taxAmount = subtotal * taxRate;
    
    // Get discount if any
    const discountAmount = getDiscount(subtotal);
    
    // Calculate total
    const total = subtotal + shippingCost + taxAmount - discountAmount;
    
    // Update the DOM
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shippingCost.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${taxAmount.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
    // Show/hide discount row
    const discountRow = document.getElementById('discountRow');
    if (discountAmount > 0) {
        document.getElementById('discount').textContent = `-$${discountAmount.toFixed(2)}`;
        discountRow.style.display = 'flex';
    } else {
        discountRow.style.display = 'none';
    }
    
    // Save order summary to localStorage for use on confirmation page
    saveOrderSummary(subtotal, shippingCost, taxAmount, discountAmount, total);
}

/**
 * Get discount amount based on coupon code
 * @param {number} subtotal - Cart subtotal
 * @returns {number} - Discount amount
 */
function getDiscount(subtotal) {
    const appliedCoupon = localStorage.getItem('appliedCoupon');
    if (!appliedCoupon) return 0;
    
    const coupon = JSON.parse(appliedCoupon);
    
    if (coupon.type === 'percentage') {
        return subtotal * (coupon.value / 100);
    } else if (coupon.type === 'fixed') {
        return coupon.value;
    }
    
    return 0;
}

/**
 * Apply coupon code
 */
function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    const couponMessage = document.getElementById('couponMessage');
    
    if (!couponInput || !couponMessage) return;
    
    const couponCode = couponInput.value.trim().toUpperCase();
    
    if (!couponCode) {
        showCouponMessage(couponMessage, 'Please enter a coupon code.', 'error');
        return;
    }
    
    // Sample coupon codes (in a real app, these would come from a database)
    const validCoupons = {
        'WELCOME10': { type: 'percentage', value: 10, description: '10% off your order' },
        'SAVE20': { type: 'percentage', value: 20, description: '20% off your order' },
        'FREESHIP': { type: 'fixed', value: 5.99, description: 'Free standard shipping' },
        'SAVE5': { type: 'fixed', value: 5, description: '$5 off your order' }
    };
    
    if (validCoupons[couponCode]) {
        // Apply the coupon
        localStorage.setItem('appliedCoupon', JSON.stringify({
            code: couponCode,
            ...validCoupons[couponCode]
        }));
        
        showCouponMessage(couponMessage, `Coupon applied: ${validCoupons[couponCode].description}`, 'success');
        
        // Recalculate totals
        calculateTotals();
    } else {
        showCouponMessage(couponMessage, 'Invalid coupon code.', 'error');
    }
}

/**
 * Show coupon message
 * @param {HTMLElement} element - Message element
 * @param {string} message - Message to display
 * @param {string} type - Message type (success/error)
 */
function showCouponMessage(element, message, type) {
    element.textContent = message;
    element.className = 'coupon-message';
    element.classList.add(type);
    
    // Clear message after 5 seconds
    setTimeout(() => {
        element.textContent = '';
        element.className = 'coupon-message';
    }, 5000);
}

/**
 * Save order summary to localStorage
 * @param {number} subtotal - Cart subtotal
 * @param {number} shipping - Shipping cost
 * @param {number} tax - Tax amount
 * @param {number} discount - Discount amount
 * @param {number} total - Order total
 */
function saveOrderSummary(subtotal, shipping, tax, discount, total) {
    const orderSummary = {
        subtotal,
        shipping,
        tax,
        discount,
        total,
        date: new Date().toISOString()
    };
    
    localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
}

/**
 * Initialize form validation
 */
function initFormValidation() {
    // Get all required inputs
    const requiredInputs = document.querySelectorAll('[required]');
    
    requiredInputs.forEach(input => {
        // Add blur event listener
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        // Add input event listener to remove error as user types
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                const formGroup = this.closest('.form-group');
                if (formGroup && formGroup.classList.contains('error')) {
                    formGroup.classList.remove('error');
                }
            }
        });
    });
}

/**
 * Validate a single input field
 * @param {HTMLElement} input - Input element to validate
 * @returns {boolean} - Is valid
 */
function validateInput(input) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    // Check if empty
    if (input.value.trim() === '') {
        isValid = false;
        errorMessage = 'This field is required';
    } else {
        // Validate based on input type
        switch (input.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
                
            case 'tel':
                const phoneRegex = /^[\d\s\-\(\)]+$/;
                if (!phoneRegex.test(input.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
                
            case 'text':
                if (input.id === 'zipCode') {
                    const zipRegex = /^\d{5}(-\d{4})?$/;
                    if (!zipRegex.test(input.value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid ZIP code';
                    }
                }
                break;
        }
    }
    
    // Update UI based on validation
    if (!isValid) {
        formGroup.classList.add('error');
        
        // Create or update error message
        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = errorMessage;
    } else {
        formGroup.classList.remove('error');
    }
    
    return isValid;
}

/**
 * Validate the entire form
 * @returns {boolean} - Is form valid
 */
function validateForm() {
    const requiredInputs = document.querySelectorAll('[required]');
    let isFormValid = true;
    
    requiredInputs.forEach(input => {
        const isInputValid = validateInput(input);
        if (!isInputValid) {
            isFormValid = false;
        }
    });
    
    return isFormValid;
}

/**
 * Process the checkout
 */
function processCheckout() {
    // In a real application, this would submit the order to a server
    // For this demo, we'll simulate a successful checkout
    
    // Show loading state
    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Simulate API call with timeout
    setTimeout(() => {
        // Generate order ID
        const orderId = generateOrderId();
        
        // Save order details to localStorage
        saveOrderDetails(orderId);
        
        // Redirect to success page
        window.location.href = 'success.html';
    }, 2000);
}

/**
 * Generate a random order ID
 * @returns {string} - Order ID
 */
function generateOrderId() {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
}

/**
 * Save order details to localStorage
 * @param {string} orderId - Generated order ID
 */
function saveOrderDetails(orderId) {
    // Get form data
    const formData = new FormData(document.getElementById('checkoutForm'));
    const formEntries = Object.fromEntries(formData.entries());
    
    // Get cart items and summary
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderSummary = JSON.parse(localStorage.getItem('orderSummary')) || {};
    
    // Create order object
    const order = {
        id: orderId,
        date: new Date().toISOString(),
        customer: {
            firstName: formEntries.firstName,
            lastName: formEntries.lastName,
            email: formEntries.email,
            phone: formEntries.phone
        },
        shipping: {
            address: formEntries.address,
            address2: formEntries.address2,
            city: formEntries.city,
            state: formEntries.state,
            zipCode: formEntries.zipCode,
            country: formEntries.country,
            method: formEntries.shipping
        },
        items: cart,
        summary: orderSummary,
        specialInstructions: formEntries.instructions || ''
    };
    
    // Save to localStorage
    localStorage.setItem('lastOrder', JSON.stringify(order));
    
    // Clear cart after successful order
    localStorage.removeItem('cart');
    localStorage.removeItem('appliedCoupon');
}

/**
 * Update cart count in header
 */
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (!cartCountElement) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
    
    cartCountElement.textContent = itemCount;
    
    // Hide count if zero
    if (itemCount === 0) {
        cartCountElement.style.display = 'none';
    } else {
        cartCountElement.style.display = 'block';
    }
}

/**
 * Show notification
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success/error/info)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Create content
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Add close button event listener
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', function() {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
} 