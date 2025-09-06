document.addEventListener("DOMContentLoaded", function () {
  initializeSignupForm();
});

function initializeSignupForm() {
  setupFormValidation();
  setupPasswordStrength();
  setupPasswordToggle();
  setupFormSubmission();
}

// Form Validation
function setupFormValidation() {
  const form = document.getElementById("signup-form");
  const inputs = form.querySelectorAll(".enhanced-input");

  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      validateField(this);
    });

    input.addEventListener("blur", function () {
      validateField(this);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;
    inputs.forEach((input) => {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    // Check terms checkbox

    if (isValid) {
      submitForm();
    } else {
      // Shake animation for invalid form
      form.style.animation = "shake 0.5s ease-in-out";
      setTimeout(() => {
        form.style.animation = "";
      }, 500);
    }
  });
}

function validateField(input) {
  const value = input.value.trim();
  const fieldType = input.name;
  let isValid = false;

  switch (fieldType) {
    case "username":
      isValid = validateUsername(value);
      break;
    case "email":
      isValid = validateEmail(value);
      break;
    case "password":
      isValid = validatePassword(value);
      updatePasswordStrength(value);
      break;
  }

  if (isValid) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  } else {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
  }

  return isValid;
}

function validateUsername(username) {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

// Password Strength
function setupPasswordStrength() {
  const passwordInput = document.getElementById("password");
  passwordInput.addEventListener("input", function () {
    updatePasswordStrength(this.value);
    updatePasswordRequirements(this.value);
  });
}

function updatePasswordStrength(password) {
  const strengthFill = document.getElementById("strength-fill");
  const strengthText = document.getElementById("strength-text");

  let score = 0;
  let strength = "";

  if (password.length >= 6) score++;
  if (/[a-zA-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (password.length >= 10) score++;

  strengthFill.className = "strength-fill";

  if (score <= 1) {
    strengthFill.classList.add("weak");
    strength = "Weak";
    strengthText.style.color = "#ef4444";
  } else if (score <= 2) {
    strengthFill.classList.add("fair");
    strength = "Fair";
    strengthText.style.color = "#f59e0b";
  } else if (score <= 3) {
    strengthFill.classList.add("good");
    strength = "Good";
    strengthText.style.color = "#3b82f6";
  } else {
    strengthFill.classList.add("strong");
    strength = "Strong";
    strengthText.style.color = "#10b981";
  }

  strengthText.textContent = `Password strength: ${strength}`;
}

function updatePasswordRequirements(password) {
  const requirements = [
    { id: "req-length", test: password.length >= 6 },
    { id: "req-letter", test: /[a-zA-Z]/.test(password) },
    { id: "req-number", test: /[0-9]/.test(password) },
  ];

  requirements.forEach((req) => {
    const element = document.getElementById(req.id);
    if (req.test) {
      element.classList.add("met");
    } else {
      element.classList.remove("met");
    }
  });
}

// Password Toggle
function setupPasswordToggle() {
  window.togglePassword = function () {
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("password-eye");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      eyeIcon.className = "fas fa-eye-slash";
    } else {
      passwordInput.type = "password";
      eyeIcon.className = "fas fa-eye";
    }
  };
}

// Form Submission
function setupFormSubmission() {
  window.submitForm = function () {
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    // Simulate form submission
    setTimeout(() => {
      // In real implementation, submit to server here
      document.getElementById("signup-form").submit();
    }, 2000);
  };
}

// Social Login
window.socialLogin = function (provider) {
  showNotification(`Redirecting to ${provider} login...`, "info");

  // In real implementation, redirect to OAuth provider
  setTimeout(() => {
    switch (provider) {
      case "google":
        window.location.href = "/auth/google";
        break;
    }
  }, 1000);
};

// Notification System
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
      ? "fa-check-circle"
      : type === "error"
      ? "fa-exclamation-circle"
      : "fa-info-circle";
  const iconColor =
    type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6";

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

// Add CSS for shake animation
const shakeStyle = document.createElement("style");
shakeStyle.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `;
document.head.appendChild(shakeStyle);
