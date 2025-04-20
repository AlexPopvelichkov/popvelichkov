// Remove all gallery-related code
// Remove the following:
// - DOMContentLoaded event listener for gallery
// - allImages array
// - shuffleArray function
// - gallery row initialization
// - animationiteration event listener
// - click event handlers for gallery items

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
    
    // Add reveal more indicators to cards with descriptions
    cards.forEach(card => {
        const description = card.querySelector('.card-description');
        
        // Only proceed with modifications if the card has a description
        if (description) {
            // Mark card as having a description
            card.classList.add('has-description');
            
            // Create and add the "reveal more" indicator
            const revealMore = document.createElement('div');
            revealMore.classList.add('reveal-more');
            revealMore.innerHTML = `
                <span>Click to reveal more</span>
                <div class="padlock"></div>
            `;
            
            // Add click handler specifically for the reveal more button
            revealMore.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event from bubbling to card
                
                if (!card.classList.contains('expanded')) {
                    card.classList.add('expanded');
                } else {
                    card.classList.remove('expanded');
                }
            });
            
            card.appendChild(revealMore);
            
            // Make sure description is at the end of the card
            card.appendChild(description);
            
            // Add click handler for toggling expanded state
            card.addEventListener('click', function(e) {
                // Get if the click was on a link or other interactive element
                const isInteractiveElement = e.target.tagName === 'A' || 
                                            e.target.tagName === 'BUTTON' ||
                                            e.target.closest('a') || 
                                            e.target.closest('button');
                
                // If clicking on an interactive element or the reveal more button, don't handle here
                if (isInteractiveElement || e.target.closest('.reveal-more')) {
                    return;
                }
                
                // If card is not expanded, expand it
                if (!card.classList.contains('expanded')) {
                    card.classList.add('expanded');
                    e.stopPropagation();
                } else {
                    // If clicking content in expanded state, allow overlay to open
                    // If clicking empty space, collapse the card
                    const isEmptySpace = e.target === card;
                    if (isEmptySpace) {
                        card.classList.remove('expanded');
                        e.stopPropagation();
                    }
                    // Otherwise let the click bubble up to handle overlay opening
                }
            });
        }
    });
    
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
    
    // Add click event listeners to all cards for overlay functionality
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Only open overlay if card is expanded or doesn't have a description
            const hasDescription = card.querySelector('.card-description');
            const isExpanded = card.classList.contains('expanded');
            
            // Don't open overlay for cards with descriptions that aren't expanded yet
            if (hasDescription && !isExpanded) {
                return;
            }
            
            // Don't open overlay if clicking the "reveal more" button
            if (e.target.closest('.reveal-more')) {
                return;
            }
            
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
                
                // Create close button
                const closeButton = document.createElement('button');
                closeButton.classList.add('close-expanded-btn');
                
                // Create a backdrop element for blur/dim effect
                const backdrop = document.createElement('div');
                backdrop.classList.add('image-backdrop');
                
                imageContainer.appendChild(expandedImage);
                imageContainer.appendChild(closeButton);
                
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

                // Create a function to close the expanded image view
                function closeExpandedImage(e) {
                    e.stopPropagation();
                    
                    if (document.body.contains(imageContainer)) {
                        document.body.removeChild(imageContainer);
                    }
                    if (document.body.contains(backdrop)) {
                        document.body.removeChild(backdrop);
                    }
                }

                // Add click event to backdrop and close button to close the expanded image
                backdrop.addEventListener('click', closeExpandedImage);
                closeButton.addEventListener('click', closeExpandedImage);
                
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
                    if (imageContainer.offsetWidth > window.innerWidth * 0.95) {
                        imageContainer.style.width = '95vw';
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

    // Initialize scrollers
    const scrollers = document.querySelectorAll(".scroller");

    // If a user hasn't opted in for reduced motion, then we add the animation
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        addAnimation();
    }

    function addAnimation() {
        scrollers.forEach((scroller) => {
            // add data-animated="true" to every `.scroller` on the page
            scroller.setAttribute("data-animated", true);

            // Make an array from the elements within `.scroller-inner`
            const scrollerInner = scroller.querySelector(".scroller__inner");
            
            // Load random images from the gallery
            loadRandomImages(scrollerInner);
        });
    }

    function loadRandomImages(scrollerInner) {
        // Get all images from the gallery
        const galleryImages = [
            "images/deform/image1.jpg",
            "images/deform/image2.jpg",
            "images/deform/image3.jpg",
            "images/deform/image4.jpg",
            "images/deform/image5.jpg",
            "images/deform/image6.jpg",
            "images/rebus/image1.jpg",
            "images/rebus/image2.jpg"
        ];

        // Shuffle the array
        const shuffledImages = galleryImages.sort(() => Math.random() - 0.5);

        // Add images to the scroller
        shuffledImages.forEach((imagePath) => {
            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = 'Gallery Image';
            img.loading = 'lazy';
            scrollerInner.appendChild(img);
        });

        // Clone the images for seamless scrolling
        const scrollerContent = Array.from(scrollerInner.children);
        scrollerContent.forEach((item) => {
            const duplicatedItem = item.cloneNode(true);
            duplicatedItem.setAttribute("aria-hidden", true);
            scrollerInner.appendChild(duplicatedItem);
        });
    }
});