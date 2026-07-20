/**
 * Connectify - Main Script File
 * Contains routing utilities, navigation events, animation observers,
 * validation hooks, and dynamic feeds interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Shared Page Framework Initializers
  initActiveNavLinks();
  initSmoothScrolling();
  initMobileMenu();
  initScrollAnimations();
  initSearchAnimation();

  // Authentication Helpers (Login/Registration views)
  initPasswordVisibilityToggle();
  initRegistrationValidation();
  initAvatarUploadPreview();

  // Feed View Interactions (feed.html)
  initDynamicFeed(); // Load localStorage posts first to attach event listeners to them
  initLikeToggle();
  initStoryDragScroll();
  initSidebarActiveState();
  initImagePopupModal();
  initPostCreator(); // Initialize Create Post page handlers
});

/* ==========================================================================
   Shared Page Framework Core Functions
   ========================================================================== */

/**
 * 1. Navbar Active Link Handler
 * Highlights header navigation links matching the window pathname.
 */
function initActiveNavLinks() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('#nav-menu a, #nav-logo');
  
  navLinks.forEach(link => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    if (currentPath === linkPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * 2. Smooth scrolling navigation anchor links
 */
function initSmoothScrolling() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  
  anchors.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = document.getElementById('main-header')?.offsetHeight || 72;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 3. Mobile Header Hamburger Navigation Dropdown Toggle
 */
function initMobileMenu() {
  const headerContainer = document.querySelector('.header-container');
  const navMenu = document.getElementById('nav-menu');
  
  if (!headerContainer || !navMenu) return;

  const menuButton = document.createElement('button');
  menuButton.id = 'mobile-menu-toggle';
  menuButton.className = 'mobile-toggle-btn';
  menuButton.setAttribute('aria-label', 'Toggle Navigation Menu');
  menuButton.innerHTML = '☰';
  
  Object.assign(menuButton.style, {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '1.8rem',
    cursor: 'pointer',
    padding: '4px 8px',
    transition: 'transform var(--transition-fast)'
  });

  headerContainer.insertBefore(menuButton, navMenu);

  const mediaQuery = window.matchMedia('(max-width: 768px)');
  
  function handleBreakpoint(e) {
    if (e.matches) {
      menuButton.style.display = 'block';
      navMenu.style.display = 'none';
      menuButton.innerHTML = '☰';
      menuButton.style.transform = 'rotate(0deg)';
    } else {
      menuButton.style.display = 'none';
      navMenu.style.display = 'flex';
      navMenu.style.flexDirection = 'row';
    }
  }

  mediaQuery.addEventListener('change', handleBreakpoint);
  handleBreakpoint(mediaQuery);

  menuButton.addEventListener('click', () => {
    const isCollapsed = navMenu.style.display === 'none';
    if (isCollapsed) {
      navMenu.style.display = 'flex';
      navMenu.style.flexDirection = 'column';
      navMenu.style.width = '100%';
      menuButton.innerHTML = '✕';
      menuButton.style.transform = 'rotate(90deg)';
    } else {
      navMenu.style.display = 'none';
      menuButton.innerHTML = '☰';
      menuButton.style.transform = 'rotate(0deg)';
    }
  });
}

/**
 * 4. IntersectionObserver Scroll Reveal animations for content cards
 */
function initScrollAnimations() {
  const cards = document.querySelectorAll('.feature-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)';
    card.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetCard = entry.target;
        targetCard.style.opacity = '1';
        targetCard.style.transform = 'translateY(0)';
        observerInstance.unobserve(targetCard);
      }
    });
  }, observerOptions);

  cards.forEach(card => observer.observe(card));
}

/**
 * 5. Global Search form scale animations on input selection
 */
function initSearchAnimation() {
  const searchInput = document.getElementById('nav-search-input');
  const searchForm = document.getElementById('nav-search-form');
  
  if (!searchInput || !searchForm) return;

  searchInput.addEventListener('focus', () => {
    searchForm.classList.add('search-focused');
    searchForm.style.transform = 'scale(1.02)';
    searchForm.style.transition = 'transform var(--transition-fast)';
  });

  searchInput.addEventListener('blur', () => {
    searchForm.classList.remove('search-focused');
    searchForm.style.transform = 'scale(1)';
  });
}

/* ==========================================================================
   Authentication Interactive Functions (login.html & register.html)
   ========================================================================== */

/**
 * 6. Show / Hide password field visibility toggle
 */
function initPasswordVisibilityToggle() {
  const toggleBtn = document.getElementById('toggle-password-btn');
  const passwordInput = document.getElementById('login-password');

  if (!toggleBtn || !passwordInput) return;

  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    // Toggle input field type
    passwordInput.type = isPassword ? 'text' : 'password';
    // Update button text and accessibility metadata
    toggleBtn.textContent = isPassword ? 'Hide' : 'Show';
    toggleBtn.setAttribute('aria-pressed', isPassword);
  });
}

/**
 * 7. Live Profile Picture Upload local file preview loader
 */
function initAvatarUploadPreview() {
  const avatarInput = document.getElementById('register-avatar');
  const previewImg = document.getElementById('avatar-preview');

  if (!avatarInput || !previewImg) return;

  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      // Inject local binary image path directly into the preview img src
      reader.onload = (event) => {
        previewImg.src = event.target.result;
      };
      
      reader.readAsDataURL(file);
    }
  });
}

/**
 * 8. Client-side Registration form field check validation handler
 */
function initRegistrationValidation() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Stop instant server form submission
    
    let isValid = true;
    
    // Validate Full Name
    const fullname = document.getElementById('register-fullname');
    const fullnameError = document.getElementById('fullname-error');
    if (fullname.validity.valueMissing || fullname.value.trim().length < 2) {
      showError(fullname, fullnameError, 'Full name must contain at least 2 characters.');
      isValid = false;
    } else {
      clearError(fullname, fullnameError);
    }

    // Validate Username
    const username = document.getElementById('register-username');
    const usernameError = document.getElementById('username-error');
    const usernamePattern = /^[a-zA-Z0-9_]+$/;
    if (!usernamePattern.test(username.value)) {
      showError(username, usernameError, 'Username can only contain letters, numbers, and underscores.');
      isValid = false;
    } else if (username.value.length < 3) {
      showError(username, usernameError, 'Username must be at least 3 characters long.');
      isValid = false;
    } else {
      clearError(username, usernameError);
    }

    // Validate Email
    const email = document.getElementById('register-email');
    const emailError = document.getElementById('email-error');
    if (!email.validity.valid) {
      showError(email, emailError, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearError(email, emailError);
    }

    // Validate Password Match
    const password = document.getElementById('register-password');
    const passwordError = document.getElementById('password-error');
    const confirmPassword = document.getElementById('register-confirm-password');
    const confirmError = document.getElementById('confirm-password-error');

    if (password.value.length < 8) {
      showError(password, passwordError, 'Password must be at least 8 characters long.');
      isValid = false;
    } else {
      clearError(password, passwordError);
    }

    if (password.value !== confirmPassword.value) {
      showError(confirmPassword, confirmError, 'Passwords do not match.');
      isValid = false;
    } else {
      clearError(confirmPassword, confirmError);
    }

    // Process Mock Submission if all fields are valid
    if (isValid) {
      alert('Mock Registration Successful! Validation passed.');
      registerForm.reset();
      // Restore default SVG preview picture avatar
      document.getElementById('avatar-preview').src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2318181c'/><circle cx='50' cy='40' r='20' fill='%2352525b'/><path d='M20,85 C20,70 30,60 50,60 C70,60 80,70 80,85' fill='%2352525b'/></svg>";
    }
  });

  // Error logging helpers
  function showError(inputElement, errorElement, message) {
    inputElement.style.borderColor = '#ff3b30';
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  function clearError(inputElement, errorElement) {
    inputElement.style.borderColor = 'var(--border-color)';
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
}

/* ==========================================================================
   Feed Interactions Functions (feed.html)
   ========================================================================== */

/**
 * 9. Interactive Post Like toggling
 * Updates the like button color state and dynamically parses and increments/decrements
 * the post likes count directly in the UI.
 */
function initLikeToggle() {
  const likeButtons = document.querySelectorAll('.like-btn');
  
  likeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle liked state class
      const isLiked = btn.classList.toggle('liked');
      
      // Update like text and icon colors dynamically
      const label = btn.querySelector('.action-label');
      const icon = btn.querySelector('.action-icon');
      
      if (isLiked) {
        btn.style.color = 'var(--accent-color)';
        btn.style.borderColor = 'rgba(255, 48, 79, 0.2)';
        btn.style.backgroundColor = 'rgba(255, 48, 79, 0.04)';
        if (label) label.textContent = 'Liked';
      } else {
        btn.style.color = 'var(--text-primary)';
        btn.style.borderColor = 'var(--border-color)';
        btn.style.backgroundColor = 'transparent';
        if (label) label.textContent = 'Like';
      }

      // Locate parent card to find and increment/decrement its specific likes counter
      const postCard = btn.closest('.post-card');
      if (postCard) {
        const likesCountEl = postCard.querySelector('.post-likes-count');
        if (likesCountEl) {
          // Parse number of likes using regex digits match
          let likesCount = parseInt(likesCountEl.textContent.replace(/[^0-9]/g, ''), 10) || 0;
          
          if (isLiked) {
            likesCount++;
          } else {
            likesCount--;
          }
          // Format back into localized string (comma separation)
          likesCountEl.textContent = `${likesCount.toLocaleString()} likes`;
        }
      }
    });
  });
}

/**
 * 10. Horizontal stories drag-to-scroll mouse gesture handler
 * Allows desktop users to drag the story list horizontally to scroll (similar to a touch drag gesture).
 */
function initStoryDragScroll() {
  const slider = document.querySelector('.stories-section');
  if (!slider) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.style.cursor = 'grabbing';
    // Calculate cursor horizontal click index minus section offset margin
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.style.cursor = 'grab';
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.style.cursor = 'grab';
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault(); // Stop highlighting text elements during drag scroll
    const x = e.pageX - slider.offsetLeft;
    // Walk represents coordinate displacement scaled for velocity acceleration
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  });
}

/**
 * 11. Left sidebar list navigation highlight toggling
 */
function initSidebarActiveState() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  
  sidebarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Toggle highlight active configuration class on navigation item selections
      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

/**
 * 12. Zoom popup modal viewer for post images
 * Dynamically constructs, styles, and injects modal elements into the DOM
 * when a user clicks on post images. Destroys the modal on exit clicks or Esc key presses.
 */
function initImagePopupModal() {
  const postImages = document.querySelectorAll('.post-image');
  
  postImages.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      // Build the Overlay container dynamically
      const overlay = document.createElement('div');
      overlay.className = 'image-modal-overlay';
      
      // Build the Close Button element
      const closeBtn = document.createElement('button');
      closeBtn.className = 'image-modal-close-btn';
      closeBtn.innerHTML = '✕';
      closeBtn.setAttribute('aria-label', 'Close Image Modal');
      
      // Build Zoomed Image element
      const zoomImg = document.createElement('img');
      zoomImg.className = 'image-modal-zoomed';
      zoomImg.src = img.src;
      zoomImg.alt = img.alt;

      // Inline styles are configured directly in JS to keep styles decoupled from static CSS
      Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        zIndex: '9999',
        display: 'flex',
        align-items: 'center',
        justify-content: 'center',
        opacity: '0',
        transition: 'opacity var(--transition-normal)',
        cursor: 'zoom-out'
      });

      Object.assign(zoomImg.style, {
        maxWidth: '90%',
        maxHeight: '85vh',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        transform: 'scale(0.95)',
        transition: 'transform var(--transition-normal)'
      });

      Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '24px',
        right: '24px',
        background: 'rgba(255, 255, 255, 0.08)',
        border: 'none',
        color: 'var(--text-primary)',
        fontSize: '1.25rem',
        cursor: 'pointer',
        width: '40px',
        height: '40px',
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        align-items: 'center',
        justify-content: 'center',
        transition: 'background var(--transition-fast)'
      });

      // Assemble nodes
      overlay.appendChild(closeBtn);
      overlay.appendChild(zoomImg);
      document.body.appendChild(overlay);

      // Trigger fade-in transition
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        zoomImg.style.transform = 'scale(1)';
      });

      // Cleanup function to close the modal
      function closeModal() {
        overlay.style.opacity = '0';
        zoomImg.style.transform = 'scale(0.95)';
        setTimeout(() => {
          overlay.remove();
        }, 300);
        document.removeEventListener('keydown', handleEsc);
      }

      // Close modal on overlays or button clicks
      overlay.addEventListener('click', closeModal);
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop overlay bubble events
        closeModal();
      });

      // Close modal on Esc keyboard trigger
      function handleEsc(e) {
        if (e.key === 'Escape') closeModal();
      }
      document.addEventListener('keydown', handleEsc);
    });
  });
}

/**
 * 13. Create Post Form Handler (create-post.html)
 * Manages file picking, preview display overlays, local validation checks,
 * and saves new posts as Base64 data blocks inside localStorage.
 */
function initPostCreator() {
  const form = document.getElementById('create-post-form');
  const fileInput = document.getElementById('post-image-input');
  const dragArea = document.getElementById('drag-picker-area');
  const previewWrapper = document.getElementById('post-preview-wrapper');
  const previewImg = document.getElementById('post-image-preview');
  const removeBtn = document.getElementById('remove-preview-btn');
  const captionInput = document.getElementById('post-caption-input');
  
  if (!form || !fileInput || !dragArea) return;

  // Handle Drag & Drop styling triggers
  ['dragenter', 'dragover'].forEach(eventName => {
    dragArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      dragArea.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dragArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      dragArea.classList.remove('dragover');
    }, false);
  });

  // Handle dropped files
  dragArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
      fileInput.files = files;
      handlePostImageSelect(files[0]);
    }
  });

  // Handle traditional input click upload
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handlePostImageSelect(file);
    }
  });

  // Render selected image preview in the UI
  function handlePostImageSelect(file) {
    // Confirm uploaded file is an image
    if (!file.type.match('image.*')) {
      alert('Please upload a valid image file (JPG, PNG, GIF).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      previewImg.src = event.target.result;
      dragArea.style.display = 'none';
      previewWrapper.style.display = 'flex';
      // Clear image error messages if any
      document.getElementById('image-error').style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  // Remove preview image
  removeBtn.addEventListener('click', () => {
    fileInput.value = ''; // Reset input selection
    previewImg.src = '';
    previewWrapper.style.display = 'none';
    dragArea.style.display = 'flex';
  });

  // Validate form requirements and store post object
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isValid = true;
    const imageError = document.getElementById('image-error');
    const captionError = document.getElementById('caption-error');
    
    // Validate image presence
    if (!fileInput.files.length && !previewImg.src) {
      imageError.textContent = 'Please select or drag an image to share.';
      imageError.style.display = 'block';
      isValid = false;
    } else {
      imageError.style.display = 'none';
    }

    // Validate caption presence
    if (!captionInput.value.trim()) {
      captionError.textContent = 'Please enter a caption for your post.';
      captionError.style.display = 'block';
      isValid = false;
    } else {
      captionError.style.display = 'none';
    }

    if (isValid) {
      // Create local storage representation of the post
      const newPost = {
        id: 'post-' + Date.now(),
        username: 'alex_design', // Mock user profile
        avatar: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23121214'/><circle cx='50' cy='40' r='20' fill='%2338bdf8'/><path d='M20,85 C20,70 30,60 50,60 C70,60 80,70 80,85' fill='%2338bdf8'/></svg>",
        timestamp: 'Just now',
        image: previewImg.src, // Base64 encoded data representation
        caption: captionInput.value.trim(),
        likesCount: 0,
        liked: false
      };

      // Retrieve existing list, unshift (newest first), and save back to localStorage
      const existingPosts = JSON.parse(localStorage.getItem('connectify_posts')) || [];
      existingPosts.unshift(newPost);
      localStorage.setItem('connectify_posts', JSON.stringify(existingPosts));
      
      // Redirect user to the feed page
      window.location.href = '/feed';
    }
  });
}

/**
 * 14. Load and Render Dynamic localStorage Posts (feed.html)
 * Retrieves posts created by the user from localStorage and prepends them
 * dynamically to the posts feed section before the standard demo posts.
 */
function initDynamicFeed() {
  const feedSection = document.getElementById('posts-feed-section');
  if (!feedSection) return;

  const dynamicPosts = JSON.parse(localStorage.getItem('connectify_posts')) || [];
  
  dynamicPosts.forEach(post => {
    const postHTML = `
      <article class="post-card" id="${post.id}">
        <!-- Post Header -->
        <header class="post-header">
          <div class="post-user-info">
            <img src="${post.avatar}" alt="${post.username}'s avatar" class="post-avatar">
            <div class="post-meta">
              <a href="/profile" class="post-username">${post.username}</a>
              <time class="post-time">${post.timestamp}</time>
            </div>
          </div>
          <button type="button" class="post-options-btn" aria-label="More Options">•••</button>
        </header>

        <!-- Post Main Image -->
        <div class="post-media-container">
          <img src="${post.image}" alt="User uploaded post image" class="post-image">
        </div>

        <!-- Post Footer / Actions / Caption -->
        <footer class="post-footer">
          
          <!-- Interaction buttons row -->
          <div class="post-actions-row">
            <div class="primary-actions">
              <button type="button" class="post-action-btn like-btn" aria-label="Like Post">
                <span class="action-icon">❤️</span> <span class="action-label">Like</span>
              </button>
              <button type="button" class="post-action-btn comment-btn" aria-label="Comment on Post">
                <span class="action-icon">💬</span> <span class="action-label">Comment</span>
              </button>
            </div>
            <button type="button" class="post-action-btn share-btn" aria-label="Share Post">
              <span class="action-icon">📤</span> <span class="action-label">Share</span>
            </button>
          </div>

          <!-- Likes Count and Captions -->
          <div class="post-content">
            <p class="post-likes-count">${post.likesCount} likes</p>
            <p class="post-caption-text">
              <a href="/profile" class="caption-username">${post.username}</a> 
              ${escapeHTML(post.caption)}
            </p>
          </div>

        </footer>
      </article>
    `;
    
    // Insert at the top of the feed list
    feedSection.insertAdjacentHTML('afterbegin', postHTML);
  });
}

/**
 * Escapes characters to prevent XSS injection issues when outputting captions.
 */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
