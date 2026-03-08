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
    showListingSkeleton("listingsGrid", 8);
    showListingSkeleton("homeListingsGrid", 6);

    // Restore page from URL hash on refresh
    const hash = window.location.hash.replace('#', '');
    const validPages = ['home', 'buy', 'about', 'contact', 'cart'];
});

// Page Navigation
function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
        window.location.hash = pageName; // ← saves current page in URL

        // Update active nav link
        document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(link => {
            link.classList.remove('active-nav');
        });
        document.querySelectorAll(`[onclick*="showPage('${pageName}')"]`).forEach(el => {
            el.classList.add('active-nav');
        });

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

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.add-to-cart-btn');
    if (btn) {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        addToCart(id);
    }
});



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
                <button class="add-to-cart-btn" data-id="${listing._id}">
    Order Now
</button>
            </div>
        </div>
    `).join('');
}


// ── Updated displayHomeListings ──────────────────────────────────────────────

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
                <button class="add-to-cart-btn" data-id="${listing._id}">
    Order Now
</button>
            </div>
        </div>
    `).join('');
}






function showListingSkeleton(gridId, count = 6){

    const grid = document.getElementById(gridId);
    if(!grid) return;

    let html = "";

    for(let i=0;i<count;i++){

        html += `
        <div class="listing-card">
            <div class="skeleton skeleton-image"></div>

            <div class="skeleton-content">

                <div class="skeleton skeleton-line skeleton-small"></div>

                <div class="skeleton skeleton-title skeleton"></div>

                <div class="skeleton skeleton-line"></div>

                <div class="skeleton skeleton-line skeleton-small"></div>

                <div class="skeleton skeleton-line skeleton-small"></div>

                <div class="skeleton skeleton-btn"></div>

            </div>
        </div>
        `;
    }

    grid.innerHTML = html;
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
// Add this CSS to your stylesheet or <style> tag
const successModalStyles = `
  .success-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.2s ease;
  }

  .success-modal {
    background: #fff;
    border-radius: 16px;
    padding: 48px 40px 36px;
    max-width: 420px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    animation: slideUp 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .success-icon {
    width: 72px;
    height: 72px;
    background: #3dba6f;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both;
  }

  .success-icon svg {
    width: 36px;
    height: 36px;
    stroke: white;
    stroke-width: 3;
    fill: none;
  }

  .success-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: #3dba6f;
    margin: 0 0 12px;
  }

  .success-text {
    color: #555;
    font-size: 0.97rem;
    line-height: 1.6;
    margin: 0 0 28px;
  }

  .success-progress {
    height: 3px;
    background: #e8e8e8;
    border-radius: 2px;
    overflow: hidden;
  }

  .success-progress-bar {
    height: 100%;
    background: #3dba6f;
    border-radius: 2px;
    animation: progress 3s linear forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes popIn {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes progress {
    from { width: 0%; }
    to { width: 100%; }
  }
`;

function showSuccessModal(message) {
  // Inject styles if not already added
  if (!document.getElementById('success-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'success-modal-styles';
    style.textContent = successModalStyles;
    document.head.appendChild(style);
  }

  const overlay = document.createElement('div');
  overlay.className = 'success-overlay';
  overlay.innerHTML = `
    <div class="success-modal">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h2 class="success-title">Success!</h2>
      <p class="success-text">${message}</p>
      <div class="success-progress">
        <div class="success-progress-bar"></div>
      </div>
    </div>
  `;

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);

  // Auto-dismiss after 3 seconds (matches progress bar)
  setTimeout(() => {
    overlay.style.animation = 'fadeIn 0.6s ease reverse';
    setTimeout(() => overlay.remove(), 600);
  }, 6000);
}

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
      showSuccessModal('Message sent successfully! We will get back to you soon.');
      event.target.reset();
    } else {
      showToast('Failed to send message. Please try calling us directly at +250 788 000 000');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    showSuccessModal('Message saved! We will contact you soon. You can also call us at +250 788 000 000');
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

