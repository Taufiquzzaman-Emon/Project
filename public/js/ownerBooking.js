// Enhanced booking action handler
function handleBookingAction(event, action) {
  event.preventDefault();

  const button = event.currentTarget;
  const form = button.closest("form");
  const bookingCard = button.closest(".booking-item");
  const card = bookingCard.querySelector(".booking-card");
  const actionButtons = bookingCard.querySelectorAll(".booking-actions button");

  // Add loading state
  actionButtons.forEach((btn) => {
    btn.disabled = true;
    btn.classList.add("loading");
  });

  card.classList.add("processing");

  // Show notification immediately for better UX
  const actionText = action === "accept" ? "Accepting" : "Rejecting";
  showNotification(`${actionText} booking...`, "info");

  // Simulate processing time for smooth animation
  setTimeout(() => {
    // Submit the actual form
    form.submit();
  }, 1000);
}

// Notification system
function showNotification(message, type = "success") {
  // Remove existing notifications
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  const iconClass =
    type === "success"
      ? "fa-check-circle"
      : type === "error"
      ? "fa-exclamation-circle"
      : "fa-info-circle";

  notification.innerHTML = `
      <div class="notification-icon">
        <i class="fas ${iconClass}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-message">${message}</div>
      </div>
    `;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => notification.classList.add("show"), 100);

  // Hide notification after delay
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// Initialize animations on page load
document.addEventListener("DOMContentLoaded", function () {
  // Stagger card animations
  const bookingItems = document.querySelectorAll(".booking-item");
  bookingItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 150}ms`;
  });

  // Add hover effects
  const cards = document.querySelectorAll(".booking-card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px) scale(1.02)";
    });

    card.addEventListener("mouseleave", function () {
      if (!this.classList.contains("processing")) {
        this.style.transform = "translateY(0) scale(1)";
      }
    });
  });

  // Add parallax effect to background (subtle)
  document.addEventListener("mousemove", function (e) {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;

    document.body.style.backgroundPosition = `${x / 10}% ${y / 10}%`;
  });
});

// Handle successful/failed form submissions (if you want to show feedback)
window.addEventListener("pageshow", function () {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("success") === "accept") {
    showNotification("Booking accepted successfully!", "success");
  } else if (urlParams.get("success") === "reject") {
    showNotification("Booking rejected", "error");
  }
});
