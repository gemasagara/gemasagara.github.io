// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
        
        // Close mobile menu if open
        if (navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
        }
    });
});

// Back to Top Button
const backToTopBtn = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Get all project cards
    const projectCards = document.querySelectorAll('.project-card');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    // Number of cards to show initially and on each load more click
    const cardsPerLoad = 3;
    let currentlyShown = cardsPerLoad;
    
    // Add a hidden class to your CSS if you don't have one
    // .hidden { display: none; }
    
    // Hide cards beyond the initial number
    projectCards.forEach((card, index) => {
        if (index >= cardsPerLoad) {
            card.classList.add('hidden');
        }
    });
    
    // Handle load more / show less button click
    loadMoreBtn.addEventListener('click', function() {
        if (loadMoreBtn.textContent === 'Load More') {
            // Show the next batch of cards
            for (let i = currentlyShown; i < currentlyShown + cardsPerLoad && i < projectCards.length; i++) {
                projectCards[i].classList.remove('hidden');
            }
            
            currentlyShown += cardsPerLoad;
            
            // If all cards are shown, change button text
            if (currentlyShown >= projectCards.length) {
                loadMoreBtn.textContent = 'Show Less';
            }
        } else {
            // Hide all cards except the first batch
            for (let i = cardsPerLoad; i < projectCards.length; i++) {
                projectCards[i].classList.add('hidden');
            }
            
            currentlyShown = cardsPerLoad;
            loadMoreBtn.textContent = 'Load More';
        }
    });
    
    // Hide the button if there are fewer cards than the initial show count
    if (projectCards.length <= cardsPerLoad) {
        loadMoreBtn.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const featuredGrid = document.querySelector('.featured-grid');
    const cards = featuredGrid.querySelectorAll('.featured-card');
    let cardWidth = 330; // Width including gap
    let scrollPosition = 0;
    let autoScrollSpeed = 1;
    let animationFrameId;
    
    function setupCarousel() {
        // Calculate actual card width including gap
        const card = cards[0];
        const gap = window.getComputedStyle(featuredGrid).gap.slice(0, -2) || 30;
        cardWidth = card.offsetWidth + parseInt(gap);
        
        // Clone cards dynamically based on viewport width
        const viewportWidth = window.innerWidth;
        const numClonesNeeded = Math.ceil(viewportWidth / cardWidth) + 1;
        
        // Clear existing clones
        const existingClones = featuredGrid.querySelectorAll('.cloned-card');
        existingClones.forEach(clone => clone.remove());
        
        // Add new clones
        for (let i = 0; i < numClonesNeeded; i++) {
            cards.forEach(card => {
                const clone = card.cloneNode(true);
                clone.classList.add('cloned-card');
                featuredGrid.appendChild(clone);
            });
        }
    }
    
    function autoScroll() {
        // Calculate total scrollable width
        const totalScrollWidth = cards.length * cardWidth;
        
        // If we've scrolled past the original cards, reset position seamlessly
        if (scrollPosition >= totalScrollWidth) {
            scrollPosition = 0;
            featuredGrid.scrollLeft = 0;
        }
        
        scrollPosition += autoScrollSpeed;
        featuredGrid.scrollLeft = scrollPosition;
        
        animationFrameId = requestAnimationFrame(autoScroll);
    }
    
    // Initialize carousel
    setupCarousel();
    autoScroll();
    
    // Pause on hover
    featuredGrid.addEventListener('mouseover', () => {
        autoScrollSpeed = 0;
    });
    
    featuredGrid.addEventListener('mouseout', () => {
        autoScrollSpeed = 1;
    });
    
    // Reinitialize on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setupCarousel();
        }, 250);
    });
});

function scrollCards(which, direction) {
    let container = null;
    if (which === 'exp'){
        container = document.querySelector('.exp-grid');
    } else {
        container = document.querySelector('.leadership-grid');
    }
    const scrollAmount = 350; // Adjust this value based on your card width + gap
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

// Scroll Animation
const fadeElements = document.querySelectorAll('.fade-in');

const fadeInOnScroll = () => {
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);
        
        if (isVisible) {
            element.classList.add('appear');
        }
    });
};

// Run on load
fadeInOnScroll();

// Run on scroll
window.addEventListener('scroll', fadeInOnScroll);
