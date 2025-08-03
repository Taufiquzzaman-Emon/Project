// Bootstrap validation logic
(() => {
  "use strict";
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// Alert auto-dismiss after 5 seconds
document.addEventListener("DOMContentLoaded", () => {
  const alerts = document.querySelectorAll(".auto-dismiss");
  alerts.forEach((alert) => {
    setTimeout(() => {
      // Fade out by removing 'show' class (Bootstrap handles this)
      alert.classList.remove("show");

      // Then remove from DOM after fade transition (Bootstrap fade duration ≈ 150ms)
      setTimeout(() => {
        alert.remove();
      }, 150); // Give it time to fade out visually
    }, 1500); // Show alert for 5 seconds
  });
});


  const btn = document.getElementById('ai-recommend-btn');
  const spinner = document.getElementById('loading-spinner');

  btn.addEventListener('click', () => {
    btn.disabled = true;            // Disable button to prevent multiple clicks
    spinner.style.display = 'inline-block'; // Show spinner
    // Redirect to AI recommendations page
    window.location.href = "/listings/recommend";
  });
