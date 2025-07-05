# ChenOne E-commerce - Premium Stationery

A minimalist e-commerce website for premium stationery built with vanilla Node.js using only built-in modules.

## 🚀 Features

- **Pure Node.js**: Built using only `http`, `fs`, `path`, and `url` modules
- **Static File Serving**: Serves HTML, CSS, JS, and images with proper MIME types
- **Custom Routing**: Clean URL routing for different pages
- **Product Management**: Hardcoded product data with detailed information
- **Shopping Cart**: localStorage-based cart functionality
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: Custom 404 and 500 error pages
- **API Endpoints**: JSON API for product data

## 📁 Project Structure

```
ChenOne/
├── server.js              # Main server file
├── package.json           # Project configuration
├── README.md             # This file
└── public/               # Static files directory
    ├── index.html        # Homepage
    ├── products.html     # Product listing page
    ├── product-detail.html # Individual product page
    ├── cart.html         # Shopping cart page
    ├── checkout.html     # Checkout page
    ├── 404.html          # Custom 404 page
    ├── css/              # Stylesheets
    ├── js/               # JavaScript files
    └── images/           # Images and assets
```

## 🛠 Installation & Setup

### Prerequisites
- Node.js (version 14.0.0 or higher)

### Quick Start

1. **Clone or download the project**
   ```bash
   git clone https://github.com/khizarbakhtiar1/chenone.git
   cd ChenOne
   ```

2. **Start the server**
   ```bash
   npm start
   # or
   node server.js
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## 🌐 API Endpoints

### Web Routes
- `GET /` → Homepage (index.html)
- `GET /products` → Product listing page
- `GET /product?id=123` → Individual product page
- `GET /cart` → Shopping cart page
- `GET /checkout` → Checkout page

### API Routes
- `GET /api/products` → JSON list of all products
- `GET /api/product?id=123` → JSON data for specific product

### Static Files
- CSS files: `/css/style.css`
- JavaScript files: `/js/script.js`
- Images: `/images/product.jpg`

## 📊 Sample Data

The server includes sample product data:

```javascript
{
  "1": {
    "id": "1",
    "name": "Premium Fountain Pen",
    "brand": "Lamy",
    "price": 45.99,
    "category": "pens",
    "description": "Experience the art of writing...",
    "colors": ["black", "blue", "silver", "gold"],
    "nibSizes": ["fine", "medium", "broad", "extra-fine"]
  }
  // ... more products
}
```

## 🔧 Configuration

### Port Configuration
The server runs on port 3000 by default. To change this, modify the `PORT` constant in `server.js`:

```javascript
const PORT = 3000; // Change this value
```

### Adding Products
To add new products, edit the `PRODUCTS` object in `server.js`:

```javascript
const PRODUCTS = {
  'new-id': {
    id: 'new-id',
    name: 'Product Name',
    brand: 'Brand Name',
    price: 29.99,
    category: 'category',
    description: 'Product description',
    // ... other properties
  }
};
```

## 🎨 Customization

### Adding New Routes
Add new routes in the `requestHandler` function:

```javascript
case '/new-page':
    await serveHTMLPage(req, res, 'new-page.html');
    break;
```

### Adding MIME Types
Add new file type support in the `MIME_TYPES` object:

```javascript
const MIME_TYPES = {
    '.newext': 'application/new-type',
    // ... existing types
};
```

## 🔒 Security Features

- **Directory Traversal Protection**: Prevents access to files outside the public directory
- **MIME Type Detection**: Proper content type headers for security
- **Input Validation**: Basic URL parsing and validation

## 📱 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 16+

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
1. Set up a production server (Linux/Ubuntu recommended)
2. Install Node.js
3. Copy project files
4. Run with process manager:
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "chenone-ecommerce"
   
   # Or using forever
   npm install -g forever
   forever start server.js
   ```

### Environment Variables
For production, consider adding environment variables:

```javascript
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
```

## 📝 Development Notes

### Adding Database Support
To add database support, modify the product loading:

```javascript
// Replace hardcoded PRODUCTS with database calls
async function getProducts() {
    // Your database logic here
}
```

### Adding Authentication
Consider adding:
- User session management
- Login/logout functionality
- Protected routes

### Performance Optimization
- Add file caching
- Implement compression
- Add CDN support for static assets

## 🐛 Troubleshooting

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change the port number or stop the conflicting process.

### Files Not Found
Ensure all HTML files are in the `public/` directory and the directory structure is correct.

### MIME Type Issues
If CSS/JS files aren't loading properly, check the `MIME_TYPES` configuration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with vanilla Node.js for educational purposes
- Inspired by modern e-commerce design patterns
- Uses semantic HTML5 and responsive CSS

---

**Happy coding! 🎉** 