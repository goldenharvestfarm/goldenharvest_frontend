// API Base URL
const API_URL = 'https://goldenharvest-backend.onrender.com';



// Check if admin is logged in
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
});

// Check admin authentication
function checkAdminAuth() {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
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
async function handleAdminLogin(event) {
    event.preventDefault();
    const password = new FormData(event.target).get('password');

    const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('adminToken', data.token); // backend sends back the password as token
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
        const listingsResponse = await fetch(`${API_URL}/api/listings`);
        const listingsData = await listingsResponse.json();
        const listings = listingsData.listings || [];
        
        // Load messages
        const messagesResponse = await fetch(`${API_URL}/api/admin/messages`, {
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
        const response = await fetch(`${API_URL}/api/listings`);
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
        <div style="width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 12px;">
        <table style="width: 100%; min-width: 900px; border-collapse: collapse;">
            <table>
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Type</th>
                        <th>Breed</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Weight (KG)</th>
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
                            <td><span class="badge badge-${listing.animalType?.toLowerCase()}">${listing.animalType}</span></td>
                            <td>${listing.breed}</td>
                            <td>${listing.quantity}</td>
                            <td>${listing.pricePerUnit.toLocaleString()} RWF</td>
                            <td>${listing.weightPerChicken || listing.weightPerGoat || listing.weightPerCow || '—'}</td>
                            <td>${listing.location}</td>
                            <td>${listing.healthStatus}</td>
                            <td><span class="badge badge-${listing.status === 'active' ? 'active' : 'inactive'}">${listing.status}</span></td>
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
        </div>
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
    weightPerChicken: parseFloat(formData.get('weightPerChicken')), // ← NEW
    description: formData.get('description'),
    image: formData.get('image'),
    healthStatus: formData.get('healthStatus'),
    location: formData.get('location'),
    phone: formData.get('phone'),
    contactMethod: 'Phone'
};
    
    try {
        const response = await fetch(`${API_URL}/api/admin/listings`, {
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
        const response = await fetch(`${API_URL}/api/admin/listings/${listingId}`, {
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
        const response = await fetch(`${API_URL}/api/admin/messages`, {
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
    window._adminMessages = messages;

    // Update counts
    const orders = messages.filter(m => m.subject?.toLowerCase().includes('order'));
    const contacts = messages.filter(m => !m.subject?.toLowerCase().includes('order'));
    document.getElementById('count-all').textContent = messages.length;
    document.getElementById('count-order').textContent = orders.length;
    document.getElementById('count-contact').textContent = contacts.length;

    renderMessages(messages);
}

function filterMessages(type) {
    // Update active tab
    document.querySelectorAll('.msg-tab').forEach(t => t.classList.remove('active'));
    event.target.closest('.msg-tab').classList.add('active');

    const messages = window._adminMessages || [];
    if (type === 'order') {
        renderMessages(messages.filter(m => m.subject?.toLowerCase().includes('order')));
    } else if (type === 'contact') {
        renderMessages(messages.filter(m => !m.subject?.toLowerCase().includes('order')));
    } else {
        renderMessages(messages);
    }
}

function renderMessages(messages) {
    const container = document.getElementById('messagesList');

    if (messages.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #757575;">No messages in this category.</p>';
        return;
    }

    container.innerHTML = messages.map((msg, index) => {
        const isOrder = msg.subject?.toLowerCase().includes('order');
        const date = new Date(msg.createdAt);
        const formatted = date.toLocaleDateString() + ' · ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const globalIndex = window._adminMessages.indexOf(msg);

        return `
        <div class="message-item" id="msg-${globalIndex}">
            <div class="message-header">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span class="message-type-badge ${isOrder ? 'badge-order' : 'badge-contact'}">
                        ${isOrder ? '🛒 Order' : '✉️ Inquiry'}
                    </span>
                    <span class="message-name">${msg.name}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span class="message-date">${formatted}</span>
                    <button class="msg-eye-btn" onclick="toggleMessage(${globalIndex})" title="View Details">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
            </div>
            <div class="message-subject">${msg.subject}</div>
            <div class="message-detail" id="detail-${globalIndex}" style="display: none;">
                <div class="message-content">${msg.message.replace(/\n/g, '<br>')}</div>
                <div class="message-contact">
                    <span>📧 ${msg.email}</span>
                    <span>📞 ${msg.phone}</span>
                </div>
                <button class="msg-print-btn" onclick="printMessage(${globalIndex})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Print / Save as PDF
                </button>
            </div>
        </div>
        `;
    }).join('');

}

    


function toggleMessage(index) {
    const detail = document.getElementById(`detail-${index}`);
    const isOpen = detail.style.display !== 'none';
    detail.style.display = isOpen ? 'none' : 'block';
}





function printMessage(index) {
    const msg = window._adminMessages[index];
    const date = new Date(msg.createdAt);
    const formatted = date.toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isOrder = msg.subject?.toLowerCase().includes('order');
    const printId = 'GHF-' + date.getFullYear() + '-' + String(index + 1).padStart(4, '0');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${msg.subject} — Golden Harvest Farm</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }

                @page {
                    size: A4;
                    margin: 0px;
                }

                body {
                    font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: #fff;
                    color: #222;
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                }

                /* ── Header ── */
                .doc-header {
                    background: linear-gradient(135deg, #1f3d22 0%, #2E5C32 60%, #4A7C4E 100%);
                    padding: 2rem 2.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: #fff;
                }

                .doc-header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .doc-logo {
                    width: 52px;
                    height: 52px;
                    background: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                    border: 1.5px solid rgba(255,255,255,0.25);
                }

                .doc-company h1 {
                    font-size: 1.3rem;
                    font-weight: 800;
                    letter-spacing: 0.02em;
                }

                .doc-company p {
                    font-size: 0.78rem;
                    opacity: 0.75;
                    margin-top: 0.2rem;
                    font-style: italic;
                }

                .doc-header-right {
                    text-align: right;
                }

                .doc-ref {
                    font-size: 0.72rem;
                    opacity: 0.7;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 0.3rem;
                }

                .doc-ref-num {
                    font-size: 1.1rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                }

                .doc-type-badge {
                    display: inline-block;
                    margin-top: 0.5rem;
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 0.25rem 0.9rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                /* ── Meta bar ── */
                .doc-meta-bar {
                    background: #f0f7f1;
                    border-bottom: 2px solid #c8e6c9;
                    padding: 0.75rem 2.5rem;
                    display: flex;
                    gap: 2.5rem;
                    align-items: center;
                }

                .doc-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.78rem;
                    color: #555;
                }

                .doc-meta-item strong {
                    color: #1f3d22;
                    font-weight: 700;
                }

                /* ── Body ── */
                .doc-body {
                    padding: 1.8rem 2.5rem;
                    flex: 1;
                }

                .doc-section-title {
                    font-size: 0.65rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #4A7C4E;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.4rem;
                    border-bottom: 1.5px solid #e8f5e9;
                }

                /* Sender info grid */
                .doc-info-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .doc-info-card {
                    background: #fafffe;
                    border: 1px solid #e0ede0;
                    border-radius: 8px;
                    padding: 0.7rem 0.9rem;
                }

                .doc-info-label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #aaa;
                    margin-bottom: 0.25rem;
                }

                .doc-info-value {
                    font-size: 0.88rem;
                    font-weight: 600;
                    color: #1f3d22;
                }

                /* Subject row */
                .doc-subject-row {
                    background: #1f3d22;
                    color: #fff;
                    border-radius: 8px;
                    padding: 0.8rem 1.1rem;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    font-size: 0.92rem;
                    font-weight: 700;
                }

                /* Message box */
                .doc-message-box {
                    background: #faf9f6;
                    border: 1px solid #e8e4de;
                    border-left: 4px solid #2E5C32;
                    border-radius: 0 8px 8px 0;
                    padding: 1.1rem 1.3rem;
                    font-size: 0.88rem;
                    line-height: 1.8;
                    color: #333;
                    margin-bottom: 1.5rem;
                    white-space: pre-wrap;
                }

                /* Divider */
                .doc-divider {
                    border: none;
                    border-top: 1px dashed #ddd;
                    margin: 1.2rem 0;
                }

                /* Printed by row */
                .doc-printed-row {
                    background: #f0f7f1;
                    border-radius: 8px;
                    padding: 0.6rem 1rem;
                    font-size: 0.75rem;
                    color: #666;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                /* ── Footer ── */
                .doc-footer {
                    background: #1f3d22;
                    color: rgba(255,255,255,0.8);
                    padding: 1rem 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.72rem;
                }

                .doc-footer strong { color: #fff; }

                @media print {
                    body { width: 100%; }
                    .doc-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .doc-meta-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .doc-subject-row { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .doc-footer { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .doc-message-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>

            <!-- Header -->
            <div class="doc-header">
                <div class="doc-header-left">
                    <div class="doc-logo"><img src="images/logo_GHF-removebg-preview.png" alt="Golden Harvest Farm" style="height: 38px; width: 38px; object-fit: contain;"></div>
                    <div class="doc-company">
                        <h1>Golden Harvest Farm</h1>
                        <p>Farm Fresh. Fairly Traded.</p>
                    </div>
                </div>
                <div class="doc-header-right">
                    <div class="doc-ref">Reference No.</div>
                    <div class="doc-ref-num">${printId}</div>
                    <div class="doc-type-badge">${isOrder ? '🛒 Order Record' : '✉️ Contact Inquiry'}</div>
                </div>
            </div>

            <!-- Meta bar -->
            <div class="doc-meta-bar">
                <div class="doc-meta-item">📅 <strong>Date:</strong> ${formatted}</div>
                <div class="doc-meta-item">📍 <strong>Location:</strong> Kigali, Rwanda</div>
                <div class="doc-meta-item">🖨️ <strong>Printed:</strong> ${new Date().toLocaleString()}</div>
            </div>

            <!-- Body -->
            <div class="doc-body">

                <div class="doc-section-title">Sender Information</div>
                <div class="doc-info-grid">
                    <div class="doc-info-card">
                        <div class="doc-info-label">Full Name</div>
                        <div class="doc-info-value">${msg.name}</div>
                    </div>
                    <div class="doc-info-card">
                        <div class="doc-info-label">Email Address</div>
                        <div class="doc-info-value">${msg.email}</div>
                    </div>
                    <div class="doc-info-card">
                        <div class="doc-info-label">Phone Number</div>
                        <div class="doc-info-value">${msg.phone}</div>
                    </div>
                </div>

                <div class="doc-section-title">Subject</div>
                <div class="doc-subject-row">
                    ${isOrder ? '🛒' : '✉️'} ${msg.subject}
                </div>

                <div class="doc-section-title">Message / Order Details</div>
                <div class="doc-message-box">${msg.message}</div>

                <hr class="doc-divider">

                <div class="doc-printed-row">
                    <span>📋 This document is an official record of Golden Harvest Farm.</span>
                    <span>Keep for your records.</span>
                </div>

            </div>

            <!-- Footer -->
            <div class="doc-footer">
                <div>
                    <strong>Golden Harvest Farm</strong> · Kigali, Rwanda
                </div>
                <div>
                    📞 +250 788 000 000 &nbsp;|&nbsp; ✉️ info@goldenharvestfarm.com
                </div>
                <div>
                    © ${new Date().getFullYear()} All rights reserved.
                </div>
            </div>

        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 400);
}