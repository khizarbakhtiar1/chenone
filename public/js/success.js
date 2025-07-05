// Success page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadOrderDetails();
});

// Load order details from sessionStorage
function loadOrderDetails() {
    const orderId = sessionStorage.getItem('lastOrderId');
    const orderDataStr = sessionStorage.getItem('lastOrderData');
    
    if (!orderId || !orderDataStr) {
        // No order data found, redirect to home
        showNoOrderMessage();
        return;
    }
    
    try {
        const orderData = JSON.parse(orderDataStr);
        displayOrderDetails(orderId, orderData);
    } catch (error) {
        console.error('Error parsing order data:', error);
        showNoOrderMessage();
    }
}

// Display order details
function displayOrderDetails(orderId, orderData) {
    // Update order information
    document.getElementById('orderNumber').textContent = orderId;
    document.getElementById('orderDate').textContent = formatDate(orderData.orderDate);
    document.getElementById('customerEmail').textContent = orderData.email;
    document.getElementById('totalAmount').textContent = `$${orderData.total.toFixed(2)}`;
    
    // Display order items
    displayOrderItems(orderData.cartItems);
    
    // Display shipping information
    displayShippingInfo(orderData);
}

// Display order items
function displayOrderItems(items) {
    const itemsList = document.getElementById('itemsList');
    
    const itemsHTML = items.map(item => `
        <div class="order-item">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-details">
                    Quantity: ${item.quantity}
                    ${item.color ? ` • Color: ${formatOption(item.color)}` : ''}
                    ${item.nibSize ? ` • Nib Size: ${formatOption(item.nibSize)}` : ''}
                    ${item.size ? ` • Size: ${formatOption(item.size)}` : ''}
                </div>
            </div>
            <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    
    itemsList.innerHTML = itemsHTML;
}

// Display shipping information
function displayShippingInfo(orderData) {
    const shippingDetails = document.getElementById('shippingDetails');
    
    const shippingHTML = `
        <div class="shipping-address">
            <strong>${orderData.customerName}</strong><br>
            ${orderData.address}<br>
            Phone: ${orderData.phone}<br>
            Email: ${orderData.email}
        </div>
        <div style="margin-top: 1rem;">
            <strong>Payment Method:</strong> ${formatPaymentMethod(orderData.paymentMethod)}
        </div>
        <div style="margin-top: 1rem;">
            <strong>Shipping Cost:</strong> ${orderData.shipping === 0 ? 'Free' : `$${orderData.shipping.toFixed(2)}`}
        </div>
    `;
    
    shippingDetails.innerHTML = shippingHTML;
}

// Show message when no order data is found
function showNoOrderMessage() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="success-content">
            <div class="success-icon">
                <div style="font-size: 4rem; color: #ffc107;">⚠️</div>
            </div>
            <div class="success-message">
                <h1>No Order Found</h1>
                <p class="success-subtitle">We couldn't find your order information. This may happen if you've navigated here directly.</p>
            </div>
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="goToHome()">Go to Home</button>
                <button class="btn btn-secondary" onclick="goToProducts()">Browse Products</button>
            </div>
        </div>
    `;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format option name (capitalize and replace hyphens)
function formatOption(option) {
    if (!option) return '';
    return option.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Format payment method for display
function formatPaymentMethod(method) {
    const methods = {
        'credit': 'Credit Card',
        'debit': 'Debit Card',
        'cod': 'Cash on Delivery',
        'paypal': 'PayPal',
        'bank': 'Bank Transfer'
    };
    return methods[method] || method;
}

// Navigation functions
function goToHome() {
    // Clear session storage
    sessionStorage.removeItem('lastOrderId');
    sessionStorage.removeItem('lastOrderData');
    
    window.location.href = '/';
}

function goToProducts() {
    // Clear session storage
    sessionStorage.removeItem('lastOrderId');
    sessionStorage.removeItem('lastOrderData');
    
    window.location.href = '/products';
}

// Print order function
function printPage() {
    window.print();
}

// Handle back button behavior
window.addEventListener('popstate', function(event) {
    // Redirect to home if user tries to go back
    goToHome();
});

// Replace current history entry to prevent back button issues
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// Auto-clear session storage after 30 minutes
setTimeout(() => {
    sessionStorage.removeItem('lastOrderId');
    sessionStorage.removeItem('lastOrderData');
}, 30 * 60 * 1000); // 30 minutes 