// Global Variables
const productsContainer = document.getElementById('products-container'); // The container where products are displayed
const cartItemsContainer = document.getElementById('cart-items'); // Container for cart items
const cartTotal = document.getElementById('cart-total'); // Element displaying total price of the cart
const productContainer = document.getElementById('product-container'); // Container for displaying individual product details
let cart = []; // Array to hold cart items

// Fetch products from API (for ecom.html)
async function fetchProducts() {
    // Check if products are cached in localStorage
    const cachedProducts = localStorage.getItem('products');
    if (cachedProducts) {
        // If cached products exist, display them
        console.log(cachedProducts);
        displayProducts(JSON.parse(cachedProducts)); // Display cached products
        return;
    }

    try {
        // Fetch products from the external API
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const products = await response.json();
        localStorage.setItem('products', JSON.stringify(products)); // Cache the fetched products
        displayProducts(products); // Display the products
    } catch (error) {
        // Handle errors if fetching fails
        console.error('Error:', error);
        productsContainer.innerHTML = '<p>Failed to load products. Please try again later.</p>';
    }
}

// Display products on the ecom.html page
function displayProducts(products) {
    productsContainer.innerHTML = ''; // Clear the products container
    products.forEach(product => {
        // Create and display each product in the grid
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <button onclick="addToCart(${product.id}, '${product.title.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', ${product.price}, '${product.image}')">Add to Cart</button>
            <button onclick="viewProductDetail(${product.id})">View Details</button>
        `;
        productsContainer.appendChild(productDiv); // Add the product div to the container
    });
}

// View product detail (redirect to product.html with product ID)
function viewProductDetail(id) {
    window.location.href = `product.html?id=${id}`; // Redirect to the product detail page with the product ID
}

// Fetch and display product details (for product.html)
async function fetchProductDetail() {
    const urlParams = new URLSearchParams(window.location.search); // Get the query parameters from the URL
    const productId = urlParams.get('id'); // Extract the product ID from the URL parameters

    // Check if the product details are cached
    const cachedProducts = localStorage.getItem('products');
    if (cachedProducts) {
        const products = JSON.parse(cachedProducts);
        const product = products.find(p => p.id == productId); // Find the product by ID

        if (product) {
            // If the product is found in the cache, display its details
            displayProductDetail(product);
            return; // Stop here as the product is already in cache
        }
    }

    // If product details aren't cached, fetch them from the API
    try {
        const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }
        const product = await response.json();
        displayProductDetail(product); // Display the fetched product details
    } catch (error) {
        console.error('Error:', error);
        productContainer.innerHTML = '<p>Failed to load product details. Please try again later.</p>';
    }
}

// Display product details on the product.html page
function displayProductDetail(product) {
    // Ensure rating is a valid number and display a star rating
    const rating = parseFloat(product.rating.rate) || 0;  // Default to 0 if not a valid number

    productContainer.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <h2>${product.title}</h2>
        <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Description:</strong> ${product.description}</p>
        <div class="product-rating">
            ${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5 - Math.floor(rating))} 
            <span>(${rating.toFixed(1)})</span>
        </div>
    `;
}

// Add product to the cart (for ecom.html)
function addToCart(id, title, price, image) {
    console.log('Adding to cart:', { id, title, price, image });

    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Get the current cart from localStorage
    const existingItem = cart.find(item => item.id === id); // Check if the product is already in the cart

    if (existingItem) {
        // If the product is already in the cart, increment its quantity
        console.log('Product already in cart. Incrementing quantity.');
        existingItem.quantity++;
    } else {
        // If the product is not in the cart, add it as a new item
        console.log('Adding new product to cart.');
        cart.push({ id, title, price, quantity: 1, image });
    }

    localStorage.setItem('cart', JSON.stringify(cart)); // Save the updated cart to localStorage
    updateCartCount(); // Update the cart count

    const cartMessage = document.getElementById('cart-message');
    cartMessage.style.display = 'block'; // Show the "Product added" message
    
    // Hide the message after 1 second
    setTimeout(() => {
        cartMessage.style.display = 'none';
    }, 1000);
}

// Update cart UI (for cart.html)
function updateCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || []; // Get the cart from localStorage

    cartItemsContainer.innerHTML = ''; // Clear the current cart items display

    let total = 0; // Variable to keep track of the total cost

    // Loop through each cart item and display it
    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        
        // Create HTML content for each cart item
        cartItemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <p>${item.title} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</p>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        
        // Add the item to the cart items container
        cartItemsContainer.appendChild(cartItemDiv);

        // Add to the total price calculation
        total += item.price * item.quantity;
    });

    // Update the total price in the cart
    const cartTotal = document.getElementById('cart-total');
    cartTotal.textContent = total.toFixed(2);
}

// Update the cart item count on the navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || []; // Get the cart from localStorage
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); // Calculate the total items in the cart
    const cartCountElement = document.getElementById('cart-count'); // Get the cart count element

    if (cartCountElement) {
        // Update the cart item count
        cartCountElement.textContent = totalItems;
    }
}

// Remove product from the cart
function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Get the cart from localStorage
    cart = cart.filter(item => item.id !== id); // Remove the item with the given ID
    localStorage.setItem('cart', JSON.stringify(cart)); // Save the updated cart to localStorage
    updateCart(); // Update the cart display
}

// Initialize the app based on the current page
if (document.getElementById('products-container')) {
    fetchProducts();  // For ecom.html, fetch and display products
}

if (document.getElementById('cart-items')) {
    updateCart();  // For cart.html, update the cart display
}

if (document.getElementById('product-container')) {
    fetchProductDetail();  // For product.html, fetch and display product details
}
