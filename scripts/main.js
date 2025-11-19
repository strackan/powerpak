/**
 * GTM.Consulting - Main JavaScript
 * Handles tabs, navigation, and interactive features
 */

// ================================================
// Tab Switching Functionality
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeSmoothScroll();
    handleURLParameters();
});

/**
 * Initialize tab switching functionality
 */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            const activePanel = document.getElementById(`tab-${targetTab}`);
            if (activePanel) {
                activePanel.classList.add('active');
            }

            // Update URL with tab parameter (optional, for sharing)
            updateURLParameter('tab', targetTab);
        });
    });
}

/**
 * Handle URL parameters on page load
 * Allows direct linking to specific tabs (e.g., #services?tab=startup)
 */
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');

    if (tabParam) {
        const targetButton = document.querySelector(`[data-tab="${tabParam}"]`);
        if (targetButton) {
            targetButton.click();
        }
    }
}

/**
 * Update URL parameter without page reload
 */
function updateURLParameter(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}

/**
 * Smooth scroll for anchor links
 */
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#" or has query parameters (tab links)
            if (href === '#' || href.includes('?')) {
                if (href.includes('?')) {
                    e.preventDefault();
                    const [hash, query] = href.split('?');
                    const target = document.querySelector(hash);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
                return;
            }

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80; // Account for sticky header
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ================================================
// Mobile Navigation Toggle (if needed later)
// ================================================

/**
 * Toggle mobile navigation
 * (Placeholder for future mobile menu implementation)
 */
function toggleMobileNav() {
    const nav = document.querySelector('.main-nav');
    nav.classList.toggle('mobile-active');
}

// ================================================
// Placeholder for Phase 2: Video Animations
// ================================================

/**
 * Future: Video animation system
 * This section will handle the "living paintings" effect
 * where static images occasionally animate
 */

// Uncomment and implement in Phase 2
/*
const videoConfig = {
    fadeInDuration: 2000,  // 2 seconds fade in
    fadeOutDuration: 2000, // 2 seconds fade out
    playDuration: 5000,    // 5 seconds of video playback
};

function playImageAnimation(containerId, videoSrc) {
    // Will implement: crossfade from static image to video and back
}

function initializeTimedTriggers() {
    // Will implement: 11:11, Fibonacci sequence, etc.
}

function initializeInteractiveTriggers() {
    // Will implement: mail icon progression, hover duration, etc.
}
*/
