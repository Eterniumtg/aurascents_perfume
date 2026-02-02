// AuraScents Admin Panel JavaScript
const ADMIN_PASSWORD = 'aurascents2026';
let currentProducts = [];
let currentItems = [];
let editingProductId = null;
let isSyncing = false;

// If running locally without Netlify, disable server sync
let SERVER_ENABLED = true;

// Helper: fetch with timeout
function fetchWithTimeout(url, options = {}, timeout = 1000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout')) , timeout);
        fetch(url, options).then(res => {
            clearTimeout(timer);
            resolve(res);
        }).catch(err => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

// Probe server availability quickly (non-blocking)
async function probeServer() {
    try {
        await fetchWithTimeout('/api/products', { method: 'HEAD' }, 800);
        SERVER_ENABLED = true;
        console.info('Server API available.');
    } catch (err) {
        SERVER_ENABLED = false;
        console.warn('Server API not available. Running in local-only mode.');
    }
    updateServerStatusIndicator();
}

// Update the small indicator in the admin UI
function updateServerStatusIndicator() {
    const el = document.getElementById('serverStatus');
    if (!el) return;
    if (SERVER_ENABLED) {
        el.classList.add('hidden');
    } else {
        el.classList.remove('hidden');
    }
}

// Check authentication
function checkAuth() {
    const isAuth = sessionStorage.getItem('aurascents_admin_auth');
    if (isAuth === 'true') {
        showDashboard();
    }
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('loginPassword').value;

        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('aurascents_admin_auth', 'true');
            document.getElementById('loginError').classList.add('hidden');
            showDashboard();
        } else {
            document.getElementById('loginError').classList.remove('hidden');
        }
    });
}

// Logout
function logout() {
    sessionStorage.removeItem('aurascents_admin_auth');
    document.getElementById('dashboardPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
}

// Show Dashboard
function showDashboard() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.remove('hidden');
    loadProducts();
}

// Default products (fallback)
const defaultProducts = [
    {
        id: 'lady1',
        name: 'Blossom',
        price: 250,
        category: 'ladies',
        image: 'images/ladies-packages.svg',
        items: ['Mini perfume', 'Scented candle', 'Lipgloss and liner', 'Chocolate', 'Handcream', 'Bracelet']
    },
    {
        id: 'lady2',
        name: 'Petal',
        price: 250,
        category: 'ladies',
        image: 'images/ladies-packages.svg',
        items: ['Mini perfume', 'Hairclips', 'Chocolate', 'Purse', 'Necklace', 'Lipgloss']
    },
    {
        id: 'lady3',
        name: 'Muse',
        price: 350,
        category: 'ladies',
        image: 'images/ladies-packages.svg',
        items: ['Mini perfume', 'Body Splash', 'Hand fan', 'Necklace', 'Lipgloss and liner', 'Chocolate']
    },
    {
        id: 'lady4',
        name: 'Signature Luxe',
        price: 580,
        category: 'ladies',
        image: 'images/ladies-packages.svg',
        items: ['Luxury Perfume (100ml)', 'Hand fan', 'Diary', 'Hairclips', 'Champagne', 'Chocolate', 'Handcream']
    },
    {
        id: 'men1',
        name: 'Classic Man',
        price: 450,
        category: 'men',
        image: 'images/men-packages.svg',
        items: ['Perfume', 'Wallet', 'Belt', 'Champagne', 'Chocolate']
    },

    {
        id: 'men2',
        name: 'Timeless',
        price: 500,
        category: 'men',
        image: 'images/men-packages.svg',
        items: ['Perfume (100ml)', 'Watch', 'Bracelet', 'Champagne', 'Chocolate']
    },
    {
        id: 'men3',
        name: 'Heritage',
        price: 700,
        category: 'men',
        image: 'images/men-packages.svg',
        items: ['Luxury Perfume (100ml)', "Men's slippers", 'Wallet', 'Room Diffuser', 'Chocolates', 'Atomizer']
    }
];

// Load products from server API (but fall back to local when server is unavailable)
async function loadProducts() {
    // If server is disabled, skip network call
    if (!SERVER_ENABLED) {
        const stored = localStorage.getItem('aurascents_products');
        if (stored) {
            currentProducts = JSON.parse(stored);
        } else {
            currentProducts = [...defaultProducts];
            localStorage.setItem('aurascents_products', JSON.stringify(currentProducts));
        }
        renderProducts();
        updateStats();
        return;
    }

    try {
        // First try to fetch from server
        const response = await fetchWithTimeout('/api/products', {}, 1500);
        if (response.ok) {
            const serverProducts = await response.json();
            if (Array.isArray(serverProducts) && serverProducts.length > 0) {
                currentProducts = serverProducts;
                // Sync to localStorage as backup
                localStorage.setItem('aurascents_products', JSON.stringify(currentProducts));
            } else {
                // No products on server, use localStorage or defaults
                const stored = localStorage.getItem('aurascents_products');
                if (stored) {
                    currentProducts = JSON.parse(stored);
                } else {
                    currentProducts = [...defaultProducts];
                    localStorage.setItem('aurascents_products', JSON.stringify(currentProducts));
                }
            }
        } else {
            throw new Error('Server request failed');
        }
    } catch (error) {
        console.warn('Could not load from server, using local storage:', error);
        // If server probe failed mid-load, disable server to avoid repeated calls
        SERVER_ENABLED = false;
        updateServerStatusIndicator();
        // Fallback to localStorage
        try {
            const stored = localStorage.getItem('aurascents_products');
            if (stored) {
                currentProducts = JSON.parse(stored);
            } else {
                currentProducts = [...defaultProducts];
                localStorage.setItem('aurascents_products', JSON.stringify(currentProducts));
            }
        } catch (localError) {
            console.error('Error loading products:', localError);
            currentProducts = [...defaultProducts];
        }
    }

    renderProducts();
    updateStats();
}

// Save products to localStorage and (optionally) server, then trigger redeploy
async function saveProducts() {
    try {
        // Always save to localStorage as backup
        localStorage.setItem('aurascents_products', JSON.stringify(currentProducts));

        // If server is disabled, skip trying to sync
        if (!SERVER_ENABLED) {
            showNotification('Products saved locally (no server available).', 'success');
            return true;
        }

        // Try to save to server and trigger redeploy
        if (!isSyncing) {
            isSyncing = true;
            showNotification('Syncing products to server...', 'info');

            try {
                // Save products to server
                const saveResponse = await fetchWithTimeout('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentProducts)
                }, 2000);

                if (saveResponse.ok) {
                    // Trigger redeploy to update storefront
                    const deployResponse = await fetchWithTimeout('/api/trigger-deploy', {
                        method: 'POST'
                    }, 1500);

                    if (deployResponse.ok) {
                        showNotification('Products saved! Site will update shortly.', 'success');
                    } else {
                        showNotification('Products saved. Manual redeploy may be needed.', 'warning');
                    }
                } else {
                    throw new Error('Failed to save to server');
                }
            } catch (serverError) {
                console.warn('Server sync failed:', serverError);
                showNotification('Saved locally. Server sync will retry.', 'warning');
                // disable server to avoid repeated failed calls
                SERVER_ENABLED = false;
                updateServerStatusIndicator();
            } finally {
                isSyncing = false;
            }
        }

        return true;
    } catch (error) {
        console.error('Error saving products:', error);
        showNotification('Error saving products. Storage might be full.', 'error');
        return false;
    }
}

// Render products table
function renderProducts() {
    const tbody = document.getElementById('productsTable');
    
    if (!tbody) {
        console.error('Products table not found');
        return;
    }
    
    if (currentProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-box-open text-4xl mb-4"></i>
                    <p>No products found. Add your first product!</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = currentProducts.map(product => `
        <tr class="hover:bg-gray-50 transition">
            <td class="px-6 py-4">
                <img src="${product.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'}" alt="${product.name}" class="w-16 h-16 object-cover rounded-lg" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">
            </td>
            <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">${product.name}</div>
                <div class="text-xs text-gray-500">ID: ${product.id}</div>
            </td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.category === 'ladies' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                }">
                    ${product.category === 'ladies' ? 'Ladies' : 'Men'}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm font-semibold text-gray-900">GH₵ ${product.price}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-xs text-gray-600">${product.items ? product.items.length : 0} items</div>
            </td>
            <td class="px-6 py-4 text-sm font-medium">
                <div class="flex space-x-2">
                    <button onclick="editProduct('${product.id}')" class="text-blue-600 hover:text-blue-900" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct('${product.id}')" class="text-red-600 hover:text-red-900" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats() {
    const total = currentProducts.length;
    const ladies = currentProducts.filter(p => p.category === 'ladies').length;
    const men = currentProducts.filter(p => p.category === 'men').length;
    const totalValue = currentProducts.reduce((sum, p) => sum + (p.price || 0), 0);

    const totalEl = document.getElementById('totalProducts');
    const ladiesEl = document.getElementById('ladiesCount');
    const menEl = document.getElementById('menCount');
    const valueEl = document.getElementById('totalValue');

    if (totalEl) totalEl.textContent = total;
    if (ladiesEl) ladiesEl.textContent = ladies;
    if (menEl) menEl.textContent = men;
    if (valueEl) valueEl.textContent = `GH₵ ${totalValue}`;
}

// Open add product modal
function openAddProduct() {
    editingProductId = null;
    currentItems = [];
    document.getElementById('modalTitle').textContent = 'Add New Product';
    const form = document.getElementById('productForm');
    if (form) form.reset();
    document.getElementById('productId').value = '';
    document.getElementById('productImageData').value = '';
    const preview = document.getElementById('imagePreview');
    if (preview) preview.classList.add('hidden');
    renderItemsList();
    document.getElementById('productModal').classList.add('active');
}

// Preview image
function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    const file = input.files[0];
    
    if (file) {
        // Check file size (limit to 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showNotification('Image too large. Please use an image under 2MB.', 'error');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            document.getElementById('productImageData').value = e.target.result;
        };
        reader.onerror = function() {
            showNotification('Error reading image file', 'error');
        };
        reader.readAsDataURL(file);
    }
}

// Edit product
function editProduct(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    editingProductId = productId;
    currentItems = product.items ? [...product.items] : [];
    
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productCategory').value = product.category || 'ladies';
    document.getElementById('productPrice').value = product.price || 0;
    document.getElementById('productImageData').value = product.image || '';
    
    const preview = document.getElementById('imagePreview');
    if (product.image) {
        preview.src = product.image;
        preview.classList.remove('hidden');
    } else {
        preview.classList.add('hidden');
    }
    
    renderItemsList();
    document.getElementById('productModal').classList.add('active');
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    currentProducts = currentProducts.filter(p => p.id !== productId);
    if (await trySaveProductsWithGithub()) {
        renderProducts();
        updateStats();
        showNotification('Product deleted successfully!', 'success');
    }
}

// Close product modal
function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    currentItems = [];
    editingProductId = null;
}

// Add item to list
function addItem() {
    const input = document.getElementById('newItem');
    const value = input.value.trim();
    
    if (value) {
        currentItems.push(value);
        input.value = '';
        renderItemsList();
    }
}

// Remove item from list
function removeItem(index) {
    currentItems.splice(index, 1);
    renderItemsList();
}

// Render items list
function renderItemsList() {
    const container = document.getElementById('itemsList');
    
    if (!container) return;
    
    if (currentItems.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 italic">No items added yet</p>';
        return;
    }

    container.innerHTML = currentItems.map((item, index) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-700">${item}</span>
            <button type="button" onclick="removeItem(${index})" class="text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Save product
const productForm = document.getElementById('productForm');
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (currentItems.length === 0) {
            showNotification('Please add at least one item to the package', 'error');
            return;
        }

        const imageData = document.getElementById('productImageData').value;
        if (!imageData && !editingProductId) {
            showNotification('Please upload a product image', 'error');
            return;
        }

        const formData = {
            id: editingProductId || `${document.getElementById('productCategory').value}-${Date.now()}`,
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            image: imageData || (editingProductId ? currentProducts.find(p => p.id === editingProductId).image : ''),
            items: [...currentItems]
        };

        if (editingProductId) {
            const index = currentProducts.findIndex(p => p.id === editingProductId);
            if (index !== -1) {
                currentProducts[index] = formData;
            }
        } else {
            currentProducts.push(formData);
        }

        if (await trySaveProductsWithGithub()) {
            renderProducts();
            updateStats();
            closeProductModal();
            showNotification(`Product ${editingProductId ? 'updated' : 'added'} successfully!`, 'success');
        }
    });
}

// Export products
function exportProducts() {
    try {
        const dataStr = JSON.stringify(currentProducts, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `aurascents-products-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showNotification('Products exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting products:', error);
        showNotification('Error exporting products', 'error');
    }
}

// Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    let bgColor, icon;

    switch(type) {
        case 'success':
            bgColor = 'bg-green-500';
            icon = 'fa-check-circle';
            break;
        case 'error':
            bgColor = 'bg-red-500';
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            bgColor = 'bg-yellow-500';
            icon = 'fa-exclamation-triangle';
            break;
        case 'info':
            bgColor = 'bg-blue-500';
            icon = 'fa-info-circle';
            break;
        default:
            bgColor = 'bg-green-500';
            icon = 'fa-check-circle';
    }

    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-[9999] transition-opacity flex items-center space-x-3`;
    notification.innerHTML = `
        <i class="fas ${icon} text-xl"></i>
        <span class="font-medium">${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// --- GitHub integration helpers ---

function loadGithubSettings() {
    const owner = localStorage.getItem('aurascents_github_owner') || '';
    const repo = localStorage.getItem('aurascents_github_repo') || '';
    const token = localStorage.getItem('aurascents_github_token') || '';

    const ownerEl = document.getElementById('githubOwner');
    const repoEl = document.getElementById('githubRepo');
    const tokenEl = document.getElementById('githubToken');

    if (ownerEl) ownerEl.value = owner;
    if (repoEl) repoEl.value = repo;
    if (tokenEl) tokenEl.value = token;
}

function saveGithubSettings() {
    const owner = document.getElementById('githubOwner').value.trim();
    const repo = document.getElementById('githubRepo').value.trim();
    const token = document.getElementById('githubToken').value.trim();

    if (!owner || !repo || !token) {
        showNotification('Please fill in owner, repo and token', 'error');
        return;
    }

    localStorage.setItem('aurascents_github_owner', owner);
    localStorage.setItem('aurascents_github_repo', repo);
    localStorage.setItem('aurascents_github_token', token);

    showNotification('GitHub settings saved locally', 'success');
    loadGithubSettings();
}

async function testGithubConnection() {
    const owner = document.getElementById('githubOwner').value.trim();
    const repo = document.getElementById('githubRepo').value.trim();
    const token = document.getElementById('githubToken').value.trim();

    const notice = document.getElementById('githubSettingsNotice');
    if (notice) {
        notice.classList.add('hidden');
        notice.textContent = '';
    }

    if (!owner || !repo || !token) {
        showNotification('Please fill in owner, repo and token', 'error');
        return;
    }

    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github+json' }
        });

        if (res.ok) {
            showNotification('GitHub repo connection OK', 'success');
            if (notice) {
                notice.classList.remove('hidden');
                notice.textContent = 'Connection successful. Commits will update data/products.json and trigger deploys.';
            }
        } else {
            const err = await res.json().catch(() => ({}));
            console.warn('GitHub test failed', err);
            showNotification('Could not connect to repository. Check token and permissions.', 'error');
            if (notice) {
                notice.classList.remove('hidden');
                notice.textContent = 'Connection failed. Double-check owner, repo and PAT permissions.';
            }
        }
    } catch (error) {
        console.error('Error testing GitHub connection:', error);
        showNotification('Network error while testing GitHub connection', 'error');
    }
}

// Commit (create/update) data/products.json in the repository using GitHub Contents API
async function commitProductsToGithub(products) {
    const owner = localStorage.getItem('aurascents_github_owner');
    const repo = localStorage.getItem('aurascents_github_repo');
    const token = localStorage.getItem('aurascents_github_token');

    if (!owner || !repo || !token) return { ok: false, message: 'GitHub settings missing' };

    const path = 'data/products.json';
    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const contentStr = JSON.stringify(products, null, 2);
    const contentB64 = btoa(unescape(encodeURIComponent(contentStr)));

    try {
        // Check if file exists to get current sha
        const getRes = await fetch(apiBase, {
            headers: { Accept: 'application/vnd.github+json', Authorization: `token ${token}` }
        });

        let sha;
        if (getRes.ok) {
            const j = await getRes.json();
            sha = j.sha;
        }

        const putBody = {
            message: 'Update products via admin panel',
            content: contentB64
        };
        if (sha) putBody.sha = sha;

        const putRes = await fetch(apiBase, {
            method: 'PUT',
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(putBody)
        });

        if (putRes.ok) {
            return { ok: true };
        } else {
            const err = await putRes.json().catch(() => ({}));
            console.warn('GitHub commit failed', err);
            return { ok: false, message: err.message || 'Commit failed' };
        }
    } catch (error) {
        console.error('Error committing to GitHub:', error);
        return { ok: false, message: error.message };
    }
}

// Update saveProducts to attempt GitHub commit when configured
const originalSaveProducts = saveProducts;
async function trySaveProductsWithGithub() {
    // Always save to localStorage first
    localStorage.setItem('aurascents_products', JSON.stringify(currentProducts));

    // If GitHub settings exist, try to commit
    const owner = localStorage.getItem('aurascents_github_owner');
    const repo = localStorage.getItem('aurascents_github_repo');
    const token = localStorage.getItem('aurascents_github_token');

    if (owner && repo && token) {
        showNotification('Committing products to GitHub...', 'info');
        const res = await commitProductsToGithub(currentProducts);
        if (res.ok) {
            showNotification('Products saved to GitHub! Deployment will follow automatically.', 'success');
            return true;
        } else {
            showNotification(`GitHub commit failed: ${res.message || 'See console'}`, 'error');
            // Fallthrough to original behavior (try server)
        }
    }

    // If GitHub not configured or commit failed, fall back to original save behavior
    return await originalSaveProducts();
}

// Hook up settings buttons
const saveGithubButton = document.getElementById('saveGithubSettings');
if (saveGithubButton) saveGithubButton.addEventListener('click', saveGithubSettings);
const testGithubButton = document.getElementById('testGithubConnection');
if (testGithubButton) testGithubButton.addEventListener('click', testGithubConnection);

// Load settings on start
loadGithubSettings();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await probeServer();
    checkAuth();
});
