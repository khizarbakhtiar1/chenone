const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// MIME type mapping for proper content delivery
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.pdf': 'application/pdf'
};

// Cache for products data to avoid reading file repeatedly
let productsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Get MIME type based on file extension
 * @param {string} filePath - Path to the file
 * @returns {string} - MIME type
 */
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Read file asynchronously with error handling
 * @param {string} filePath - Path to the file
 * @returns {Promise} - Promise that resolves with file content or rejects with error
 */
function readFileAsync(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * Check if file exists asynchronously
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} - Promise that resolves with boolean
 */
function fileExistsAsync(filePath) {
    return new Promise((resolve) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            resolve(!err);
        });
    });
}

/**
 * Load products from JSON file with caching
 * @returns {Promise<Array>} - Promise that resolves with products array
 */
async function loadProducts() {
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (productsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
        return productsCache;
    }
    
    try {
        const exists = await fileExistsAsync(PRODUCTS_FILE);
        if (!exists) {
            console.error(`Products file not found: ${PRODUCTS_FILE}`);
            return [];
        }
        
        const data = await readFileAsync(PRODUCTS_FILE);
        const products = JSON.parse(data.toString());
        
        // Update cache
        productsCache = products;
        cacheTimestamp = now;
        
        console.log(`✓ Loaded ${products.length} products from database`);
        return products;
    } catch (error) {
        console.error('Error loading products:', error.message);
        return [];
    }
}

/**
 * Find product by ID
 * @param {string} productId - Product ID to search for
 * @returns {Promise<Object|null>} - Promise that resolves with product or null
 */
async function findProductById(productId) {
    const products = await loadProducts();
    return products.find(product => product.id === productId) || null;
}

/**
 * Filter products by category
 * @param {string} category - Category to filter by
 * @returns {Promise<Array>} - Promise that resolves with filtered products
 */
async function getProductsByCategory(category) {
    const products = await loadProducts();
    if (!category) return products;
    return products.filter(product => product.category === category);
}

/**
 * Get featured products
 * @returns {Promise<Array>} - Promise that resolves with featured products
 */
async function getFeaturedProducts() {
    const products = await loadProducts();
    return products.filter(product => product.featured === true);
}

/**
 * Serve static files from public directory
 * @param {http.IncomingMessage} req - Request object
 * @param {http.ServerResponse} res - Response object
 * @param {string} filePath - Path to the requested file
 */
async function serveStaticFile(req, res, filePath) {
    try {
        const fullPath = path.join(PUBLIC_DIR, filePath);
        const exists = await fileExistsAsync(fullPath);
        
        if (!exists) {
            serve404(res);
            return;
        }

        const data = await readFileAsync(fullPath);
        const mimeType = getMimeType(fullPath);
        
        res.writeHead(200, {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        });
        res.end(data);
        
        console.log(`✓ Served: ${filePath} (${mimeType})`);
    } catch (error) {
        console.error(`Error serving file ${filePath}:`, error.message);
        serve500(res);
    }
}

/**
 * Serve HTML pages with potential template replacement
 * @param {http.IncomingMessage} req - Request object
 * @param {http.ServerResponse} res - Response object
 * @param {string} fileName - HTML file name
 * @param {Object} data - Data to inject into template (optional)
 */
async function serveHTMLPage(req, res, fileName, data = {}) {
    try {
        const filePath = path.join(PUBLIC_DIR, fileName);
        const exists = await fileExistsAsync(filePath);
        
        if (!exists) {
            serve404(res);
            return;
        }

        let htmlContent = await readFileAsync(filePath);
        let content = htmlContent.toString();
        
        // Simple template replacement for product pages
        if (data.product) {
            content = content
                .replace(/\$\{product\.name\}/g, data.product.name)
                .replace(/\$\{product\.price\}/g, data.product.price)
                .replace(/\$\{product\.description\}/g, data.product.description)
                .replace(/\$\{product\.brand\}/g, data.product.brand);
        }
        
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
        });
        res.end(content);
        
        console.log(`✓ Served HTML: ${fileName}`);
    } catch (error) {
        console.error(`Error serving HTML ${fileName}:`, error.message);
        serve500(res);
    }
}

/**
 * Serve 404 Not Found page
 * @param {http.ServerResponse} res - Response object
 */
async function serve404(res) {
    try {
        const notFoundPath = path.join(PUBLIC_DIR, '404.html');
        const exists = await fileExistsAsync(notFoundPath);
        
        if (exists) {
            const data = await readFileAsync(notFoundPath);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(data);
        } else {
            // Fallback 404 if 404.html doesn't exist
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>404 - Page Not Found</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        h1 { color: #e74c3c; }
                        a { color: #3498db; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                    <a href="/">Go back to home</a>
                </body>
                </html>
            `);
        }
        console.log('✗ 404 - Page not found');
    } catch (error) {
        console.error('Error serving 404 page:', error.message);
        serve500(res);
    }
}

/**
 * Serve 500 Internal Server Error
 * @param {http.ServerResponse} res - Response object
 */
function serve500(res) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>500 - Server Error</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                h1 { color: #e74c3c; }
                a { color: #3498db; text-decoration: none; }
            </style>
        </head>
        <body>
            <h1>500 - Internal Server Error</h1>
            <p>Something went wrong on our end.</p>
            <a href="/">Go back to home</a>
        </body>
        </html>
    `);
    console.log('✗ 500 - Internal server error');
}

/**
 * Parse JSON body from request
 * @param {http.IncomingMessage} req - Request object
 * @returns {Promise<Object>} - Parsed JSON object
 */
function parseJSONBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

/**
 * Save order to orders.json file
 * @param {Object} orderData - Order data to save
 * @returns {Promise<string>} - Order ID
 */
async function saveOrder(orderData) {
    const ordersFile = path.join(DATA_DIR, 'orders.json');
    
    try {
        // Generate unique order ID
        const orderId = 'CO' + Date.now().toString();
        
        // Create order object with timestamp
        const order = {
            id: orderId,
            ...orderData,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        // Read existing orders or create empty array
        let orders = [];
        const exists = await fileExistsAsync(ordersFile);
        
        if (exists) {
            try {
                const data = await readFileAsync(ordersFile);
                orders = JSON.parse(data.toString());
            } catch (error) {
                console.error('Error reading orders file:', error.message);
                orders = [];
            }
        }
        
        // Add new order
        orders.push(order);
        
        // Save updated orders
        await new Promise((resolve, reject) => {
            fs.writeFile(ordersFile, JSON.stringify(orders, null, 2), (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log(`✓ Order saved: ${orderId}`);
        return orderId;
        
    } catch (error) {
        console.error('Error saving order:', error.message);
        throw error;
    }
}

/**
 * Handle API endpoints
 * @param {http.IncomingMessage} req - Request object
 * @param {http.ServerResponse} res - Response object
 * @param {string} endpoint - API endpoint
 */
async function handleAPI(req, res, endpoint) {
    // Set CORS headers for frontend integration
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
    
    // Handle OPTIONS requests for CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(200, headers);
        res.end();
        return;
    }
    
    try {
        const urlParams = new URL(req.url, `http://${req.headers.host}`);
        
        switch (endpoint) {
            case '/api/products':
                // Get all products or filter by category/featured
                const category = urlParams.searchParams.get('category');
                const featured = urlParams.searchParams.get('featured');
                
                let products;
                if (featured === 'true') {
                    products = await getFeaturedProducts();
                } else if (category) {
                    products = await getProductsByCategory(category);
                } else {
                    products = await loadProducts();
                }
                
                res.writeHead(200, headers);
                res.end(JSON.stringify({
                    success: true,
                    data: products,
                    count: products.length
                }));
                console.log(`✓ API: Served ${products.length} products`);
                break;
                
            case '/api/product':
                // Get single product by ID
                const productId = urlParams.searchParams.get('id');
                
                if (!productId) {
                    res.writeHead(400, headers);
                    res.end(JSON.stringify({ 
                        success: false,
                        error: 'Product ID is required' 
                    }));
                    return;
                }
                
                const product = await findProductById(productId);
                
                if (product) {
                    res.writeHead(200, headers);
                    res.end(JSON.stringify({
                        success: true,
                        data: product
                    }));
                    console.log(`✓ API: Served product ${productId}`);
                } else {
                    res.writeHead(404, headers);
                    res.end(JSON.stringify({ 
                        success: false,
                        error: 'Product not found',
                        productId: productId
                    }));
                    console.log(`✗ API: Product ${productId} not found`);
                }
                break;
                
            case '/api/categories':
                // Get all unique categories
                const allProducts = await loadProducts();
                const categories = [...new Set(allProducts.map(p => p.category))];
                
                res.writeHead(200, headers);
                res.end(JSON.stringify({
                    success: true,
                    data: categories
                }));
                console.log(`✓ API: Served ${categories.length} categories`);
                break;
                
            case '/api/brands':
                // Get all unique brands
                const productsForBrands = await loadProducts();
                const brands = [...new Set(productsForBrands.map(p => p.brand))];
                
                res.writeHead(200, headers);
                res.end(JSON.stringify({
                    success: true,
                    data: brands
                }));
                console.log(`✓ API: Served ${brands.length} brands`);
                break;
                
            case '/api/submit-order':
                // Handle order submission
                if (req.method !== 'POST') {
                    res.writeHead(405, headers);
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Method not allowed. Use POST.'
                    }));
                    return;
                }
                
                try {
                    const orderData = await parseJSONBody(req);
                    
                    // Validate required fields
                    const requiredFields = ['customerName', 'email', 'phone', 'address', 'cartItems', 'paymentMethod'];
                    const missingFields = requiredFields.filter(field => !orderData[field]);
                    
                    if (missingFields.length > 0) {
                        res.writeHead(400, headers);
                        res.end(JSON.stringify({
                            success: false,
                            error: 'Missing required fields',
                            missingFields
                        }));
                        return;
                    }
                    
                    // Validate cart items
                    if (!Array.isArray(orderData.cartItems) || orderData.cartItems.length === 0) {
                        res.writeHead(400, headers);
                        res.end(JSON.stringify({
                            success: false,
                            error: 'Cart is empty'
                        }));
                        return;
                    }
                    
                    // Save order
                    const orderId = await saveOrder(orderData);
                    
                    res.writeHead(200, headers);
                    res.end(JSON.stringify({
                        success: true,
                        orderId,
                        message: 'Order submitted successfully'
                    }));
                    
                    console.log(`✓ API: Order submitted successfully - ${orderId}`);
                    
                } catch (error) {
                    console.error('Error processing order:', error.message);
                    res.writeHead(500, headers);
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Failed to process order',
                        details: error.message
                    }));
                }
                break;
                
            default:
                res.writeHead(404, headers);
                res.end(JSON.stringify({ 
                    success: false,
                    error: 'API endpoint not found',
                    endpoint: endpoint
                }));
                console.log(`✗ API: Unknown endpoint ${endpoint}`);
        }
    } catch (error) {
        console.error('API Error:', error.message);
        res.writeHead(500, headers);
        res.end(JSON.stringify({ 
            success: false,
            error: 'Internal server error',
            details: error.message
        }));
    }
}

/**
 * Main request handler
 * @param {http.IncomingMessage} req - Request object
 * @param {http.ServerResponse} res - Response object
 */
async function requestHandler(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    console.log(`${method} ${pathname}`);
    
    // Handle API endpoints
    if (pathname.startsWith('/api/')) {
        await handleAPI(req, res, pathname);
        return;
    }
    
    // Handle main routes
    switch (pathname) {
        case '/':
            await serveHTMLPage(req, res, 'index.html');
            break;
            
        case '/products':
            await serveHTMLPage(req, res, 'products.html');
            break;
            
        case '/product':
            const productId = parsedUrl.query.id;
            
            if (!productId) {
                await serve404(res);
                return;
            }
            
            const product = await findProductById(productId);
            
            if (product) {
                await serveHTMLPage(req, res, 'product-detail.html', { product });
            } else {
                await serve404(res);
            }
            break;
            
        case '/cart':
            await serveHTMLPage(req, res, 'cart.html');
            break;
            
        case '/checkout':
            await serveHTMLPage(req, res, 'checkout.html');
            break;
            
        case '/success':
            await serveHTMLPage(req, res, 'success.html');
            break;
            
        default:
            // Try to serve static file
            const staticFilePath = pathname.slice(1); // Remove leading slash
            
            // Security check: prevent directory traversal
            if (staticFilePath.includes('..')) {
                await serve404(res);
                return;
            }
            
            await serveStaticFile(req, res, staticFilePath);
    }
}

/**
 * Create and start the HTTP server
 */
function startServer() {
    const server = http.createServer(requestHandler);
    
    server.listen(PORT, () => {
        console.log('🚀 ChenOne E-commerce Server Started');
        console.log(`📡 Server running at http://localhost:${PORT}`);
        console.log(`📁 Serving files from: ${PUBLIC_DIR}`);
        console.log('📄 Available routes:');
        console.log('   GET / → index.html');
        console.log('   GET /products → products.html');
        console.log('   GET /product?id=123 → product-detail.html');
        console.log('   GET /cart → cart.html');
        console.log('   GET /checkout → checkout.html');
        console.log('   GET /success → success.html');
        console.log('🔌 API endpoints:');
        console.log('   GET /api/products → JSON product list');
        console.log('   GET /api/products?category=pens → JSON filtered products');
        console.log('   GET /api/products?featured=true → JSON featured products');
        console.log('   GET /api/product?id=123 → JSON product data');
        console.log('   GET /api/categories → JSON category list');
        console.log('   GET /api/brands → JSON brand list');
        console.log('   POST /api/submit-order → Submit order data');
        console.log('\n✨ Ready to serve your e-commerce site!');
    });
    
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use`);
            console.log('💡 Try a different port or stop the conflicting process');
        } else {
            console.error('❌ Server error:', err.message);
        }
        process.exit(1);
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server gracefully...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
}

// Start the server
startServer(); 