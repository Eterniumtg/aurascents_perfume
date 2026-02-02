// Build script to fetch products from Netlify Blobs and generate storefront.js
import { getStore } from "@netlify/blobs";
import * as fs from "fs";
import * as path from "path";

// Default products (fallback if no products in Blobs)
const defaultProducts = [
  {
    id: 'lady1',
    name: 'Blossom',
    price: 250,
    category: 'ladies',
    image: 'images/ladies-packages.jpeg',
    items: ['Mini perfume', 'Scented candle', 'Lipgloss and liner', 'Chocolate', 'Handcream', 'Bracelet']
  },
  {
    id: 'lady2',
    name: 'Petal',
    price: 250,
    category: 'ladies',
    image: 'images/ladies-packages.jpeg',
    items: ['Mini perfume', 'Hairclips', 'Chocolate', 'Purse', 'Necklace', 'Lipgloss']
  },
  {
    id: 'lady3',
    name: 'Muse',
    price: 350,
    category: 'ladies',
    image: 'images/ladies-packages.jpeg',
    items: ['Mini perfume', 'Body Splash', 'Hand fan', 'Necklace', 'Lipgloss and liner', 'Chocolate']
  },
  {
    id: 'lady4',
    name: 'Signature Luxe',
    price: 580,
    category: 'ladies',
    image: 'images/ladies-packages.jpeg',
    items: ['Luxury Perfume (100ml)', 'Hand fan', 'Diary', 'Hairclips', 'Champagne', 'Chocolate', 'Handcream']
  },
  {
    id: 'men1',
    name: 'Classic Man',
    price: 450,
    category: 'men',
    image: 'images/men-packages.jpeg',
    items: ['Perfume', 'Wallet', 'Belt', 'Champagne', 'Chocolate']
  },
  {
    id: 'men2',
    name: 'Timeless',
    price: 500,
    category: 'men',
    image: 'images/men-packages.jpeg',
    items: ['Perfume (100ml)', 'Watch', 'Bracelet', 'Champagne', 'Chocolate']
  },
  {
    id: 'men3',
    name: 'Heritage',
    price: 700,
    category: 'men',
    image: 'images/men-packages.jpeg',
    items: ['Luxury Perfume (100ml)', "Men's slippers", 'Wallet', 'Room Diffuser', 'Chocolates', 'Atomizer']
  }
];

async function generateStorefrontJs() {
  let products = defaultProducts;

  try {
    // Check if we have Netlify context (running in Netlify build)
    if (process.env.NETLIFY) {
      console.log("Running in Netlify build environment, fetching products from Blobs...");
      const store = getStore("products");
      const storedProducts = await store.get("all-products", { type: "json" });

      if (storedProducts && Array.isArray(storedProducts) && storedProducts.length > 0) {
        console.log(`Found ${storedProducts.length} products in Blobs`);
        products = storedProducts;
      } else {
        console.log("No products found in Blobs, using defaults");
      }
    } else {
      console.log("Not running in Netlify environment, using default products");
    }
  } catch (error) {
    console.error("Error fetching products from Blobs:", error);
    console.log("Using default products as fallback");
  }

  // Generate the storefront.js content
  const storefrontJs = `// AuraScents Storefront JavaScript
// Auto-generated during build - DO NOT EDIT MANUALLY

// Products loaded from server
const defaultProducts = ${JSON.stringify(products, null, 2)};

let allProducts = [];
let cart = [];

// Load products
function loadProducts() {
    allProducts = [...defaultProducts];
}

// Initialize and render products
function initProducts() {
    loadProducts();

    const ladiesProducts = allProducts.filter(p => p.category === 'ladies');
    const menProducts = allProducts.filter(p => p.category === 'men');

    renderProducts('ladies', ladiesProducts);
    renderProducts('men', menProducts);
}

function renderProducts(category, items) {
    const container = document.getElementById(\`\${category}Products\`);

    if (!container) {
        console.error(\`Container not found: \${category}Products\`);
        return;
    }

    if (items.length === 0) {
        container.innerHTML = \`
            <div class="col-span-full text-center py-12">
                <i class="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No products available</p>
            </div>
        \`;
        return;
    }

    container.innerHTML = items.map(product => \`
        <div class="product-card fade-in">
            <div class="product-badge">
                <i class="fas fa-star star-icon mr-1"></i> Featured
            </div>
            <div class="p-6 md:p-8">
                <img src="\${product.image}" alt="\${product.name}" class="product-image" onerror="this.style.display='none'">

                <div class="text-center mb-6">
                    <i class="fas fa-gift text-5xl md:text-6xl text-primary mb-4"></i>
                    <h3 class="text-xl md:text-2xl font-display font-bold text-dark mb-2">\${product.name}</h3>
                    <div class="price-tag">
                        <span class="currency-symbol">GH₵</span>\${product.price}
                    </div>
                </div>

                <div class="space-y-2 mb-6">
                    \${product.items.map(item => \`
                        <div class="package-item flex items-start">
                            <i class="fas fa-check text-secondary mr-2 mt-1 flex-shrink-0"></i>
                            <span class="text-gray-700 text-sm md:text-base">\${item}</span>
                        </div>
                    \`).join('')}
                </div>

                <button onclick="addToCart('\${product.id}')" class="btn-primary w-full text-sm md:text-base">
                    <i class="fas fa-cart-plus mr-2"></i>Add to Cart
                </button>
            </div>
        </div>
    \`).join('');
}

// Cart Functions
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);

    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCart();
    showNotification(\`\${product.name} added to cart!\`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
        }
    }
}

function updateCart() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }

    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = \`
            <div class="text-center py-12">
                <i class="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Your cart is empty</p>
            </div>
        \`;
    } else {
        cartItems.innerHTML = cart.map(item => \`
            <div class="cart-item">
                <div class="flex-1">
                    <h4 class="font-bold text-dark text-sm md:text-base">\${item.name}</h4>
                    <p class="text-xs md:text-sm text-gray-600">GH₵ \${item.price} each</p>
                </div>
                <div class="flex items-center space-x-2 md:space-x-3">
                    <button onclick="updateQuantity('\${item.id}', -1)" class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-200 hover:bg-primary hover:text-white transition">
                        <i class="fas fa-minus text-xs"></i>
                    </button>
                    <span class="font-bold w-6 md:w-8 text-center text-sm md:text-base">\${item.quantity}</span>
                    <button onclick="updateQuantity('\${item.id}', 1)" class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-200 hover:bg-primary hover:text-white transition">
                        <i class="fas fa-plus text-xs"></i>
                    </button>
                    <button onclick="removeFromCart('\${item.id}')" class="ml-2 md:ml-4 text-red-500 hover:text-red-700">
                        <i class="fas fa-trash text-sm md:text-base"></i>
                    </button>
                </div>
            </div>
        \`).join('');
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartTotalElement = document.getElementById('cartTotal');
    if (cartTotalElement) {
        cartTotalElement.textContent = \`GH₵ \${total}\`;
    }
}

function openCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderSummary = cart.map(item => \`\${item.quantity}x \${item.name}\`).join(', ');
    const message = \`Hi! I'd like to order: \${orderSummary}. Total: GH₵ \${total}\`;
    const whatsappUrl = \`https://wa.me/233206845402?text=\${encodeURIComponent(message)}\`;

    window.open(whatsappUrl, '_blank');
}

// Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    notification.className = \`fixed top-24 right-4 \${bgColor} text-white px-4 md:px-6 py-3 rounded-full shadow-lg z-50 transition-opacity text-sm md:text-base\`;
    notification.innerHTML = \`<i class="fas \${icon} mr-2"></i>\${message}\`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Scroll Functions
function scrollToSection(section) {
    const element = document.getElementById(section);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile Menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Scroll to Top Button
window.addEventListener('scroll', () => {
    const scrollTop = document.getElementById('scrollTop');
    if (scrollTop) {
        if (window.scrollY > 300) {
            scrollTop.classList.add('show');
        } else {
            scrollTop.classList.remove('show');
        }
    }
});

// Close cart when clicking outside
const cartModal = document.getElementById('cartModal');
if (cartModal) {
    cartModal.addEventListener('click', (e) => {
        if (e.target.id === 'cartModal') {
            closeCart();
        }
    });
}

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                const mobileMenu = document.getElementById('mobileMenu');
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Initialize products
    initProducts();
});
`;

  // Write the generated storefront.js
  const outputPath = path.join(process.cwd(), "js", "storefront.js");
  fs.writeFileSync(outputPath, storefrontJs, "utf8");
  console.log(`Generated storefront.js with ${products.length} products`);
}

generateStorefrontJs().catch(console.error);
