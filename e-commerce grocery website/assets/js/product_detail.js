function changeMixedMainImage(thumbnail) {
    document.querySelectorAll('.mixed-thumbnail-item').forEach(img => img.classList.remove('active'));
    thumbnail.classList.add('active');
    document.getElementById('mixedMainProductImage').src = thumbnail.src;
}

function updateMixedQuantity(change) {
    let quantityInput = document.getElementById('mixedProductQuantity');
    let currentQuantity = parseInt(quantityInput.value);
    let newQuantity = currentQuantity + change;

    if (newQuantity > 0) {
        quantityInput.value = newQuantity;
    }
}

function handleMixedCheckboxChange(currentCheckbox) {
    const checkboxes = document.querySelectorAll('.mixed-qty-checkbox');
    let selectedValue = '';

    checkboxes.forEach(checkbox => {
        if (checkbox !== currentCheckbox) {
            checkbox.checked = false;
        }
    });

    if (currentCheckbox.checked) {
        selectedValue = currentCheckbox.value;
    }

    document.getElementById('selectedQuantityDisplay').textContent = "Quantity: " + selectedValue;
}

document.addEventListener('DOMContentLoaded', () => {
    const initialSelectedCheckbox = document.querySelector('input[name="mixedQuantityOption"]:checked');
    if (initialSelectedCheckbox) {
        handleMixedCheckboxChange(initialSelectedCheckbox);
    } else {
        const firstCheckbox = document.querySelector('input[name="mixedQuantityOption"][value="250g"]');
        if (firstCheckbox) {
            firstCheckbox.checked = true;
            handleMixedCheckboxChange(firstCheckbox);
        }
    }
});

// add to cart
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
        const existingItemIndex = cart.findIndex(item => item.id === newItem.id && item.selectedQuantity === newItem.selectedQuantity);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += newItem.quantity; 
        } else {
            cart.push(newItem);
        }
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

        const productDetailContainer = document.querySelector('.mixed-product-detail-container');

        if (!productDetailContainer) {
            console.error("Error: Could not find the product detail container.");
            return;
        }

        const productId = productDetailContainer.dataset.productId;
        const productName = productDetailContainer.querySelector('.mixed-product-title')?.textContent.trim();
        const productPriceText = productDetailContainer.querySelector('.mixed-product-price')?.textContent.replace('₹', '').trim();
        const productImageSrc = productDetailContainer.querySelector('.mixed-main-image')?.src;
        const productCategory = productDetailContainer.dataset.category;

        const selectedQuantityElement = document.getElementById('selectedQuantityDisplay');
        const selectedQuantityText = selectedQuantityElement ? selectedQuantityElement.textContent.replace('Quantity: ', '').trim() : '250g'; 

        const quantityInputVal = parseInt(document.getElementById('mixedProductQuantity').value);


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
            selectedQuantity: selectedQuantityText, 
            quantity: quantityInputVal 
        };

        addItemToCart(itemToAdd);
        alert(`${productName} (${selectedQuantityText}) has been added to your cart!`);
    }

    const addToCartButton = document.querySelector('.mixed-add-to-cart-btn');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', handleAddToCartButtonClick);
    }

    updateCartIconCount(); 
});