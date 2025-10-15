document.addEventListener('DOMContentLoaded', () => {
    // --- All Element Selections ---
    const productGrid = document.getElementById('product-grid');
    const searchBar = document.getElementById('search-bar');
    const productModal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal');
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountSpan = document.getElementById('cart-count');
    const cartTotalSpan = document.getElementById('cart-total');
    const toast = document.getElementById('toast');
    const loginLink = document.getElementById('login-link');
    const userInfo = document.getElementById('user-info');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-button');
    const checkoutTitle = document.getElementById('checkout-title');
    const progressBar = document.getElementById('progress-bar');
    const checkoutFooter = document.getElementById('checkout-footer');
    const cartStep = document.getElementById('cart-step');
    const addressStep = document.getElementById('address-step');
    const paymentStep = document.getElementById('payment-step');
    const confirmationStep = document.getElementById('confirmation-step');
    const addressForm = document.getElementById('address-form');
    const checkoutButton = document.getElementById('checkout-button');
    const placeOrderButton = document.getElementById('place-order-button');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const viewOrdersBtn = document.getElementById('view-orders-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const ordersStep = document.getElementById('orders-step');
    const orderHistoryContainer = document.getElementById('order-history-container');

    let products = [];
    let cart = [];
    let debounceTimer;

    // --- Helper function for authenticated API requests ---
    async function fetchWithAuth(url, options = {}) {
        const token = getToken();
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) { headers['x-auth-token'] = token; }
        return fetch(url, { ...options, headers });
    }

    // --- Fetch initial data ---
    async function fetchProducts(searchTerm = '') {
        let url = 'http://localhost:5000/api/products';
        if (searchTerm) { url = `http://localhost:5000/api/products/search?q=${searchTerm}`; }
        try {
            const response = await fetch(url);
            if (!response.ok) { throw new Error('Network response was not ok'); }
            products = await response.json();
            renderProducts();
            await loadUserData();
        } catch (error) {
            console.error('Failed to fetch products:', error);
            productGrid.innerHTML = '<p class="text-center text-red-500 col-span-full">Failed to load products. Ensure backend is running.</p>';
        }
    }

    // --- Load user's cart from DB ---
    async function loadUserData() {
        if (!getToken()) { cart = []; updateCart(); return; }
        try {
            const res = await fetchWithAuth('http://localhost:5000/api/users/cart');
            if (!res.ok) throw new Error('Failed to fetch cart');
            const dbCart = await res.json();
            const populatedCart = dbCart.map(item => {
                const product = products.find(p => p.id === item.productId);
                return product ? { ...product, quantity: item.quantity } : null;
            }).filter(item => item !== null);
            cart = populatedCart;
        } catch (error) { console.error(error.message); cart = []; }
        updateCart();
    }

    // --- Add to Cart in DB ---
    async function addToCart(productId) {
        if (!getToken()) { alert('Please log in to add items to your cart.'); return; }
        try {
            await fetchWithAuth('http://localhost:5000/api/users/cart', {
                method: 'POST',
                body: JSON.stringify({ productId: parseInt(productId), quantity: 1 })
            });
            showToast('Item added to cart!');
            await loadUserData();
        } catch (error) { showToast('Error adding item.'); }
    }

    // --- Remove from Cart in DB ---
    async function handleCartActions(e) {
        const target = e.target.closest('button.remove-item');
        if (!target) return;
        const productId = parseInt(target.dataset.id);
        try {
            await fetchWithAuth(`http://localhost:5000/api/users/cart/${productId}`, { method: 'DELETE' });
            await loadUserData();
        } catch (error) { console.error(error.message); }
    }

    // --- NEW: Place Order Logic ---
    placeOrderButton.addEventListener('click', async () => {
        placeOrderButton.textContent = "Processing...";
        placeOrderButton.disabled = true;

        try {
            const shippingAddress = {
                fullName: document.getElementById('fullName').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                pincode: document.getElementById('pincode').value,
            };

            const res = await fetchWithAuth('http://localhost:5000/api/orders', {
                method: 'POST',
                body: JSON.stringify({ shippingAddress })
            });

            if (!res.ok) throw new Error('Failed to place order.');

            const order = await res.json();
            
            document.getElementById('final-order-summary').innerHTML = `
                <p><strong>Total:</strong> ₹${order.totalAmount.toLocaleString('en-IN')}</p>
                <p class="mt-2"><strong>Shipping to:</strong></p>
                <p class="text-sm text-gray-600">${order.shippingAddress.fullName}<br>${order.shippingAddress.address}<br>${order.shippingAddress.city}, ${order.shippingAddress.pincode}</p>
            `;
            
            navigateToCheckoutStep(4);
            cart = [];
            updateCart();

        } catch (error) {
            alert(error.message);
        } finally {
            placeOrderButton.textContent = "Place Order";
            placeOrderButton.disabled = false;
        }
    });
    
    // --- NEW: Order History Logic ---
    async function showOrderHistory() {
        cartStep.classList.add('hidden');
        ordersStep.classList.remove('hidden');
        checkoutFooter.classList.add('hidden');
        checkoutTitle.textContent = "Your Orders";

        orderHistoryContainer.innerHTML = '<p>Loading order history...</p>';

        try {
            const res = await fetchWithAuth('http://localhost:5000/api/orders');
            if (!res.ok) throw new Error('Could not fetch orders.');
            const orders = await res.json();

            if (orders.length === 0) {
                orderHistoryContainer.innerHTML = '<p class="text-gray-500 text-center">You have no past orders.</p>';
                return;
            }

            orderHistoryContainer.innerHTML = orders.map(order => `
                <div class="border rounded-lg p-4">
                    <div class="flex justify-between items-center border-b pb-2 mb-2">
                        <div>
                            <p class="font-bold">Order #${order._id.slice(-6)}</p>
                            <p class="text-sm text-gray-500">${new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                        <p class="font-bold text-lg">₹${order.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        ${order.products.map(p => `<p class="text-sm text-gray-600">${p.name} (x${p.quantity})</p>`).join('')}
                    </div>
                </div>
            `).join('');
        } catch (error) {
            orderHistoryContainer.innerHTML = `<p class="text-red-500 text-center">${error.message}</p>`;
        }
    }

    // --- All other functions and event listeners ---
    function renderProducts() { /* ... unchanged ... */ }
    function updateAuthUI() { /* ... unchanged ... */ }
    function updateCart() { /* ... unchanged ... */ }
    function saveAddress(address) { /* ... unchanged ... */ }
    function loadAddress() { /* ... unchanged ... */ }
    function navigateToCheckoutStep(step) { /* ... unchanged ... */ }
    function showProductModal(productId) { /* ... unchanged ... */ }
    function hideProductModal() { /* ... unchanged ... */ }
    function showCart() { /* ... unchanged ... */ }
    function hideCart() { /* ... unchanged ... */ }
    function showToast(message) { /* ... unchanged ... */ }
    
    function initialize() {
        updateAuthUI();
        fetchProducts();
        
        // Event Listeners
        viewOrdersBtn.addEventListener('click', showOrderHistory);
        viewCartBtn.addEventListener('click', () => {
            ordersStep.classList.add('hidden');
            cartStep.classList.remove('hidden');
            checkoutFooter.classList.remove('hidden');
            checkoutTitle.textContent = "Your Cart";
        });
        
        searchBar.addEventListener('input', (e) => { const searchTerm = e.target.value.trim(); clearTimeout(debounceTimer); debounceTimer = setTimeout(() => { fetchProducts(searchTerm); }, 300); });
        logoutButton.addEventListener('click', logout);
        productGrid.addEventListener('click', (e) => { const target = e.target; if (target.classList.contains('product-image')) { showProductModal(target.dataset.id); } else if (target.closest('.add-to-cart-btn')) { addToCart(target.closest('.add-to-cart-btn').dataset.id); } });
        modalBody.addEventListener('click', (e) => { if (e.target.closest('.add-to-cart-btn')) { addToCart(e.target.closest('.add-to-cart-btn').dataset.id); hideProductModal(); } });
        checkoutButton.addEventListener('click', () => { const token = getToken(); if (!token) { alert('Please log in to proceed to checkout.'); window.location.href = 'login.html'; return; } navigateToCheckoutStep(2); });
        addressForm.addEventListener('submit', (e) => { e.preventDefault(); const address = { fullName: document.getElementById('fullName').value, address: document.getElementById('address').value, city: document.getElementById('city').value, pincode: document.getElementById('pincode').value, }; saveAddress(address); navigateToCheckoutStep(3); });
        continueShoppingBtn.addEventListener('click', hideCart);
        closeModalBtn.addEventListener('click', hideProductModal);
        productModal.addEventListener('click', (e) => { if (e.target === productModal) hideProductModal(); });
        cartButton.addEventListener('click', showCart);
        closeCartBtn.addEventListener('click', hideCart);
        cartItemsContainer.addEventListener('click', handleCartActions);
    }

    // --- Full versions of unchanged functions for safety ---
    function renderProducts() { productGrid.innerHTML = ''; if (products.length === 0) { productGrid.innerHTML = '<p class="text-center text-gray-500 col-span-full">No products found.</p>'; return; } products.forEach(product => { productGrid.innerHTML += `<div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"><img src="${product.image}" alt="${product.name}" class="w-full h-56 object-cover cursor-pointer product-image" data-id="${product.id}"><div class="p-4"><h3 class="text-lg font-semibold text-gray-800">${product.name}</h3><p class="text-gray-600 mt-1">₹${product.price.toLocaleString('en-IN')}</p><button class="add-to-cart-btn w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition" data-id="${product.id}">Add to Cart</button></div></div>`; }); }
    function updateAuthUI() { const token = getToken(); const userName = getUserName(); if (token && userName) { loginLink.classList.add('hidden'); userInfo.classList.remove('hidden'); userInfo.classList.add('flex'); welcomeMessage.textContent = `Welcome, ${userName.split(' ')[0]}!`; } else { loginLink.classList.remove('hidden'); userInfo.classList.add('hidden'); userInfo.classList.remove('flex'); } }
    function updateCart() { cartItemsContainer.innerHTML = ''; let total = 0; let totalItems = 0; if (cart.length === 0) { cartItemsContainer.innerHTML = `<p class="text-gray-500 text-center py-8">Your cart is empty.</p>`; } else { cart.forEach(item => { cartItemsContainer.innerHTML += `<div class="flex items-center justify-between py-3 border-b"><div class="flex items-center space-x-4"><img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded"><div><p class="font-semibold">${item.name}</p><p class="text-sm text-gray-500">₹${item.price.toLocaleString('en-IN')}</p></div></div><div class="flex items-center space-x-2"><span class="font-semibold">Qty: ${item.quantity}</span><button class="remove-item text-red-500 hover:text-red-700" data-id="${item.productId || item.id}"><i class="fas fa-trash"></i></button></div></div>`; total += item.price * item.quantity; totalItems += item.quantity; }); } cartCountSpan.textContent = totalItems; cartTotalSpan.textContent = `₹${total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`; checkoutButton.disabled = cart.length === 0; }
    function saveAddress(address) { const userName = getUserName(); if(userName) { localStorage.setItem(`address_${userName}`, JSON.stringify(address)); } }
    function loadAddress() { const userName = getUserName(); if(userName) { const savedAddress = localStorage.getItem(`address_${userName}`); if(savedAddress) { const address = JSON.parse(savedAddress); document.getElementById('fullName').value = address.fullName; document.getElementById('address').value = address.address; document.getElementById('city').value = address.city; document.getElementById('pincode').value = address.pincode; } } }
    function navigateToCheckoutStep(step) { cartStep.classList.add('hidden'); addressStep.classList.add('hidden'); paymentStep.classList.add('hidden'); confirmationStep.classList.add('hidden'); checkoutButton.classList.add('hidden'); placeOrderButton.classList.add('hidden'); for(let i=1; i<=4; i++) { document.getElementById(`progress-step-${i}`).classList.remove('active'); } document.getElementById(`progress-step-${step}`).classList.add('active'); if (step === 1) { checkoutTitle.textContent = "Your Cart"; progressBar.classList.add('hidden'); cartStep.classList.remove('hidden'); checkoutButton.classList.remove('hidden'); checkoutFooter.classList.remove('hidden'); } else if (step === 2) { checkoutTitle.textContent = "Checkout"; progressBar.classList.remove('hidden'); addressStep.classList.remove('hidden'); loadAddress(); checkoutFooter.classList.add('hidden'); } else if (step === 3) { paymentStep.classList.remove('hidden'); placeOrderButton.classList.remove('hidden'); checkoutFooter.classList.remove('hidden'); } else if (step === 4) { confirmationStep.classList.remove('hidden'); checkoutFooter.classList.add('hidden'); progressBar.classList.remove('hidden'); document.getElementById(`progress-step-${4}`).classList.add('active'); } }
    function showProductModal(productId) { const product = products.find(p => p.id === parseInt(productId)); if (!product) return; modalBody.innerHTML = `<div class="sm:w-1/2"><img src="${product.image}" alt="${product.name}" class="w-full h-auto rounded-lg"></div><div class="sm:w-1/2 mt-4 sm:mt-0"><h2 class="text-2xl font-bold text-gray-800">${product.name}</h2><p class="text-2xl font-semibold text-indigo-600 my-3">₹${product.price.toLocaleString('en-IN')}</p><p class="text-gray-600 leading-relaxed">${product.description}</p><button class="add-to-cart-btn w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition" data-id="${product.id}">Add to Cart</button></div>`; document.body.classList.add('modal-open'); productModal.classList.remove('hidden'); setTimeout(() => productModal.classList.add('visible'), 10); }
    function hideProductModal() { productModal.classList.remove('visible'); setTimeout(() => { productModal.classList.add('hidden'); document.body.classList.remove('modal-open'); }, 300); }
    function showCart() { navigateToCheckoutStep(1); document.body.classList.add('modal-open'); cartModal.classList.remove('hidden'); setTimeout(() => cartModal.classList.add('visible'), 10); }
    function hideCart() { cartModal.classList.remove('visible'); setTimeout(() => { cartModal.classList.add('hidden'); document.body.classList.remove('modal-open'); }, 300); }
    function showToast(message) { toast.textContent = message; toast.classList.add('visible'); setTimeout(() => toast.classList.remove('visible'), 2000); }
    
    initialize();
});