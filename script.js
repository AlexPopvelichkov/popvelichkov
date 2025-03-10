document.addEventListener('DOMContentLoaded', () => {
    // Preload gallery images
    preloadGalleryImages();
    
    const cards = document.querySelectorAll('.card');
    const overlay = document.getElementById('overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayDescription = document.getElementById('overlay-description');
    const gallery = document.querySelector('.gallery');
    const closeButton = document.querySelector('.close-btn');
    const overlayContent = document.querySelector('.overlay-content');
    
    // Store the last clicked card and its dimensions
    let activeCard = null;
    let originalCardRect = null;
    let isAnimating = false; // Flag to prevent animation conflicts
    
    // Hide overlay initially
    overlay.style.display = 'none';
    
    // Function to disable body scrolling
    function disableBodyScroll() {
        document.body.style.overflow = 'hidden';
    }

    // Function to enable body scrolling
    function enableBodyScroll() {
        document.body.style.overflow = '';
    }
    
    // Function to open overlay for a specific card
    function openOverlay(card) {
        // If we're in the middle of an animation, don't proceed
        if (isAnimating) return;
        isAnimating = true;
        
        // Disable body scrolling when opening a card
        disableBodyScroll();
        
        // If we already have an active card, make it visible again
        if (activeCard && activeCard !== card) {
            activeCard.style.visibility = 'visible';
        }
        
        // Store the clicked card
        activeCard = card;
        
        // Get the card's position and dimensions
        originalCardRect = card.getBoundingClientRect();
        
        // Set initial position and size to match the clicked card exactly
        overlay.style.position = 'fixed';
        overlay.style.top = `${originalCardRect.top}px`;
        overlay.style.left = `${originalCardRect.left}px`;
        overlay.style.width = `${originalCardRect.width}px`;
        overlay.style.height = `${originalCardRect.height}px`;
        overlay.style.transform = 'none';
        
        // Make overlay visible but with opacity 0
        overlay.style.display = 'block';
        overlay.style.opacity = '0';
        
        // Force browser to recognize the initial state
        void overlay.offsetWidth;
        
        // Get content from the card
        const cardTitle = card.querySelector('h3').textContent;
        const cardSubtitle = card.querySelector('h4') ? card.querySelector('h4').textContent : '';
        const cardInfo = card.querySelector('.contact-info') ? card.querySelector('.contact-info').innerHTML : '';
        const cardDescription = card.querySelector('.card-description') ? card.querySelector('.card-description').innerHTML : '';
        
        // Add content to overlay
        overlayTitle.textContent = cardTitle;
        overlayDescription.innerHTML = `
            <h4>${cardSubtitle}</h4>
            ${cardDescription}
            <div class="contact-info">${cardInfo}</div>
        `;
        
        // Get the card's ID for specific data
        const cardId = card.getAttribute('data-card-id') || cardTitle.toLowerCase().replace(/\s+/g, '-');
        
        // Load images into gallery (placeholder for now)
        gallery.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const img = document.createElement('img');
            img.src = `/api/placeholder/400/320`;
            img.alt = `${cardTitle} Image ${i}`;
            gallery.appendChild(img);
        }
        
        // Start the animation
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            overlay.style.top = '3%';
            overlay.style.left = '50%';
            overlay.style.width = '90%';
            overlay.style.height = '93vh';
            overlay.style.transform = 'translateX(-50%)';
            overlay.classList.add('active');
            
            // Hide the original card
            activeCard.style.visibility = 'hidden';
            
            // Animation is complete
            setTimeout(() => {
                isAnimating = false;
            }, 300);
        });
    }
    
    // Add click event listeners to all cards
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // If overlay is already active, first close it with a quick animation
            if (overlay.classList.contains('active')) {
                // Store the current card dimensions for a smoother transition
                const currentCardRect = card.getBoundingClientRect();
                
                // First fade out the current overlay
                overlay.style.opacity = '0.5';
                
                // Quick reset of animation flag for new animation
                setTimeout(() => {
                    // Open new overlay immediately after fade
                    openOverlay(card);
                }, 100);
            } else {
                // Normal opening if no overlay is active
                openOverlay(card);
            }
            populateOverlayGallery(card);
        });
    });

    // Function to close the overlay and animate back to original card
    function closeOverlay() {
        if (!activeCard || !originalCardRect || isAnimating) return;
        
        isAnimating = true;
        
        // Enable body scrolling when closing the card
        enableBodyScroll();
        
        // Remove any expanded image container and backdrop if they exist
        const expandedImageContainer = document.querySelector('.expanded-image-container');
        const backdrop = document.querySelector('.image-backdrop');
        
        if (expandedImageContainer) {
            document.body.removeChild(expandedImageContainer);
        }
        
        if (backdrop) {
            document.body.removeChild(backdrop);
        }
        
        // Animate back to original card size and position
        overlay.style.top = `${originalCardRect.top}px`;
        overlay.style.left = `${originalCardRect.left}px`;
        overlay.style.width = `${originalCardRect.width}px`;
        overlay.style.height = `${originalCardRect.height}px`;
        overlay.style.transform = 'none';
        overlay.style.opacity = '0';
        overlay.classList.remove('active');
        
        // Show the original card after animation completes
        setTimeout(() => {
            overlay.style.display = 'none';
            if (activeCard) {
                activeCard.style.visibility = 'visible';
                activeCard = null;
                originalCardRect = null;
            }
            isAnimating = false;
        }, 300);
    }

    // Close when clicking the close button
    closeButton.addEventListener('click', closeOverlay);
    
    // Close when clicking outside the overlay content
    document.addEventListener('mousedown', (event) => {
        // Check if overlay is active and the click is outside the content
        // AND not on the backdrop or expanded image container
        const backdrop = document.querySelector('.image-backdrop');
        const expandedImageContainer = document.querySelector('.expanded-image-container');
        
        if (overlay.classList.contains('active') && 
            !overlayContent.contains(event.target) && 
            event.target !== closeButton &&
            !(backdrop && backdrop.contains(event.target)) &&
            !(expandedImageContainer && expandedImageContainer.contains(event.target))) {
            closeOverlay();
        }
    });

    function populateOverlayGallery(cardData) {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';
        
        if (cardData.dataset.gallery) {
            const images = JSON.parse(cardData.dataset.gallery);
            
            // Create a container for the gallery layout
            const galleryContainer = document.createElement('div');
            galleryContainer.classList.add('gallery-container');
            
            // Group related images (1&2, 3&4, 5&6)
            for (let i = 0; i < images.length; i += 2) {
                // Create a group for each pair of related images
                const group = document.createElement('div');
                group.classList.add('image-group');
                
                // Add the first image of the pair
                if (i < images.length) {
                    const imgWrapper1 = document.createElement('div');
                    imgWrapper1.classList.add('image-wrapper');
                    
                    const img1 = document.createElement('img');
                    img1.src = images[i];
                    img1.alt = 'Gallery Image';
                    img1.classList.add('gallery-image');
                    
                    imgWrapper1.appendChild(img1);
                    group.appendChild(imgWrapper1);
                    
                    // Add click event to expand the image
                    addImageClickHandler(img1);
                }
                
                // Add the second image of the pair if it exists
                if (i + 1 < images.length) {
                    const imgWrapper2 = document.createElement('div');
                    imgWrapper2.classList.add('image-wrapper');
                    
                    const img2 = document.createElement('img');
                    img2.src = images[i + 1];
                    img2.alt = 'Gallery Image';
                    img2.classList.add('gallery-image');
                    
                    imgWrapper2.appendChild(img2);
                    group.appendChild(imgWrapper2);
                    
                    // Add click event to expand the image
                    addImageClickHandler(img2);
                }
                
                galleryContainer.appendChild(group);
            }
            
            gallery.appendChild(galleryContainer);
        }
        
        // Helper function to add click handler for image expansion
        function addImageClickHandler(img) {
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const imageContainer = document.createElement('div');
                imageContainer.classList.add('expanded-image-container');
                
                const expandedImage = document.createElement('img');
                expandedImage.src = img.src;
                expandedImage.classList.add('expanded-image');
                
                // Create a backdrop element for blur/dim effect
                const backdrop = document.createElement('div');
                backdrop.classList.add('image-backdrop');
                
                imageContainer.appendChild(expandedImage);
                
                // Append backdrop to document.body first, then the container
                document.body.appendChild(backdrop);
                document.body.appendChild(imageContainer);

                // Set up zoom functionality
                let scale = 1;
                const SCALE_STEP = 0.35;
                const MAX_SCALE = 4;

                // Handle zoom with mouse wheel
                imageContainer.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    
                    // Get cursor position relative to image
                    const rect = expandedImage.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;

                    // Calculate new scale based on scroll direction
                    const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
                    const newScale = Math.max(1, Math.min(MAX_SCALE, scale + delta));
                    
                    if (newScale !== scale) {
                        scale = newScale;
                        
                        // Apply transform with transform-origin at cursor position
                        expandedImage.style.transformOrigin = `${x * 100}% ${y * 100}%`;
                        expandedImage.style.transform = `scale(${scale})`;
                        
                        // Update cursor based on whether we can zoom in/out more
                        expandedImage.style.cursor = scale === 1 ? 'zoom-in' : 'move';
                    }
                });

                // Create a function to close just the expanded image view
                function closeExpandedImage(e) {
                    e.stopPropagation();
                    
                    if (document.body.contains(imageContainer)) {
                        document.body.removeChild(imageContainer);
                    }
                    if (document.body.contains(backdrop)) {
                        document.body.removeChild(backdrop);
                    }
                    
                    backdrop.removeEventListener('click', closeExpandedImage);
                }

                // Add click event to backdrop to close the expanded image
                backdrop.addEventListener('click', closeExpandedImage);
                
                // Prevent clicks on the image container from closing
                imageContainer.addEventListener('click', (e) => {
                    e.stopPropagation();
                });

                // Set container width to match image after it loads
                expandedImage.onload = () => {
                    const aspectRatio = expandedImage.naturalWidth / expandedImage.naturalHeight;
                    const containerHeight = window.innerHeight * 0.9;
                    const containerWidth = containerHeight * aspectRatio;
                    
                    // Only set the width if the image is wider than it is tall
                    if (aspectRatio > 1) {
                        imageContainer.style.width = `${containerWidth}px`;
                    } else {
                        // For portrait images, let the height be the limiting factor
                        imageContainer.style.width = 'auto';
                    }
                    
                    // Let the image fill the container naturally
                    expandedImage.style.height = '100%';
                    expandedImage.style.width = 'auto';
                    
                    // Ensure the container isn't too wide for the screen
                    if (imageContainer.offsetWidth > window.innerWidth * 0.9) {
                        imageContainer.style.width = '90vw';
                    }
                };
            });
        }
    }

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
    });

    // Add scrollbar auto-hide functionality
    let scrollTimeout;
    document.addEventListener('scroll', () => {
        document.body.classList.remove('scroll-hidden');
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.body.classList.add('scroll-hidden');
        }, 1500); // Hide after 1.5 seconds of inactivity
    });

    // Function to preload all gallery images
    function preloadGalleryImages() {
        const cards = document.querySelectorAll('.card[data-gallery]');
        
        cards.forEach(card => {
            try {
                const galleryData = JSON.parse(card.getAttribute('data-gallery'));
                if (Array.isArray(galleryData)) {
                    galleryData.forEach(imgSrc => {
                        const img = new Image();
                        img.src = imgSrc;
                    });
                }
            } catch (error) {
                console.warn('Error preloading gallery images:', error);
            }
        });
    }
});