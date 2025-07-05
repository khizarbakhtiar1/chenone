/**
 * Index Page JavaScript
 * Handles featured products loading, cart functionality, and modern UI interactions
 */

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
        offset: 100
    });

    // Load featured products
    loadFeaturedProducts();
    
    // Update cart count
    updateCartCount();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize header scroll effect
    initializeHeaderScroll();
    
    // Initialize hover effects
    initializeHoverEffects();
    
    // Initialize newsletter form
    initializeNewsletterForm();
    
    // Initialize counter animations
    initializeCounters();
}

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
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(event.target) && 
                !mobileToggle.contains(event.target)) {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        });
    }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

/**
 * Initialize header scroll effect
 */
function initializeHeaderScroll() {
    const header = document.querySelector('.header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

/**
 * Initialize hover effects
 */
function initializeHoverEffects() {
    // Add hover effects to category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.category-icon i');
            if (icon) {
                icon.classList.add('fa-bounce');
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.category-icon i');
            if (icon) {
                icon.classList.remove('fa-bounce');
            }
        });
    });
}

/**
 * Initialize newsletter form
 */
function initializeNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', subscribeNewsletter);
    }
}

/**
 * Load featured products from API
 */
async function loadFeaturedProducts() {
    const productsGrid = document.getElementById('featuredProducts');
    if (!productsGrid) return;
    
    try {
        // Show loading state
        productsGrid.innerHTML = `
            <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
                </div>
                <p style="margin-top: 1rem; color: var(--text-medium);">Loading featured products...</p>
            </div>
        `;
        
        const response = await fetch('/api/products?featured=true');
        const result = await response.json();
        
        if (result.success) {
            renderFeaturedProducts(result.data);
        } else {
            console.error('Failed to load featured products:', result.error);
            showErrorMessage('Failed to load featured products');
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
        
        // For demo purposes, render sample products if API fails
        const sampleProducts = [
            {
                id: 'pen1',
                name: 'Montblanc Meisterstück',
                category: 'pens',
                brand: 'Montblanc',
                price: 499.99
            },
            {
                id: 'notebook1',
                name: 'Moleskine Classic Notebook',
                category: 'notebooks',
                brand: 'Moleskine',
                price: 24.95
            },
            {
                id: 'art1',
                name: 'Faber-Castell Polychromos Set',
                category: 'art-supplies',
                brand: 'Faber-Castell',
                price: 149.99
            },
            {
                id: 'desk1',
                name: 'Leather Desk Pad Protector',
                category: 'desk-accessories',
                brand: 'ChenOne',
                price: 89.95
            }
        ];
        
        renderFeaturedProducts(sampleProducts);
    }
}

/**
 * Render featured products on the page
 * @param {Array} products - Featured products
 */
function renderFeaturedProducts(products) {
    const productsGrid = document.getElementById('featuredProducts');
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: var(--text-light);"></i>
                <p style="margin-top: 1rem; color: var(--text-medium);">No featured products found.</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = '';
    
    // Product images based on category
    const productImages = {
        'pens': 'images/pen-placeholder.jpg',
        'notebooks': 'images/notebook-placeholder.jpg',
        'art-supplies': 'images/art-placeholder.jpg',
        'desk-accessories': 'images/desk-placeholder.jpg',
        'default': 'images/product-placeholder.jpg'
    };
    
    products.forEach((product, index) => {
        // Create product card with animation
        const delay = index * 100;
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-aos', 'fade-up');
        productCard.setAttribute('data-aos-delay', delay);
        
        // Use placeholder image based on category or default
        const imageSrc = productImages[product.category] || productImages.default;
        
        productCard.innerHTML = `
            <div class="product-image" style="background-image: url('${imageSrc}');">
                <div class="product-category">${formatCategory(product.category)}</div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-brand">${formatBrand(product.brand)}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart" onclick="addToCart('${product.id}')">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        `;
        
        // Add hover animation class
        productCard.addEventListener('mouseenter', () => {
            productCard.classList.add('pulse');
        });
        
        productCard.addEventListener('mouseleave', () => {
            productCard.classList.remove('pulse');
        });
        
        // Add click handler for product detail page
        productCard.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart')) {
                viewProduct(product.id);
            }
        });
        
        productsGrid.appendChild(productCard);
    });
}

/**
 * Get product color based on category
 * @param {string} category - Product category
 * @returns {string} - Color gradient
 */
function getProductColor(category) {
    const colors = {
        'pens': 'linear-gradient(135deg, #3a5a40 0%, #588157 100%)',
        'notebooks': 'linear-gradient(135deg, #344e41 0%, #3a5a40 100%)',
        'art-supplies': 'linear-gradient(135deg, #588157 0%, #a3b18a 100%)',
        'desk-accessories': 'linear-gradient(135deg, #344e41 0%, #588157 100%)'
    };
    return colors[category] || 'linear-gradient(135deg, #3a5a40 0%, #588157 100%)';
}

/**
 * Get product icon based on category
 * @param {string} category - Product category
 * @returns {string} - FontAwesome icon class
 */
function getProductIcon(category) {
    const icons = {
        'pens': 'fas fa-pen-fancy',
        'notebooks': 'fas fa-book',
        'art-supplies': 'fas fa-palette',
        'desk-accessories': 'fas fa-desktop'
    };
    return icons[category] || 'fas fa-box';
}

/**
 * Add product to cart
 * @param {string} productId - Product ID
 */
async function addToCart(productId) {
    try {
        const response = await fetch(`/api/product?id=${productId}`);
        const result = await response.json();
        
        if (!result.success) {
            showMessage('Product not found', 'error');
            return;
        }
        
        // Get current cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if product already in cart
        const existingProduct = cart.find(item => item.id === productId);
        
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: result.data.name,
                price: result.data.price,
                quantity: 1
            });
        }
        
        // Save updated cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Show success message
        showMessage(`${result.data.name} added to cart!`, 'success');
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        
        // For demo purposes, add sample product if API fails
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Add sample product
        cart.push({
            id: productId,
            name: 'Sample Product',
            price: 49.99,
            quantity: 1
        });
        
        // Save updated cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Show success message
        showMessage('Product added to cart!', 'success');
    }
}

/**
 * Update cart count in the header
 */
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (!cartCountElement) return;
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calculate total quantity
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart count
    cartCountElement.textContent = totalItems;
    
    // Add animation if items in cart
    if (totalItems > 0) {
        cartCountElement.classList.add('pulse');
        setTimeout(() => {
            cartCountElement.classList.remove('pulse');
        }, 1000);
    }
}

/**
 * Navigate to product detail page
 * @param {string} productId - Product ID
 */
function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

/**
 * Format category name for display
 * @param {string} category - Category slug
 * @returns {string} - Formatted category name
 */
function formatCategory(category) {
    const categories = {
        'pens': 'Pens',
        'notebooks': 'Notebooks',
        'art-supplies': 'Art Supplies',
        'desk-accessories': 'Desk Accessories'
    };
    
    return categories[category] || category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format brand name for display
 * @param {string} brand - Brand name
 * @returns {string} - Formatted brand name
 */
function formatBrand(brand) {
    return brand || 'ChenOne';
}

/**
 * Show message to user
 * @param {string} message - Message text
 * @param {string} type - Message type (success, error, info)
 */
function showMessage(message, type = 'info') {
    // Check if message container exists
    let messageContainer = document.querySelector('.message-container');
    
    // Create message container if it doesn't exist
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        document.body.appendChild(messageContainer);
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = `
        <div class="message-icon">${getMessageIcon(type)}</div>
        <div class="message-content">${message}</div>
        <button class="message-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add message to container
    messageContainer.appendChild(messageElement);
    
    // Add message style
    messageElement.style.cssText = getMessageStyle(type);
    
    // Add close button functionality
    const closeButton = messageElement.querySelector('.message-close');
    closeButton.addEventListener('click', () => {
        messageElement.classList.add('fade-out');
        setTimeout(() => {
            messageElement.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 300);
        }
    }, 5000);
}

/**
 * Get message icon based on type
 * @param {string} type - Message type
 * @returns {string} - Icon HTML
 */
function getMessageIcon(type) {
    const icons = {
        'success': '<i class="fas fa-check-circle"></i>',
        'error': '<i class="fas fa-exclamation-circle"></i>',
        'info': '<i class="fas fa-info-circle"></i>',
        'warning': '<i class="fas fa-exclamation-triangle"></i>'
    };
    
    return icons[type] || icons.info;
}

/**
 * Get message style based on type
 * @param {string} type - Message type
 * @returns {string} - CSS styles
 */
function getMessageStyle(type) {
    const styles = {
        'success': 'background-color: #d4edda; color: #155724; border-left: 4px solid #28a745;',
        'error': 'background-color: #f8d7da; color: #721c24; border-left: 4px solid #dc3545;',
        'info': 'background-color: #d1ecf1; color: #0c5460; border-left: 4px solid #17a2b8;',
        'warning': 'background-color: #fff3cd; color: #856404; border-left: 4px solid #ffc107;'
    };
    
    return styles[type] || styles.info;
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
    showMessage(message, 'error');
}

/**
 * Subscribe to newsletter
 * @param {Event} event - Form submit event
 */
function subscribeNewsletter(event) {
    event.preventDefault();
    
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    if (!email) {
        showMessage('Please enter your email address', 'warning');
        return;
    }
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address', 'warning');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset form
        form.reset();
        
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Show success message
        showMessage('Thank you for subscribing to our newsletter!', 'success');
        
        // Store subscription in localStorage for demo
        const subscribers = JSON.parse(localStorage.getItem('subscribers')) || [];
        subscribers.push({
            email: email,
            date: new Date().toISOString()
        });
        localStorage.setItem('subscribers', JSON.stringify(subscribers));
    }, 1500);
}

// Add CSS for messages
(function addMessageStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .message-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        }
        
        .message {
            display: flex;
            align-items: center;
            padding: 15px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            animation: slide-in 0.3s ease-out forwards;
        }
        
        .message-icon {
            font-size: 20px;
            margin-right: 15px;
        }
        
        .message-content {
            flex: 1;
            font-size: 14px;
        }
        
        .message-close {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 14px;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        
        .message-close:hover {
            opacity: 1;
        }
        
        .fade-out {
            animation: fade-out 0.3s ease-out forwards;
        }
        
        @keyframes slide-in {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fade-out {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .pulse {
            animation: pulse 0.5s ease-out;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.3);
            }
            100% {
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);
})();

/**
 * Initialize counter animations for stats
 */
function initializeCounters() {
    // Client counter
    animateCounter('clientCounter', 0, 5000, 2000, '+');
    
    // Brand counter
    animateCounter('brandCounter', 0, 50, 1500, '+');
}

/**
 * Animate a counter from start to end value
 * @param {string} elementId - The ID of the element to animate
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} duration - Duration in milliseconds
 * @param {string} suffix - Optional suffix to add after the number
 */
function animateCounter(elementId, start, end, duration, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Check if element is in viewport before starting animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Start animation when element is visible
                let startTime = null;
                
                function step(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    const value = Math.floor(progress * (end - start) + start);
                    element.textContent = value + suffix;
                    
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        // Animation complete
                        element.textContent = end + suffix;
                        observer.disconnect();
                    }
                }
                
                window.requestAnimationFrame(step);
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(element);
} 