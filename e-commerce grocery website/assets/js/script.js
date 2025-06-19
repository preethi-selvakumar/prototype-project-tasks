document.addEventListener('DOMContentLoaded', function () {

    function getCart() {
        try {
            const cartData = sessionStorage.getItem('cart');
            return cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error("Failed to retrieve cart from session storage:", error);
            return [];
        }
    }

    function saveCart(cart) {
        try {
            sessionStorage.setItem('cart', JSON.stringify(cart));
            updateCartIconCount();
        } catch (error) {
            console.error("Failed to save cart to session storage:", error);
        }
    }

    function addItemToCart(newItem) {
        const cart = getCart();
        const existingItemIndex = cart.findIndex(item => item.id === newItem.id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            newItem.quantity = 1;
            cart.push(newItem);
        }
        saveCart(cart);
    }

    function updateItemQuantity(productId, newQuantity) {
        const cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity = newQuantity;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            saveCart(cart);
        }
    }

    function removeItemFromCart(productId) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== productId);
        saveCart(cart);
    }

    function updateCartIconCount() {
        const cart = getCart();
        const cartItemCountSpan = document.getElementById('cartItemCount');

        if (cartItemCountSpan) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

            if (totalItems > 0) {
                cartItemCountSpan.textContent = totalItems;
                cartItemCountSpan.style.display = 'block';
            } else {
                cartItemCountSpan.textContent = '0';
                cartItemCountSpan.style.display = 'none';
            }
        }
    }

    function handleAddToCartButtonClick(event) {
        event.preventDefault();

        const productCard = event.target.closest('.product-card') ||
            event.target.closest('.new-arrivals-product-item-card') ||
            event.target.closest('.best-deals-product-card');

        if (!productCard) {
            console.error("Error: Could not find the parent product card for this button.", event.target);
            return;
        }

        const productId = event.target.dataset.productId;
        const productName = productCard.querySelector('.product-name, .new-arrivals-product-title, .best-deals-product-title')?.textContent.trim();
        const productPriceText = productCard.querySelector('.product-price, .new-arrivals-product-price, .best-deals-product-price')?.textContent.replace('₹', '').trim();
        const productImageSrc = productCard.querySelector('.product-image, .new-arrivals-product-thumbnail, .best-deals-product-img')?.src;
        const productCategory = productCard.dataset.category;

        if (!productId || !productName || !productPriceText || !productImageSrc || !productCategory) {
            console.error("Error: Missing product details for item.", { productId, productName, productPriceText, productImageSrc, productCategory });
            alert("Could not add item to cart. Some product details are missing.");
            return;
        }

        const productPrice = parseFloat(productPriceText);

        const itemToAdd = {
            id: productId,
            name: productName,
            price: productPrice,
            imageSrc: productImageSrc,
            category: productCategory,
            quantity: 1
        };

        addItemToCart(itemToAdd);
        alert(`${productName} has been added to your cart!`);
    }

    document.querySelectorAll(
        '.add-to-cart-button, ' +
        '.new-arrivals-add-to-cart-btn, ' +
        '.best-deals-add-to-cart-btn'
    ).forEach(button => {
        button.addEventListener('click', handleAddToCartButtonClick);
    });

    updateCartIconCount();

    if (document.getElementById('cartItemsList')) {
        renderCartItems();
        updateCartSummaryDisplay();
    }

    function renderCartItems() {
        const cartItemsListContainer = document.getElementById('cartItemsList');
        const cart = getCart();

        cartItemsListContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsListContainer.innerHTML = `
                <div class="cart-empty-message text-center p-5">
                    <h2 class="text-secondary mb-3">Your Cart is Empty!</h2>
                    <p class="lead">Looks like you haven't added anything to your cart yet. Start shopping now!</p>
                    <a href="../pages/home.html" class="btn btn-success mt-3">Continue Shopping</a>
                </div>
            `;
        } else {
            cart.forEach(item => {
                const cartItemHtml = `
                    <div class="cart-item d-flex align-items-center mb-3 p-2" data-product-id="${item.id}">
                        <img src="${item.imageSrc || '../images/default-product.png'}" alt="${item.name}" class="cart-item-img me-3">
                        <div class="cart-item-details flex-grow-1">
                            <p class="cart-item-category mb-0">${item.category || 'N/A'}</p> <h5 class="cart-item-name mb-1">${item.name}</h5>
                            <p class="cart-item-price mb-0">₹ <span class="item-current-price">${(item.price * item.quantity).toFixed(0)}</span></p>
                        </div>
                        <div class="cart-item-quantity-control d-flex align-items-center">
                            <button class="btn cart-qty-btn-minus" onclick="changeItemQuantity('${item.id}', -1)">-</button>
                            <input type="text" class="form-control text-center mx-1 cart-qty-input" value="${item.quantity}" readonly>
                            <button class="btn cart-qty-btn-plus" onclick="changeItemQuantity('${item.id}', 1)">+</button>
                        </div>
                        <button class="btn btn-danger btn-sm ms-3" onclick="removeItemFromCartAndRender('${item.id}')">Remove</button>
                    </div>
                `;
                cartItemsListContainer.insertAdjacentHTML('beforeend', cartItemHtml);
            });
        }
        updateCartSummaryDisplay();
        updateCartIconCount();
    }

    function changeItemQuantity(productId, change) {
        const cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            let newQuantity = cart[itemIndex].quantity + change;
            if (newQuantity < 1) {
                newQuantity = 1;
            }
            updateItemQuantity(productId, newQuantity);
            renderCartItems();
        }
    }

    function removeItemFromCartAndRender(productId) {
        if (confirm('Are you sure you want to remove this item from your cart?')) {
            removeItemFromCart(productId);
            renderCartItems();
        }
    }

    function updateCartSummaryDisplay() {
        const cart = getCart();
        let subtotal = 0;
        const deliveryCharges = 50;
        const discount = 0;

        cart.forEach(item => {
            subtotal += (item.price * item.quantity);
        });

        let total = subtotal + deliveryCharges - discount;
        if (total < 0) total = 0;

        document.getElementById('cartSubtotal').textContent = subtotal.toFixed(0);
        document.getElementById('cartDeliveryCharges').textContent = deliveryCharges.toFixed(0);
        document.getElementById('cartDiscount').textContent = discount.toFixed(0);
        document.getElementById('cartTotal').textContent = total.toFixed(0);

        const cartSummary = {
            subtotal: subtotal.toFixed(0),
            deliveryCharges: deliveryCharges.toFixed(0),
            discount: discount.toFixed(0),
            total: total.toFixed(0)
        };
        sessionStorage.setItem('cartSummary', JSON.stringify(cartSummary));
    }

    window.changeItemQuantity = changeItemQuantity;
    window.removeItemFromCartAndRender = removeItemFromCartAndRender;

});
