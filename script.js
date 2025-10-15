document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections (including new checkout elements) ---
    const productGrid = document.getElementById('product-grid');
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
    
    // New Checkout Modal Elements
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

   const products = [
    { id: 1, name: 'Wireless Headphones', price: 2499, image: 'images/headphones.jpg', description: 'High-fidelity wireless headphones with noise-cancellation and a 20-hour battery life.' },
    { id: 2, name: 'Smartwatch Series 7', price: 14999, image: 'images/smartwatch.jpg', description: 'The latest smartwatch with a larger display, advanced health sensors, and faster charging.' },
    { id: 3, name: 'Ergonomic Mouse', price: 1899, image: 'images/mouse.jpg', description: 'A comfortable ergonomic mouse designed to reduce strain, featuring customizable buttons.' },
    { id: 4, name: 'Mechanical Keyboard', price: 4500, image: 'images/mechanicalkey.jpg', description: 'A durable mechanical keyboard with satisfying tactile feedback and RGB backlighting.' },
    { id: 5, name: '4K Ultra HD Monitor', price: 22500, image: 'images/monitor.jpg', description: 'A stunning 27-inch 4K monitor with vibrant colors and sharp details.' },
    { id: 6, name: 'Portable SSD 1TB', price: 6999, image: 'images/ssd.webp', description: 'A fast and compact 1TB portable SSD for transferring large files in seconds.' },
    { id: 7, name: 'Leather Backpack', price: 3499, image: 'images/backpack.jpg', description: 'A stylish and functional leather backpack with a padded laptop sleeve.' },
    { id: 8, name: 'Insulated Water Bottle', price: 799, image: 'images/bottle.webp', description: 'Keep your drinks cold for 24 hours or hot for 12 hours with this sleek bottle.' },
    { id: 9, name: 'Gaming Console', price: 45000, image: 'images/game.jpg', description: 'Next-generation gaming console for an immersive 4K gaming experience.' },
    { id: 10, name: 'Bluetooth Speaker', price: 2999, image: 'images/speaker.webp', description: 'A portable Bluetooth speaker with rich bass and 360-degree sound. Waterproof.' },
    { id: 11, name: 'Espresso Machine', price: 8990, image: 'images/coffe.jpg', description: 'A compact espresso machine to brew barista-quality coffee at home.' },
    { id: 12, name: 'Yoga Mat', price: 1299, image: 'images/yoga.jpg', description: 'A premium, non-slip yoga mat that provides excellent cushioning and support.' },
];

    let cart = [];

    // --- Authentication UI ---
    function updateAuthUI() {
        const user = getCurrentUser();
        if (user) {
            loginLink.classList.add('hidden');
            userInfo.classList.remove('hidden');
            userInfo.classList.add('flex');
            welcomeMessage.textContent = `Welcome, ${user.name.split(' ')[0]}!`;
        } else {
            loginLink.classList.remove('hidden');
            userInfo.classList.add('hidden');
            userInfo.classList.remove('flex');
        }
    }

    // --- Data Persistence (Cart & Address) ---
    function loadUserData() {
        const user = getCurrentUser();
        if (user) {
            const savedCart = localStorage.getItem(`cart_${user.email}`);
            cart = savedCart ? JSON.parse(savedCart) : [];
        } else {
            cart = [];
        }
        updateCart();
    }

    function saveCart() {
        const user = getCurrentUser();
        if (user) {
            localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
        }
    }
    
    function saveAddress(address) {
        const user = getCurrentUser();
        if(user) {
            localStorage.setItem(`address_${user.email}`, JSON.stringify(address));
        }
    }
    
    function loadAddress() {
        const user = getCurrentUser();
        if(user) {
            const savedAddress = localStorage.getItem(`address_${user.email}`);
            if(savedAddress) {
                const address = JSON.parse(savedAddress);
                document.getElementById('fullName').value = address.fullName;
                document.getElementById('address').value = address.address;
                document.getElementById('city').value = address.city;
                document.getElementById('pincode').value = address.pincode;
            }
        }
    }

    // --- NEW: Checkout Flow Management ---
    function navigateToCheckoutStep(step) {
        cartStep.classList.add('hidden');
        addressStep.classList.add('hidden');
        paymentStep.classList.add('hidden');
        confirmationStep.classList.add('hidden');
        checkoutButton.classList.add('hidden');
        placeOrderButton.classList.add('hidden');

        for(let i=1; i<=4; i++) {
             document.getElementById(`progress-step-${i}`).classList.remove('active');
        }
        document.getElementById(`progress-step-${step}`).classList.add('active');
        
        if (step === 1) { // Cart Review
            checkoutTitle.textContent = "Your Cart";
            progressBar.classList.add('hidden');
            cartStep.classList.remove('hidden');
            checkoutButton.classList.remove('hidden');
            checkoutFooter.classList.remove('hidden');
        } else if (step === 2) { // Address
            checkoutTitle.textContent = "Checkout";
            progressBar.classList.remove('hidden');
            addressStep.classList.remove('hidden');
            loadAddress();
            checkoutFooter.classList.add('hidden');
        } else if (step === 3) { // Payment
            paymentStep.classList.remove('hidden');
            placeOrderButton.classList.remove('hidden');
            checkoutFooter.classList.remove('hidden');
        } else if (step === 4) { // Confirmation
            confirmationStep.classList.remove('hidden');
            checkoutFooter.classList.add('hidden');
            progressBar.classList.remove('hidden');
            document.getElementById(`progress-step-4`).classList.add('active');
        }
    }

    // --- Product Rendering & Modals ---
    function renderProducts() {
        productGrid.innerHTML = '';
        products.forEach(product => {
            productGrid.innerHTML += `
                <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-56 object-cover cursor-pointer product-image" data-id="${product.id}">
                    <div class="p-4">
                        <h3 class="text-lg font-semibold text-gray-800">${product.name}</h3>
                        <p class="text-gray-600 mt-1">₹${product.price.toLocaleString('en-IN')}</p>
                        <button class="add-to-cart-btn w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition" data-id="${product.id}">Add to Cart</button>
                    </div>
                </div>`;
        });
    }

    function showProductModal(productId) {
        const product = products.find(p => p.id === parseInt(productId));
        if (!product) return;
        modalBody.innerHTML = `
            <div class="sm:w-1/2"><img src="${product.image}" alt="${product.name}" class="w-full h-auto rounded-lg"></div>
            <div class="sm:w-1/2 mt-4 sm:mt-0">
                <h2 class="text-2xl font-bold text-gray-800">${product.name}</h2>
                <p class="text-2xl font-semibold text-indigo-600 my-3">₹${product.price.toLocaleString('en-IN')}</p>
                <p class="text-gray-600 leading-relaxed">${product.description}</p>
                <button class="add-to-cart-btn w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition" data-id="${product.id}">Add to Cart</button>
            </div>`;
        document.body.classList.add('modal-open');
        productModal.classList.remove('hidden');
        setTimeout(() => productModal.classList.add('visible'), 10);
    }

    function hideProductModal() {
        productModal.classList.remove('visible');
        setTimeout(() => {
            productModal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }, 300);
    }

    function showCart() {
        navigateToCheckoutStep(1);
        document.body.classList.add('modal-open');
        cartModal.classList.remove('hidden');
        setTimeout(() => cartModal.classList.add('visible'), 10);
    }

    function hideCart() {
        cartModal.classList.remove('visible');
        setTimeout(() => {
            cartModal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }, 300);
    }
    
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 2000);
    }

    // --- Cart Management ---
    function addToCart(productId) {
        const product = products.find(p => p.id === parseInt(productId));
        const cartItem = cart.find(item => item.id === parseInt(productId));
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
        showToast('Item added to cart!');
    }

    function updateCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItems = 0;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="text-gray-500 text-center py-8">Your cart is empty.</p>`;
        } else {
            cart.forEach(item => {
                cartItemsContainer.innerHTML += `
                    <div class="flex items-center justify-between py-3 border-b">
                        <div class="flex items-center space-x-4">
                            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                            <div>
                                <p class="font-semibold">${item.name}</p>
                                <p class="text-sm text-gray-500">₹${item.price.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-3">
                            <button class="quantity-change text-gray-500 hover:text-indigo-600" data-id="${item.id}" data-change="-1">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-change text-gray-500 hover:text-indigo-600" data-id="${item.id}" data-change="1">+</button>
                            <button class="remove-item text-red-500 hover:text-red-700" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>`;
                total += item.price * item.quantity;
                totalItems += item.quantity;
            });
        }
        cartCountSpan.textContent = totalItems;
        cartTotalSpan.textContent = `₹${total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        checkoutButton.disabled = cart.length === 0;
        saveCart();
    }
    
    function handleCartActions(e) {
        const target = e.target.closest('button');
        if (!target) return;
        const productId = parseInt(target.dataset.id);
        const item = cart.find(i => i.id === productId);
        if (!item) return;

        if (target.classList.contains('quantity-change')) {
            const change = parseInt(target.dataset.change);
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== productId);
            }
        } else if (target.classList.contains('remove-item')) {
            cart = cart.filter(i => i.id !== productId);
        }
        updateCart();
    }

    // --- Checkout Event Handlers ---
    checkoutButton.addEventListener('click', () => {
        const user = getCurrentUser();
        if (!user) {
            alert('Please log in to proceed to checkout.');
            window.location.href = 'login.html';
            return;
        }
        navigateToCheckoutStep(2);
    });

    addressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const address = {
            fullName: document.getElementById('fullName').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            pincode: document.getElementById('pincode').value,
        };
        saveAddress(address);
        navigateToCheckoutStep(3);
    });
    
    placeOrderButton.addEventListener('click', () => {
        placeOrderButton.textContent = "Processing...";
        placeOrderButton.disabled = true;

        setTimeout(() => {
            const user = getCurrentUser();
            const address = JSON.parse(localStorage.getItem(`address_${user.email}`));
            
            document.getElementById('final-order-summary').innerHTML = `
                <p><strong>Total:</strong> ${cartTotalSpan.textContent}</p>
                <p class="mt-2"><strong>Shipping to:</strong></p>
                <p class="text-sm text-gray-600">${address.fullName}<br>${address.address}<br>${address.city}, ${address.pincode}</p>
            `;
            
            navigateToCheckoutStep(4);
            cart = [];
            updateCart();
            
            placeOrderButton.textContent = "Place Order";
            placeOrderButton.disabled = false;
        }, 1500);
    });
    
    continueShoppingBtn.addEventListener('click', hideCart);

    // --- Initial Page Load & Event Listeners ---
    function initialize() {
        renderProducts();
        updateAuthUI();
        loadUserData();

        logoutButton.addEventListener('click', logout);
        
        productGrid.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('product-image')) {
                showProductModal(target.dataset.id);
            } else if (target.closest('.add-to-cart-btn')) {
                addToCart(target.closest('.add-to-cart-btn').dataset.id);
            }
        });

        modalBody.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                addToCart(e.target.closest('.add-to-cart-btn').dataset.id);
                hideProductModal();
            }
        });
        
        closeModalBtn.addEventListener('click', hideProductModal);
        productModal.addEventListener('click', (e) => { if (e.target === productModal) hideProductModal(); });
        cartButton.addEventListener('click', showCart);
        closeCartBtn.addEventListener('click', hideCart);
        cartItemsContainer.addEventListener('click', handleCartActions);
    }

    initialize();
});