document.addEventListener('DOMContentLoaded', () => {
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
    
    // Function to open overlay for a specific card
    function openOverlay(card) {
        // If we're in the middle of an animation, don't proceed
        if (isAnimating) return;
        isAnimating = true;
        
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
        const cardList = card.querySelector('ul') ? card.querySelector('ul').outerHTML : '';
        const cardInfo = card.querySelector('.contact-info') ? card.querySelector('.contact-info').innerHTML : '';
        
        // Add content to overlay
        overlayTitle.textContent = cardTitle;
        overlayDescription.innerHTML = `
            <h4>${cardSubtitle}</h4>
            ${cardList}
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
        if (overlay.classList.contains('active') && 
            !overlayContent.contains(event.target) && 
            event.target !== closeButton) {
            closeOverlay();
        }
    });

    function populateOverlayGallery(cardData) {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';
        
        if (cardData.dataset.gallery) {
            const images = JSON.parse(cardData.dataset.gallery);
            images.forEach(imagePath => {
                const img = document.createElement('img');
                img.src = imagePath;
                img.alt = 'Gallery Image';
                img.classList.add('gallery-image');
                gallery.appendChild(img);

                // Add click event to expand the image
                img.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    const imageContainer = document.createElement('div');
                    imageContainer.classList.add('expanded-image-container');
                    
                    const expandedImage = document.createElement('img');
                    expandedImage.src = img.src;
                    expandedImage.classList.add('expanded-image');
                    
                    imageContainer.appendChild(expandedImage);
                    overlayContent.appendChild(imageContainer);

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

                    // Prevent clicks on the image/container from closing
                    imageContainer.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                    
                    // Handle click to close
                    function closeHandler(e) {
                        if (!imageContainer.contains(e.target)) {
                            overlayContent.removeChild(imageContainer);
                            overlayContent.removeEventListener('click', closeHandler);
                        }
                    }

                    // Add the click event listener to overlayContent
                    overlayContent.addEventListener('click', closeHandler);

                    // Set container width to match image after it loads
                    expandedImage.onload = () => {
                        const aspectRatio = expandedImage.naturalWidth / expandedImage.naturalHeight;
                        const containerHeight = window.innerHeight * 0.7;
                        const containerWidth = containerHeight * aspectRatio;
                        imageContainer.style.width = `${containerWidth}px`;
                        
                        // Ensure container fits image exactly
                        if (expandedImage.offsetWidth < containerWidth) {
                            imageContainer.style.width = `${expandedImage.offsetWidth}px`;
                        }
                    };
                });
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
});