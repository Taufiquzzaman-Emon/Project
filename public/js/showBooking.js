document.addEventListener("DOMContentLoaded", function () {
  initializeBookingsPage();
  setupFilterTabs();
});

function initializeBookingsPage() {
  // Stagger booking card animations
  const bookingCards = document.querySelectorAll(".booking-card");
  bookingCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 100}ms`;
  });

  // Add hover effects
  bookingCards.forEach((card) => {
    const inner = card.querySelector(".booking-card-inner");

    card.addEventListener("mouseenter", function () {
      inner.style.transform = "translateY(-5px) scale(1.02)";
    });

    card.addEventListener("mouseleave", function () {
      inner.style.transform = "translateY(0) scale(1)";
    });
  });
}

function setupFilterTabs() {
  const filterTabs = document.querySelectorAll(".filter-tab");
  const bookingCards = document.querySelectorAll(".booking-card");

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const status = this.dataset.status;

      // Update active tab
      filterTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Filter bookings
      bookingCards.forEach((card) => {
        const cardStatus = card.dataset.status;

        if (status === "all" || cardStatus === status) {
          card.classList.remove("hidden");
          card.style.animation = "slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
        } else {
          card.classList.add("hidden");
        }
      });

      // Update visible count
      const visibleCount = Array.from(bookingCards).filter(
        (card) => !card.classList.contains("hidden")
      ).length;

      if (visibleCount === 0) {
        showNotification(`No ${status} bookings found`, "info");
      } else {
        showNotification(
          `Showing ${visibleCount} ${status === "all" ? "" : status} booking${
            visibleCount === 1 ? "" : "s"
          }`,
          "success"
        );
      }
    });
  });
}

function cancelBooking(bookingid) {
  if (confirm("Are you sure you want to cancel this booking?")) {
    showNotification("Cancelling booking...", "info");

    // Simulate API call
    setTimeout(() => {
      showNotification("Booking cancelled successfully!", "success");
      // In real implementation, you would make an actual API call here
      // and then reload the page or update the booking status
      location.reload();
    }, 1500);
  }
}

function contactHost(hostUsername) {
  showNotification(`Opening chat with ${hostUsername}...`, "info");
  // In real implementation, this would open a messaging system
  setTimeout(() => {
    showNotification("Messaging feature coming soon!", "info");
  }, 1000);
}

function showNotification(message, type = "success") {
  const existing = document.querySelector(".notification-toast");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = `notification-toast ${type}`;
  notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      color: #374151;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      border-left: 4px solid ${
        type === "success"
          ? "#10b981"
          : type === "error"
          ? "#ef4444"
          : "#3b82f6"
      };
      z-index: 10000;
      transform: translateX(400px);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      min-width: 280px;
    `;

  const iconClass =
    type === "success"
      ? "fas fa-check-circle"
      : type === "error"
      ? "fas fa-times-circle"
      : "fas fa-info-circle";
  const iconColor =
    type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6";

  notification.innerHTML = `
      <i class="${iconClass}" style="color: ${iconColor};"></i>
      <span>${message}</span>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 10);

  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    notification.addEventListener("transitionend", () => {
      notification.remove();
    });
  }, 4000);
}
