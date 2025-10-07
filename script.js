document.addEventListener('DOMContentLoaded', () => {
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
    const checkoutButton = document.getElementById('checkout-button');
    const toast = document.getElementById('toast');

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

    function renderProducts() {
        productGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="w-full h-56 object-cover cursor-pointer product-image" data-id="${product.id}">
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-800">${product.name}</h3>
                    <p class="text-gray-600 mt-1">₹${product.price.toLocaleString('en-IN')}</p>
                    <button class="add-to-cart-btn w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition" data-id="${product.id}">Add to Cart</button>
                </div>`;
            productGrid.appendChild(productCard);
        });
    }

    function showProductModal(productId) {
        const product = products.find(p => p.id === productId);
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
    
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 2000);
    }

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        const cartItem = cart.find(item => item.id === productId);
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
            cartItemsContainer.innerHTML = `<p class="text-gray-500 text-center">Your cart is empty.</p>`;
            checkoutButton.disabled = true;
        } else {
            cart.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'flex items-center justify-between py-3 border-b';
                cartItemElement.innerHTML = `
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
                    </div>`;
                cartItemsContainer.appendChild(cartItemElement);
                total += item.price * item.quantity;
                totalItems += item.quantity;
            });
             checkoutButton.disabled = false;
        }
        cartCountSpan.textContent = totalItems;
        cartTotalSpan.textContent = `₹${total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    
    function handleCartActions(e) {
        const target = e.target.closest('button');
        if (!target) return;
        const productId = parseInt(target.dataset.id);
        if (target.classList.contains('quantity-change')) {
            const change = parseInt(target.dataset.change);
            const item = cart.find(i => i.id === productId);
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    cart = cart.filter(i => i.id !== productId);
                }
            }
        } else if (target.classList.contains('remove-item')) {
            cart = cart.filter(i => i.id !== productId);
        }
        updateCart();
    }

    function showCart() {
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
    
    function handleCheckout() {
        if(cart.length > 0) {
           alert('Thank you for your purchase! Your total is ' + cartTotalSpan.textContent);
           cart = [];
           updateCart();
           hideCart();
        }
    }

    productGrid.addEventListener('click', e => {
        const target = e.target;
        if (target.classList.contains('product-image')) {
            showProductModal(parseInt(target.dataset.id));
        } else if (target.closest('.add-to-cart-btn')) {
            addToCart(parseInt(target.closest('.add-to-cart-btn').dataset.id));
        }
    });

    modalBody.addEventListener('click', e => {
        if (e.target.closest('.add-to-cart-btn')) {
            addToCart(parseInt(e.target.closest('.add-to-cart-btn').dataset.id));
            hideProductModal();
        }
    });

    closeModalBtn.addEventListener('click', hideProductModal);
    productModal.addEventListener('click', e => { if (e.target === productModal) hideProductModal(); });
    cartButton.addEventListener('click', showCart);
    closeCartBtn.addEventListener('click', hideCart);
    cartModal.addEventListener('click', e => { if (e.target === cartModal) hideCart(); });
    cartItemsContainer.addEventListener('click', handleCartActions);
    checkoutButton.addEventListener('click', handleCheckout);

    renderProducts();
    updateCart();
});