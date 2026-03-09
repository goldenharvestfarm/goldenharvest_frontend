// Inject shared header
function injectHeader(activePage) {
    const headerEl = document.getElementById('site-header');
    if (!headerEl) return;

    headerEl.innerHTML = `
    <header class="header">
        <div class="container">
            <div class="nav-wrapper">
                <div class="logo" onclick="window.location.href='index.html'" style="cursor:pointer;">
                    <img class="logo-icon" src="images/logo_GHF-removebg-preview.png" alt="">
                    <div>
                        <h1 data-translate="site_name">Golden Harvest Farm</h1>
                        <p class="tagline" data-translate="tagline">Farm Fresh. Fairly Traded.</p>
                    </div>
                </div>

                <nav class="desktop-nav">
                    <a href="index.html" class="${activePage === 'home' ? 'active-nav' : ''}" data-translate="nav_home">Home</a>
                    <a href="buy.html" class="${activePage === 'buy' ? 'active-nav' : ''}" data-translate="nav_buy">Buy Livestock</a>
                    <a href="about.html" class="${activePage === 'about' ? 'active-nav' : ''}" data-translate="nav_about">About Us</a>
                    <a href="contact.html" class="${activePage === 'contact' ? 'active-nav' : ''}" data-translate="nav_contact">Contact</a>
                    <a href="cart.html" class="cart-link ${activePage === 'cart' ? 'active-nav' : ''}" data-translate="nav_cart_label">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span id="cartCount" class="cart-count">0</span>
                    </a>
                    <select id="languageSwitcher" onchange="changeLanguage()" class="lang-switcher" aria-label="Language switcher">
                        <option value="en" data-translate="lang_en">English</option>
                        <option value="rw" data-translate="lang_rw">Kinyarwanda</option>
                    </select>
                </nav>

                <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
                    <span></span><span></span><span></span>
                </button>
            </div>

            <nav class="mobile-nav" id="mobileNav">

    <div class="mobile-nav-header">
        <div class="mobile-logo" onclick="window.location.href='index.html'">
            <img src="images/logo_GHF-removebg-preview.png" alt="">
            <span>Golden Harvest Farm</span>
        </div>

        <button class="mobile-close-btn" onclick="toggleMobileMenu()">✕</button>
    </div>

    <a href="index.html" class="${activePage === 'home' ? 'active-nav' : ''}" data-translate="nav_home">Home</a>
    <a href="buy.html" class="${activePage === 'buy' ? 'active-nav' : ''}" data-translate="nav_buy">Buy Livestock</a>
    <a href="about.html" class="${activePage === 'about' ? 'active-nav' : ''}" data-translate="nav_about">About Us</a>
    <a href="contact.html" class="${activePage === 'contact' ? 'active-nav' : ''}" data-translate="nav_contact">Contact</a>

    <a href="cart.html" class="${activePage === 'cart' ? 'active-nav' : ''}">
        Cart (<span id="mobileCartCount">0</span>)
    </a>

    <select id="mobileLanguageSwitcher" onchange="changeLanguage()" class="lang-switcher">
        <option value="en">English</option>
        <option value="rw">Kinyarwanda</option>
    </select>

</nav>

<div id="mobileOverlay" class="mobile-overlay"></div>
        </div>
    </header>
    `;
}

// Inject shared footer
function injectFooter() {
    const footerEl = document.getElementById('site-footer');
    if (!footerEl) return;

    footerEl.innerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <h3 data-translate="footer_name">Golden Harvest Farm</h3>
                    <p data-translate="footer_tagline">Farm Fresh. Fairly Traded.</p>
                </div>
                <div class="footer-col">
                    <h4 data-translate="footer_quick_links">Quick Links</h4>
                    <ul>
                        <li><a href="index.html" data-translate="nav_home">Home</a></li>
                        <li><a href="buy.html" data-translate="nav_buy">Buy Livestock</a></li>
                        <li><a href="about.html" data-translate="nav_about">About Us</a></li>
                        <li><a href="contact.html" data-translate="nav_contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4 data-translate="footer_contact">Contact</h4>
                    <p data-translate="footer_phone">Phone: +250 788 000 000</p>
                    <p data-translate="footer_email">Email: info@goldenharvestfarm.com</p>
                    <p data-translate="footer_location">Location: Kigali, Rwanda</p>
                </div>
                <div class="footer-col">
                    <h4 data-translate="footer_hours">Business Hours</h4>
                    <p data-translate="footer_mon">Monday - Friday: 8AM - 6PM</p>
                    <p data-translate="footer_sat">Saturday: 8AM - 4PM</p>
                    <p data-translate="footer_sun">Sunday: Closed</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Golden Harvest Farm. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Toast Modal -->
    <div id="toastModal" class="toast-modal">
        <div class="toast-content">
            <p id="toastMessage"></p>
            <button id="toastCloseBtn">OK</button>
        </div>
    </div>
    `;
}

// Mobile menu toggle
const mobileNav = document.getElementById("mobileNav");
const overlay = document.getElementById("mobileOverlay");
const menuBtn = document.querySelector(".mobile-menu-btn");

/* toggle menu */
function toggleMobileMenu(){
    mobileNav.classList.toggle("active");
    overlay.classList.toggle("active");
    menuBtn.classList.toggle("active");
}

/* close menu */
function closeMobileMenu(){
    mobileNav.classList.remove("active");
    overlay.classList.remove("active");
    menuBtn.classList.remove("active");
}


/* close when link clicked */
document.querySelectorAll(".mobile-nav a").forEach(link=>{
    link.addEventListener("click", closeMobileMenu);
});





