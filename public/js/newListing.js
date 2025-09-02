document.addEventListener("DOMContentLoaded", function () {
  initializeForm();
  setupFormValidation();
  setupImageUpload();
  setupCharacterCounter();
});

let currentStep = 1;
const totalSteps = 4;

function initializeForm() {
  updateProgressBar();
  updateStepVisibility();
  updateNavigation();

  // Next button click handler
  document.getElementById("next-btn").addEventListener("click", function () {
    if (validateCurrentStep()) {
      nextStep();
    }
  });

  // Previous button click handler
  document.getElementById("prev-btn").addEventListener("click", function () {
    prevStep();
  });

  // Step dot click handlers
  document.querySelectorAll(".step-dot").forEach((dot, index) => {
    dot.addEventListener("click", function () {
      if (index + 1 <= currentStep || validateStep(index + 1)) {
        goToStep(index + 1);
      }
    });
  });

  // Form submission
  document
    .getElementById("listing-form")
    .addEventListener("submit", function (e) {
      if (!validateAllSteps()) {
        e.preventDefault();
        return;
      }

      const submitBtn = document.getElementById("submit-btn");
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;
    });
}

function nextStep() {
  if (currentStep < totalSteps) {
    // Mark current step as completed
    document
      .querySelector(`.step-dot[data-step="${currentStep}"]`)
      .classList.add("completed");

    currentStep++;
    updateProgressBar();
    updateStepVisibility();
    updateNavigation();

    // Scroll to top of form
    document.querySelector(".form-container").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateProgressBar();
    updateStepVisibility();
    updateNavigation();
  }
}

function goToStep(step) {
  currentStep = step;
  updateProgressBar();
  updateStepVisibility();
  updateNavigation();
}

function updateProgressBar() {
  const progress = (currentStep / totalSteps) * 100;
  document.getElementById("progress-fill").style.width = `${progress}%`;
  document.getElementById(
    "progress-text"
  ).textContent = `Step ${currentStep} of ${totalSteps}`;
}

function updateStepVisibility() {
  // Hide all steps
  document.querySelectorAll(".form-step").forEach((step) => {
    step.classList.remove("active");
  });

  // Show current step
  document
    .querySelector(`.form-step[data-step="${currentStep}"]`)
    .classList.add("active");

  // Update step dots
  document.querySelectorAll(".step-dot").forEach((dot) => {
    dot.classList.remove("active");
  });
  document
    .querySelector(`.step-dot[data-step="${currentStep}"]`)
    .classList.add("active");
}

function updateNavigation() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const submitBtn = document.getElementById("submit-btn");

  // Previous button
  prevBtn.style.display = currentStep === 1 ? "none" : "block";

  // Next/Submit button
  if (currentStep === totalSteps) {
    nextBtn.style.display = "none";
    submitBtn.style.display = "block";
  } else {
    nextBtn.style.display = "block";
    submitBtn.style.display = "none";
  }
}

function validateCurrentStep() {
  return validateStep(currentStep);
}

function validateStep(step) {
  const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
  const inputs = stepElement.querySelectorAll(
    "input[required], textarea[required], select[required]"
  );
  let isValid = true;

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      isValid = false;

      // Add shake animation
      input.style.animation = "shake 0.5s ease-in-out";
      setTimeout(() => {
        input.style.animation = "";
      }, 500);
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");

      // Add success animation
      input.classList.add("success-animation");
      setTimeout(() => {
        input.classList.remove("success-animation");
      }, 600);
    }
  });

  // Special validation for price
  const priceInput = stepElement.querySelector("#price");
  if (
    priceInput &&
    (parseFloat(priceInput.value) <= 0 || isNaN(parseFloat(priceInput.value)))
  ) {
    priceInput.classList.add("is-invalid");
    priceInput.classList.remove("is-valid");
    isValid = false;
  }

  return isValid;
}

function validateAllSteps() {
  for (let i = 1; i <= totalSteps; i++) {
    if (!validateStep(i)) {
      goToStep(i);
      return false;
    }
  }
  return true;
}

function setupFormValidation() {
  // Real-time validation
  document.querySelectorAll("input, textarea, select").forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value.trim()) {
        this.classList.remove("is-invalid");
        this.classList.add("is-valid");
      } else {
        this.classList.remove("is-valid");
      }
    });

    input.addEventListener("blur", function () {
      if (this.hasAttribute("required") && !this.value.trim()) {
        this.classList.add("is-invalid");
        this.classList.remove("is-valid");
      }
    });
  });
}

function setupImageUpload() {
  const uploadArea = document.getElementById("image-upload-area");
  const fileInput = document.getElementById("image");
  const uploadBtn = document.querySelector(".upload-btn");
  const preview = document.getElementById("image-preview");

  // Upload button click
  uploadBtn.addEventListener("click", function (e) {
    e.preventDefault();
    fileInput.click();
  });

  // File input change
  fileInput.addEventListener("change", function () {
    handleFiles(this.files);
  });

  // Drag and drop
  uploadArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.classList.add("drag-over");
  });

  uploadArea.addEventListener("dragleave", function () {
    this.classList.remove("drag-over");
  });

  uploadArea.addEventListener("drop", function (e) {
    e.preventDefault();
    this.classList.remove("drag-over");
    handleFiles(e.dataTransfer.files);
  });

  function handleFiles(files) {
    preview.innerHTML = "";

    // Since we only accept single file now, just take the first one
    const file = files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const previewItem = document.createElement("div");
        previewItem.className = "preview-item";
        previewItem.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
            <button type="button" class="preview-remove" onclick="removePreview(this)">
              <i class="fas fa-times"></i>
            </button>
          `;
        preview.appendChild(previewItem);

        // Add animation
        previewItem.style.animation =
          "fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      };
      reader.readAsDataURL(file);

      // Show success notification
      showNotification("Image uploaded successfully!", "success");
    }
  }
}

function removePreview(button) {
  const previewItem = button.closest(".preview-item");
  previewItem.style.animation = "fadeOut 0.3s ease-out forwards";
  setTimeout(() => {
    previewItem.remove();
  }, 300);
}

function setupCharacterCounter() {
  const description = document.getElementById("description");
  const counter = document.getElementById("desc-count");

  description.addEventListener("input", function () {
    counter.textContent = this.value.length;

    // Color coding
    if (this.value.length > 500) {
      counter.style.color = "#ef4444";
    } else if (this.value.length > 300) {
      counter.style.color = "#f59e0b";
    } else {
      counter.style.color = "#10b981";
    }
  });
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
      border-left: 4px solid ${type === "success" ? "#10b981" : "#ef4444"};
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
    type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
  const iconColor = type === "success" ? "#10b981" : "#ef4444";

  notification.innerHTML = `
      <div style="color: ${iconColor}; font-size: 1.25rem;">
        <i class="fas ${iconClass}"></i>
      </div>
      <div>${message}</div>
    `;

  document.body.appendChild(notification);

  setTimeout(() => (notification.style.transform = "translateX(0)"), 100);

  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// Additional CSS animations
const additionalStyles = document.createElement("style");
additionalStyles.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    
    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    @keyframes fadeOut {
      to {
        opacity: 0;
        transform: scale(0.8);
      }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;
document.head.appendChild(additionalStyles);
