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
 * 9. Interactive Post Like Toggling & Double-Click animations
 * Manages liked states in localStorage, updates counts instantly, triggers
 * bounce animations on button clicks, and overlays pop hearts on post image double-clicks.
 */
function initLikeToggle() {
  const likeButtons = document.querySelectorAll('.like-btn');
  
  likeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const postCard = btn.closest('.post-card');
      if (!postCard) return;
      
      const postId = postCard.id;
      const isLiked = btn.classList.toggle('liked');
      
      // Update like text and icon colors dynamically
      const label = btn.querySelector('.action-label');
      
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

      // Update state in localStorage
      let posts = JSON.parse(localStorage.getItem('connectify_posts')) || [];
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex !== -1) {
        // Toggle liked boolean
        posts[postIndex].liked = isLiked;
        
        // Update likesCount number
        if (isLiked) {
          posts[postIndex].likesCount++;
        } else {
          posts[postIndex].likesCount--;
        }
        
        localStorage.setItem('connectify_posts', JSON.stringify(posts));
        
        // Update DOM count
        const likesCountEl = postCard.querySelector('.post-likes-count');
        if (likesCountEl) {
          likesCountEl.textContent = `${posts[postIndex].likesCount.toLocaleString()} likes`;
        }
      }
    });
  });

  // Enable Double-Click to Like on post images
  const mediaContainers = document.querySelectorAll('.post-media-container');
  mediaContainers.forEach(container => {
    container.addEventListener('dblclick', () => {
      const postCard = container.closest('.post-card');
      if (!postCard) return;

      const likeBtn = postCard.querySelector('.like-btn');
      
      // Trigger like click if not already liked
      if (likeBtn && !likeBtn.classList.contains('liked')) {
        likeBtn.click();
      }

      // Create and overlay the pop heart icon dynamically
      const overlayHeart = document.createElement('span');
      overlayHeart.className = 'overlay-heart-animation';
      overlayHeart.innerHTML = '❤️';
      
      container.appendChild(overlayHeart);
      
      // Remove overlay element after keyframe animation terminates (800ms)
      setTimeout(() => {
        overlayHeart.remove();
      }, 800);
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
        liked: false,
        comments: [] // Initialize empty comments array
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
 * Seeds default posts on first run, displays a friendly empty state if no posts exist,
 * renders posts newest-first, and binds dropdown option toggles & delete actions.
 */
function initDynamicFeed() {
  const feedSection = document.getElementById('posts-feed-section');
  if (!feedSection) return;

  // Default seed posts for first-time visitors (now featuring custom comments)
  const defaultPosts = [
    {
      id: 'post-1',
      username: 'alex_design',
      avatar: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23121214'/><circle cx='50' cy='40' r='20' fill='%2338bdf8'/><path d='M20,85 C20,70 30,60 50,60 C70,60 80,70 80,85' fill='%2338bdf8'/></svg>",
      timestamp: '2 hours ago',
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><defs><linearGradient id='g1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%231e1b4b'/><stop offset='50%25' stop-color='%23311042'/><stop offset='100%25' stop-color='%230f172a'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g1)'/><circle cx='300' cy='200' r='100' fill='%23ff304f' opacity='0.15'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-size='24' font-weight='bold' opacity='0.8'>Neon Vibes - Design Concepts</text></svg>",
      caption: 'Working on some fresh dark-mode layouts tonight. What do you think of this neon gradient colorway? Let me know! 🚀🎨',
      likesCount: 1248,
      liked: false,
      comments: [
        { id: 'c-1', username: 'sarah_m', text: 'This is gorgeous! 💜', timestamp: '1 hour ago' },
        { id: 'c-2', username: 'lucas_dev', text: 'Stunning colors, what software did you use?', timestamp: '30m ago' }
      ]
    },
    {
      id: 'post-2',
      username: 'sarah_m',
      avatar: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23121214'/><circle cx='50' cy='40' r='20' fill='%23a855f7'/><path d='M20,85 C20,70 30,60 50,60 C70,60 80,70 80,85' fill='%23a855f7'/></svg>",
      timestamp: '5 hours ago',
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><defs><linearGradient id='g2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%230284c7'/><stop offset='100%25' stop-color='%230f172a'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g2)'/><path d='M50,300 Q150,150 250,250 T450,100 T550,200 L550,400 L50,400 Z' fill='%230369a1' opacity='0.4'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-size='24' font-weight='bold' opacity='0.8'>Chasing Horizons</text></svg>",
      caption: 'Chasing horizons. Reminiscing on this serene morning in the peaks. Nature has a beautiful way of resetting the soul. 🏔️✨',
      likesCount: 842,
      liked: false,
      comments: [
        { id: 'c-3', username: 'alex_design', text: 'Stunning view, Sarah!', timestamp: '4 hours ago' }
      ]
    },
    {
      id: 'post-3',
      username: 'lucas_dev',
      avatar: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23121214'/><circle cx='50' cy='40' r='20' fill='%23f43f5e'/><path d='M20,85 C20,70 30,60 50,60 C70,60 80,70 80,85' fill='%23f43f5e'/></svg>",
      timestamp: '1 day ago',
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><defs><linearGradient id='g3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23115e59'/><stop offset='100%25' stop-color='%230f172a'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g3)'/><rect x='150' y='100' width='300' height='200' rx='10' fill='%23000000' opacity='0.3'/><text x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%232dd4bf' font-family='monospace' font-size='18' font-weight='bold'>npm run build</text><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%238e8e93' font-family='monospace' font-size='14'>✓ Build completed in 2.3s</text></svg>",
      caption: 'Finally hit 100% test coverage and got the production build compilation under 3 seconds! Time to deploy. ☕💻🚀 #devlife #node',
      likesCount: 315,
      liked: false,
      comments: []
    }
  ];

  let dynamicPosts = JSON.parse(localStorage.getItem('connectify_posts'));

  // Seed default posts if key doesn't exist (first run ever)
  if (dynamicPosts === null) {
    dynamicPosts = defaultPosts;
    localStorage.setItem('connectify_posts', JSON.stringify(defaultPosts));
  }

  // If feed is empty, render the friendly empty state
  if (dynamicPosts.length === 0) {
    renderEmptyState(feedSection);
    return;
  }

  // Render posts: dynamicPosts has new items at the beginning, so drawing them in order places newest at the top
  dynamicPosts.forEach(post => {
    const isLiked = post.liked === true;
    const likedClass = isLiked ? 'liked' : '';
    const likedLabel = isLiked ? 'Liked' : 'Like';
    const likedStyle = isLiked ? 'style="color: var(--accent-color); border-color: rgba(255, 48, 79, 0.2); background-color: rgba(255, 48, 79, 0.04);"' : '';

    // Generate inner comments HTML list
    const postComments = post.comments || [];
    let commentsHTML = '';
    
    postComments.forEach(comment => {
      commentsHTML += `
        <div class="comment-item">
          <a href="/profile" class="comment-username">${comment.username}</a>
          <span class="comment-text">${escapeHTML(comment.text)}</span>
          <span class="comment-time">${comment.timestamp}</span>
        </div>
      `;
    });

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
          <div class="post-options-wrapper">
            <button type="button" class="post-options-btn" aria-label="More Options">•••</button>
            <div class="post-options-dropdown" style="display: none;">
              <button type="button" class="dropdown-item delete-post-btn" data-id="${post.id}">
                <span class="dropdown-icon">🗑️</span> Delete Post
              </button>
            </div>
          </div>
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
              <button type="button" class="post-action-btn like-btn ${likedClass}" ${likedStyle} aria-label="Like Post">
                <span class="action-icon">❤️</span> <span class="action-label">${likedLabel}</span>
              </button>
              <button type="button" class="post-action-btn comment-btn" aria-label="Comment on Post">
                <span class="action-icon">💬</span> <span class="action-label">Comment</span>
              </button>
            </div>
            <button type="button" class="post-action-btn share-btn" aria-label="Share Post">
              <span class="action-icon">📤</span> <span class="action-label">Share</span>
            </button>
          </div>

          <!-- Likes Count, Captions, Comments -->
          <div class="post-content">
            <p class="post-likes-count">${post.likesCount.toLocaleString()} likes</p>
            <p class="post-caption-text">
              <a href="/profile" class="caption-username">${post.username}</a> 
              ${escapeHTML(post.caption)}
            </p>
            
            <!-- Dynamic Comments List Container -->
            <div class="post-comments-list" id="comments-list-${post.id}">
              ${commentsHTML}
            </div>
          </div>

          <!-- Inline Comment Form container -->
          <div class="comment-form-container">
            <form class="comment-form" data-post-id="${post.id}">
              <input type="text" class="comment-input" placeholder="Add a comment..." required autocomplete="off">
              <button type="submit" class="comment-post-btn">Post</button>
            </form>
          </div>

        </footer>
      </article>
    `;
    
    // Append to feed (ordered newest first in localStorage array, so we draw in sequence)
    feedSection.insertAdjacentHTML('beforeend', postHTML);
  });

  // Bind dropdown action toggles
  bindPostDropdowns();
  // Bind dynamic comment submission events
  initComments();
}

/**
 * Renders the friendly empty-state card in the center of the feed.
 */
function renderEmptyState(container) {
  container.innerHTML = `
    <div class="feed-empty-state" id="feed-empty-state">
      <div class="empty-state-icon" aria-hidden="true">🎴</div>
      <h2 class="empty-state-title">Your Feed is Empty</h2>
      <p class="empty-state-text">No posts have been published yet. Share your first moment to start the conversation!</p>
      <a href="/create-post" class="btn btn-cta">Create Your First Post</a>
    </div>
  `;
}

/**
 * Handles toggling and action handling of post dropdowns (like Delete).
 */
function bindPostDropdowns() {
  const optionsButtons = document.querySelectorAll('.post-options-btn');
  
  optionsButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = btn.nextElementSibling;
      
      // Close any other open dropdowns
      document.querySelectorAll('.post-options-dropdown').forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
      });

      // Toggle current dropdown
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
  });

  // Close dropdowns on background click
  document.addEventListener('click', () => {
    document.querySelectorAll('.post-options-dropdown').forEach(d => {
      d.style.display = 'none';
    });
  });

  // Bind post delete triggers
  const deleteButtons = document.querySelectorAll('.delete-post-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const postId = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this post?')) {
        deleteLocalPost(postId);
      }
    });
  });
}

/**
 * Deletes a post from localStorage, removes its node from the DOM,
 * and renders the empty state if there are no posts remaining.
 */
function deleteLocalPost(postId) {
  let posts = JSON.parse(localStorage.getItem('connectify_posts')) || [];
  posts = posts.filter(p => p.id !== postId);
  localStorage.setItem('connectify_posts', JSON.stringify(posts));

  const card = document.getElementById(postId);
  if (card) {
    card.remove();
  }

  const feedSection = document.getElementById('posts-feed-section');
  if (posts.length === 0 && feedSection) {
    renderEmptyState(feedSection);
  }
}

/**
 * 15. Comments Submission System (feed.html)
 * Intercepts form submissions from comment fields, updates the post's comment
 * structure inside localStorage, and appends the comment node at the bottom
 * of the comments row (newest last).
 */
function initComments() {
  const commentForms = document.querySelectorAll('.comment-form');
  
  commentForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const postId = form.getAttribute('data-post-id');
      const input = form.querySelector('.comment-input');
      const commentText = input.value.trim();
      
      if (!commentText) return;

      const newComment = {
        id: 'comment-' + Date.now(),
        username: 'alex_design', // Mocked active user profile
        text: commentText,
        timestamp: 'Just now'
      };

      // Retrieve local posts, select post index, and push new comment
      let posts = JSON.parse(localStorage.getItem('connectify_posts')) || [];
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex !== -1) {
        posts[postIndex].comments = posts[postIndex].comments || [];
        posts[postIndex].comments.push(newComment); // Newest comments last
        localStorage.setItem('connectify_posts', JSON.stringify(posts));

        // Inject new comment element at the bottom of the comments list container
        const commentsList = document.getElementById(`comments-list-${postId}`);
        if (commentsList) {
          const commentHTML = `
            <div class="comment-item">
              <a href="/profile" class="comment-username">${newComment.username}</a>
              <span class="comment-text">${escapeHTML(newComment.text)}</span>
              <span class="comment-time">${newComment.timestamp}</span>
            </div>
          `;
          commentsList.insertAdjacentHTML('beforeend', commentHTML);
        }

        // Reset input text field
        input.value = '';
      }
    });
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
