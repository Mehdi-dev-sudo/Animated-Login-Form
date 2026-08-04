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

  const loginBtn = loginForm.querySelector(".btn");
  const signupBtn = signupForm.querySelector(".btn");
  const announcer = document.getElementById("a11yAnnounce");

  let isLoading = false;

  function announce(msg) {
    if (announcer) announcer.textContent = msg;
  }

  function setLoading(form, btn, busy) {
    form.setAttribute("aria-busy", busy ? "true" : "false");
    btn.disabled = busy;
  }

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
      this.setAttribute("data-tooltip", isPass ? "Hide password" : "Show password");
    });
  });

  // ===== Validation =====
  function isValidEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  function showError(input, show, msg) {
    input.classList.toggle("error", show);
    input.setAttribute("aria-invalid", show ? "true" : "false");
    if (show) {
      input.classList.remove("shake");
      void input.offsetWidth;
      input.classList.add("shake");
    }
    var errorText = input.closest(".field").querySelector(".error-text");
    if (errorText) {
      errorText.textContent = show ? (msg || "") : "";
    }
    // Remove error toast when user starts fixing
    if (show) {
      function clearErr() {
        showError(input, false);
        input.removeEventListener("input", clearErr);
        input.removeEventListener("focus", clearErr);
      }
      input.addEventListener("input", clearErr);
      input.addEventListener("focus", clearErr);
    }
  }

  // ===== Ripple Effect on Buttons =====
  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (this.disabled) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var rect = this.getBoundingClientRect();
      var ripple = document.createElement("span");
      ripple.className = "ripple";
      var size = Math.max(rect.width, rect.height);
      var x = e.clientX - rect.left - size / 2;
      var y = e.clientY - rect.top - size / 2;
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.style.width = ripple.style.height = size + "px";
      this.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  });

  // ===== Password Generator =====
  var genBtn = document.getElementById("genPass");
  if (genBtn && signupPass) {
    genBtn.addEventListener("click", function () {
      var upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var lower = "abcdefghijklmnopqrstuvwxyz";
      var digits = "0123456789";
      var special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      var all = upper + lower + digits + special;
      var pass = "", len = 20;
      // Ensure at least one of each type
      pass += upper[Math.floor(Math.random() * upper.length)];
      pass += lower[Math.floor(Math.random() * lower.length)];
      pass += digits[Math.floor(Math.random() * digits.length)];
      pass += special[Math.floor(Math.random() * special.length)];
      for (var i = pass.length; i < len; i++) {
        pass += all[Math.floor(Math.random() * all.length)];
      }
      pass = pass.split("").sort(function () { return Math.random() - 0.5; }).join("");
      signupPass.value = pass;
      signupConfirm.value = pass;
      signupPass.dispatchEvent(new Event("input"));
      signupConfirm.dispatchEvent(new Event("input"));
      showToast("Password generated and filled in both fields", "success");
    });
  }

  // ===== Character Counters =====
  document.querySelectorAll(".char-counter").forEach(function (counter) {
    var input = document.getElementById(counter.getAttribute("data-for"));
    if (!input) return;
    var max = parseInt(input.getAttribute("maxlength"), 10) || 999;
    function update() {
      var len = input.value.length;
      counter.textContent = len + "/" + max;
      counter.classList.toggle("warn", len > max * 0.8);
      counter.classList.toggle("danger", len >= max);
    }
    input.addEventListener("input", update);
    update();
  });

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
    // Clear old form fields, errors, and ARIA error state
    active.querySelectorAll(".input").forEach(function (el) {
      el.value = "";
      el.classList.remove("error");
      el.setAttribute("aria-invalid", "false");
      var err = el.closest(".field").querySelector(".error-text");
      if (err) err.textContent = "";
    });
    setTimeout(function () {
      active.classList.remove("active", "out");
      target.classList.add("active");
      strengthBar.classList.remove("visible");
      strengthFill.style.width = "0%";
      strengthText.textContent = "";
      // Avatar enter animation
      var avatar = target.querySelector(".avatar");
      if (avatar) { avatar.classList.remove("bounce-in"); void avatar.offsetWidth; avatar.classList.add("bounce-in"); }
      // Focus first input
      var firstInput = target.querySelector(".input");
      if (firstInput) firstInput.focus();
      announce(formId === "loginForm" ? "Sign in form shown" : "Sign up form shown");
    }, 250);
  }

  document.querySelectorAll("[data-form]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      switchForm(this.getAttribute("data-form") + "Form");
    });
  });

  // ===== Form Draft Persistence (sessionStorage) =====
  (function () {
    var KEY = "auth_draft";
    try {
      var draft = sessionStorage.getItem(KEY);
      if (draft) {
        var data = JSON.parse(draft);
        Object.keys(data).forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.value = data[id];
        });
      }
    } catch (_) {}
    function saveDraft() {
      var inputs = signupForm.querySelectorAll(".input");
      var data = {};
      inputs.forEach(function (inp) {
        if (inp.value) data[inp.id] = inp.value;
      });
      if (Object.keys(data).length) {
        sessionStorage.setItem(KEY, JSON.stringify(data));
      } else {
        sessionStorage.removeItem(KEY);
      }
    }
    signupForm.querySelectorAll(".input").forEach(function (inp) {
      inp.addEventListener("input", saveDraft);
    });
  })();

  // ===== Theme Toggle =====
  (function () {
    var saved = localStorage.getItem("auth_theme");
    if (saved === "light") document.documentElement.setAttribute("data-theme", "light");
    document.getElementById("themeToggle").setAttribute("data-tooltip", saved === "light" ? "Dark mode" : "Light mode");
    document.getElementById("themeToggle").addEventListener("click", function () {
      var html = document.documentElement;
      var isLight = html.getAttribute("data-theme") === "light";
      html.setAttribute("data-theme", isLight ? "" : "light");
      localStorage.setItem("auth_theme", isLight ? "" : "light");
      this.setAttribute("data-tooltip", isLight ? "Dark mode" : "Light mode");
    });
  })();

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
      showError(loginEmail, true, "Valid email required");
      valid = false;
    } else {
      showError(loginEmail, false);
    }
    if (!pass || pass.length < 6) {
      showError(loginPass, true, "At least 6 characters");
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
    setLoading(loginForm, loginBtn, true);
    // Avatar success hint
    var loginAvatar = loginForm.querySelector(".avatar i");
    if (loginAvatar) { loginAvatar.className = "fa-regular fa-circle-check"; }

    setTimeout(function () {
      isLoading = false;
      loginForm.classList.remove("loading");
      setLoading(loginForm, loginBtn, false);
      if (loginAvatar) { loginAvatar.className = "fa-regular fa-user"; }

      showToast("Welcome back! Redirecting\u2026", "success");
      announce("Signed in successfully.");
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
      showError(signupName, true, "Name must be at least 2 characters");
      valid = false;
    } else {
      showError(signupName, false);
    }
    if (!email || !isValidEmail(email)) {
      showError(signupEmail, true, "Valid email required");
      valid = false;
    } else {
      showError(signupEmail, false);
    }
    if (!pass || pass.length < 6) {
      showError(signupPass, true, "At least 6 characters");
      valid = false;
    } else {
      showError(signupPass, false);
    }
    if (pass !== confirm) {
      showError(signupConfirm, true, "Passwords do not match");
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
    setLoading(signupForm, signupBtn, true);
    var signupAvatar = signupForm.querySelector(".avatar i");
    if (signupAvatar) { signupAvatar.className = "fa-regular fa-circle-check"; }

    setTimeout(function () {
      isLoading = false;
      signupForm.classList.remove("loading");
      setLoading(signupForm, signupBtn, false);
      if (signupAvatar) { signupAvatar.className = "fa-solid fa-user-plus"; }
      showToast("Account created! You can now sign in.", "success");
      announce("Account created. You can now sign in.");
      sessionStorage.removeItem("auth_draft");
      switchForm("loginForm");
    }, 1500);
  });

})();
