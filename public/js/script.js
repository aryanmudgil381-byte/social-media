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
  initLikeToggle();
  initStoryDragScroll();
  initSidebarActiveState();
  initImagePopupModal();
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
