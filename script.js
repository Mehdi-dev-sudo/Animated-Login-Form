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
    toast.setAttribute("role", "alert");
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

  // ===== Password Strength =====
  var strengthFill = document.getElementById("strengthFill");
  var strengthText = document.getElementById("strengthText");
  var strengthBar = document.getElementById("strengthBar");

  if (signupPass && strengthFill && strengthText && strengthBar) {
    signupPass.addEventListener("input", function () {
      var val = this.value;
      if (!val) {
        strengthBar.classList.remove("visible");
        strengthFill.style.width = "0%";
        strengthText.textContent = "";
        return;
      }
      strengthBar.classList.add("visible");
      var score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
      if (/\d/.test(val)) score++;
      if (/[^a-zA-Z0-9]/.test(val)) score++;

      var levels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
      var colors = ["#ef4444", "#f59e0b", "#22c55e", "#06b6d4", "#a855f7"];
      var pcts = ["20%", "40%", "60%", "80%", "100%"];
      var idx = Math.min(score, 4);
      strengthFill.style.width = pcts[idx];
      strengthFill.style.background = colors[idx];
      strengthText.textContent = levels[idx];
      strengthText.style.color = colors[idx];
    });
  }

  // ===== Form Switch =====
  function switchForm(formId) {
    var active = document.querySelector(".form.active");
    var target = document.getElementById(formId);
    if (!active || !target || active === target) return;

    active.classList.add("out");
    // Clear old form fields
    active.querySelectorAll(".input").forEach(function (el) { el.value = ""; });
    active.querySelectorAll(".error").forEach(function (el) { el.classList.remove("error"); });
    setTimeout(function () {
      active.classList.remove("active", "out");
      target.classList.add("active");
      document.getElementById("strengthBar").classList.remove("visible");
      document.getElementById("strengthFill").style.width = "0%";
      document.getElementById("strengthText").textContent = "";
      // Avatar enter animation
      var avatar = target.querySelector(".avatar");
      if (avatar) { avatar.classList.remove("bounce-in"); void avatar.offsetWidth; avatar.classList.add("bounce-in"); }
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

  // ===== Forgot Password =====
  document.querySelectorAll(".row .link").forEach(function (link) {
    if (link.textContent.trim() === "Forgot password?") {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        showToast("Password reset link sent to your email.", "success");
      });
    }
  });

  // ===== Keyboard: Escape closes toasts =====
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var toasts = document.querySelectorAll(".toast");
      toasts.forEach(function (t) { t.remove(); });
    }
  });

  // ===== Remember Me (restore on load) =====
  (function () {
    var saved = localStorage.getItem("auth_remember");
    if (saved) {
      try {
        var data = JSON.parse(saved);
        if (data.email && data.pass) {
          loginEmail.value = data.email;
          loginPass.value = data.pass;
          document.getElementById("remember").checked = true;
        }
      } catch (_) {}
    }
  })();

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

      showToast("Welcome back! Redirecting\u2026", "success");
      // Save if "Remember me" is checked
      if (document.getElementById("remember").checked) {
        localStorage.setItem("auth_remember", JSON.stringify({ email: email, pass: pass }));
      } else {
        localStorage.removeItem("auth_remember");
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
