document.addEventListener("DOMContentLoaded", function () {
  // Initialize animations
  initializeAnimations();

  // AI Recommendation button functionality
  const aiBtn = document.getElementById("ai-recommend-btn");
  const loadingOverlay = document.getElementById("loading-overlay");

  if (aiBtn) {
    aiBtn.addEventListener("click", function () {
      handleAIRecommendation();
    });
  }
});

// Initialize page animations
function initializeAnimations() {
  // Stagger listing card animations
  const listingItems = document.querySelectorAll(".listing-item");
  listingItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 50}ms`;
  });

  // Add hover effects to cards
  const listingCards = document.querySelectorAll(".listing-card");
  listingCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px) scale(1.02)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });
}

// Handle AI Recommendation
function handleAIRecommendation() {
  const aiBtn = document.getElementById("ai-recommend-btn");
  const loadingOverlay = document.getElementById("loading-overlay");

  // Show loading state
  aiBtn.classList.add("loading");
  aiBtn.disabled = true;

  if (loadingOverlay) {
    loadingOverlay.style.display = "flex";
  }

  // Simulate AI processing
  setTimeout(() => {
    // Hide loading
    aiBtn.classList.remove("loading");
    aiBtn.disabled = false;

    if (loadingOverlay) {
      loadingOverlay.style.display = "none";
    }

    // Show success notification
    showNotification("AI recommendations generated successfully!", "success");

    // You can add actual AI recommendation logic here
    // For now, just scroll to listings
    document.querySelector(".listings-grid").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 2500);
}

// Toggle favorite functionality
function toggleFavorite(button, listingId) {
  const icon = button.querySelector("i");
  const isActive = button.classList.contains("active");

  if (isActive) {
    button.classList.remove("active");
    icon.className = "far fa-heart";
    showNotification("Removed from favorites", "info");
  } else {
    button.classList.add("active");
    icon.className = "fas fa-heart";
    showNotification("Added to favorites!", "success");

    // Add pulse animation
    button.style.animation = "pulse 0.5s ease-out";
    setTimeout(() => {
      button.style.animation = "";
    }, 500);
  }
}

// Share listing functionality
function shareListing(listingId) {
  const url = `${window.location.origin}/listings/${listingId}`;

  if (navigator.share) {
    navigator.share({
      title: "Check out this amazing place!",
      url: url,
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      showNotification("Link copied to clipboard!", "success");
    });
  }
}

// Notification system
function showNotification(message, type = "success") {
  // Remove existing notifications
  const existing = document.querySelector(".notification-toast");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = `notification-toast ${type}`;

  const iconClass =
    type === "success"
      ? "fa-check-circle"
      : type === "error"
      ? "fa-exclamation-circle"
      : "fa-info-circle";

  notification.innerHTML = `
      <div class="toast-icon">
        <i class="fas ${iconClass}"></i>
      </div>
      <div class="toast-message">${message}</div>
    `;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => notification.classList.add("show"), 100);

  // Hide notification after delay
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add parallax effect
document.addEventListener("mousemove", function (e) {
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;

  document.querySelector(".listings-page").style.backgroundPosition = `${
    x / 20
  }% ${y / 20}%`;
});
