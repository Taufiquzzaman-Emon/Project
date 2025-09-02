document.addEventListener("DOMContentLoaded", function () {
  // Enhanced search box interactions
  const searchBox = document.querySelector(".search-box");
  const searchInput = document.querySelector(".search-input");
  const searchSections = document.querySelectorAll(".search-section");

  // Focus effects
  if (searchInput) {
    searchInput.addEventListener("focus", function () {
      searchBox.classList.add("focused");
    });

    searchInput.addEventListener("blur", function () {
      searchBox.classList.remove("focused");
    });
  }

  // Search section click effects
  searchSections.forEach((section) => {
    section.addEventListener("click", function () {
      const input = this.querySelector(".search-input");
      if (input) {
        input.focus();
      }
    });
  });

  // Brand hover sound effect (visual feedback only)
  const brandLink = document.querySelector(".navbar-brand");
  if (brandLink) {
    brandLink.addEventListener("mouseenter", function () {
      this.style.filter = "brightness(1.1)";
    });

    brandLink.addEventListener("mouseleave", function () {
      this.style.filter = "brightness(1)";
    });
  }

  // Navigation link active states
  const navLinks = document.querySelectorAll(".nav-link");
  const currentPath = window.location.pathname;

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
      link.style.color = "var(--navbar-primary)";
      link.querySelector(".nav-indicator").style.width = "80%";
      link.querySelector(".nav-icon").style.background =
        "var(--navbar-gradient)";
      link.querySelector(".nav-icon").style.color = "white";
    }
  });

  // Dropdown animation enhancements
  const dropdowns = document.querySelectorAll('[data-bs-toggle="dropdown"]');
  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("show.bs.dropdown", function () {
      const menu = this.nextElementSibling;
      if (menu) {
        menu.style.animation = "slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      }
    });
  });

  // Search form enhancement
  const searchForm = document.querySelector(".search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      const searchBtn = this.querySelector(".search-btn");
      searchBtn.style.transform = "scale(0.9)";

      setTimeout(() => {
        searchBtn.style.transform = "scale(1)";
      }, 150);
    });
  }

  // Notification bell animation
  const notificationBtn = document.querySelector(".notification-btn");
  if (notificationBtn) {
    notificationBtn.addEventListener("click", function () {
      this.style.animation = "none";
      setTimeout(() => {
        this.style.animation = "";
      }, 10);
    });
  }

  // Parallax effect for navbar background
  let ticking = false;

  function updateNavbarParallax() {
    const scrolled = window.pageYOffset;
    const navbar = document.querySelector(".enhanced-navbar");

    if (navbar) {
      const opacity = Math.max(0.95, 1 - scrolled * 0.001);
      navbar.style.background = `rgba(255, 255, 255, ${opacity})`;

      if (scrolled > 50) {
        navbar.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.15)";
      } else {
        navbar.style.boxShadow = "var(--navbar-shadow)";
      }
    }

    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(updateNavbarParallax);
      ticking = true;
    }
  });

  // Mobile menu enhancement
  function handleMobileResize() {
    const centralNav = document.querySelector(".central-nav-section");
    if (window.innerWidth < 576 && centralNav) {
      centralNav.style.gap = "0.5rem";
    } else if (centralNav) {
      centralNav.style.gap = "1rem";
    }
  }

  window.addEventListener("resize", handleMobileResize);
  handleMobileResize(); // Initial call

  // Add ripple effect to buttons
  function addRippleEffect(button) {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        `;

      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  }

  // Apply ripple to interactive elements
  const rippleButtons = document.querySelectorAll(
    ".search-btn, .notification-btn, .user-menu-btn"
  );
  rippleButtons.forEach(addRippleEffect);
});

// Add CSS for ripple animation
const rippleStyle = document.createElement("style");
rippleStyle.textContent = `
    @keyframes ripple {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
    
    .navbar-brand,
    .nav-link,
    .search-btn,
    .notification-btn,
    .user-menu-btn {
      position: relative;
      overflow: hidden;
    }
  `;
document.head.appendChild(rippleStyle);
