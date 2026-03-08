// Cart Management

function initCart() {
    updateCartCount();
}

function getCart() {
    const cart = localStorage.getItem('ghf_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('ghf_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElements = document.querySelectorAll('#cartCount, #mobileCartCount');
    countElements.forEach(el => {
        if (el) el.textContent = totalItems;
    });
}



function addToCart(listingId) {
    let listing = allListings.find(l => l._id === listingId);
    if (!listing) {
        listing = allListings.find(l => String(l._id) === String(listingId));
    }
    if (!listing) return;

    const cart = getCart();
    const existingItem = cart.find(item => item.id === String(listing._id));

    if (existingItem) {
        if (existingItem.quantity < listing.quantity) {
            existingItem.quantity++;
            showCartToast('Quantity Updated!', `${listing.breed} quantity updated in your cart.`);
        } else {
            showCartToast('Maximum Reached!', `Sorry, no more stock available for ${listing.breed}.`);
            return;
        }
    } else {
        cart.push({
            id: String(listing._id),
            breed: listing.breed,
            animalType: listing.animalType,
            pricePerUnit: listing.pricePerUnit,
            image: listing.image,
            maxQuantity: listing.quantity,
            quantity: 1,
            location: listing.location,
            phone: listing.phone || '+250 788 000 000'
        });
        showCartToast('Added to Cart!', `${listing.breed} has been added to your order.`);
    }

    saveCart(cart);
}

function showCartToast(title, message) {
    // Remove existing if any
    const existing = document.getElementById('cartSuccessModal');
    if (existing) existing.remove();

    // Inject styles once
    if (!document.getElementById('cart-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'cart-toast-styles';
        style.textContent = `
            .cart-toast-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.45);
                backdrop-filter: blur(3px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                animation: ctFadeIn 0.2s ease;
            }
            .cart-toast-modal {
                background: #fff;
                border-radius: 16px;
                padding: 48px 40px 36px;
                max-width: 420px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                animation: ctSlideUp 0.3s ease;
                position: relative;
            }
            .cart-toast-icon {
                width: 72px;
                height: 72px;
                background: #3dba6f;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                animation: ctPopIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) 0.1s both;
            }
            .cart-toast-icon svg {
                width: 36px;
                height: 36px;
                stroke: white;
                stroke-width: 3;
                fill: none;
            }
            .cart-toast-title {
                font-size: 1.6rem;
                font-weight: 700;
                color: #3dba6f;
                margin: 0 0 12px;
            }
            .cart-toast-text {
                color: #555;
                font-size: 0.97rem;
                line-height: 1.6;
                margin: 0 0 28px;
            }
            .cart-toast-progress {
                height: 3px;
                background: #e8e8e8;
                border-radius: 2px;
                overflow: hidden;
            }
            .cart-toast-bar {
                height: 100%;
                background: #3dba6f;
                border-radius: 2px;
                animation: ctProgress 3s linear forwards;
            }
            @keyframes ctFadeIn {
                from { opacity: 0; } to { opacity: 1; }
            }
            @keyframes ctSlideUp {
                from { opacity: 0; transform: translateY(30px) scale(0.95); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes ctPopIn {
                from { transform: scale(0); opacity: 0; }
                to   { transform: scale(1); opacity: 1; }
            }
            @keyframes ctProgress {
                from { width: 0%; } to { width: 100%; }
            }
        `;
        document.head.appendChild(style);
    }

    const overlay = document.createElement('div');
    overlay.className = 'cart-toast-overlay';
    overlay.id = 'cartSuccessModal';
    overlay.innerHTML = `
        <div class="cart-toast-modal">
            <div class="cart-toast-icon">
                <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <h2 class="cart-toast-title">${title}</h2>
            <p class="cart-toast-text">${message}</p>
            <div class="cart-toast-progress">
                <div class="cart-toast-bar"></div>
            </div>
        </div>
    `;

    // Click outside to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);

    // Auto dismiss after 3s
    setTimeout(() => {
        overlay.style.animation = 'ctFadeIn 0.4s ease reverse';
        setTimeout(() => overlay.remove(), 400);
    }, 3000);
}



function showWeightSelectionModal(listing) {
    const weightPerUnit = listing.weightPerChicken || listing.weightPerGoat || listing.weightPerCow;
    const unitName = listing.animalType.toLowerCase();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            <h2>Select Weight Range</h2>
            <div style="display: flex; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                <img src="${listing.image}" alt="${listing.breed}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                <div>
                    <h3>${listing.breed}</h3>
                    <p>${listing.animalType} - ${listing.location}</p>
                    <p><strong>Average weight per ${unitName}: ${weightPerUnit} kg</strong></p>
                    <p>Price per unit: ${listing.pricePerUnit.toLocaleString()} RWF</p>
                </div>
            </div>
            <form id="weightSelectionForm">
                <div class="form-group">
                    <label>Minimum Weight (kg)</label>
                    <input type="number" id="minWeight" step="0.1" min="0" value="${(weightPerUnit * 0.8).toFixed(1)}" required>
                </div>
                <div class="form-group">
                    <label>Maximum Weight (kg)</label>
                    <input type="number" id="maxWeight" step="0.1" min="0" value="${(weightPerUnit * 1.2).toFixed(1)}" required>
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button type="button" onclick="adjustQuantity(-1)" style="width: 35px; height: 35px;">-</button>
                        <input type="number" id="weightQuantity" value="1" min="1" max="${listing.quantity}" required style="width: 60px; text-align: center;">
                        <button type="button" onclick="adjustQuantity(1)" style="width: 35px; height: 35px;">+</button>
                    </div>
                    <small>Available: ${listing.quantity} ${unitName}(s)</small>
                </div>
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4>Selection Summary</h4>
                    <p id="weightSummary">Select weight range and quantity</p>
                    <p id="estimatedPrice" style="font-size: 1.2em; font-weight: bold; color: #2e7d32; margin-top: 10px;"></p>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Add to Cart</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const minWeightInput = modal.querySelector('#minWeight');
    const maxWeightInput = modal.querySelector('#maxWeight');
    const quantityInput = modal.querySelector('#weightQuantity');

    function updateSummary() {
        const minWeight = parseFloat(minWeightInput.value) || 0;
        const maxWeight = parseFloat(maxWeightInput.value) || 0;
        const quantity = parseInt(quantityInput.value) || 1;

        if (minWeight >= maxWeight) {
            document.getElementById('weightSummary').innerHTML = '<span style="color: #dc3545;">Maximum weight must be greater than minimum weight</span>';
            document.getElementById('estimatedPrice').textContent = '';
            return;
        }

        const avgWeight = (minWeight + maxWeight) / 2;
        const totalWeight = avgWeight * quantity;
        const estimatedPrice = listing.pricePerUnit * quantity;

        document.getElementById('weightSummary').innerHTML = `
            ${quantity} ${unitName}(s) with weight between ${minWeight} - ${maxWeight} kg<br>
            <small>Average: ${avgWeight.toFixed(1)} kg per ${unitName}, Total: ${totalWeight.toFixed(1)} kg</small>
        `;
        document.getElementById('estimatedPrice').textContent = `Estimated Total: ${estimatedPrice.toLocaleString()} RWF`;
    }

    minWeightInput.addEventListener('input', updateSummary);
    maxWeightInput.addEventListener('input', updateSummary);
    quantityInput.addEventListener('input', updateSummary);
    updateSummary();

    modal.querySelector('#weightSelectionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const minWeight = parseFloat(minWeightInput.value);
        const maxWeight = parseFloat(maxWeightInput.value);
        const quantity = parseInt(quantityInput.value);

        if (minWeight >= maxWeight) { showToast('Maximum weight must be greater than minimum weight!'); return; }
        if (quantity > listing.quantity) { showToast('Quantity exceeds available stock!'); return; }

        addToCartWithWeight(listing, minWeight, maxWeight, quantity);
        modal.remove();
    });
}

function adjustQuantity(change) {
    const input = document.getElementById('weightQuantity');
    const newValue = parseInt(input.value) + change;
    if (newValue >= 1 && newValue <= parseInt(input.max)) {
        input.value = newValue;
        input.dispatchEvent(new Event('input'));
    }
}

function addToCartWithWeight(listing, minWeight, maxWeight, quantity) {
    const cart = getCart();
    const weightPerUnit = listing.weightPerChicken || listing.weightPerGoat || listing.weightPerCow;

    cart.push({
        id: listing._id,
        breed: listing.breed,
        animalType: listing.animalType,
        pricePerUnit: listing.pricePerUnit,
        image: listing.image,
        maxQuantity: listing.quantity,
        quantity: quantity,
        location: listing.location,
        phone: listing.phone || '+250 788 000 000',
        weightRange: { min: minWeight, max: maxWeight, avgPerUnit: weightPerUnit }
    });

    saveCart(cart);
    showToast(`Added ${quantity} ${listing.animalType.toLowerCase()}(s) with weight ${minWeight}-${maxWeight} kg to cart!`);
}

function updateCartQuantity(listingId, change, hasWeightRange) {
    const cart = getCart();
    const itemIndex = hasWeightRange ?
        cart.findIndex(i => i.id === listingId && i.weightRange) :
        cart.findIndex(i => i.id === listingId && !i.weightRange);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) { removeFromCart(itemIndex); return; }
        if (cart[itemIndex].quantity > cart[itemIndex].maxQuantity) {
            cart[itemIndex].quantity = cart[itemIndex].maxQuantity;
            showToast('Maximum available quantity reached!');
        }
        saveCart(cart);
        displayCart();
    }
}

function updateCartQuantityDirect(listingId, value, hasWeightRange) {
    const cart = getCart();
    const itemIndex = hasWeightRange ?
        cart.findIndex(i => i.id === listingId && i.weightRange) :
        cart.findIndex(i => i.id === listingId && !i.weightRange);

    if (itemIndex !== -1) {
        const newQty = parseInt(value) || 1;
        if (newQty <= 0) { removeFromCart(itemIndex); return; }
        cart[itemIndex].quantity = newQty > cart[itemIndex].maxQuantity ? cart[itemIndex].maxQuantity : newQty;
        saveCart(cart);
        displayCart();
    }
}

function addWeightRange(itemIndex) {
    const cart = getCart();
    showWeightRangeModal(cart[itemIndex], itemIndex);
}

function editWeightRange(itemIndex) {
    const cart = getCart();
    showWeightRangeModal(cart[itemIndex], itemIndex, true);
}

function showWeightRangeModal(item, itemIndex, isEdit = false) {
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    modal.innerHTML = `
        <div class="modal-content" style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; position: relative;">
            <button onclick="this.closest('.modal-overlay').remove()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 28px; cursor: pointer;">×</button>
            <h2>${isEdit ? 'Edit' : 'Add'} Weight Range</h2>
            <form id="weightRangeForm">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Min Weight (kg)</label>
                    <input type="number" id="modalMinWeight" step="0.1" min="0" value="${item.weightRange?.min || 2}" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Max Weight (kg)</label>
                    <input type="number" id="modalMaxWeight" step="0.1" min="0" value="${item.weightRange?.max || 5}" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                </div>
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p id="modalWeightSummary" style="margin: 0;"></p>
                </div>
                <button type="submit" style="width: 100%; padding: 12px; background: #4A7C4E; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: 600;">Save Weight Range</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const minInput = modal.querySelector('#modalMinWeight');
    const maxInput = modal.querySelector('#modalMaxWeight');

    function updateModalSummary() {
        const min = parseFloat(minInput.value) || 0;
        const max = parseFloat(maxInput.value) || 0;
        if (min >= max) {
            document.getElementById('modalWeightSummary').innerHTML = '<span style="color: #dc3545;">Max must be greater than min</span>';
        } else {
            const avg = (min + max) / 2;
            document.getElementById('modalWeightSummary').innerHTML = `Range: ${min} - ${max} kg | Avg: ${avg.toFixed(1)} kg`;
        }
    }

    minInput.addEventListener('input', updateModalSummary);
    maxInput.addEventListener('input', updateModalSummary);
    updateModalSummary();

    modal.querySelector('#weightRangeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const min = parseFloat(minInput.value);
        const max = parseFloat(maxInput.value);
        if (min >= max) { showToast('Maximum weight must be greater than minimum!'); return; }

        const cart = getCart();
        cart[itemIndex].weightRange = { min, max, avgPerUnit: (min + max) / 2 };
        saveCart(cart);
        displayCart();
        modal.remove();
        showToast('Weight range ' + (isEdit ? 'updated' : 'added') + '!');
    });
}

function removeFromCart(indexOrId) {
    let cart = getCart();
    if (typeof indexOrId === 'number') {
        cart.splice(indexOrId, 1);
    } else {
        cart = cart.filter(item => item.id !== indexOrId);
    }
    saveCart(cart);
    displayCart();
    showToast('Item removed from cart');
}

function displayCart() {
    const cartContent = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    if (!cartContent) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-empty">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <h3>Your cart is empty</h3>
                <p>Browse our livestock and add items to your cart</p>
                <button class="btn btn-primary" onclick="window.location.href='buy.html'">Browse Livestock</button>
            </div>
        `;
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);

    cartContent.innerHTML = `
        <div class="cart-items-list">
            ${cart.map((item, index) => {
                const avgWeight = item.weightRange ? (item.weightRange.min + item.weightRange.max) / 2 : null;
                const totalWeight = avgWeight ? avgWeight * item.quantity : null;
                return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.breed}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${item.breed}</h3>
                        <p class="cart-item-info">
                            <span class="listing-badge">${item.animalType}</span><br>
                            📍 ${item.location}
                        </p>
                        <p class="cart-item-info">Price per unit: ${item.pricePerUnit.toLocaleString()} RWF</p>
                        ${item.weightRange ? `
                            <div style="background: #fff3cd; padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 0.9em;">
                                <strong>⚖️ Weight:</strong> ${item.weightRange.min} - ${item.weightRange.max} kg each<br>
                                <small>Avg: ${avgWeight.toFixed(1)} kg | Total: ${totalWeight.toFixed(1)} kg</small>
                                <button onclick="editWeightRange(${index})" style="margin-top: 8px; padding: 5px 10px; background: #4A7C4E; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;">Change Weight Range</button>
                            </div>
                        ` : `
                            <div style="margin: 10px 0; padding: 10px; background: #ffffff; border-radius: 6px;">
                                <button onclick="addWeightRange(${index})" style="padding: 8px 15px; background: #1f3d22; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; width: 100%;">
                                    ⚖️ Add Weight Range Preference
                                </button>
                            </div>
                        `}
                        <div style="margin: 10px 0; padding: 10px; background: #f0f0f0; border-radius: 6px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Quantity:</label>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', -1, ${!!item.weightRange})" style="width: 35px; height: 35px; font-size: 18px;">-</button>
                                <input type="number" value="${item.quantity}" min="1" max="${item.maxQuantity}"
                                       onchange="updateCartQuantityDirect('${item.id}', this.value, ${!!item.weightRange})"
                                       style="width: 70px; text-align: center; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                                <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', 1, ${!!item.weightRange})" style="width: 35px; height: 35px; font-size: 18px;">+</button>
                                <span style="color: #666; font-size: 0.9em;">/ ${item.maxQuantity}</span>
                            </div>
                        </div>
                        <div class="cart-item-controls">
                            <span class="cart-item-price">${(item.pricePerUnit * item.quantity).toLocaleString()} RWF</span>
                            <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;

    if (document.getElementById('totalItems')) document.getElementById('totalItems').textContent = totalItems;
    if (document.getElementById('totalPrice')) document.getElementById('totalPrice').textContent = totalPrice.toLocaleString() + ' RWF';
    if (cartSummary) cartSummary.style.display = 'block';
}

async function proceedToCheckout(event) {
    event.preventDefault();

    const cart = getCart();
    if (cart.length === 0) { showToast('Your cart is empty!'); return; }

    const customerName = document.getElementById('checkoutName').value.trim();
    const customerPhone = document.getElementById('checkoutPhone').value.trim();
    const customerEmail = document.getElementById('checkoutEmail').value.trim();
    const deliveryAddress = document.getElementById('checkoutAddress').value.trim();

    if (!customerName || !customerPhone || !customerEmail) {
        showToast('Please fill in all required contact information!');
        return;
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);
    const orderDetails = cart.map(item => {
        let details = `${item.quantity}x ${item.breed} (${item.animalType})`;
        if (item.weightRange) {
            const avgWeight = (item.weightRange.min + item.weightRange.max) / 2;
            details += `\n   Weight Range: ${item.weightRange.min}-${item.weightRange.max} kg`;
            details += `\n   Total Weight: ${(avgWeight * item.quantity).toFixed(1)} kg`;
        }
        details += `\n   Price: ${(item.pricePerUnit * item.quantity).toLocaleString()} RWF`;
        return details;
    }).join('\n\n');

    const message = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        subject: 'New Cart Order - ' + customerName,
        message: `NEW ORDER\n\nName: ${customerName}\nPhone: ${customerPhone}\nEmail: ${customerEmail}\n${deliveryAddress ? 'Delivery: ' + deliveryAddress : 'Pickup from farm'}\n\nORDER:\n${orderDetails}\n\nTOTAL: ${totalPrice.toLocaleString()} RWF`
    };



    
    try {
        const response = await fetch(`${API_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
        showToast('Order placed! We will contact you at ' + customerPhone + ' soon.');
    } catch (error) {
        showToast('Order saved! We will contact you at ' + customerPhone + ' to confirm.');
    }

    localStorage.removeItem('ghf_cart');
    updateCartCount();
    const form = document.getElementById('checkoutForm');
    if (form) form.reset();
    displayCart();
}
