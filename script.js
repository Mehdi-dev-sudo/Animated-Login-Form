(function () {
  "use strict";

  // ===== DOM refs =====
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const toastContainer = document.getElementById("toastContainer");

  const loginEmail = document.getElementById("loginEmail");
  const loginPass = document.getElementById("loginPass");
  const signupName = document.getElementById("signupName");
  const signupEmail = document.getElementById("signupEmail");
  const signupPass = document.getElementById("signupPass");
  const signupConfirm = document.getElementById("signupConfirm");

  let isLoading = false;

  // ===== Toast =====
  function showToast(message, type) {
    if (!toastContainer) return;
    var toast = document.createElement("div");
    toast.className = "toast " + type;
    var icon = document.createElement("i");
    icon.className = type === "success"
      ? "fa-regular fa-circle-check"
      : "fa-regular fa-circle-xmark";
    var span = document.createElement("span");
    span.textContent = message;
    toast.appendChild(icon);
    toast.appendChild(span);
    toastContainer.appendChild(toast);
    while (toastContainer.children.length > 3) {
      var old = toastContainer.firstElementChild;
      if (old) { old.classList.add("toast-out"); setTimeout(function () { old.remove(); }, 300); }
    }
    function remove() {
      toast.classList.add("toast-out");
      setTimeout(function () { toast.remove(); }, 300);
    }
    setTimeout(remove, 3000);
    toast.addEventListener("click", remove);
  }

  // ===== Password Toggle =====
  document.querySelectorAll(".toggle-pass").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = document.getElementById(this.getAttribute("data-target"));
      if (!input) return;
      var isPass = input.type === "password";
      input.type = isPass ? "text" : "password";
      this.querySelector("i").className = isPass
        ? "fa-regular fa-eye-slash"
        : "fa-regular fa-eye";
    });
  });

  // ===== Validation =====
  function isValidEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  function showError(input, show) {
    input.classList.toggle("error", show);
    if (show) { input.classList.add("shake"); setTimeout(function () { input.classList.remove("shake"); }, 500); }
  }

  // ===== Form Switch =====
  function switchForm(formId) {
    var active = document.querySelector(".form.active");
    var target = document.getElementById(formId);
    if (!active || !target || active === target) return;

    active.classList.add("out");
    setTimeout(function () {
      active.classList.remove("active", "out");
      target.classList.add("active");
      // Focus first input
      var firstInput = target.querySelector(".input");
      if (firstInput) firstInput.focus();
    }, 300);
  }

  document.querySelectorAll("[data-form]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      switchForm(this.getAttribute("data-form") + "Form");
    });
  });

  // ===== Submit Login =====
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (isLoading) return;

    var email = loginEmail.value.trim();
    var pass = loginPass.value;
    var valid = true;

    if (!email || !isValidEmail(email)) {
      showError(loginEmail, true);
      valid = false;
    } else {
      showError(loginEmail, false);
    }
    if (!pass || pass.length < 6) {
      showError(loginPass, true);
      valid = false;
    } else {
      showError(loginPass, false);
    }

    if (!valid) {
      showToast("Please fix the errors above", "error");
      if (loginEmail.classList.contains("error")) loginEmail.focus();
      else loginPass.focus();
      return;
    }

    isLoading = true;
    loginForm.classList.add("loading");

    setTimeout(function () {
      isLoading = false;
      loginForm.classList.remove("loading");

      if (email === "demo@example.com" && pass === "demo123") {
        showToast("Welcome back! Redirecting\u2026", "success");
      } else {
        showToast("Invalid credentials. Try demo@example.com / demo123", "error");
      }
    }, 1500);
  });

  // ===== Submit Signup =====
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (isLoading) return;

    var name = signupName.value.trim();
    var email = signupEmail.value.trim();
    var pass = signupPass.value;
    var confirm = signupConfirm.value;
    var terms = document.getElementById("terms").checked;
    var valid = true;

    if (!name || name.length < 2) {
      showError(signupName, true);
      valid = false;
    } else {
      showError(signupName, false);
    }
    if (!email || !isValidEmail(email)) {
      showError(signupEmail, true);
      valid = false;
    } else {
      showError(signupEmail, false);
    }
    if (!pass || pass.length < 6) {
      showError(signupPass, true);
      valid = false;
    } else {
      showError(signupPass, false);
    }
    if (pass !== confirm) {
      showError(signupConfirm, true);
      valid = false;
    } else {
      showError(signupConfirm, false);
    }
    if (!terms) {
      showToast("Please agree to the Terms & Conditions", "error");
      valid = false;
    }

    if (!valid) return;

    isLoading = true;
    signupForm.classList.add("loading");

    setTimeout(function () {
      isLoading = false;
      signupForm.classList.remove("loading");
      showToast("Account created! You can now sign in.", "success");
      switchForm("loginForm");
    }, 1500);
  });

})();
