/**
 * Slate Theme - Main JavaScript
 * Photography Portfolio with Lightbox
 */

(function() {
    'use strict';

    // Gallery items data
    var galleryItems = [];
    var currentIndex = 0;

    // DOM elements
    var lightbox;
    var lightboxImage;
    var lightboxTitle;
    var prevBtn;
    var nextBtn;
    var closeBtn;

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        initLightbox();
        initGallery();
        initKeyboardNav();
    });

    /**
     * Initialize lightbox elements
     */
    function initLightbox() {
        lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        lightboxImage = lightbox.querySelector('.lightbox-image');
        lightboxTitle = lightbox.querySelector('.lightbox-title');
        prevBtn = lightbox.querySelector('.lightbox-prev');
        nextBtn = lightbox.querySelector('.lightbox-next');
        closeBtn = lightbox.querySelector('.lightbox-close');

        // Close button
        closeBtn.addEventListener('click', closeLightbox);

        // Backdrop click to close
        lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);

        // Navigation buttons
        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navigateTo(currentIndex - 1);
        });

        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navigateTo(currentIndex + 1);
        });
    }

    /**
     * Initialize gallery items
     */
    function initGallery() {
        var items = document.querySelectorAll('.gallery-item');

        items.forEach(function(item, index) {
            var data = {
                image: item.dataset.image,
                title: item.dataset.title || '',
                url: item.dataset.url
            };
            galleryItems.push(data);

            var link = item.querySelector('[data-gallery-open]');
            if (link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    openLightbox(index);
                });
            }
        });
    }

    /**
     * Open lightbox at specific index
     */
    function openLightbox(index) {
        if (!lightbox || galleryItems.length === 0) return;

        currentIndex = index;
        updateLightboxContent();

        lightbox.classList.add('is-active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Focus trap
        closeBtn.focus();
    }

    /**
     * Close lightbox
     */
    function closeLightbox() {
        if (!lightbox) return;

        lightbox.classList.remove('is-active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Clear image
        lightboxImage.classList.remove('is-loaded');
    }

    /**
     * Navigate to specific index
     */
    function navigateTo(index) {
        if (index < 0 || index >= galleryItems.length) return;

        currentIndex = index;
        lightboxImage.classList.remove('is-loaded');
        updateLightboxContent();
    }

    /**
     * Update lightbox content for current index
     */
    function updateLightboxContent() {
        var item = galleryItems[currentIndex];
        if (!item) return;

        // Update image
        lightboxImage.src = item.image;
        lightboxImage.alt = item.title || '';

        lightboxImage.onload = function() {
            lightboxImage.classList.add('is-loaded');
        };

        // Update title
        lightboxTitle.textContent = item.title;

        // Update navigation visibility
        prevBtn.classList.toggle('is-hidden', currentIndex === 0);
        nextBtn.classList.toggle('is-hidden', currentIndex === galleryItems.length - 1);
    }

    /**
     * Keyboard navigation
     */
    function initKeyboardNav() {
        document.addEventListener('keydown', function(e) {
            if (!lightbox || !lightbox.classList.contains('is-active')) return;

            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    navigateTo(currentIndex - 1);
                    break;
                case 'ArrowRight':
                    navigateTo(currentIndex + 1);
                    break;
            }
        });
    }

    /**
     * Touch/swipe support for mobile
     */
    (function initTouchNav() {
        var touchStartX = 0;
        var touchEndX = 0;
        var minSwipeDistance = 50;

        document.addEventListener('touchstart', function(e) {
            if (!lightbox || !lightbox.classList.contains('is-active')) return;
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', function(e) {
            if (!lightbox || !lightbox.classList.contains('is-active')) return;

            touchEndX = e.changedTouches[0].screenX;
            var diff = touchStartX - touchEndX;

            if (Math.abs(diff) > minSwipeDistance) {
                if (diff > 0) {
                    // Swipe left - next
                    navigateTo(currentIndex + 1);
                } else {
                    // Swipe right - prev
                    navigateTo(currentIndex - 1);
                }
            }
        }, { passive: true });
    })();

})();
