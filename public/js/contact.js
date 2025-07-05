/**
 * Contact Page JavaScript
 * Handles form submission, FAQ accordion, and interactive features
 */

// Initialize contact page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
    initializeFAQAccordion();
    initializeLiveChat();
});

/**
 * Initialize contact form functionality
 */
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmission);
        
        // Add real-time validation
        const inputs = contactForm.querySelectorAll('.form-input, .form-select, .form-textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
}

/**
 * Handle contact form submission
 * @param {Event} event - Form submit event
 */
async function handleFormSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.form-submit');
    const formData = new FormData(form);
    
    // Validate all fields
    if (!validateForm(form)) {
        showMessage('Please correct the errors and try again.', 'error');
        return;
    }
    
    // Show loading state
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;
    
    try {
        // Simulate form submission (in a real app, this would send to a server)
        await simulateFormSubmission(formData);
        
        // Show success message
        showMessage('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
        
        // Reset form
        form.reset();
        clearAllErrors(form);
        
        // Analytics tracking (if implemented)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact_form_submit', {
                'event_category': 'engagement',
                'event_label': formData.get('subject')
            });
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

/**
 * Simulate form submission with delay
 * @param {FormData} formData - Form data
 * @returns {Promise} - Promise that resolves after delay
 */
function simulateFormSubmission(formData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate occasional errors for demo
            if (Math.random() < 0.05) {
                reject(new Error('Network error'));
            } else {
                // Store submission in localStorage for demo
                const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
                const submission = {
                    id: Date.now().toString(),
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    subject: formData.get('subject'),
                    message: formData.get('message'),
                    newsletter: formData.get('newsletter') === 'on',
                    timestamp: new Date().toISOString()
                };
                submissions.push(submission);
                localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
                resolve(submission);
            }
        }, 1500); // Simulate network delay
    });
}

/**
 * Validate entire form
 * @param {HTMLFormElement} form - Form element
 * @returns {boolean} - True if form is valid
 */
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Validate individual field
 * @param {Event} event - Input event
 * @returns {boolean} - True if field is valid
 */
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    
    // Clear previous errors
    clearFieldError(event);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required.');
        return false;
    }
    
    // Email validation
    if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address.');
            return false;
        }
    }
    
    // Phone validation
    if (fieldName === 'phone' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            showFieldError(field, 'Please enter a valid phone number.');
            return false;
        }
    }
    
    // Name validation
    if ((fieldName === 'firstName' || fieldName === 'lastName') && value) {
        if (value.length < 2) {
            showFieldError(field, 'Name must be at least 2 characters long.');
            return false;
        }
    }
    
    // Message validation
    if (fieldName === 'message' && value) {
        if (value.length < 10) {
            showFieldError(field, 'Message must be at least 10 characters long.');
            return false;
        }
    }
    
    return true;
}

/**
 * Show field validation error
 * @param {HTMLElement} field - Input field
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorElement = document.createElement('span');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #e74c3c;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    `;
    
    field.parentNode.appendChild(errorElement);
    
    // Add error styling to field
    field.style.borderColor = '#e74c3c';
}

/**
 * Clear field validation error
 * @param {Event} event - Input event
 */
function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('error');
    
    // Remove error message
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
    
    // Reset field styling
    field.style.borderColor = '';
}

/**
 * Clear all form errors
 * @param {HTMLFormElement} form - Form element
 */
function clearAllErrors(form) {
    const errorElements = form.querySelectorAll('.field-error');
    errorElements.forEach(error => error.remove());
    
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
        field.style.borderColor = '';
    });
}

/**
 * Initialize FAQ accordion functionality
 */
function initializeFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active', !isActive);
                
                // Analytics tracking
                if (!isActive && typeof gtag !== 'undefined') {
                    const questionText = question.querySelector('h4').textContent;
                    gtag('event', 'faq_expand', {
                        'event_category': 'engagement',
                        'event_label': questionText
                    });
                }
            });
        }
    });
}

/**
 * Initialize live chat functionality
 */
function initializeLiveChat() {
    // This would integrate with a real chat service like Intercom, Zendesk, etc.
    window.openLiveChat = function() {
        // Simulate opening chat widget
        showMessage('Live chat feature coming soon! Please use our contact form or email us directly.', 'info');
        
        // In a real implementation, this would open the chat widget
        // Example: window.Intercom('show');
        
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'live_chat_open', {
                'event_category': 'engagement'
            });
        }
    };
}

/**
 * Show message to user (reusing from index.js with minor modifications)
 * @param {string} message - Message to show
 * @param {string} type - Message type (success, error, info)
 */
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.toast-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `toast-message toast-${type}`;
    messageElement.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getMessageIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    messageElement.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        transform: translateX(400px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        ${getMessageStyle(type)}
    `;
    
    document.body.appendChild(messageElement);
    
    // Show message
    setTimeout(() => {
        messageElement.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
        if (messageElement.parentElement) {
            messageElement.style.transform = 'translateX(400px)';
            setTimeout(() => {
                messageElement.remove();
            }, 300);
        }
    }, 5000);
}

/**
 * Get message icon based on type
 * @param {string} type - Message type
 * @returns {string} - FontAwesome icon class
 */
function getMessageIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

/**
 * Get message style based on type
 * @param {string} type - Message type
 * @returns {string} - CSS styles
 */
function getMessageStyle(type) {
    const styles = {
        'success': 'background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);',
        'error': 'background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);',
        'info': 'background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);'
    };
    return styles[type] || styles.info;
}

/**
 * Auto-fill form from URL parameters (for marketing campaigns)
 */
function autoFillFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const form = document.getElementById('contactForm');
    
    if (form) {
        // Auto-fill subject if provided
        const subject = urlParams.get('subject');
        if (subject) {
            const subjectField = form.querySelector('#subject');
            if (subjectField) {
                subjectField.value = subject;
            }
        }
        
        // Auto-fill email if provided
        const email = urlParams.get('email');
        if (email) {
            const emailField = form.querySelector('#email');
            if (emailField) {
                emailField.value = email;
            }
        }
    }
}

// Initialize auto-fill on page load
document.addEventListener('DOMContentLoaded', autoFillFromURL);

/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.getElementById('contactForm');
        if (form && document.activeElement && form.contains(document.activeElement)) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    }
});

/**
 * Form auto-save functionality (draft)
 */
function initializeAutoSave() {
    const form = document.getElementById('contactForm');
    const draftKey = 'contact_form_draft';
    
    if (form) {
        // Load saved draft
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            try {
                const draftData = JSON.parse(savedDraft);
                Object.keys(draftData).forEach(key => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field) {
                        if (field.type === 'checkbox') {
                            field.checked = draftData[key];
                        } else {
                            field.value = draftData[key];
                        }
                    }
                });
            } catch (error) {
                console.error('Error loading form draft:', error);
            }
        }
        
        // Save draft on input
        const saveTimeout = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(saveTimeout[input.name]);
                saveTimeout[input.name] = setTimeout(() => {
                    saveDraft(form, draftKey);
                }, 1000); // Save after 1 second of inactivity
            });
        });
        
        // Clear draft on successful submission
        form.addEventListener('submit', () => {
            setTimeout(() => {
                localStorage.removeItem(draftKey);
            }, 2000); // Clear after successful submission
        });
    }
}

/**
 * Save form data as draft
 * @param {HTMLFormElement} form - Form element
 * @param {string} key - Storage key
 */
function saveDraft(form, key) {
    try {
        const formData = new FormData(form);
        const draftData = {};
        
        for (let [key, value] of formData.entries()) {
            draftData[key] = value;
        }
        
        localStorage.setItem(key, JSON.stringify(draftData));
    } catch (error) {
        console.error('Error saving form draft:', error);
    }
}

// Initialize auto-save
document.addEventListener('DOMContentLoaded', initializeAutoSave); 