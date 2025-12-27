// API Base URL
const API_URL = 'http://localhost:3000/api';

// Admin password
const ADMIN_PASSWORD = 'goldenharvest123';

// Check if admin is logged in
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
});

// Check admin authentication
function checkAdminAuth() {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken === ADMIN_PASSWORD) {
        showAdminDashboard();
    } else {
        showAdminLogin();
    }
}

// Show admin login
function showAdminLogin() {
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

// Show admin dashboard
function showAdminDashboard() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadDashboardData();
}

// Handle admin login
function handleAdminLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const password = formData.get('password');
    
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminToken', password);
        showAdminDashboard();
        showToast('Login successful!');
    } else {
        showToast('Invalid password. Please try again.');
    }
}

// Admin logout
function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        showAdminLogin();
    }
}

// Show admin section
function showAdminSection(section) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.admin-nav button').forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    document.getElementById(`${section}Section`).classList.add('active');
    document.getElementById(`nav${section.charAt(0).toUpperCase() + section.slice(1)}`).classList.add('active');
    
    // Load section data
    if (section === 'listings') {
        loadAllListings();
    } else if (section === 'messages') {
        loadMessages();
    } else if (section === 'overview') {
        loadDashboardData();
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load listings
        const listingsResponse = await fetch(`${API_URL}/listings`);
        const listingsData = await listingsResponse.json();
        const listings = listingsData.listings || [];
        
        // Load messages
        const messagesResponse = await fetch(`${API_URL}/admin/messages`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const messagesData = await messagesResponse.json();
        const messages = messagesData.messages || [];
        
        // Update stats
        document.getElementById('statTotalListings').textContent = listings.length;
        document.getElementById('statActiveListings').textContent = listings.filter(l => l.status === 'active').length;
        document.getElementById('statTotalMessages').textContent = messages.length;
        
        const chickens = listings.filter(l => l.animalType === 'chicken').reduce((sum, l) => sum + l.quantity, 0);
        const goats = listings.filter(l => l.animalType === 'goat').reduce((sum, l) => sum + l.quantity, 0);
        
        document.getElementById('statChickens').textContent = chickens;
        document.getElementById('statGoats').textContent = goats;
        
        // Display recent listings
        displayRecentListings(listings.slice(0, 5));
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Display recent listings
function displayRecentListings(listings) {
    const container = document.getElementById('recentListingsTable');
    
    if (listings.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #757575;">No listings yet.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="listing-table">
            <table>
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Type</th>
                        <th>Breed</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Location</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${listings.map(listing => `
                        <tr>
                            <td><img src="${listing.image}" class="listing-image-small" alt="${listing.breed}"></td>
                            <td><span class="badge badge-${listing.animalType}">${listing.animalType}</span></td>
                            <td>${listing.breed}</td>
                            <td>${listing.quantity}</td>
                            <td>${listing.pricePerUnit.toLocaleString()} RWF</td>
                            <td>${listing.location}</td>
                            <td>${listing.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Load all listings
async function loadAllListings() {
    try {
        const response = await fetch(`${API_URL}/listings`);
        const data = await response.json();
        const listings = data.listings || [];
        
        displayAllListings(listings);
    } catch (error) {
        console.error('Error loading listings:', error);
    }
}

// Display all listings
function displayAllListings(listings) {
    const container = document.getElementById('allListingsTable');
    
    if (listings.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #757575;">No listings found.</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Type</th>
                    <th>Breed</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Location</th>
                    <th>Health Status</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${listings.map(listing => `
                    <tr>
                        <td><img src="${listing.image}" class="listing-image-small" alt="${listing.breed}"></td>
                        <td><span class="badge badge-${listing.animalType}">${listing.animalType}</span></td>
                        <td>${listing.breed}</td>
                        <td>${listing.quantity}</td>
                        <td>${listing.pricePerUnit.toLocaleString()} RWF</td>
                        <td>${listing.location}</td>
                        <td>${listing.healthStatus}</td>
                        <td>${listing.status}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-edit" onclick="editListing('${listing._id}')">Edit</button>
                                <button class="btn-delete" onclick="deleteListing('${listing._id}')">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Handle create listing
async function handleCreateListing(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        animalType: formData.get('animalType'),
        breed: formData.get('breed'),
        quantity: parseInt(formData.get('quantity')),
        pricePerUnit: parseInt(formData.get('pricePerUnit')),
        description: formData.get('description'),
        image: formData.get('image'),
        healthStatus: formData.get('healthStatus'),
        location: formData.get('location'),
        phone: formData.get('phone'),
        contactMethod: 'Phone'
    };
    
    try {
        const response = await fetch(`${API_URL}/admin/listings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('Listing created successfully!');
            event.target.reset();
            showAdminSection('listings');
        } else {
            showToast(result.message || 'Failed to create listing');
        }
    } catch (error) {
        console.error('Error creating listing:', error);
        showToast('An error occurred. Please try again.');
    }
}

// Edit listing
function editListing(listingId) {
    showToast('Edit functionality: You can implement a form pre-filled with listing data. Listing ID: ' + listingId);
    // TODO: Implement edit form
}

// Delete listing
async function deleteListing(listingId) {
    if (!confirm('Are you sure you want to delete this listing?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/listings/${listingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            showToast('Listing deleted successfully!');
            loadAllListings();
            loadDashboardData();
        } else {
            showToast('Failed to delete listing');
        }
    } catch (error) {
        console.error('Error deleting listing:', error);
        showToast('An error occurred. Please try again.');
    }
}

// Load messages
async function loadMessages() {
    try {
        const response = await fetch(`${API_URL}/admin/messages`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        const data = await response.json();
        const messages = data.messages || [];
        
        displayMessages(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Display messages
function displayMessages(messages) {
    const container = document.getElementById('messagesList');
    
    if (messages.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #757575;">No messages yet.</p>';
        return;
    }
    
    container.innerHTML = messages.map(msg => `
        <div class="message-item">
            <div class="message-header">
                <span class="message-name">${msg.name}</span>
                <span class="message-date">${new Date(msg.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="message-subject"><strong>Subject:</strong> ${msg.subject}</div>
            <div class="message-content">${msg.message}</div>
            <div class="message-contact">
                <strong>Contact:</strong> ${msg.email} | ${msg.phone}
            </div>
        </div>
    `).join('');
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