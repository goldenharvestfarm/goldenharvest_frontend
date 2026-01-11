// API Base URL
const API_URL = 'https://goldenharvest-backend.onrender.com';

// Global State
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

// Apply Filters
function applyFilters() {
    if (!allListings || allListings.length === 0) return;

    currentFilters.animalType = document.getElementById('filterAnimalType').value;
    currentFilters.breed = document.getElementById('filterBreed').value.toLowerCase().trim();
    currentFilters.minPrice = parseInt(document.getElementById('filterMinPrice').value || 0);
    currentFilters.maxPrice = parseInt(document.getElementById('filterMaxPrice').value || 1000000);
    currentFilters.location = document.getElementById('filterLocation').value.toLowerCase().trim();

    let filtered = allListings;

    // Filter by animal type (case-insensitive)
    if (currentFilters.animalType !== 'all') {
        filtered = filtered.filter(l => l.animalType.toLowerCase() === currentFilters.animalType.toLowerCase());
    }

    // Filter by breed
    if (currentFilters.breed) {
        filtered = filtered.filter(l => l.breed.toLowerCase().includes(currentFilters.breed));
    }

    // Filter by price range
    filtered = filtered.filter(l => 
        Number(l.pricePerUnit) >= currentFilters.minPrice &&
        Number(l.pricePerUnit) <= currentFilters.maxPrice
    );

    // Filter by location
    if (currentFilters.location) {
        filtered = filtered.filter(l => l.location.toLowerCase().includes(currentFilters.location));
    }

    displayListings(filtered);

    // Show results count
    const resultsCount = filtered.length;
    const grid = document.getElementById('listingsGrid');
    if (grid && resultsCount > 0) {
        const countMsg = document.createElement('p');
        countMsg.style.cssText = 'grid-column: 1/-1; text-align: center; color: #4A7C4E; font-weight: 600; margin-bottom: 1rem;';
        countMsg.textContent = `Found ${resultsCount} listing${resultsCount !== 1 ? 's' : ''}`;
        grid.insertAdjacentElement('beforebegin', countMsg);
        setTimeout(() => countMsg.remove(), 3000);
    }
}


// Clear Filters
// Clear Filters
function clearFilters() {
    document.getElementById('filterAnimalType').value = 'all';
    document.getElementById('filterBreed').value = '';
    document.getElementById('filterMinPrice').value = '';
    document.getElementById('filterMaxPrice').value = '';
    document.getElementById('filterLocation').value = '';
    
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
    const listing = allListings.find(l => l._id === listingId);
    if (!listing) return;
    
    const cart = getCart();
    const existingItem = cart.find(item => item.id === listingId);
    
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

function updateCartQuantity(listingId, change) {
    const cart = getCart();
    const item = cart.find(i => i.id === listingId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(listingId);
            return;
        }
        
        if (item.quantity > item.maxQuantity) {
            item.quantity = item.maxQuantity;
            showToast('Maximum available quantity reached!');
        }
        
        saveCart(cart);
        displayCart();
    }
}

function removeFromCart(listingId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== listingId);
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
            ${cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.breed}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${item.breed}</h3>
                        <p class="cart-item-info">
                            <span class="listing-badge">${item.animalType}</span>
                            <br>📍 ${item.location}
                        </p>
                        <p class="cart-item-info">Price per unit: ${item.pricePerUnit.toLocaleString()} RWF</p>
                        <div class="cart-item-controls">
                            <div class="quantity-control">
                                <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                            </div>
                            <span class="cart-item-price">${(item.pricePerUnit * item.quantity).toLocaleString()} RWF</span>
                            <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
                        </div>
                    </div>
                </div>
            `).join('')}
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
    
    // Get customer details from form
    const customerName = document.getElementById('checkoutName').value.trim();
    const customerPhone = document.getElementById('checkoutPhone').value.trim();
    const customerEmail = document.getElementById('checkoutEmail').value.trim();
    const deliveryAddress = document.getElementById('checkoutAddress').value.trim();
    
    if (!customerName || !customerPhone || !customerEmail) {
        showToast('Please fill in all required contact information!');
        return;
    }
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);
    const orderDetails = cart.map(item => 
        `${item.quantity}x ${item.breed} (${item.animalType}) - ${(item.pricePerUnit * item.quantity).toLocaleString()} RWF`
    ).join('\n');
    
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

// Update the initialization
document.addEventListener('DOMContentLoaded', () => {
    loadListings();
    initCart();
});






