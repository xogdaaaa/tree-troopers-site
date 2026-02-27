// =====================
// Base + Loader (safe for multiple pages)
// =====================
const loader = document.getElementById("loader");

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

window.addEventListener("load", () => {
  if (!loader) return;
  const MIN_TIME_MS = 1200;
  setTimeout(() => {
    loader.classList.add("split");
    setTimeout(() => loader.classList.add("hidden"), 950);
  }, MIN_TIME_MS);
});

// =====================
// Developer session check
// =====================
const DEV_SESSION_MS = 1000 * 60 * 60 * 6; // 6 hours
function isDevLoggedIn() {
  const loggedIn = localStorage.getItem("devLoggedIn") === "true";
  const loginTime = Number(localStorage.getItem("devLoginTime") || 0);
  return loggedIn && Date.now() - loginTime < DEV_SESSION_MS;
}

// =====================
// Content Model (editable "whole site" content)
// =====================
const DEFAULT_CONTENT = {
  heroTitle: "Tree Troopers Eco Club",
  heroDescription:
    "Tree Troopers is a student eco-club founded in 2016. We protect the environment through hands-on action like beach cleanups, recycling projects, and field trips with Generation Earth. Meetings are every other Wednesday.",

  aboutTitle: "About",
  aboutIntro:
    "By joining Tree Troopers, students build climate literacy, practice environmental stewardship, and participate in real community service through indoor/outdoor learning and conservation work.",

  activities: [
    {
      icon: "🌊",
      title: "Santa Monica Beach Cleanups",
      desc: "Learn about human impact on sea animals and help clean the shoreline.",
      tag: "Heal the Bay",
    },
    {
      icon: "♻️",
      title: "Recycling Project",
      desc: "Ongoing campus effort to reduce waste and recycle correctly.",
      tag: "On-campus",
    },
    {
      icon: "🌎",
      title: "Generation Earth Field Trips",
      desc: "Indoor/outdoor education with hands-on conservation learning.",
      tag: "Field Trips",
    },
    {
      icon: "🏛️",
      title: "Environmental Youth Summit",
      desc: "Present what we’ve done, explore the museum, and meet other youth leaders.",
      tag: "Required Event",
    },
  ],

  members: [
    {
      title: "President",
      desc: "Leads meetings, organizes events, and communicates with partners.",
    },
    {
      title: "Vice President",
      desc: "Supports planning, attendance tracking, and member coordination.",
    },
    {
      title: "Top 35 Attendance",
      desc: "Students with top attendance are invited to special field trips.",
    },
  ],

  // ✅ Events (Upcoming Events section)
  eventsTitle: "Upcoming Events",
  eventsIntro: "Don’t miss what’s next — join us and make an impact.",
  events: [
    { date: "2026-03-12", title: "Beach Cleanup", icon: "🌊" },
    { date: "2026-03-26", title: "Recycling Workshop", icon: "♻️" },
    { date: "2026-04-05", title: "Environmental Youth Summit", icon: "🌍" },
  ],

  // ✅ Officers content
  officersTitle: "Officers & Leadership Team",
  officersIntro: "Meet the students leading Tree Troopers and organizing our events.",
  officers: [
    {
      name: "Jeisi Escobar",
      role: "President",
      bio: "Leads meetings, organizes cleanups, and coordinates partnerships.",
      cause: "Ocean & beach protection",
      photo: "assets/officers/president.jpg",
    },
    {
      name: "Chloe Lee",
      role: "Vice President",
      bio: "Supports planning, attendance tracking, and helps lead events.",
      cause: "Recycling & waste reduction",
      photo: "assets/officers/vice-president.jpg",
    },
    {
      name: "Sayeed Abdullah",
      role: "Treasurer",
      bio: "Tracks supplies, budgets, and helps plan fundraising for projects.",
      cause: "Climate education",
      photo: "assets/officers/treasurer.jpg",
    },
    {
      name: "Alexandra Melgar",
      role: "Secretary",
      bio: "Promotes events, recruits members, and connects with community orgs.",
      cause: "Wildlife & habitat conservation",
      photo: "assets/officers/secretary.jpg",
    },
  ],

  // ✅ Gallery content
  galleryTitle: "Photo Gallery",
  galleryIntro:
    "Moments from Santa Monica cleanups, Generation Earth events, youth summits, and meetings.",

  gallery: [
    { src: "assets/gallery1.jpg", title: "Santa Monica Beach Cleanup", tag: "Beach Cleanups" },
    { src: "assets/gallery2.jpg", title: "Generation Earth Field Trip", tag: "Generation Earth" },
    { src: "assets/gallery3.jpg", title: "Environmental Youth Summit", tag: "Youth Summit" },
    { src: "assets/gallery4.jpg", title: "Club Meeting", tag: "Meetings" },
  ],

  beforeAfter: {
    title: "Before & After Cleanup",
    beforeSrc: "assets/before.jpg",
    afterSrc: "assets/after.jpg",
  },

  logoDataUrl: null,
};

// =====================
// MIGRATION FIX (Officers stuck from localStorage placeholders)
// =====================
function migrateContent(c) {
  if (!c) return c;

  // make sure officers array exists
  if (!Array.isArray(c.officers)) return c;

  const defaults = Array.isArray(DEFAULT_CONTENT.officers) ? DEFAULT_CONTENT.officers : [];

  // If saved officers still have placeholders, refresh them from DEFAULT_CONTENT
  const hasPlaceholder = c.officers.some((o) => {
    const name = String(o?.name || "").trim().toLowerCase();
    return !name || name === "your name";
  });

  // If it looks like old placeholder data, replace the whole officers list
  if (hasPlaceholder && defaults.length) {
    c.officers = structuredClone(defaults);
    return c;
  }

  // Otherwise do targeted fixes (Secretary role/photo + missing fields)
  c.officers = c.officers.map((o, i) => {
    if (!o) return o;

    const role = String(o.role || "").trim().toLowerCase();

    // Fix old role spelling / old role name
    if (role === "outreach coordinator" || role === "secretrary") {
      o.role = "Secretary";
      o.photo = "assets/officers/secretary.jpg";
    }

    // Fix misspelled photo path
    if (String(o.photo || "").includes("Secretrary.jpg")) {
      o.photo = "assets/officers/secretary.jpg";
    }

    // If any fields are blank, fill from defaults by index
    const d = defaults[i];
    if (d) {
      const nm = String(o.name || "").trim();
      if (!nm || nm.toLowerCase() === "your name") o.name = d.name;

      if (!String(o.photo || "").trim()) o.photo = d.photo;
      if (!String(o.bio || "").trim()) o.bio = d.bio;
      if (!String(o.cause || "").trim()) o.cause = d.cause;
      if (
        !String(o.role || "").trim() ||
        String(o.role).trim().toLowerCase() === "role"
      )
        o.role = d.role;
    }

    return o;
  });

  return c;
}

function loadContent() {
  try {
    const savedRaw = localStorage.getItem("siteContent");
    const saved = JSON.parse(savedRaw || "null");

    const merged = saved
      ? { ...DEFAULT_CONTENT, ...saved }
      : structuredClone(DEFAULT_CONTENT);

    const migrated = migrateContent(merged);

    // ✅ write back so you don't keep loading old placeholders
    if (saved) localStorage.setItem("siteContent", JSON.stringify(migrated));

    return migrated;
  } catch {
    const fresh = migrateContent(structuredClone(DEFAULT_CONTENT));
    return fresh;
  }
}

function saveContent(content) {
  localStorage.setItem("siteContent", JSON.stringify(content));
}

// =====================
// Theme Model
// =====================
const DEFAULT_THEME = {
  p1: "#7b2cff",
  p2: "#b58cff",
  p3: "#ff4fd8",
};

function loadTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem("siteTheme") || "null");
    return saved ? { ...DEFAULT_THEME, ...saved } : { ...DEFAULT_THEME };
  } catch {
    return { ...DEFAULT_THEME };
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--p1", theme.p1);
  root.style.setProperty("--p2", theme.p2);
  root.style.setProperty("--p3", theme.p3);
}

function saveTheme(theme) {
  localStorage.setItem("siteTheme", JSON.stringify(theme));
}

// =====================
// DOM refs
// =====================
const activitiesList = document.getElementById("activitiesList");
const membersList = document.getElementById("membersList");

// Events refs
const eventsList = document.getElementById("eventsList");
const countdownTitleEl = document.getElementById("countdownTitle");
const countdownDateEl = document.getElementById("countdownDate");
const cdDays = document.getElementById("cdDays");
const cdHours = document.getElementById("cdHours");
const cdMins = document.getElementById("cdMins");
const cdSecs = document.getElementById("cdSecs");

// Gallery refs
const galleryGrid = document.getElementById("galleryGrid");
const beforeAfterWrap = document.getElementById("beforeAfterWrap");

// Officers refs
const officersList = document.getElementById("officersList");

// File input
const galleryPicker = document.getElementById("galleryPicker");

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// =====================
// Events helpers + render + countdown
// =====================
function parseLocalDateYYYYMMDD(s) {
  const m = String(s || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]),
    mo = Number(m[2]) - 1,
    d = Number(m[3]);
  const dt = new Date(y, mo, d, 0, 0, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatPrettyDate(dt) {
  return dt.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function renderEvents(content, editing = false) {
  if (!eventsList) return;

  const list = content.events || [];
  eventsList.innerHTML = list
    .map((ev, i) => {
      const dt = parseLocalDateYYYYMMDD(ev.date);
      const pretty = dt ? formatPrettyDate(dt) : ev.date;

      return `
        <div class="event-card editable-card" data-type="event" data-index="${i}">
          ${editing ? `<button class="delete-btn" title="Delete">✕</button>` : ""}
          <div class="event-icon" data-edit="eventIcon:${i}">${escapeHtml(ev.icon || "📅")}</div>
          <div class="event-main">
            <div class="event-title" data-edit="eventTitle:${i}">${escapeHtml(ev.title || "New Event")}</div>
            <div class="event-sub">
              <span data-edit="eventDate:${i}">${escapeHtml(ev.date || "YYYY-MM-DD")}</span>
              <span> • </span>
              <span>${escapeHtml(pretty || "")}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

let countdownTimer = null;

function getNextEvent(content) {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const upcoming = (content.events || [])
    .map((ev, idx) => ({ ev, idx, dt: parseLocalDateYYYYMMDD(ev.date) }))
    .filter((x) => x.dt && x.dt.getTime() >= todayMidnight.getTime())
    .sort((a, b) => a.dt.getTime() - b.dt.getTime());

  return upcoming[0] || null;
}

function setCountdownBoxes(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / (3600 * 24));
  const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (cdDays) cdDays.textContent = String(days);
  if (cdHours) cdHours.textContent = String(hours).padStart(2, "0");
  if (cdMins) cdMins.textContent = String(mins).padStart(2, "0");
  if (cdSecs) cdSecs.textContent = String(secs).padStart(2, "0");
}

function startCountdown(content) {
  if (!countdownTitleEl || !countdownDateEl || !cdDays || !cdHours || !cdMins || !cdSecs) return;

  if (countdownTimer) clearInterval(countdownTimer);

  function tick() {
    const next = getNextEvent(content);

    if (!next) {
      countdownTitleEl.textContent = "No upcoming events yet";
      countdownDateEl.textContent = "Add a new event in Developer Mode.";
      setCountdownBoxes(0);
      return;
    }

    const dt = next.dt; // midnight local
    const diff = dt.getTime() - Date.now();

    countdownTitleEl.textContent = `${next.ev.title || "Next Event"} ${next.ev.icon || ""}`.trim();
    countdownDateEl.textContent = formatPrettyDate(dt);

    setCountdownBoxes(diff);
  }

  tick();
  countdownTimer = setInterval(tick, 1000);
}

// =====================
// Render: Activities + Members + Officers + Gallery
// =====================
function renderActivities(content, editing = false) {
  if (!activitiesList) return;
  activitiesList.innerHTML = content.activities
    .map(
      (a, i) => `
      <div class="card hover editable-card" data-type="activity" data-index="${i}">
        ${editing ? `<button class="delete-btn" title="Delete">✕</button>` : ""}
        <div class="icon" data-edit="activityIcon:${i}">${escapeHtml(a.icon)}</div>
        <h3 data-edit="activityTitle:${i}">${escapeHtml(a.title)}</h3>
        <p data-edit="activityDesc:${i}">${escapeHtml(a.desc)}</p>
        <div class="tag" data-edit="activityTag:${i}">${escapeHtml(a.tag)}</div>
      </div>
    `
    )
    .join("");
}

function renderMembers(content, editing = false) {
  if (!membersList) return;
  membersList.innerHTML = content.members
    .map(
      (m, i) => `
      <div class="card editable-card" data-type="member" data-index="${i}">
        ${editing ? `<button class="delete-btn" title="Delete">✕</button>` : ""}
        <h3 data-edit="memberTitle:${i}">${escapeHtml(m.title)}</h3>
        <p data-edit="memberDesc:${i}">${escapeHtml(m.desc)}</p>
      </div>
    `
    )
    .join("");
}

function renderOfficers(content, editing = false) {
  if (!officersList) return;

  officersList.innerHTML = (content.officers || [])
    .map(
      (o, i) => `
      <div class="officer-card editable-card" data-type="officer" data-index="${i}">
        ${editing ? `<button class="delete-btn" title="Delete">✕</button>` : ""}

        <div class="officer-top">
          <img
            class="officer-avatar officer-photo"
            data-officer-photo="${i}"
            src="${escapeHtml(o.photo || "")}"
            alt="${escapeHtml(o.name || "Officer")}"
          />

          <div class="officer-meta">
            <div class="officer-name" data-edit="officerName:${i}">${escapeHtml(o.name || "New Officer")}</div>
            <div class="officer-role">
              <span class="pill" data-edit="officerRole:${i}">${escapeHtml(o.role || "Role")}</span>
            </div>
          </div>
        </div>

        <p class="officer-bio" data-edit="officerBio:${i}">${escapeHtml(o.bio || "Short bio...")}</p>

        <div class="officer-cause">
          <div class="label">Favorite environmental cause</div>
          <div class="value" data-edit="officerCause:${i}">${escapeHtml(o.cause || "Cause")}</div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderGallery(content, editing = false) {
  if (!galleryGrid) return;

  galleryGrid.innerHTML = content.gallery
    .map(
      (g, i) => `
      <div class="gallery-item editable-card" data-type="photo" data-index="${i}">
        ${editing ? `<button class="delete-btn" title="Delete">✕</button>` : ""}
        <img class="gallery-img" src="${escapeHtml(g.src)}" alt="${escapeHtml(g.title)}" />
        <div class="gallery-overlay"></div>
        <div class="gallery-meta">
          <div class="gallery-title" data-edit="galleryTitle:${i}">${escapeHtml(g.title)}</div>
          <div class="gallery-tag" data-edit="galleryTag:${i}">${escapeHtml(g.tag)}</div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderBeforeAfter(content) {
  if (!beforeAfterWrap) return;

  const b = content.beforeAfter;
  if (!b?.beforeSrc || !b?.afterSrc) {
    beforeAfterWrap.innerHTML = "";
    return;
  }

  beforeAfterWrap.innerHTML = `
    <div class="before-after">
      <div class="before-after-head">
        <div class="before-after-title" data-edit="beforeAfterTitle">${escapeHtml(
          b.title || "Before & After"
        )}</div>
        <div class="tag">Drag slider</div>
      </div>

      <div class="before-after-stage" id="baStage">
        <img class="before" src="${escapeHtml(b.beforeSrc)}" alt="Before cleanup" />
        <img class="after" id="baAfter" src="${escapeHtml(b.afterSrc)}" alt="After cleanup" />
      </div>

      <input id="baSlider" class="before-after-slider" type="range" min="0" max="100" value="50" />
    </div>
  `;

  const slider = document.getElementById("baSlider");
  const afterImg = document.getElementById("baAfter");
  if (slider && afterImg) {
    afterImg.style.clipPath = "inset(0 50% 0 0)";
    slider.addEventListener("input", () => {
      const v = Number(slider.value);
      afterImg.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
    });
  }
}

// =====================
// Bind "data-edit" text to content object
// =====================
function fillStaticEdits(content) {
  document.querySelectorAll("[data-edit]").forEach((el) => {
    const key = el.getAttribute("data-edit");
    if (!key) return;
    if (key.includes(":")) return;

    if (content[key] != null) el.textContent = content[key];
  });
}

function collectStaticEdits(content) {
  document.querySelectorAll("[data-edit]").forEach((el) => {
    const key = el.getAttribute("data-edit");
    if (!key) return;
    if (key.includes(":")) return;
    content[key] = el.textContent.trim();
  });

  const baTitle = document.querySelector(`[data-edit="beforeAfterTitle"]`);
  if (baTitle) {
    if (!content.beforeAfter) content.beforeAfter = { title: "" };
    content.beforeAfter.title = baTitle.textContent.trim();
  }
}

function collectListEdits(content) {
  // Activities
  content.activities.forEach((_, i) => {
    const icon = document.querySelector(`[data-edit="activityIcon:${i}"]`);
    const title = document.querySelector(`[data-edit="activityTitle:${i}"]`);
    const desc = document.querySelector(`[data-edit="activityDesc:${i}"]`);
    const tag = document.querySelector(`[data-edit="activityTag:${i}"]`);
    if (icon) content.activities[i].icon = icon.textContent.trim();
    if (title) content.activities[i].title = title.textContent.trim();
    if (desc) content.activities[i].desc = desc.textContent.trim();
    if (tag) content.activities[i].tag = tag.textContent.trim();
  });

  // Members
  content.members.forEach((_, i) => {
    const title = document.querySelector(`[data-edit="memberTitle:${i}"]`);
    const desc = document.querySelector(`[data-edit="memberDesc:${i}"]`);
    if (title) content.members[i].title = title.textContent.trim();
    if (desc) content.members[i].desc = desc.textContent.trim();
  });

  // Gallery
  content.gallery.forEach((_, i) => {
    const title = document.querySelector(`[data-edit="galleryTitle:${i}"]`);
    const tag = document.querySelector(`[data-edit="galleryTag:${i}"]`);
    if (title) content.gallery[i].title = title.textContent.trim();
    if (tag) content.gallery[i].tag = tag.textContent.trim();
  });

  // Officers
  (content.officers || []).forEach((_, i) => {
    const name = document.querySelector(`[data-edit="officerName:${i}"]`);
    const role = document.querySelector(`[data-edit="officerRole:${i}"]`);
    const bio = document.querySelector(`[data-edit="officerBio:${i}"]`);
    const cause = document.querySelector(`[data-edit="officerCause:${i}"]`);

    if (name) content.officers[i].name = name.textContent.trim();
    if (role) content.officers[i].role = role.textContent.trim();
    if (bio) content.officers[i].bio = bio.textContent.trim();
    if (cause) content.officers[i].cause = cause.textContent.trim();
  });

  // Events
  (content.events || []).forEach((_, i) => {
    const icon = document.querySelector(`[data-edit="eventIcon:${i}"]`);
    const title = document.querySelector(`[data-edit="eventTitle:${i}"]`);
    const date = document.querySelector(`[data-edit="eventDate:${i}"]`);

    if (icon) content.events[i].icon = icon.textContent.trim();
    if (title) content.events[i].title = title.textContent.trim();
    if (date) content.events[i].date = date.textContent.trim();
  });
}

// =====================
// Logo image override (click-to-change in dev mode)
// =====================
const siteLogo = document.getElementById("siteLogo");
const imagePicker = document.getElementById("imagePicker");

function applyLogo(content) {
  if (!siteLogo) return;
  if (content.logoDataUrl) siteLogo.src = content.logoDataUrl;
}

function pickImageFile(onChosen) {
  if (!imagePicker) return;
  imagePicker.value = "";
  imagePicker.onchange = () => {
    const file = imagePicker.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChosen(String(reader.result));
    reader.readAsDataURL(file);
  };
  imagePicker.click();
}

function pickGalleryFile(onChosen) {
  if (!galleryPicker) return;
  galleryPicker.value = "";
  galleryPicker.onchange = () => {
    const file = galleryPicker.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChosen(String(reader.result));
    reader.readAsDataURL(file);
  };
  galleryPicker.click();
}

function bindOfficerPhotoPickers() {
  if (!editing) return;
  document.querySelectorAll("[data-officer-photo]").forEach((img) => {
    img.style.cursor = "pointer";
    img.classList.add("editable");
    img.onclick = () => {
      const i = Number(img.getAttribute("data-officer-photo"));
      if (!Number.isFinite(i)) return;

      pickGalleryFile((dataUrl) => {
        if (!content.officers) content.officers = [];
        if (!content.officers[i]) return;
        content.officers[i].photo = dataUrl;

        renderOfficers(content, true);
        setEditableAll(true);
        bindOfficerPhotoPickers();
      });
    };
  });
}

// =====================
// Dev Toolbar + Edit Mode
// =====================
const devToolbar = document.getElementById("devToolbar");
const devEditBtn = document.getElementById("devEditBtn");
const devSaveBtn = document.getElementById("devSaveBtn");
const devCancelBtn = document.getElementById("devCancelBtn");
const devLogoutBtn = document.getElementById("devLogoutBtn");

const addActivityBtn = document.getElementById("addActivityBtn");
const addMemberBtn = document.getElementById("addMemberBtn");
const themeBtn = document.getElementById("themeBtn");

const addPhotoBtn = document.getElementById("addPhotoBtn");
const editBeforeAfterBtn = document.getElementById("editBeforeAfterBtn");
const addOfficerBtn = document.getElementById("addOfficerBtn");
const addEventBtn = document.getElementById("addEventBtn");

// ✅ Events Manager UI button (panel launcher)
const manageEventsBtn = document.getElementById("manageEventsBtn");

let content = loadContent();
let theme = loadTheme();
let snapshot = null;
let editing = false;

applyTheme(theme);
fillStaticEdits(content);

renderActivities(content, false);
renderMembers(content, false);
renderOfficers(content, false);

renderEvents(content, false);
startCountdown(content);

renderBeforeAfter(content);
renderGallery(content, false);

applyLogo(content);

function showDevToolbar() {
  if (!devToolbar) return;
  devToolbar.classList.remove("hidden");
  devToolbar.setAttribute("aria-hidden", "false");
}

function hideDevToolbar() {
  if (!devToolbar) return;
  devToolbar.classList.add("hidden");
  devToolbar.setAttribute("aria-hidden", "true");
}

function setEditableAll(on) {
  document.querySelectorAll("[data-edit]").forEach((el) => {
    el.contentEditable = on ? "true" : "false";
    el.classList.toggle("editable", on);
  });
}

function enableEditingUI(on) {
  devSaveBtn.disabled = !on;
  devCancelBtn.disabled = !on;
  addActivityBtn.disabled = !on;
  addMemberBtn.disabled = !on;

  addPhotoBtn.disabled = !on;
  editBeforeAfterBtn.disabled = !on;

  if (addOfficerBtn) addOfficerBtn.disabled = !on;
  if (addEventBtn) addEventBtn.disabled = !on;

  // ✅ Events manager launcher
  if (manageEventsBtn) manageEventsBtn.disabled = !on;

  themeBtn.disabled = !on;
  devEditBtn.disabled = on;
}

function startEdit() {
  snapshot = {
    content: structuredClone(content),
    theme: { ...theme },
  };

  editing = true;
  setEditableAll(true);

  renderActivities(content, true);
  renderMembers(content, true);
  renderOfficers(content, true);

  renderEvents(content, true);
  startCountdown(content);

  renderBeforeAfter(content);
  renderGallery(content, true);

  enableEditingUI(true);

  if (siteLogo) {
    siteLogo.classList.add("editable");
    siteLogo.style.cursor = "pointer";
    siteLogo.onclick = () => {
      pickImageFile((dataUrl) => {
        content.logoDataUrl = dataUrl;
        applyLogo(content);
      });
    };
  }

  bindOfficerPhotoPickers();
}

function stopEditCleanup() {
  editing = false;
  setEditableAll(false);

  renderActivities(content, false);
  renderMembers(content, false);
  renderOfficers(content, false);

  renderEvents(content, false);
  startCountdown(content);

  renderBeforeAfter(content);
  renderGallery(content, false);

  enableEditingUI(false);

  if (siteLogo) {
    siteLogo.classList.remove("editable");
    siteLogo.style.cursor = "";
    siteLogo.onclick = null;
  }
}

function saveEdits() {
  collectStaticEdits(content);
  collectListEdits(content);

  // ✅ migrate before saving so it persists cleanly
  content = migrateContent(content);

  saveContent(content);
  saveTheme(theme);

  stopEditCleanup();
  alert("Saved website changes!");
}

function cancelEdits() {
  if (!snapshot) return;

  content = structuredClone(snapshot.content);
  theme = { ...snapshot.theme };

  applyTheme(theme);
  fillStaticEdits(content);

  renderActivities(content, true);
  renderMembers(content, true);
  renderOfficers(content, true);

  renderEvents(content, true);
  startCountdown(content);

  renderBeforeAfter(content);
  renderGallery(content, true);

  applyLogo(content);

  bindOfficerPhotoPickers();

  alert("Changes canceled (reverted).");
}

function logoutDev() {
  localStorage.removeItem("devLoggedIn");
  localStorage.removeItem("devLoginTime");
  stopEditCleanup();
  hideDevToolbar();
  alert("Logged out of Developer Mode.");
}

// Add / Delete cards
function addActivity() {
  content.activities.push({
    icon: "✨",
    title: "New Activity",
    desc: "Describe the activity...",
    tag: "Tag",
  });
  renderActivities(content, true);
  setEditableAll(true);
}

function addMember() {
  content.members.push({
    title: "New Role",
    desc: "Describe this role...",
  });
  renderMembers(content, true);
  setEditableAll(true);
}

function addOfficer() {
  if (!content.officers) content.officers = [];
  content.officers.push({
    name: "New Officer",
    role: "Role",
    bio: "Short bio...",
    cause: "Favorite environmental cause",
    photo: "",
  });

  renderOfficers(content, true);
  setEditableAll(true);
  bindOfficerPhotoPickers();
}

function addEvent() {
  if (!content.events) content.events = [];
  content.events.push({
    date: "2026-04-20",
    title: "New Event",
    icon: "📅",
  });
  renderEvents(content, true);
  setEditableAll(true);
  startCountdown(content);
}

function addPhoto() {
  pickGalleryFile((dataUrl) => {
    content.gallery.push({
      src: dataUrl,
      title: "New Photo",
      tag: "Gallery",
    });
    renderGallery(content, true);
    setEditableAll(true);
  });
}

function editBeforeAfterImages() {
  const choice = prompt("Type: before OR after (to replace that image)", "before");
  if (!choice) return;

  const which = choice.toLowerCase().includes("after") ? "after" : "before";

  pickGalleryFile((dataUrl) => {
    if (!content.beforeAfter) content.beforeAfter = { title: "Before & After Cleanup" };
    if (which === "before") content.beforeAfter.beforeSrc = dataUrl;
    else content.beforeAfter.afterSrc = dataUrl;

    renderBeforeAfter(content);
    if (editing) setEditableAll(true);
  });
}

function handleDeleteClick(e) {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;

  const card = e.target.closest(".editable-card");
  if (!card) return;

  const type = card.getAttribute("data-type");
  const index = Number(card.getAttribute("data-index"));
  if (!Number.isFinite(index)) return;

  if (type === "activity") content.activities.splice(index, 1);
  if (type === "member") content.members.splice(index, 1);
  if (type === "photo") content.gallery.splice(index, 1);
  if (type === "officer") content.officers.splice(index, 1);
  if (type === "event") content.events.splice(index, 1);

  renderActivities(content, true);
  renderMembers(content, true);
  renderGallery(content, true);
  renderOfficers(content, true);

  renderEvents(content, true);
  startCountdown(content);

  setEditableAll(true);
  bindOfficerPhotoPickers();
}

// Theme editor (simple prompts)
function editTheme() {
  const p1 = prompt("Primary purple (hex):", theme.p1) || theme.p1;
  const p2 = prompt("Secondary purple (hex):", theme.p2) || theme.p2;
  const p3 = prompt("Accent pink (hex):", theme.p3) || theme.p3;

  theme = { p1, p2, p3 };
  applyTheme(theme);
}

// =====================
// Events Manager UI (Dev Panel)
// =====================

// A) DOM refs
const devPanel = document.getElementById("devPanel");
const devPanelClose = document.getElementById("devPanelClose");
const devEventsEditor = document.getElementById("devEventsEditor");
const devAddEventQuick = document.getElementById("devAddEventQuick");
const devSortEvents = document.getElementById("devSortEvents");
const devEventsSave = document.getElementById("devEventsSave");

// B) Open/Close panel
function openDevPanel() {
  if (!devPanel) return;
  devPanel.classList.remove("hidden");
  devPanel.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeDevPanel() {
  if (!devPanel) return;
  devPanel.classList.add("hidden");
  devPanel.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// C) Render editor rows
function ensureEventsArray() {
  if (!content.events) content.events = [];
}

function renderEventsEditor() {
  if (!devEventsEditor) return;
  ensureEventsArray();

  devEventsEditor.innerHTML = content.events
    .map(
      (ev, i) => `
      <div class="dev-event-item" data-ev-index="${i}">
        <div class="dev-event-grid">
          <input type="text" value="${escapeHtml(ev.icon || "📅")}" placeholder="Icon (emoji)" data-ev-field="icon">
          <input type="text" value="${escapeHtml(ev.title || "")}" placeholder="Event title" data-ev-field="title">
          <input type="date" value="${escapeHtml(ev.date || "")}" data-ev-field="date">
        </div>

        <div class="dev-event-actions">
          <button class="dev-btn" type="button" data-ev-action="up">↑ Move Up</button>
          <button class="dev-btn" type="button" data-ev-action="down">↓ Move Down</button>
          <button class="dev-btn danger" type="button" data-ev-action="delete">Delete</button>
        </div>
      </div>
    `
    )
    .join("");
}

// D) Apply editor → content
function applyEventsEditorToContent() {
  if (!devEventsEditor) return;
  ensureEventsArray();

  const items = devEventsEditor.querySelectorAll("[data-ev-index]");
  const next = [];

  items.forEach((row) => {
    const icon = row.querySelector(`[data-ev-field="icon"]`)?.value?.trim() || "📅";
    const title = row.querySelector(`[data-ev-field="title"]`)?.value?.trim() || "New Event";
    const date = row.querySelector(`[data-ev-field="date"]`)?.value?.trim() || "2026-04-20";
    next.push({ icon, title, date });
  });

  content.events = next;
}

// E) Move / delete handlers
function moveEvent(from, to) {
  ensureEventsArray();
  if (to < 0 || to >= content.events.length) return;
  const item = content.events.splice(from, 1)[0];
  content.events.splice(to, 0, item);
}

function deleteEventAt(i) {
  ensureEventsArray();
  content.events.splice(i, 1);
}

// F) Wire up panel actions
let devEventsPanelBound = false;

function bindDevEventsPanel() {
  if (devEventsPanelBound) return;
  devEventsPanelBound = true;

  manageEventsBtn?.addEventListener("click", () => {
    if (!editing) return; // only in edit mode
    renderEventsEditor();
    openDevPanel();
  });

  devPanelClose?.addEventListener("click", closeDevPanel);

  devAddEventQuick?.addEventListener("click", () => {
    ensureEventsArray();
    content.events.push({ date: "2026-04-20", title: "New Event", icon: "📅" });
    renderEventsEditor();
  });

  devSortEvents?.addEventListener("click", () => {
    ensureEventsArray();
    content.events.sort((a, b) => {
      const da = parseLocalDateYYYYMMDD(a.date)?.getTime() ?? 0;
      const db = parseLocalDateYYYYMMDD(b.date)?.getTime() ?? 0;
      return da - db;
    });
    renderEventsEditor();
  });

  devEventsEditor?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-ev-action]");
    if (!btn) return;

    const row = e.target.closest("[data-ev-index]");
    if (!row) return;
    const i = Number(row.getAttribute("data-ev-index"));
    if (!Number.isFinite(i)) return;

    const action = btn.getAttribute("data-ev-action");

    // First pull latest input values into content
    applyEventsEditorToContent();

    if (action === "up") moveEvent(i, i - 1);
    if (action === "down") moveEvent(i, i + 1);
    if (action === "delete") deleteEventAt(i);

    renderEventsEditor();
  });

  devEventsSave?.addEventListener("click", () => {
    applyEventsEditorToContent();

    // refresh the real section UI
    renderEvents(content, true);
    startCountdown(content);

    // keep edit outlines
    setEditableAll(true);

    alert("Events updated in Developer Mode!");
  });
}

// =====================
// Wire up toolbar + delete buttons
// =====================
function bindEditingEvents() {
  document.addEventListener("click", (e) => {
    if (!editing) return;
    handleDeleteClick(e);
  });

  devEditBtn?.addEventListener("click", startEdit);
  devSaveBtn?.addEventListener("click", saveEdits);
  devCancelBtn?.addEventListener("click", cancelEdits);
  devLogoutBtn?.addEventListener("click", logoutDev);

  addActivityBtn?.addEventListener("click", addActivity);
  addMemberBtn?.addEventListener("click", addMember);

  addPhotoBtn?.addEventListener("click", addPhoto);
  editBeforeAfterBtn?.addEventListener("click", editBeforeAfterImages);

  addOfficerBtn?.addEventListener("click", addOfficer);
  addEventBtn?.addEventListener("click", addEvent);

  themeBtn?.addEventListener("click", editTheme);

  // ✅ call binder for Events Manager UI
  bindDevEventsPanel();
}

if (isDevLoggedIn()) {
  showDevToolbar();
  bindEditingEvents();
} else {
  hideDevToolbar();
}

// =========================
// Impact Counters (animate on scroll)
// =========================
const counters = document.querySelectorAll(".counter");
const impactCards = document.querySelectorAll(".impact-card");
let countersRan = false;

function formatNumber(n) {
  return n.toLocaleString();
}

function animateCounter(el, target, suffix = "") {
  const duration = 1200;
  const start = 0;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    const value = Math.round(start + (target - start) * eased);
    el.textContent = formatNumber(value) + suffix;

    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function runImpactCounters() {
  if (countersRan) return;
  countersRan = true;

  impactCards.forEach((card, i) => {
    setTimeout(() => card.classList.add("reveal"), i * 90);
  });

  counters.forEach((el) => {
    const target = Number(el.getAttribute("data-target") || "0");
    const suffix = el.getAttribute("data-suffix") || "";
    animateCounter(el, target, suffix);
  });
}

const impactSection = document.getElementById("impact");
if (impactSection) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runImpactCounters();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(impactSection);
}

// =========================
// Lightbox (Gallery)
// =========================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxTag = document.getElementById("lightboxTag");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");

let lightboxIndex = 0;

function openLightbox(i) {
  if (!lightbox || !content.gallery?.length) return;
  lightboxIndex = Math.max(0, Math.min(i, content.gallery.length - 1));
  const item = content.gallery[lightboxIndex];

  if (lightboxImg) lightboxImg.src = item.src;
  if (lightboxTitle) lightboxTitle.textContent = item.title || "";
  if (lightboxTag) lightboxTag.textContent = item.tag || "";

  lightbox.classList.remove("hidden");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.add("hidden");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function lightboxStep(dir) {
  if (!content.gallery?.length) return;
  const next = (lightboxIndex + dir + content.gallery.length) % content.gallery.length;
  openLightbox(next);
}

galleryGrid?.addEventListener("click", (e) => {
  if (editing) return;
  const item = e.target.closest(".gallery-item");
  if (!item) return;
  const idx = Number(item.getAttribute("data-index"));
  if (!Number.isFinite(idx)) return;
  openLightbox(idx);
});

lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrev?.addEventListener("click", () => lightboxStep(-1));
lightboxNext?.addEventListener("click", () => lightboxStep(1));

lightbox?.addEventListener("click", (e) => {
  if (e.target?.dataset?.close === "true") closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (!lightbox || lightbox.classList.contains("hidden")) return;

  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") lightboxStep(-1);
  if (e.key === "ArrowRight") lightboxStep(1);
});

document.querySelector('.hamburger').addEventListener('click', function() {
  document.querySelector('.nav').classList.toggle('open');
});