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

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  const events = formData.getAll("events");
  data.events = events.join(", ");
  data.attending = events.length > 0 ? "yes" : "no";
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

// Countdown to the wedding (Nov 22, 2026 at 9:49 AM Central Time = 15:49 UTC)
(function countdown() {
  const target = new Date("2026-11-22T15:49:00Z").getTime();
  const els = {
    d: document.getElementById("cd-days"),
    h: document.getElementById("cd-hours"),
    m: document.getElementById("cd-minutes"),
    s: document.getElementById("cd-seconds"),
  };
  if (!els.d) return;
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      els.d.textContent = els.h.textContent = els.m.textContent = els.s.textContent = "0";
      return;
    }
    els.d.textContent = String(Math.floor(diff / 86400000));
    els.h.textContent = String(Math.floor((diff / 3600000) % 24)).padStart(2, "0");
    els.m.textContent = String(Math.floor((diff / 60000) % 60)).padStart(2, "0");
    els.s.textContent = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);
})();

// Add-to-Calendar link generation
(function wireCalendars() {
  const events = {
    sangeeth: {
      title: "Sangeeth — Rajiv & Tejaswini",
      start: "20261121T010000Z",
      end: "20261121T050000Z",
      allDay: false,
      location: "Cloud 9 Ranch @ Custer, 5083 County Road 126, Celina, TX 75009",
      description: "An evening of music, sparkle, and dancing. Starts 7:00 PM CT.",
    },
    wedding: {
      title: "Wedding — Rajiv & Tejaswini",
      start: "20261122T150000Z",
      end: "20261122T200000Z",
      allDay: false,
      location: "Cloud 9 Ranch @ Custer, 5083 County Road 126, Celina, TX 75009",
      description: "Muhurtham at 9:49 AM. Please arrive by 9:00 AM.",
    },
  };

  function googleUrl(ev) {
    const p = new URLSearchParams({
      action: "TEMPLATE",
      text: ev.title,
      dates: `${ev.start}/${ev.end}`,
      details: ev.description || "",
      location: ev.location || "",
    });
    return `https://calendar.google.com/calendar/render?${p.toString()}`;
  }

  function icsFor(ev) {
    const uid = ev.title.replace(/\W+/g, "-") + "@rajivtejaswini";
    const stamp = "20261101T000000Z";
    const startLine = ev.allDay ? `DTSTART;VALUE=DATE:${ev.start}` : `DTSTART:${ev.start}`;
    const endLine = ev.allDay ? `DTEND;VALUE=DATE:${ev.end}` : `DTEND:${ev.end}`;
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//RajivTejaswini//Wedding//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      startLine,
      endLine,
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${(ev.description || "").replace(/\n/g, "\\n")}`,
      `LOCATION:${ev.location || ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
  }

  Object.entries(events).forEach(([key, ev]) => {
    const box = document.querySelector(`.add-cal[data-event="${key}"]`);
    if (!box) return;
    const g = box.querySelector(".cal-google");
    const i = box.querySelector(".cal-ics");
    if (g) g.href = googleUrl(ev);
    if (i) {
      const blob = new Blob([icsFor(ev)], { type: "text/calendar;charset=utf-8" });
      i.href = URL.createObjectURL(blob);
      i.download = key + "-rajiv-tejaswini.ics";
    }
  });
})();

// Visitor tracking — fetch IP + geo from a free public API, log to the Apps Script
(async function trackVisit() {
  if (sessionStorage.getItem("visit-tracked") === "1") return;
  sessionStorage.setItem("visit-tracked", "1");
  try {
    const r = await fetch("https://ipapi.co/json/");
    const info = r.ok ? await r.json() : {};
    const data = {
      action: "track",
      timestamp: new Date().toISOString(),
      ip: info.ip || "",
      city: info.city || "",
      region: info.region || "",
      country: info.country_name || info.country || "",
      ua: navigator.userAgent,
      referrer: document.referrer || "",
      page: location.pathname + location.search,
    };
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data).toString(),
    });
  } catch (_) {}
})();

// Background music — try autoplay, fall back to first user gesture, auto-pause on tab hidden
(function bgMusic() {
  const audio = document.getElementById("bg-audio");
  const btn = document.getElementById("music-toggle");
  if (!audio || !btn) return;
  const icon = btn.querySelector(".music-icon");
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
    return audio.play().then(() => setUI(true)).catch(() => setUI(false));
  }

  // Try autoplay
  audio.play().then(() => setUI(true)).catch(() => setUI(false));

  // Fallback — start on first user interaction if browser blocked autoplay
  const events = ["pointerdown", "keydown", "scroll", "touchstart"];
  const onFirstGesture = () => {
    if (!userPaused && audio.paused) play();
    events.forEach((ev) => document.removeEventListener(ev, onFirstGesture));
  };
  events.forEach((ev) => document.addEventListener(ev, onFirstGesture, { passive: true }));

  // Manual toggle
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (audio.paused) {
      userPaused = false;
      play();
    } else {
      userPaused = true;
      audio.pause();
      setUI(false);
    }
  });

  // Auto-pause when tab hidden / window minimized; resume when visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (!audio.paused) {
        audio.pause();
        btn.classList.remove("playing");
      }
    } else if (!userPaused) {
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

