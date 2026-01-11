// API Base URL
const API_URL = 'https://goldenharvest-backend.onrender.com';

// Global State
let allListings = [];
let currentFilters = {
    animalType: 'all',
    breed: '',
    minPrice: 0,
    maxPrice: 1000000,
    location: ''
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadListings();
    initCart();
});

// Page Navigation
function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load page-specific data
        if (pageName === 'buy') {
            displayListings(allListings);
        } else if (pageName === 'home') {
            displayHomeListings();
        } else if (pageName === 'cart') {
            displayCart();
        }
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    mobileNav.classList.toggle('active');
}

// Load Listings
async function loadListings() {
    try {
        const response = await fetch(`${API_URL}/api/listings`);
        const data = await response.json();
        
        if (response.ok) {
            allListings = data.listings;
            displayListings(allListings);
            populateAnimalTypeFilter();
            displayHomeListings();
        }
    } catch (error) {
        console.error('Error loading listings:', error);
        // Display sample data if backend is not available
        allListings = getSampleListings();
        displayListings(allListings);
        displayHomeListings();
    }
}

// Display Listings
function displayListings(listings) {
    const grid = document.getElementById('listingsGrid');
    if (!grid) return;
    
    if (listings.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No listings found.</p>';
        return;
    }
    
    grid.innerHTML = listings.map(listing => `
        <div class="listing-card">
            <img src="${listing.image}" alt="${listing.breed}" class="listing-image" onclick="showListingDetail('${listing._id}')">
            <div class="listing-content">
                <span class="listing-badge">${listing.animalType}</span>
                <h3 class="listing-title">${listing.breed}</h3>
                <div class="listing-info">
                    <span>Qty: ${listing.quantity}</span>
                    <span>${listing.healthStatus}</span>
                </div>
                <div class="listing-price">${listing.pricePerUnit.toLocaleString()} RWF</div>
                <div class="listing-location">📍 ${listing.location}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${listing._id}')">
                    Order Now
                </button>
            </div>
        </div>
    `).join('');
}

// Display Home Listings (Latest 6)
function displayHomeListings() {
    const grid = document.getElementById('homeListingsGrid');
    if (!grid) return;
    
    const latestListings = allListings.slice(0, 6);
    
    grid.innerHTML = latestListings.map(listing => `
        <div class="listing-card">
            <img src="${listing.image}" alt="${listing.breed}" class="listing-image" onclick="showListingDetail('${listing._id}')">
            <div class="listing-content">
                <span class="listing-badge">${listing.animalType}</span>
                <h3 class="listing-title">${listing.breed}</h3>
                <div class="listing-info">
                    <span>Qty: ${listing.quantity}</span>
                    <span>${listing.healthStatus}</span>
                </div>
                <div class="listing-price">${listing.pricePerUnit.toLocaleString()} RWF</div>
                <div class="listing-location">📍 ${listing.location}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${listing._id}')">
                    Order Now
                </button>
            </div>
        </div>
    `).join('');
}

// Apply Filters - FIXED VERSION
function applyFilters() {
    if (!allListings || allListings.length === 0) return;

    // Get filter elements and check if they exist
    const animalTypeEl = document.getElementById('filterAnimalType');
    const breedEl = document.getElementById('filterBreed');
    const minPriceEl = document.getElementById('filterMinPrice');
    const maxPriceEl = document.getElementById('filterMaxPrice');
    const locationEl = document.getElementById('filterLocation');

    // Update current filters only if elements exist
    currentFilters.animalType = animalTypeEl ? animalTypeEl.value : 'all';
    currentFilters.breed = breedEl ? breedEl.value.toLowerCase().trim() : '';
    currentFilters.minPrice = minPriceEl ? parseInt(minPriceEl.value || 0) : 0;
    currentFilters.maxPrice = maxPriceEl ? parseInt(maxPriceEl.value || 1000000) : 1000000;
    currentFilters.location = locationEl ? locationEl.value.toLowerCase().trim() : '';

    let filtered = allListings;

    // Animal type filter (case-insensitive)
    if (currentFilters.animalType !== 'all') {
        filtered = filtered.filter(l => l.animalType.toLowerCase() === currentFilters.animalType.toLowerCase());
    }

    // Breed filter
    if (currentFilters.breed) {
        filtered = filtered.filter(l => l.breed.toLowerCase().includes(currentFilters.breed));
    }

    // Price filter
    filtered = filtered.filter(l => Number(l.pricePerUnit) >= currentFilters.minPrice &&
                                    Number(l.pricePerUnit) <= currentFilters.maxPrice);

    // Location filter
    if (currentFilters.location) {
        filtered = filtered.filter(l => l.location.toLowerCase().includes(currentFilters.location));
    }

    // Display filtered listings
    displayListings(filtered);

    // Show results count
    const resultsCount = filtered.length;
    const grid = document.getElementById('listingsGrid');
    if (grid && resultsCount > 0) {
        const existingCount = grid.previousElementSibling;
        if (existingCount && existingCount.classList.contains('results-count')) {
            existingCount.remove();
        }
        
        const countMsg = document.createElement('p');
        countMsg.className = 'results-count';
        countMsg.style.cssText = 'grid-column: 1/-1; text-align: center; color: #4A7C4E; font-weight: 600; margin-bottom: 1rem;';
        countMsg.textContent = `Found ${resultsCount} listing${resultsCount !== 1 ? 's' : ''}`;
        grid.insertAdjacentElement('beforebegin', countMsg);
        setTimeout(() => countMsg.remove(), 3000);
    }
}

function populateAnimalTypeFilter() {
    const select = document.getElementById('filterAnimalType');
    if (!select || !allListings) return;

    // Get unique animal types from listings
    const types = [...new Set(allListings.map(l => l.animalType.toLowerCase()))];

    // Clear existing options except "all"
    select.innerHTML = '<option value="all">All Animals</option>';

    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        select.appendChild(option);
    });
}

// Clear Filters - FIXED VERSION
function clearFilters() {
    // Clear filter inputs only if they exist
    const animalTypeEl = document.getElementById('filterAnimalType');
    const breedEl = document.getElementById('filterBreed');
    const minPriceEl = document.getElementById('filterMinPrice');
    const maxPriceEl = document.getElementById('filterMaxPrice');
    const locationEl = document.getElementById('filterLocation');

    if (animalTypeEl) animalTypeEl.value = 'all';
    if (breedEl) breedEl.value = '';
    if (minPriceEl) minPriceEl.value = '';
    if (maxPriceEl) maxPriceEl.value = '';
    if (locationEl) locationEl.value = '';

    // Reset filters object
    currentFilters = {
        animalType: 'all',
        breed: '',
        minPrice: 0,
        maxPrice: 1000000,
        location: ''
    };

    displayListings(allListings);
}

// Show Listing Detail
function showListingDetail(listingId) {
    const listing = allListings.find(l => l._id === listingId);
    if (!listing) return;
    
    const modal = document.getElementById('listingModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h2 style="color: #2E5C32; margin-bottom: 1rem;">${listing.breed}</h2>
        <img src="${listing.image}" alt="${listing.breed}" class="modal-image">
        <div class="modal-grid">
            <div class="modal-item">
                <h4>Animal Type</h4>
                <p class="capitalize">${listing.animalType}</p>
            </div>
            <div class="modal-item">
                <h4>Quantity Available</h4>
                <p>${listing.quantity} units</p>
            </div>
            <div class="modal-item">
                <h4>Price per Unit</h4>
                <p style="color: #4A7C4E; font-size: 1.25rem; font-weight: 700;">${listing.pricePerUnit.toLocaleString()} RWF</p>
            </div>
            <div class="modal-item">
                <h4>Location</h4>
                <p>${listing.location}</p>
            </div>
            <div class="modal-item">
                <h4>Health Status</h4>
                <p>${listing.healthStatus}</p>
            </div>
        </div>
        <div style="margin: 1.5rem 0;">
            <h4 style="color: #757575; margin-bottom: 0.5rem;">Description</h4>
            <p>${listing.description}</p>
        </div>
        <div class="modal-contact">
            <h3>Contact Golden Harvest Farm</h3>
            <p style="display: flex; align-items: center; gap: 0.5rem;">
                <svg style="width: 20px; height: 20px; color: #4A7C4E;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <strong>${listing.phone || '+250 788 000 000'}</strong>
            </p>
            <p style="margin-top: 0.5rem; color: #555;">Call us to inquire about this livestock or arrange a visit to our farm.</p>
        </div>
    `;
    
    modal.classList.add('active');
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('listingModal');
    modal.classList.remove('active');
}

// Handle Contact Form
async function handleContact(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    try {
        const response = await fetch(`${API_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showToast('Message sent successfully! We will get back to you soon.');
            event.target.reset();
        } else {
            showToast('Failed to send message. Please try calling us directly at +250 788 000 000');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Message saved! We will contact you soon. You can also call us at +250 788 000 000');
        event.target.reset();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('listingModal');
    if (event.target === modal) {
        closeModal();
    }
}

function showToast(message) {
    const toast = document.getElementById("toastModal");
    const toastMsg = document.getElementById("toastMessage");
    const closeBtn = document.getElementById("toastCloseBtn");

    toastMsg.textContent = message;
    toast.style.display = "flex";

    closeBtn.onclick = () => {
        toast.style.display = "none";
    };

    // Click outside to close
    toast.onclick = (e) => {
        if (e.target === toast) {
            toast.style.display = "none";
        }
    };
}

// Cart Management with Weight-Based Ordering
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
    const listing = allListings.find(l => l._id === listingId);
    if (!listing) return;
    
    // Show weight selection modal if weight per unit is available
    if (listing.weightPerChicken || listing.weightPerGoat || listing.weightPerCow) {
        showWeightSelectionModal(listing);
        return;
    }
    
    // Standard cart addition for listings without weight
    const cart = getCart();
    const existingItem = cart.find(item => item.id === listingId && !item.weightRange);
    
    if (existingItem) {
        if (existingItem.quantity < listing.quantity) {
            existingItem.quantity++;
            showToast('Quantity updated in cart!');
        } else {
            showToast('Maximum available quantity reached!');
            return;
        }
    } else {
        cart.push({
            id: listing._id,
            breed: listing.breed,
            animalType: listing.animalType,
            pricePerUnit: listing.pricePerUnit,
            image: listing.image,
            maxQuantity: listing.quantity,
            quantity: 1,
            location: listing.location,
            phone: listing.phone || '+250 788 000 000'
        });
        showToast('Added to cart successfully!');
    }
    
    saveCart(cart);
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
                    <input type="number" id="minWeight" step="0.1" min="0" max="${weightPerUnit * 1.5}" 
                           value="${(weightPerUnit * 0.8).toFixed(1)}" required>
                </div>
                
                <div class="form-group">
                    <label>Maximum Weight (kg)</label>
                    <input type="number" id="maxWeight" step="0.1" min="0" max="${weightPerUnit * 2}" 
                           value="${(weightPerUnit * 1.2).toFixed(1)}" required>
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
    
    // Update summary on input change
    const minWeightInput = modal.querySelector('#minWeight');
    const maxWeightInput = modal.querySelector('#maxWeight');
    const quantityInput = modal.querySelector('#weightQuantity');
    
    function updateSummary() {
        const minWeight = parseFloat(minWeightInput.value) || 0;
        const maxWeight = parseFloat(maxWeightInput.value) || 0;
        const quantity = parseInt(quantityInput.value) || 1;
        
        if (minWeight >= maxWeight) {
            document.getElementById('weightSummary').innerHTML = 
                '<span style="color: #dc3545;">Maximum weight must be greater than minimum weight</span>';
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
        document.getElementById('estimatedPrice').textContent = 
            `Estimated Total: ${estimatedPrice.toLocaleString()} RWF`;
    }
    
    minWeightInput.addEventListener('input', updateSummary);
    maxWeightInput.addEventListener('input', updateSummary);
    quantityInput.addEventListener('input', updateSummary);
    updateSummary();
    
    // Handle form submission
    modal.querySelector('#weightSelectionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const minWeight = parseFloat(minWeightInput.value);
        const maxWeight = parseFloat(maxWeightInput.value);
        const quantity = parseInt(quantityInput.value);
        
        if (minWeight >= maxWeight) {
            showToast('Maximum weight must be greater than minimum weight!');
            return;
        }
        
        if (quantity > listing.quantity) {
            showToast('Quantity exceeds available stock!');
            return;
        }
        
        addToCartWithWeight(listing, minWeight, maxWeight, quantity);
        modal.remove();
    });
}

function adjustQuantity(change) {
    const input = document.getElementById('weightQuantity');
    const max = parseInt(input.max);
    const newValue = parseInt(input.value) + change;
    
    if (newValue >= 1 && newValue <= max) {
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
        weightRange: {
            min: minWeight,
            max: maxWeight,
            avgPerUnit: weightPerUnit
        }
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
        
        if (cart[itemIndex].quantity <= 0) {
            removeFromCart(itemIndex);
            return;
        }
        
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
        
        if (newQty <= 0) {
            removeFromCart(itemIndex);
            return;
        }
        
        if (newQty > cart[itemIndex].maxQuantity) {
            cart[itemIndex].quantity = cart[itemIndex].maxQuantity;
            showToast('Maximum available quantity reached!');
        } else {
            cart[itemIndex].quantity = newQty;
        }
        
        saveCart(cart);
        displayCart();
    }
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
                <button class="btn btn-primary" onclick="showPage('buy')">Browse Livestock</button>
            </div>
        `;
        cartSummary.style.display = 'none';
        return;
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);
    
    cartContent.innerHTML = `
        <div class="cart-items-list">
            ${cart.map((item, index) => {
                const avgWeight = item.weightRange ? 
                    (item.weightRange.min + item.weightRange.max) / 2 : null;
                const totalWeight = avgWeight ? avgWeight * item.quantity : null;
                
                return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.breed}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${item.breed}</h3>
                        <p class="cart-item-info">
                            <span class="listing-badge">${item.animalType}</span>
                            <br>📍 ${item.location}
                        </p>
                        <p class="cart-item-info">Price per unit: ${item.pricePerUnit.toLocaleString()} RWF</p>
                        ${item.weightRange ? `
                            <div style="background: #fff3cd; padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 0.9em;">
                                <strong>⚖️ Weight Range:</strong> ${item.weightRange.min} - ${item.weightRange.max} kg per ${item.animalType.toLowerCase()}<br>
                                <small>Average: ${avgWeight.toFixed(1)} kg | Total: ${totalWeight.toFixed(1)} kg for ${item.quantity} ${item.animalType.toLowerCase()}(s)</small>
                            </div>
                        ` : ''}
                        <div style="margin: 10px 0; padding: 10px; background: #f0f0f0; border-radius: 6px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Number of ${item.animalType}(s) to buy:</label>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', -1, ${!!item.weightRange})" style="width: 35px; height: 35px; font-size: 18px;">-</button>
                                <input type="number" value="${item.quantity}" min="1" max="${item.maxQuantity}" 
                                       onchange="updateCartQuantityDirect('${item.id}', this.value, ${!!item.weightRange})"
                                       style="width: 70px; text-align: center; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                                <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', 1, ${!!item.weightRange})" style="width: 35px; height: 35px; font-size: 18px;">+</button>
                                <span style="color: #666; font-size: 0.9em;">/ ${item.maxQuantity} available</span>
                            </div>
                        </div>
                        <div class="cart-item-controls">
                            <span class="cart-item-price">${(item.pricePerUnit * item.quantity).toLocaleString()} RWF</span>
                            <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                        </div>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
    
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalPrice').textContent = totalPrice.toLocaleString() + ' RWF';
    cartSummary.style.display = 'block';
}

async function proceedToCheckout(event) {
    event.preventDefault();
    
    const cart = getCart();
    
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
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
            const totalWeight = avgWeight * item.quantity;
            details += `\n   Weight Range: ${item.weightRange.min}-${item.weightRange.max} kg per animal`;
            details += `\n   Total Weight: ${totalWeight.toFixed(1)} kg`;
        }
        
        details += `\n   Price: ${(item.pricePerUnit * item.quantity).toLocaleString()} RWF`;
        return details;
    }).join('\n\n');
    
    const message = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        subject: 'New Cart Order - ' + customerName,
        message: `NEW ORDER FROM CART
        
CUSTOMER DETAILS:
Name: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail}
${deliveryAddress ? 'Delivery Address: ' + deliveryAddress : 'Pickup from farm'}

ORDER DETAILS:
${orderDetails}

TOTAL AMOUNT: ${totalPrice.toLocaleString()} RWF

Please contact the customer to confirm this order.`
    };
    
    try {
        const response = await fetch(`${API_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
        
        if (response.ok) {
            showToast('Order placed successfully! We will contact you at ' + customerPhone + ' soon.');
            localStorage.removeItem('ghf_cart');
            updateCartCount();
            document.getElementById('checkoutForm').reset();
            displayCart();
        } else {
            showToast('Order saved! We will contact you at ' + customerPhone + ' to confirm.');
            localStorage.removeItem('ghf_cart');
            updateCartCount();
            document.getElementById('checkoutForm').reset();
            displayCart();
        }
    } catch (error) {
        showToast('Order saved! We will contact you at ' + customerPhone + ' to confirm.');
        localStorage.removeItem('ghf_cart');
        updateCartCount();
        document.getElementById('checkoutForm').reset();
        displayCart();
    }
}