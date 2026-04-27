// Paste the URL you get after deploying the Apps Script as a Web App.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw763IH4ckCbnfLMxhyGZ4zvpF1rB7R1A5KksOCgBiUmHX4H9febH6ve-FXJvw9TenSkQ/exec";

const form = document.getElementById("rsvp-form");
const status = document.getElementById("status");
const button = form.querySelector("button[type=submit]");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "";

  if (!form.checkValidity()) {
    status.textContent = "Please fill in the required fields.";
    return;
  }

  button.disabled = true;
  const original = button.textContent;
  button.textContent = "Sending…";

  const data = Object.fromEntries(new FormData(form));
  data.timestamp = new Date().toISOString();

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data).toString(),
    });
    status.textContent = "Thank you — your RSVP is received with love. ✿";
    form.reset();
  } catch (err) {
    status.textContent = "Something went wrong. Please try again or message us directly.";
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
});

// Background music — opt-in modal on first visit, pause when tab hidden
(function bgMusic() {
  const audio = document.getElementById("bg-audio");
  const btn = document.getElementById("music-toggle");
  const modal = document.getElementById("music-modal");
  const yesBtn = document.getElementById("modal-yes");
  const noBtn = document.getElementById("modal-no");
  if (!audio || !btn) return;
  const icon = btn.querySelector(".music-icon");
  const PREF_KEY = "music-pref";
  let userPaused = false;

  audio.volume = 0.55;

  function setUI(playing) {
    btn.classList.toggle("playing", playing);
    icon.textContent = playing ? "❚❚" : "♪";
    const label = playing ? "Pause music" : "Play music";
    btn.title = label;
    btn.setAttribute("aria-label", label);
  }

  function play() {
    userPaused = false;
    return audio.play().then(() => setUI(true)).catch(() => setUI(false));
  }
  function pause() {
    audio.pause();
    setUI(false);
  }

  // First-visit modal
  const pref = localStorage.getItem(PREF_KEY);
  if (modal && pref === null) {
    setTimeout(() => modal.classList.add("open"), 1400);
    yesBtn?.addEventListener("click", () => {
      localStorage.setItem(PREF_KEY, "yes");
      modal.classList.remove("open");
      play();
    });
    noBtn?.addEventListener("click", () => {
      localStorage.setItem(PREF_KEY, "no");
      modal.classList.remove("open");
    });
  } else if (pref === "yes") {
    play();
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    const onFirstGesture = () => {
      if (audio.paused && !userPaused) play();
      events.forEach((ev) => document.removeEventListener(ev, onFirstGesture));
    };
    events.forEach((ev) => document.addEventListener(ev, onFirstGesture, { passive: true }));
  }

  // Manual toggle
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (audio.paused) {
      localStorage.setItem(PREF_KEY, "yes");
      play();
    } else {
      userPaused = true;
      pause();
    }
  });

  // Auto-pause on tab hidden / minimize, resume on focus
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (!audio.paused) {
        audio.pause();
        btn.classList.remove("playing");
      }
    } else if (!userPaused && localStorage.getItem(PREF_KEY) === "yes") {
      audio.play().then(() => setUI(true)).catch(() => {});
    }
  });
})();

// Scroll-triggered reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Floating flower petals
(function makePetals() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const container = document.querySelector(".petals");
  if (!container) return;
  const glyphs = ["✿", "❀", "✾", "❁", "✼"];
  const colors = ["pink", "blue", "peach", "pink", "blue"];
  const count = 14;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "petal " + colors[i % colors.length];
    el.textContent = glyphs[i % glyphs.length];
    el.style.left = Math.random() * 100 + "%";
    el.style.fontSize = 0.9 + Math.random() * 1.4 + "rem";
    el.style.opacity = 0.18 + Math.random() * 0.22;
    const fall = 16 + Math.random() * 14;
    const sway = 3 + Math.random() * 3;
    el.style.animationDuration = `${fall}s, ${sway}s`;
    el.style.animationDelay = `${-Math.random() * fall}s, ${-Math.random() * sway}s`;
    container.appendChild(el);
  }
})();
