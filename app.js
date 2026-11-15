const API_URL = String(window.HINGAS_CONFIG?.appsScriptUrl || "").trim();
const CATEGORIES = ["All classes", "Basic Ballet", "Modern Dance Kids", "Step Hype", "Zumba", "Yoga", "Gymnastics", "Muay Thai", "Karatedo", "Dance"];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const php = (amount) => `₱${Number(amount).toLocaleString("en-PH")}`;
const safeHTML = (text) => String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const localKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const parseLocalDate = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};
const addDays = (date, amount) => {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + amount);
  return result;
};
const fullDate = new Intl.DateTimeFormat("en-PH", { weekday: "long", month: "long", day: "numeric" });
const shortDate = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric" });
const timeLabel = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit" }).format(new Date(2026, 0, 1, hours, minutes));
};
const PAGE_META = {
  home: ["Hingas Lifestyle Studio — Health. Harmony. Hingas.", "Find your kind of movement at Hingas Lifestyle Studio in Surigao City."],
  classes: ["Classes | Hingas Lifestyle Studio", "Explore dance, fitness and movement classes at Hingas Lifestyle Studio in Surigao City."],
  schedule: ["Schedule and booking | Hingas Lifestyle Studio", "Browse upcoming classes and reserve a seat with secure online payment."],
  gallery: ["Gallery | Hingas Lifestyle Studio", "Photos and videos from Hingas Lifestyle Studio in Surigao City."],
  "studio-rental": ["Studio rental | Hingas Lifestyle Studio", "Ask about studio rental for rehearsals, workshops, events and fitness sessions."],
  contact: ["Contact | Hingas Lifestyle Studio", "Contact Hingas Lifestyle Studio in Surigao City by phone, email or Messenger."]
};
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const today = new Date();
const dateTabs = Array.from({ length: 14 }, (_, index) => addDays(today, index));

const WEEKLY_STUDIO_SCHEDULE = {
  1: [ // Monday
    { name: "Yoga", category: "Yoga", time: "08:00", duration: 60, capacity: 10, price: 350, coach: "Elena", level: "All Levels", group: "Teens & Adults", description: "Breathwork, gentle flow and mindful stretching to energize your week.", bring: "Yoga mat & water" },
    { name: "Basic Ballet", category: "Basic Ballet", time: "16:00", duration: 60, capacity: 12, price: 350, coach: "Sarah", level: "Beginner", group: "Kids & Teens (Ages 6+)", description: "Foundational ballet technique, posture, musicality and grace in a supportive setting.", bring: "Ballet shoes or socks, comfortable attire" },
    { name: "Step Hype", category: "Step Hype", time: "17:30", duration: 60, capacity: 15, price: 250, coach: "Jolo", level: "Open Level", group: "All Ages", description: "High-energy cardio step routines set to upbeat chart-topping music.", bring: "Sneakers, towel & water" },
    { name: "Muay Thai", category: "Muay Thai", time: "19:00", duration: 60, capacity: 10, price: 350, coach: "Carlos", level: "Beginner to Intermediate", group: "Teens & Adults", description: "Striking technique, pad work, core conditioning and self-defense basics.", bring: "Hand wraps, athletic wear & water bottle" }
  ],
  2: [ // Tuesday
    { name: "Yoga Flow", category: "Yoga", time: "09:00", duration: 60, capacity: 10, price: 350, coach: "Elena", level: "Gentle / Moderate", group: "Adults", description: "Vinyasa flow focusing on joint mobility, balance and core awareness.", bring: "Yoga mat & towel" },
    { name: "Modern Dance Kids", category: "Modern Dance Kids", time: "15:30", duration: 50, capacity: 12, price: 300, coach: "Mark", level: "Beginner", group: "Kids (Ages 5-12)", description: "Expressive contemporary movement, coordination games and fun choreography.", bring: "Comfortable stretch clothing" },
    { name: "Gymnastics", category: "Gymnastics", time: "16:45", duration: 60, capacity: 10, price: 400, coach: "Ryan", level: "Beginner to Intermediate", group: "Youth (Ages 6-15)", description: "Tumbling, flexibility, balance beams, handstands and core strength.", bring: "Gymnastic leotard or snug athletic wear" },
    { name: "Zumba", category: "Zumba", time: "18:00", duration: 60, capacity: 20, price: 200, coach: "Diane", level: "All Levels", group: "Open to All", description: "Total body dance fitness party combining Latin rhythms and global beats.", bring: "Gym shoes, face towel & water" },
    { name: "Karatedo", category: "Karatedo", time: "19:15", duration: 60, capacity: 12, price: 350, coach: "Ken", level: "All Belts", group: "Kids & Adults", description: "Traditional kata, disciplined striking, sparring fundamentals and etiquette.", bring: "Karate Gi or loose training pants" }
  ],
  3: [ // Wednesday
    { name: "Yoga", category: "Yoga", time: "08:00", duration: 60, capacity: 10, price: 350, coach: "Elena", level: "All Levels", group: "Teens & Adults", description: "Core strength, hip openers and revitalizing morning sequence.", bring: "Yoga mat & water" },
    { name: "Basic Ballet", category: "Basic Ballet", time: "16:00", duration: 60, capacity: 12, price: 350, coach: "Sarah", level: "Beginner / Intermediate", group: "Kids & Teens", description: "Barre work, center practice and elegant combinations.", bring: "Ballet slippers & comfortable attire" },
    { name: "Step Hype", category: "Step Hype", time: "17:30", duration: 60, capacity: 15, price: 250, coach: "Jolo", level: "Open Level", group: "All Ages", description: "Cardio conditioning and rhythmic footwork patterns.", bring: "Sneakers & water" },
    { name: "Dance Sports", category: "Dance", time: "18:45", duration: 60, capacity: 14, price: 400, coach: "Mia", level: "Beginner to Advanced", group: "Teens & Adults", description: "Latin and Ballroom basics: Cha-Cha, Rumba, Jive and poise training.", bring: "Dance shoes or smooth-soled shoes" },
    { name: "Muay Thai", category: "Muay Thai", time: "20:00", duration: 60, capacity: 10, price: 350, coach: "Carlos", level: "All Levels", group: "Teens & Adults", description: "Pad drills, heavy bag combinations and metabolic conditioning.", bring: "Hand wraps & athletic gear" }
  ],
  4: [ // Thursday
    { name: "Yoga Flow", category: "Yoga", time: "09:00", duration: 60, capacity: 10, price: 350, coach: "Elena", level: "All Levels", group: "Adults", description: "Deep stretches, alignment and soothing breathwork.", bring: "Yoga mat & water" },
    { name: "Modern Dance Kids", category: "Modern Dance Kids", time: "15:30", duration: 50, capacity: 12, price: 300, coach: "Mark", level: "Beginner", group: "Kids (Ages 5-12)", description: "Creative movement, rhythm training and group dances.", bring: "Comfortable stretch clothing" },
    { name: "Gymnastics", category: "Gymnastics", time: "16:45", duration: 60, capacity: 10, price: 400, coach: "Ryan", level: "All Levels", group: "Youth (Ages 6-15)", description: "Floor skills, cartwheels, backbends, and strength development.", bring: "Snug athletic wear" },
    { name: "Zumba", category: "Zumba", time: "18:00", duration: 60, capacity: 20, price: 200, coach: "Diane", level: "All Levels", group: "Open to All", description: "Upbeat music, high calorie burn, and an infectious community vibe.", bring: "Sneakers & hydration" },
    { name: "Femme Dance", category: "Dance", time: "19:15", duration: 60, capacity: 15, price: 300, coach: "Nicole", level: "Open Level", group: "Teens & Adults", description: "Sultry, empowering commercial choreography and confidence building.", bring: "Comfortable heels or clean sneakers" }
  ],
  5: [ // Friday
    { name: "Gentle Yoga", category: "Yoga", time: "08:00", duration: 60, capacity: 10, price: 350, coach: "Elena", level: "All Levels", group: "Adults", description: "Slow somatic stretches and restorative postures to decompress from the week.", bring: "Yoga mat & water" },
    { name: "Basic Ballet", category: "Basic Ballet", time: "16:00", duration: 60, capacity: 12, price: 350, coach: "Sarah", level: "Beginner", group: "Kids & Teens", description: "Barre training, turns, leaps and graceful posture work.", bring: "Ballet shoes & attire" },
    { name: "Step Hype", category: "Step Hype", time: "17:30", duration: 60, capacity: 15, price: 250, coach: "Jolo", level: "Open Level", group: "All Ages", description: "Friday hype step party! Upbeat tracks, fast feet and great vibes.", bring: "Sneakers & towel" },
    { name: "Dance Sports", category: "Dance", time: "18:45", duration: 60, capacity: 14, price: 400, coach: "Mia", level: "All Levels", group: "Teens & Adults", description: "Latin rhythms, partner work fundamentals and floor styling.", bring: "Dance shoes or clean sneakers" },
    { name: "Female Dancehall", category: "Dance", time: "20:00", duration: 60, capacity: 15, price: 300, coach: "Nicole", level: "Open Level", group: "Teens & Adults", description: "Authentic Jamaican dancehall steps, waistline control and fierce energy.", bring: "Comfortable clothes & sneakers" }
  ],
  6: [ // Saturday
    { name: "Zumba Weekend", category: "Zumba", time: "08:00", duration: 60, capacity: 25, price: 200, coach: "Diane", level: "All Levels", group: "Open to All", description: "Start your weekend with maximum energy and upbeat global music.", bring: "Sneakers & water" },
    { name: "Basic Ballet Kids", category: "Basic Ballet", time: "09:30", duration: 50, capacity: 12, price: 350, coach: "Sarah", level: "Beginner", group: "Kids (Ages 4-8)", description: "Storytelling, rhythm, basic positions and coordination for young dancers.", bring: "Ballet attire or socks" },
    { name: "Modern Dance Kids", category: "Modern Dance Kids", time: "10:45", duration: 60, capacity: 14, price: 300, coach: "Mark", level: "All Levels", group: "Kids (Ages 7-14)", description: "Contemporary flow, floorwork and creative group routines.", bring: "Comfortable stretch clothing" },
    { name: "Gymnastics", category: "Gymnastics", time: "14:00", duration: 60, capacity: 12, price: 400, coach: "Ryan", level: "All Levels", group: "Youth (Ages 5-16)", description: "Acrobatics, balance, vault drills and tumbling passes.", bring: "Athletic wear" },
    { name: "Karatedo", category: "Karatedo", time: "16:00", duration: 60, capacity: 15, price: 350, coach: "Ken", level: "All Belts", group: "All Ages", description: "Self-defense, belt progression kata, and discipline.", bring: "Gi or training uniform" },
    { name: "Muay Thai Weekend", category: "Muay Thai", time: "17:30", duration: 60, capacity: 12, price: 350, coach: "Carlos", level: "All Levels", group: "Teens & Adults", description: "Bag work, sparring drills, knee & elbow combinations and strength.", bring: "Gloves, wraps & water" }
  ],
  0: [ // Sunday
    { name: "Sunday Morning Yoga", category: "Yoga", time: "09:00", duration: 60, capacity: 12, price: 350, coach: "Elena", level: "All Levels", group: "Open to All", description: "Gentle Sunday flow, calming pranayama, and deep hip & spine release.", bring: "Yoga mat & water" },
    { name: "Community Dance Jam", category: "Dance", time: "10:30", duration: 60, capacity: 20, price: 250, coach: "Studio Team", level: "All Levels", group: "Open to All", description: "Open floor groove session featuring hip-hop, pop and Latin choreo.", bring: "Comfortable shoes & positive vibes" },
    { name: "Studio Open Rehearsal", category: "All classes", time: "16:00", duration: 90, capacity: 15, price: 200, coach: "Open Floor", level: "Self-Guided", group: "Studio Members", description: "Supervised open floor space for dancers, martial artists and yogis to practice.", bring: "Own equipment & music player" }
  ]
};

function generateStudioSchedule(startDay, daysCount = 45) {
  const result = [];
  for (let i = -7; i < daysCount; i++) {
    const sessionDate = addDays(startDay, i);
    const dayOfWeek = sessionDate.getDay();
    const dayTemplates = WEEKLY_STUDIO_SCHEDULE[dayOfWeek] || [];
    dayTemplates.forEach((template, idx) => {
      const id = `sched-${localKey(sessionDate)}-${idx}-${template.time.replace(":", "")}`;
      result.push({
        ...template,
        date: sessionDate,
        dayIndex: dayOfWeek,
        id: id,
        photoUrl: localClassPhoto(template.name)
      });
    });
  }
  return result;
}

const previewClasses = [
  "Basic Ballet", "Modern Dance Kids", "Step Hype", "Zumba", "Yoga", "Gymnastics", "Muay Thai", "Karatedo", "Dance Sports", "Femme Dance", "Female Dancehall"
].map((name, index) => ({ id: `preview-class-${index}`, name, description: "", ageGroup: "", level: "", bring: "", photoUrl: localClassPhoto(name), price: 350 }));
let classesCatalog = previewClasses;
const LOCAL_CLASS_MEDIA = previewClasses.map((item, index) => ({
  type: "photo",
  title: `${item.name} class at Hingas`,
  url: localClassPhoto(item.name),
  poster: "",
  order: index + 1
}));
let mediaItems = LOCAL_CLASS_MEDIA;
let classes = generateStudioSchedule(today, 45);
let currentCalYear = today.getFullYear();
let currentCalMonth = today.getMonth();
let scheduleViewMode = "strip";
const bookingModal = $("#booking-modal");
const bookingContent = $("#booking-content");
const toast = $("#toast");
const nav = $("#site-nav");
const menuToggle = $(".menu-toggle");
let selectedDate = new Date(today);
let selectedCategory = "All classes";
let selectedTimeFilter = "all";
let classSearchQuery = "";
let appliedPromo = null;
let selectedClass = null;
let bookingStep = 1;
let bookingQuantity = 1;
let holdEndsAt = 0;
let holdInterval = null;
let activeHeldClassId = null;
let bookingCheckoutUrl = "";
let pendingBookingId = "";
let previousFocus = null;
let toastTimeout = null;
let rentalSubmitInProgress = false;
let isLiveMode = false;
let isScheduleLoading = false;
let isClassesLive = false;
let isClassesLoading = false;
let isMediaLoading = false;
let pendingPost = null;
let pendingPostTimeout = null;
let revealObserver = null;
let lineObserver = null;
const mediaViewer = $("#media-viewer");
const mediaViewerContent = $("#media-viewer-content");
const waitlistModal = $("#waitlist-modal");
const waitlistForm = $("#waitlist-form");
const classDetailModal = $("#class-detail-modal");

function trackEvent(name, data = {}) {
  try {
    if (typeof window.gtag === "function") window.gtag("event", name, data);
    if (typeof window.fbq === "function") window.fbq("track", name, data);
  } catch (err) {}
}

function initTheme() {
  const saved = localStorage.getItem("hingas_theme");
  const isDark = saved === "midnight";
  document.documentElement.classList.toggle("theme-midnight", isDark);
  updateThemeIcon(isDark);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("theme-midnight");
  localStorage.setItem("hingas_theme", isDark ? "midnight" : "light");
  updateThemeIcon(isDark);
  showToast(isDark ? "Switched to Midnight Studio mode" : "Switched to Warm Studio mode");
}

function updateThemeIcon(isDark) {
  const icon = $(".theme-icon", $("#theme-toggle"));
  if (icon) icon.innerHTML = isDark ? '<svg class="ui-icon theme-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>' : '<svg class="ui-icon theme-svg" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
}

function initTypewriter() {
  const target = $("#typewriter-text");
  if (!target) return;
  const phrases = [
    "Basic Ballet & Dance.",
    "Step Hype & Cardio.",
    "Gentle & Vinyasa Yoga.",
    "Gymnastics & Movement.",
    "Muay Thai & Strength.",
    "Health. Harmony. Hingas."
  ];
  let phraseIndex = 0;
  let charIndex = phrases[0].length;
  let isDeleting = true;
  target.textContent = phrases[0];

  function tick() {
    const current = phrases[phraseIndex];
    if (isDeleting) {
      charIndex--;
      target.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, 450);
        return;
      }
      setTimeout(tick, 32);
    } else {
      charIndex++;
      target.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(tick, 2200);
        return;
      }
      setTimeout(tick, 65 + Math.random() * 40);
    }
  }

  setTimeout(tick, 2000);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 4200);
}

function apiGet(parameters) {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(API_URL)) {
    return Promise.reject(new Error("Booking service is not configured."));
  }
  return new Promise((resolve, reject) => {
    const callback = `hingasCallback${Date.now()}${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => finish(new Error("The studio service did not respond.")), 12000);
    function finish(error, result) {
      window.clearTimeout(timeout);
      delete window[callback];
      script.remove();
      if (error) reject(error);
      else resolve(result);
    }
    window[callback] = (result) => finish(null, result);
    const query = new URLSearchParams({ ...parameters, callback });
    script.onerror = () => finish(new Error("Could not reach the studio service."));
    script.src = `${API_URL}?${query.toString()}`;
    document.head.append(script);
  });
}

async function loadSchedule() {
  if (!API_URL || isScheduleLoading) return;
  isScheduleLoading = true;
  renderClasses();
  try {
    const result = await apiGet({ action: "schedule" });
    if (!result || !result.ok || !Array.isArray(result.sessions)) throw new Error(result?.error || "The live schedule is unavailable.");
    classes = result.sessions.map((session) => ({
      ...session,
      category: session.name,
      date: parseLocalDate(session.date)
    })).filter((session) => session.date instanceof Date && !Number.isNaN(session.date.getTime()));
    isLiveMode = true;
    if (selectedCategory !== "All classes" && !classes.some((item) => (item.category || item.name) === selectedCategory)) {
      selectedCategory = "All classes";
    }
    if (!classes.some((item) => localKey(item.date) === localKey(selectedDate))) {
      selectedDate = classes.length ? new Date(classes[0].date) : new Date(today);
    }
    buildDates();
    buildPills();
    renderClasses();
    updateNextClass();
  } catch (error) {
    console.error("Hingas live schedule could not load.", error);
    showToast("Live schedule is unavailable. Preview only; booking is disabled.");
  } finally {
    isScheduleLoading = false;
    renderClasses();
  }
}

async function loadClasses() {
  if (!API_URL || isClassesLoading) return;
  isClassesLoading = true;
  try {
    const result = await apiGet({ action: "classes" });
    if (!result || !result.ok || !Array.isArray(result.classes)) throw new Error(result?.error || "The class catalog is unavailable.");
    classesCatalog = result.classes;
    isClassesLive = true;
    renderClassDetails();
  } catch (error) {
    console.error("Hingas class catalog could not load.", error);
  } finally {
    isClassesLoading = false;
    renderClassDetails();
  }
}

async function loadMedia() {
  if (!API_URL || isMediaLoading) return;
  isMediaLoading = true;
  try {
    const result = await apiGet({ action: "media" });
    if (!result || !result.ok || !Array.isArray(result.media)) throw new Error(result?.error || "The gallery is unavailable.");
    const remoteMedia = result.media.filter((item) =>
      item && ["photo", "video"].includes(item.type) && safeHttpsUrl(item.url) &&
      (item.type !== "video" || safeHttpsUrl(item.poster))
    ).map((item) => ({ ...item, url: safeHttpsUrl(item.url), poster: safeHttpsUrl(item.poster) }));
    const remoteUrls = new Set(remoteMedia.map((item) => item.url));
    mediaItems = [...remoteMedia, ...LOCAL_CLASS_MEDIA.filter((item) => !remoteUrls.has(item.url))];
    renderMediaGallery();
  } catch (error) {
    console.error("Hingas gallery media could not load.", error);
  } finally {
    isMediaLoading = false;
    renderMediaGallery();
  }
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.href : "";
  } catch (error) {
    return "";
  }
}

function safePhotoUrl(value) {
  const remoteUrl = safeHttpsUrl(value);
  if (remoteUrl) return remoteUrl;
  const localUrl = String(value || "").trim();
  return LOCAL_CLASS_MEDIA.some((item) => item.url === localUrl) ? localUrl : "";
}

function localClassPhoto(name) {
  const photos = {
    "basic ballet": "img/basic%20ballet.jpg",
    "modern dance kids": "img/modern%20dance%20kids.jpg",
    "step hype": "img/step%20hype.jpg",
    zumba: "img/zumba.jpg",
    yoga: "img/yoga.jpg",
    gymnastics: "img/gymnastics.jpg",
    "muay thai": "img/mhuay%20thai.jpg"
  };
  return photos[String(name || "").trim().toLowerCase()] || "";
}

function classPhotoUrl(item) {
  return safeHttpsUrl(item.photoUrl) || localClassPhoto(item.name);
}

function classSlug(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function renderClassDetails() {
  const container = $("#class-details-grid");
  if (!container) return;
  if (!classesCatalog.length) {
    container.innerHTML = `<p class="class-catalog-empty">${isClassesLive ? "The studio has not added class details yet." : "Class details are loading. Please try again soon."}</p>`;
    return;
  }
  container.innerHTML = classesCatalog.map((item) => {
    const photoUrl = classPhotoUrl(item);
    const photo = photoUrl
      ? `<img src="${safeHTML(photoUrl)}" alt="${safeHTML(item.name)} class" loading="lazy" referrerpolicy="no-referrer">`
      : `<span class="class-detail-photo-placeholder">Class photo to add</span>`;
    const detail = (label, value) => `<div><span>${label}</span><strong>${safeHTML(value || "To be confirmed")}</strong></div>`;
    const price = Number.isFinite(Number(item.price)) && Number(item.price) > 0 ? php(item.price) : "Price to confirm";
    return `<article class="class-detail-card" id="class-${classSlug(item.name)}">
      <div class="class-detail-photo">${photo}</div>
      <div class="class-detail-copy"><span class="eyebrow">HINGAS CLASS</span><h2>${safeHTML(item.name)}</h2>
        <p>${safeHTML(item.description || "A class description will be added after the studio confirms the details.")}</p>
        <div class="class-detail-meta">${detail("Who it’s for", item.ageGroup)}${detail("Level", item.level)}${detail("What to bring", item.bring)}</div>
        <div class="class-detail-footer"><strong>${safeHTML(price)}</strong><a class="button button-gold" href="#schedule" data-route="schedule" data-category="${safeHTML(item.name)}">Find a class <span>↗</span></a></div>
      </div>
    </article>`;
  }).join("");
  observeScrollReveals(container);
}

function featuredMarkup(item, emptyTitle) {
  const poster = item && safeHttpsUrl(item.poster);
  const title = item && item.title ? item.title : emptyTitle;
  const index = item ? mediaItems.indexOf(item) : -1;
  return `${poster ? `<img src="${safeHTML(poster)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ""}
    <span class="media-play" aria-hidden="true">▶</span>
    <span class="media-card-title">${safeHTML(title)}</span>
    <span class="media-placeholder-note">${item ? "Press play to watch" : "Video goes here · add it in the Media sheet"}</span>
    <span class="media-data" hidden data-media-index="${index}" data-media-kind="video"></span>`;
}

function videoTile(item, slot) {
  const poster = item && safeHttpsUrl(item.poster);
  const title = item && item.title ? item.title : `Video goes here · Reel ${slot + 1}`;
  const index = item ? mediaItems.indexOf(item) : -1;
  return `<button type="button" class="reel-card${item ? "" : " media-empty"}" data-media-index="${index}" data-media-kind="video" aria-label="Play ${safeHTML(title)}">
    ${poster ? `<img src="${safeHTML(poster)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ""}
    <span class="media-play" aria-hidden="true">▶</span><span class="media-card-title">${safeHTML(title)}</span>
    ${item ? "" : `<span class="media-placeholder-note">Add a video in the Media sheet</span>`}</button>`;
}

function renderMediaGallery() {
  const videos = mediaItems.filter((item) => item.type === "video");
  const photos = mediaItems.filter((item) => item.type === "photo");
  const featured = videos[0] || null;
  ["#home-featured-video", "#gallery-featured-video"].forEach((selector) => {
    const button = $(selector);
    if (!button) return;
    button.innerHTML = featuredMarkup(featured, "Video goes here");
    button.dataset.mediaIndex = String(featured ? mediaItems.indexOf(featured) : -1);
    button.setAttribute("aria-label", featured ? `Play ${featured.title || "featured video"}` : "Video goes here. Open placeholder.");
  });
  const reels = $("#gallery-reels");
  if (reels) reels.innerHTML = Array.from({ length: 4 }, (_, index) => videoTile(videos[index + 1] || null, index)).join("");
  const photoGrid = $("#gallery-photos");
  if (photoGrid) {
    const entries = photos.length ? photos : Array.from({ length: 4 }, () => null);
    photoGrid.innerHTML = entries.map((item, index) => {
      const photoUrl = item && safePhotoUrl(item.url);
      const title = item && item.title ? item.title : `Photo ${index + 1} goes here`;
      const mediaIndex = item ? mediaItems.indexOf(item) : -1;
      return `<button type="button" class="gallery-photo${item ? "" : " media-empty"}" data-media-index="${mediaIndex}" data-media-kind="photo" aria-label="Open ${safeHTML(title)}">
        ${photoUrl ? `<img src="${safeHTML(photoUrl)}" alt="${safeHTML(item.title || "Hingas studio photo")}" loading="lazy" referrerpolicy="no-referrer">` : `<span>Photo goes here<br><small>Add a photo in the Media sheet</small></span>`}
      </button>`;
    }).join("");
  }
  observeScrollReveals(document.querySelector(".view.active") || document);
}

function getVideoPlayer(item) {
  const videoUrl = safeHttpsUrl(item.url);
  if (!videoUrl) return `<p class="media-viewer-message">This video needs a public HTTPS URL in the Media sheet.</p>`;
  const url = new URL(videoUrl);
  if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) {
    const poster = safeHttpsUrl(item.poster);
    return `<video controls autoplay playsinline${poster ? ` poster="${safeHTML(poster)}"` : ""}><source src="${safeHTML(videoUrl)}">Your browser cannot play this video.</video>`;
  }
  let embedUrl = "";
  if (url.hostname === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    if (id) embedUrl = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
  } else if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(url.hostname)) {
    const id = url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
    if (id) embedUrl = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
  } else if (["facebook.com", "www.facebook.com", "m.facebook.com", "fb.watch"].includes(url.hostname)) {
    embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false&autoplay=true`;
  }
  if (!embedUrl) {
    return `<p class="media-viewer-message">Use a public HTTPS MP4, YouTube, or Facebook video link.</p>`;
  }
  return `<iframe src="${safeHTML(embedUrl)}" title="${safeHTML(item.title || "Hingas video")}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
}

function openMediaViewer(index, kind) {
  const item = Number(index) >= 0 ? mediaItems[Number(index)] : null;
  const mediaKind = item ? item.type : kind;
  previousFocus = document.activeElement;
  $("#media-viewer-title").textContent = item && item.title ? item.title : mediaKind === "photo" ? "Photo placeholder" : "Video placeholder";
  mediaViewerContent.innerHTML = "";
  if (!item) {
    mediaViewerContent.innerHTML = `<div class="media-viewer-message"><span aria-hidden="true">${mediaKind === "photo" ? "▧" : "▶"}</span><p>${mediaKind === "photo" ? "Photo goes here. Add a visible photo to the Media sheet." : "Video goes here. Add a visible video to the Media sheet."}</p></div>`;
  } else if (item.type === "photo") {
    const photoUrl = safePhotoUrl(item.url);
    mediaViewerContent.innerHTML = photoUrl
      ? `<img class="media-viewer-photo" src="${safeHTML(photoUrl)}" alt="${safeHTML(item.title || "Hingas studio photo")}">`
      : `<div class="media-viewer-message"><p>Photo unavailable. Check its HTTPS URL in the Media sheet.</p></div>`;
  } else {
    mediaViewerContent.innerHTML = getVideoPlayer(item);
  }
  mediaViewer.hidden = false;
  document.body.classList.add("modal-open");
  $("[data-close-media]", mediaViewer).focus();
}

function closeMediaViewer() {
  if (mediaViewer.hidden) return;
  mediaViewer.hidden = true;
  mediaViewerContent.replaceChildren();
  if (bookingModal.hidden) document.body.classList.remove("modal-open");
  if (previousFocus && previousFocus.isConnected) previousFocus.focus();
}

function createNonce() {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function postToBackend(action, values, formElement) {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(API_URL)) {
    showToast("Online requests are not configured yet. Please call the studio.");
    return false;
  }
  if (pendingPost) {
    showToast("Please wait for the current request to finish.");
    return false;
  }
  const nonce = createNonce();
  const form = document.createElement("form");
  form.method = "post";
  form.action = API_URL;
  form.target = "backend-frame";
  form.hidden = true;
  const fields = { ...values, action, nonce };
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value ?? "");
    form.append(input);
  });
  document.body.append(form);
  pendingPost = { nonce, action, form, formElement };
  pendingPostTimeout = window.setTimeout(() => {
    if (!pendingPost || pendingPost.nonce !== nonce) return;
    const request = pendingPost;
    pendingPost = null;
    request.form.remove();
    showToast("The studio service did not respond. Please try again or call the studio.");
    if (request.formElement) {
      const button = $("button[type='submit']", request.formElement);
      if (button) button.disabled = false;
    }
    if (request.action === "book") $(".dialog-close", bookingModal).disabled = false;
    else rentalSubmitInProgress = false;
  }, 45000);
  form.submit();
  return true;
}

window.addEventListener("message", (event) => {
  const frame = $("#backend-frame");
  if (!pendingPost || event.source !== frame.contentWindow) return;
  const result = event.data;
  if (!result || result.nonce !== pendingPost.nonce) return;
  const request = pendingPost;
  pendingPost = null;
  window.clearTimeout(pendingPostTimeout);
  request.form.remove();
  if (request.action === "book") $(".dialog-close", bookingModal).disabled = false;
  if (result.type === "payment-ready") {
    pendingBookingId = result.bookingId || "";
    if (result.isPrepaid || totalPrice() === 0 || (result.checkoutUrl && result.checkoutUrl.includes("?booking="))) {
      checkBookingStatus(result.bookingId);
      return;
    }
    let checkout;
    try {
      checkout = new URL(result.checkoutUrl);
    } catch (error) {
      showToast("The payment provider returned an invalid checkout link.");
      return;
    }
    if (checkout.protocol !== "https:") {
      showToast("The payment provider returned an insecure checkout link.");
      return;
    }
    bookingCheckoutUrl = checkout.href;
    holdEndsAt = Date.parse(result.heldUntil);
    if (!Number.isFinite(holdEndsAt) || holdEndsAt <= Date.now()) {
      showToast("The seat hold expired before checkout was ready. Please start again.");
      closeBooking();
      return;
    }
    activeHeldClassId = selectedClass.id;
    bookingStep = 3;
    renderClasses();
    renderBooking();
    holdInterval = window.setInterval(updateTimer, 1000);
    loadSchedule();
  } else if (result.type === "request-saved") {
    const feedbackByAction = {
      rental: ["#rental-feedback", "Thanks. Your rental request was sent; the studio will confirm availability."],
      package: ["#package-feedback", "Thanks. Your package inquiry was sent. The studio will confirm current terms before payment."],
      "booking-change": ["#booking-change-feedback", "Thanks. Your request was sent. Your existing booking remains unchanged until the studio confirms."],
      waitlist: ["#waitlist-feedback", "Thanks! You are on the waitlist. We’ll contact you if a seat opens up."],
      contact: ["#contact-feedback", "Thanks. Your message was sent to the studio."]
    };
    const [feedbackSelector, confirmation] = feedbackByAction[request.action] || feedbackByAction.contact;
    $(feedbackSelector).textContent = confirmation;
    request.formElement.reset();
    if (request.action === "rental") $("#rental-form [name='date']").min = localKey(new Date());
    if (request.action === "rental") updateRentalGroupOptions();
    if (request.action === "booking-change") {
      updateBookingChangeFields();
      clearRescheduleOptions();
    }
  } else {
    showToast(result.message || "The request could not be completed. Please try again.");
  }
  if (request.action === "book" && request.formElement && result.type !== "payment-ready") {
    const button = $("button[type='submit']", request.formElement);
    if (button) button.disabled = false;
  }
  if (request.action !== "book") {
    rentalSubmitInProgress = false;
    if (request.formElement) {
      const button = $("button[type='submit']", request.formElement);
      if (button) button.disabled = false;
    }
  }
});

function seatsLeft(item) {
  if (isLiveMode && Number.isFinite(Number(item.seatsLeft))) return Math.max(0, Number(item.seatsLeft));
  return Math.max(0, item.capacity - (item.reserved || 0));
}

function getClassStart(item) {
  const [hours, minutes] = item.time.split(":").map(Number);
  return new Date(item.date.getFullYear(), item.date.getMonth(), item.date.getDate(), hours, minutes);
}

function getClassesCountForDate(key) {
  return classes.filter((item) => localKey(item.date) === key).length;
}

function buildDates() {
  const container = $("#date-tabs");
  if (!container) return;
  const todayKey = localKey(today);
  container.innerHTML = dateTabs.map((date) => {
    const key = localKey(date);
    const active = key === localKey(selectedDate);
    const isToday = key === todayKey;
    const count = getClassesCountForDate(key);
    const dayName = isToday ? "Today" : dayLabels[date.getDay()];
    const monthName = date.toLocaleDateString("en-US", { month: "short" });
    return `<button type="button" class="date-tab${active ? " active" : ""}${isToday ? " is-today" : ""}" role="tab" aria-selected="${active}" data-date="${key}">
      <span class="date-tab-day">${dayName}</span>
      <strong class="date-tab-num">${date.getDate()}</strong>
      <span class="date-tab-month">${monthName}</span>
      <span class="date-tab-count">${count > 0 ? `${count} class${count > 1 ? "es" : ""}` : "Open"}</span>
    </button>`;
  }).join("");
  renderMonthCalendar();
}

function renderMonthCalendar() {
  const container = $("#month-grid");
  const monthDisplay = $("#cal-month-display");
  if (!container) return;

  const monthDate = new Date(currentCalYear, currentCalMonth, 1);
  const monthFormatter = new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric" });
  if (monthDisplay) monthDisplay.textContent = monthFormatter.format(monthDate);

  const firstDayIndex = new Date(currentCalYear, currentCalMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentCalYear, currentCalMonth, 0).getDate();

  const todayKey = localKey(today);
  const selectedKey = localKey(selectedDate);

  let cells = [];

  // Trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevDate = new Date(currentCalYear, currentCalMonth - 1, d);
    const key = localKey(prevDate);
    const count = getClassesCountForDate(key);
    cells.push(`
      <button type="button" class="month-cell is-other-month ${key < todayKey ? "is-past" : ""} ${key === selectedKey ? "is-selected" : ""}" data-date="${key}">
        <span class="month-cell-num">${d}</span>
        ${count > 0 ? `<span class="month-cell-badge">${count}</span>` : ""}
      </button>
    `);
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const cellDate = new Date(currentCalYear, currentCalMonth, d);
    const key = localKey(cellDate);
    const count = getClassesCountForDate(key);
    const isToday = key === todayKey;
    const isSelected = key === selectedKey;
    const isPast = key < todayKey;

    cells.push(`
      <button type="button" class="month-cell ${isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""} ${isPast ? "is-past" : ""}" data-date="${key}" aria-label="${fullDate.format(cellDate)} · ${count} classes">
        <span class="month-cell-num">${d}</span>
        ${count > 0 ? `<span class="month-cell-classes">${count} ${count === 1 ? "class" : "classes"}</span>` : `<span class="month-cell-empty">Open</span>`}
      </button>
    `);
  }

  // Leading days for next month
  const totalCellsSoFar = cells.length;
  const remainingCells = (7 - (totalCellsSoFar % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(currentCalYear, currentCalMonth + 1, d);
    const key = localKey(nextDate);
    const count = getClassesCountForDate(key);
    cells.push(`
      <button type="button" class="month-cell is-other-month ${key === selectedKey ? "is-selected" : ""}" data-date="${key}">
        <span class="month-cell-num">${d}</span>
        ${count > 0 ? `<span class="month-cell-badge">${count}</span>` : ""}
      </button>
    `);
  }

  container.innerHTML = cells.join("");
}

function buildPills() {
  const categories = isLiveMode
    ? ["All classes", ...new Set(classes.map((item) => item.category || item.name))]
    : CATEGORIES;
  $("#filter-pills").innerHTML = categories.map((category) =>
    `<button type="button" class="filter-pill${selectedCategory === category ? " active" : ""}" aria-pressed="${selectedCategory === category}" data-category="${safeHTML(category)}">${safeHTML(category)}</button>`
  ).join("");
}

function clearRescheduleOptions() {
  const select = $("#desired-session");
  if (!select) return;
  select.innerHTML = `<option value="">Load times after entering your booking details</option>`;
  $("#reschedule-options-feedback").textContent = "";
}

async function loadRescheduleOptions() {
  const form = $("#booking-change-form");
  const bookingId = form.elements.bookingId;
  const email = form.elements.email;
  if (!bookingId.reportValidity() || !email.reportValidity()) return;
  const requestedBookingId = bookingId.value.trim();
  const requestedEmail = email.value.trim();
  const button = $("#load-reschedule-options");
  const feedback = $("#reschedule-options-feedback");
  button.disabled = true;
  feedback.textContent = "Checking your booking and available class times…";
  try {
    const result = await apiGet({ action: "reschedule_options", bookingId: requestedBookingId, email: requestedEmail });
    if (bookingId.value.trim() !== requestedBookingId || email.value.trim() !== requestedEmail) return;
    if (!result || !result.ok || !Array.isArray(result.sessions)) {
      throw new Error(result?.error || "Could not load matching class times.");
    }
    const options = result.sessions.map((session) => {
      const date = parseLocalDate(session.date);
      return `<option value="${safeHTML(session.id)}">${safeHTML(fullDate.format(date))} · ${safeHTML(timeLabel(session.time))} · ${session.seatsLeft} seats currently available</option>`;
    });
    $("#desired-session").innerHTML = `<option value="">${options.length ? "Choose a requested class time" : "No matching times currently available"}</option>${options.join("")}`;
    feedback.textContent = options.length
      ? "The studio must confirm the new time; this request does not hold a seat."
      : "No eligible future times are currently available. Contact the studio for help.";
  } catch (error) {
    console.error("Hingas reschedule options could not load.", error);
    clearRescheduleOptions();
    feedback.textContent = error.message || "Could not load class times. Check your booking details and try again.";
  } finally {
    button.disabled = false;
  }
}

function updateBookingChangeFields() {
  const reschedule = $("#booking-change-type").value === "reschedule";
  $("#reschedule-session-field").hidden = !reschedule;
  $("#desired-session").required = reschedule;
}

function matchesTimeFilter(timeStr, filter) {
  if (!filter || filter === "all") return true;
  const hour = Number(String(timeStr).split(":")[0]);
  if (filter === "morning") return hour < 12;
  if (filter === "afternoon") return hour >= 12 && hour < 17;
  if (filter === "evening") return hour >= 17;
  return true;
}

function openClassDetailModal(className) {
  const catalogItem = classesCatalog.find((c) => c.name.toLowerCase() === className.toLowerCase()) || { name: className, description: "", ageGroup: "", level: "", bring: "" };
  const photoUrl = classPhotoUrl(catalogItem);
  const futureSessions = classes.filter((s) => s.name.toLowerCase() === className.toLowerCase() && getClassStart(s) >= new Date() && seatsLeft(s) > 0).slice(0, 5);
  
  const sessionsHtml = futureSessions.length ? futureSessions.map((s) => `
    <div class="detail-session-row">
      <div><strong>${fullDate.format(s.date)}</strong> at <strong>${timeLabel(s.time)}</strong> (${s.duration} min) · ${seatsLeft(s)} spots left</div>
      <button type="button" class="button button-gold" data-book-detail="${safeHTML(s.id)}" style="min-height: 32px; padding: 0 12px; font-size: 8px;">Book ↗</button>
    </div>
  `).join("") : `<p style="font-size: 9px; color: var(--muted); margin: 6px 0;">No more upcoming sessions scheduled for this week. Please check back soon or join the waitlist.</p>`;

  $("#class-detail-modal-body").innerHTML = `
    <div class="detail-modal-hero">
      ${photoUrl ? `<img src="${safeHTML(photoUrl)}" alt="${safeHTML(catalogItem.name)}">` : ""}
    </div>
    <div class="detail-modal-header">
      <span class="booking-kicker">HINGAS CLASS SPOTLIGHT</span>
      <h2 id="detail-dialog-title">${safeHTML(catalogItem.name)}</h2>
    </div>
    <p class="detail-modal-desc">${safeHTML(catalogItem.description || "A dance and movement program designed to build strength, harmony, and rhythm in a fun and welcoming atmosphere.")}</p>
    <div class="detail-modal-meta">
      <div><span>Who it’s for</span><strong>${safeHTML(catalogItem.ageGroup || "All ages welcome")}</strong></div>
      <div><span>Level</span><strong>${safeHTML(catalogItem.level || "Beginner to Advanced")}</strong></div>
      <div><span>What to bring</span><strong>${safeHTML(catalogItem.bring || "Comfortable attire & water")}</strong></div>
    </div>
    <div class="detail-modal-sessions">
      <h4>Upcoming bookable times</h4>
      ${sessionsHtml}
    </div>
  `;
  classDetailModal.hidden = false;
  document.body.classList.add("modal-open");
  trackEvent("view_item", { item_name: className });
}

function closeClassDetailModal() {
  if (!classDetailModal) return;
  classDetailModal.hidden = true;
  if (bookingModal.hidden && waitlistModal.hidden) document.body.classList.remove("modal-open");
}

function renderClasses() {
  let dayClasses = classes.filter((item) => localKey(item.date) === localKey(selectedDate))
    .filter((item) => selectedCategory === "All classes" || (item.category || item.name) === selectedCategory)
    .filter((item) => matchesTimeFilter(item.time, selectedTimeFilter));

  if (classSearchQuery) {
    const q = classSearchQuery.toLowerCase();
    dayClasses = dayClasses.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      (item.coach && item.coach.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  }

  dayClasses.sort((a, b) => a.time.localeCompare(b.time));
  $("#selected-date-heading").textContent = fullDate.format(selectedDate);
  $("#feed-count").textContent = isScheduleLoading ? "Loading live schedule…" :
    `${dayClasses.length} ${dayClasses.length === 1 ? "class" : "classes"} on this day${isLiveMode ? "" : " · preview only"}`;
  $("#class-feed-list").hidden = !dayClasses.length;
  $("#no-classes").hidden = dayClasses.length > 0;
  $("#class-feed-list").innerHTML = dayClasses.map((item) => {
    const available = seatsLeft(item);
    const isHeld = activeHeldClassId === item.id;
    const hasPassed = getClassStart(item) < new Date();
    const hasPrice = Number.isFinite(Number(item.price)) && Number(item.price) > 0;
    const price = hasPrice ? item.price : 350;
    const isFull = available === 0;
    const buttonLabel = isHeld ? "Held" : hasPassed ? "Ended" : (isLiveMode && isFull) ? "Full" : "Book spot";
    const coach = item.coach || "";
    const description = item.description
      ? `<p class="class-description">${safeHTML(item.description)}</p>`
      : "";
    const bring = item.bring
      ? `<div class="class-meta">What to bring: ${safeHTML(item.bring)}</div>`
      : "";
    const photoUrl = classPhotoUrl(item);
    const photo = photoUrl
      ? `<img class="class-card-photo" src="${safeHTML(photoUrl)}" alt="${safeHTML(item.name)} class at Hingas Lifestyle Studio" loading="lazy">`
      : `<span class="class-card-photo-placeholder" aria-label="Class photo to be added">PHOTO<br>TO ADD</span>`;
    const details = `${safeHTML(item.level || "All Levels")} · ${safeHTML(item.group || "All Welcome")}`;
    
    let mainActionBtn = "";
    if (isLiveMode && isFull && !hasPassed) {
      mainActionBtn = `<button type="button" class="button button-waitlist" data-waitlist="${safeHTML(item.id)}">Join Waitlist <span>↗</span></button>`;
    } else {
      mainActionBtn = `<button type="button" class="button ${isHeld ? "held-button" : "button-gold"}" data-book="${safeHTML(item.id)}" ${hasPassed || (isLiveMode && isFull) || isHeld ? "disabled" : ""}>${buttonLabel} <span>↗</span></button>`;
    }

    let seatBadge = "";
    if (isFull && isLiveMode) {
      seatBadge = `<span class="seat-badge full"><span class="seat-dot"></span> Full</span>`;
    } else if (available <= 3 && isLiveMode) {
      seatBadge = `<span class="seat-badge urgent"><span class="seat-dot"></span> Only ${available} spots left!</span>`;
    } else {
      seatBadge = `<span class="seat-badge plenty"><span class="seat-dot"></span> ${available} spots available</span>`;
    }

    return `<article class="class-card" data-class-id="${safeHTML(item.id)}">
      <div class="class-card-time"><strong>${timeLabel(item.time)}</strong><span>${item.duration} min</span></div>
      <div class="class-card-main" data-detail-name="${safeHTML(item.name)}" style="cursor: pointer;" title="View class info">${photo}<div class="class-card-copy"><h3>${safeHTML(item.name)}</h3><div class="class-meta">${details}${coach ? `<br>with ${safeHTML(coach)}` : ""}</div>${description}${bring}</div></div>
      <span class="class-tag">${safeHTML(item.category || item.name)}</span>
      <div><div class="class-seats">${seatBadge}</div><div class="class-price">${php(price)}<small>per session</small></div></div>
      <div class="class-card-actions">
        ${mainActionBtn}
        <button type="button" class="class-share-btn" data-share="${safeHTML(item.id)}" title="Share this class" aria-label="Share this class">↗</button>
      </div>
    </article>`;
  }).join("");
  observeScrollReveals($("#class-feed-list"));
}

function updateNextClass() {
  renderHomeSessions();
  const now = new Date();
  let upcoming = classes.filter((item) => getClassStart(item) >= now && seatsLeft(item) > 0)
    .sort((a, b) => getClassStart(a) - getClassStart(b))[0];
  if (!upcoming && classes.length) {
    upcoming = classes.slice().sort((a, b) => getClassStart(a) - getClassStart(b))[0];
  }
  const labelEl = $("#next-class-label");
  const seatsEl = $("#next-class-seats");
  const bookLink = $(".hero-live-badge") || $(".quick-status>a");
  if (!upcoming) {
    if (labelEl) labelEl.textContent = "More classes coming soon";
    if (seatsEl) seatsEl.textContent = "See the full schedule";
    return;
  }
  const isToday = localKey(upcoming.date) === localKey(now);
  const dateText = isToday ? "Today" : dayLabels[upcoming.date.getDay()];
  const seats = seatsLeft(upcoming);
  const seatText = seats > 0 ? `${seats} spots available` : (isLiveMode ? "Full" : "Spots available");
  if (labelEl) labelEl.textContent = `${upcoming.name} · ${dateText} ${timeLabel(upcoming.time)}`;
  if (seatsEl) seatsEl.textContent = seatText;
  if (bookLink) {
    bookLink.href = "#schedule";
    bookLink.dataset.route = "schedule";
  }
}

function renderHomeSessions() {
  const container = $("#home-session-list");
  if (!container) return;
  const now = new Date();
  const todaySessions = classes.filter((item) => localKey(item.date) === localKey(now) && getClassStart(item) >= now)
    .sort((a, b) => getClassStart(a) - getClassStart(b));
  const upcoming = todaySessions.length
    ? todaySessions.slice(0, 3)
    : isLiveMode
      ? classes.filter((item) => getClassStart(item) >= now).sort((a, b) => getClassStart(a) - getClassStart(b)).slice(0, 3)
      : classes.slice().sort((a, b) => a.time.localeCompare(b.time)).slice(0, 3);
  const label = $("#home-sessions-label");
  if (!upcoming.length) {
    label.textContent = isLiveMode ? "NO UPCOMING SESSIONS" : "SAMPLE TIMES · PREVIEW ONLY";
    container.innerHTML = `<p class="home-sessions-empty">${isLiveMode ? "The studio has not added any upcoming sessions yet." : "Sample sessions appear after setup."}</p>`;
    return;
  }
  label.textContent = isLiveMode
    ? todaySessions.length ? "TODAY AT HINGAS · LIVE" : "NEXT SESSIONS · LIVE"
    : "SAMPLE TIMES · PREVIEW ONLY";
  container.innerHTML = upcoming.map((item) => {
    const liveSeats = seatsLeft(item);
    const seats = isLiveMode
      ? liveSeats ? `${liveSeats} ${liveSeats === 1 ? "seat" : "seats"} left` : "Full"
      : "Sample";
    const when = localKey(item.date) === localKey(now) ? "Today" : shortDate.format(item.date);
    return `<a class="home-session-row${isLiveMode && liveSeats === 0 ? " is-full" : ""}" href="#schedule" data-route="schedule" data-category="${safeHTML(item.name)}" data-session-id="${safeHTML(item.id)}">
      <time datetime="${localKey(item.date)}T${safeHTML(item.time)}">${timeLabel(item.time)}</time>
      <span><strong>${safeHTML(item.name)}</strong><small>${when}</small></span>
      <small class="home-session-seats">${seats}</small>
    </a>`;
  }).join("");
  observeScrollReveals(container);
}

function setView(name, options = {}) {
  const valid = ["home", "classes", "schedule", "gallery", "studio-rental", "contact"];
  const view = valid.includes(name) ? name : "home";
  document.title = PAGE_META[view][0];
  $('meta[name="description"]').content = PAGE_META[view][1];
  $$(".view").forEach((panel) => panel.classList.toggle("active", panel.dataset.view === view));
  $$(".site-nav a").forEach((link) => {
    const active = link.dataset.route === view && !link.dataset.anchor;
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  updateNavIndicator();
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  if (view === "schedule") {
    buildDates();
    buildPills();
    renderClasses();
    updateNextClass();
  }
  if (view === "classes") renderClassDetails();
  if (view === "gallery") renderMediaGallery();
  if (!options.keepScroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (options.anchor) {
      requestAnimationFrame(() => {
        const target = document.getElementById(options.anchor);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }
}

function navigateTo(view, anchor) {
  const route = anchor ? `#${anchor}` : `#${view}`;
  if (location.hash !== route) history.pushState({ view, anchor }, "", route);
  setView(view, { anchor });
}

document.addEventListener("click", (event) => {
  const anchor = event.target.closest("a[data-route]");
  if (!anchor) return;
  const view = anchor.dataset.route;
  if (!["home", "classes", "schedule", "gallery", "studio-rental", "contact"].includes(view)) return;
  event.preventDefault();
  const category = anchor.dataset.category || "";
  if (view === "schedule" && category) {
    selectedCategory = category;
    const requestedSession = classes.find((item) => item.id === anchor.dataset.sessionId);
    const nextSession = requestedSession || classes.filter((item) => (item.category || item.name) === category && getClassStart(item) >= new Date())
      .sort((a, b) => getClassStart(a) - getClassStart(b))[0];
    if (nextSession) selectedDate = new Date(nextSession.date);
  }
  const anchorTarget = anchor.dataset.anchor || (view === "classes" && category ? `class-${classSlug(category)}` : "");
  navigateTo(view, anchorTarget);
  if (view === "schedule" && category) {
    buildPills();
    renderClasses();
  }
});

window.addEventListener("popstate", () => {
  const route = location.hash.slice(1);
  const view = ["classes", "schedule", "gallery", "studio-rental", "contact"].includes(route) ? route : "home";
  setView(view, { anchor: route === "about" || route === "classes" ? route : "" });
});

function getAvailable(item) {
  return seatsLeft(item);
}

function openBooking(item) {
  if (!isLiveMode) {
    showToast("Online booking is not set up yet. Please contact the studio.");
    return;
  }
  if (getClassStart(item) < new Date()) {
    showToast("This class has already started. Please choose another session.");
    renderClasses();
    return;
  }
  const available = getAvailable(item);
  if (available < 1) {
    showToast("This class is full. Choose another class or date.");
    renderClasses();
    return;
  }
  selectedClass = item;
  bookingStep = 1;
  bookingQuantity = 1;
  activeHeldClassId = null;
  holdEndsAt = 0;
  bookingCheckoutUrl = "";
  pendingBookingId = "";
  appliedPromo = null;
  bookingDetails = null;
  previousFocus = document.activeElement;
  bookingModal.hidden = false;
  document.body.classList.add("modal-open");
  renderClasses();
  renderBooking();
  $(".dialog-close", bookingModal).focus();
  clearInterval(holdInterval);
  holdInterval = setInterval(updateTimer, 1000);
}

function closeBooking(releaseHold = true) {
  if (pendingPost && pendingPost.action === "book") {
    showToast("Please wait while secure checkout is prepared.");
    return;
  }
  bookingModal.hidden = true;
  document.body.classList.remove("modal-open");
  clearInterval(holdInterval);
  pendingBookingId = "";
  appliedPromo = null;
  if (releaseHold && activeHeldClassId) {
    activeHeldClassId = null;
    renderClasses();
    updateNextClass();
  }
  if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
}

function updateTimer() {
  const timer = $("#hold-countdown");
  if (!timer || !holdEndsAt) return;
  const remaining = Math.max(0, holdEndsAt - Date.now());
  timer.textContent = `${String(Math.floor(remaining / 60000)).padStart(2, "0")}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0")}`;
  if (remaining === 0) {
    clearInterval(holdInterval);
    activeHeldClassId = null;
    bookingCheckoutUrl = "";
    showToast("Your seat hold expired. Please choose a class again.");
    renderClasses();
    updateNextClass();
    window.setTimeout(() => closeBooking(), 1600);
  }
}

function summaryHTML() {
  const coachLine = selectedClass.coach ? ` · ${safeHTML(selectedClass.coach)}` : "";
  return `<div class="booking-class-summary"><div><h3>${safeHTML(selectedClass.name)}</h3><p>${safeHTML(fullDate.format(selectedClass.date))} · ${timeLabel(selectedClass.time)} · ${selectedClass.duration} min</p><p>${safeHTML(selectedClass.level)} · ${safeHTML(selectedClass.group)}${coachLine}</p></div><div class="summary-price">${php(selectedClass.price)}<small>per person</small></div></div>`;
}

function holdBanner() {
  const seats = seatsLeft(selectedClass);
  if (activeHeldClassId === selectedClass.id && holdEndsAt) {
    return `<div class="hold-banner"><span>${bookingQuantity} ${bookingQuantity === 1 ? "seat" : "seats"} held · <strong id="hold-countdown">15:00</strong></span><span>Complete payment before the hold expires.</span></div>`;
  }
  return `<div class="hold-banner"><span>${bookingQuantity} ${bookingQuantity === 1 ? "seat" : "seats"} selected</span><span>${seats} ${seats === 1 ? "seat" : "seats"} currently available. Hold starts when checkout opens.</span></div>`;
}

function updateProgress() {
  const labels = $$(".checkout-steps>span");
  labels.forEach((label, index) => {
    label.classList.toggle("current", index === bookingStep - 1);
    label.classList.toggle("completed", index < bookingStep - 1);
  });
  $("#checkout-progress-bar").style.width = `${bookingStep * 25}%`;
  $("#checkout-progress").hidden = bookingStep === 4;
}

function renderBooking() {
  updateProgress();
  if (bookingStep === 1) {
    const maxQuantity = Math.max(1, seatsLeft(selectedClass) + bookingQuantity);
    bookingContent.innerHTML = `<span class="booking-kicker">STEP 1 · PICK A CLASS</span><h2 id="booking-title">Save your <em>spot.</em></h2><p class="booking-intro">Select your seats. We’ll hold them for 15 minutes once secure checkout begins.</p>${summaryHTML()}${holdBanner()}<div class="seat-selector"><span>Number of seats</span><div class="seat-controls"><button type="button" data-quantity="-1" aria-label="Remove one seat" ${bookingQuantity <= 1 ? "disabled" : ""}>−</button><strong>${bookingQuantity}</strong><button type="button" data-quantity="1" aria-label="Add one seat" ${bookingQuantity >= maxQuantity ? "disabled" : ""}>+</button></div></div><div class="booking-actions"><button type="button" class="button button-outline" data-action="cancel">Cancel</button><button type="button" class="button button-gold" data-action="details">Enter your details <span>→</span></button></div>`;
    updateTimer();
  } else if (bookingStep === 2) {
    const baseTotal = selectedClass.price * bookingQuantity;
    const finalTotal = totalPrice();
    const discountAmount = Math.max(0, baseTotal - finalTotal);
    bookingContent.innerHTML = `<span class="booking-kicker">STEP 2 · YOUR DETAILS</span><h2 id="booking-title">Who’s coming <em>along?</em></h2><p class="booking-intro">We use your name, mobile and email only to manage this booking. HitPay handles payment details.</p>${summaryHTML()}${holdBanner()}<form class="booking-form" id="attendee-form" novalidate><label class="form-field"><span>Full name *</span><input name="name" autocomplete="name" required placeholder="Your full name" value="${safeHTML(bookingDetails?.name || "")}"></label><label class="form-field"><span>Mobile number *</span><input name="mobile" type="tel" autocomplete="tel" inputmode="numeric" pattern="09[0-9]{9}" required placeholder="09XX XXX XXXX" value="${safeHTML(bookingDetails?.mobile || "")}" title="Enter a Philippine mobile number beginning with 09 and containing 11 digits."></label><label class="form-field full-field"><span>Email address *</span><input name="email" type="email" autocomplete="email" required placeholder="you@example.com" value="${safeHTML(bookingDetails?.email || "")}"></label><div class="promo-code-wrap full-field"><label for="booking-promo-code">Promo Code or Prepaid Pass (optional)</label><div class="promo-code-field"><input id="booking-promo-code" placeholder="e.g. HINGASVIP or WELCOME10" maxlength="20" value="${appliedPromo ? safeHTML(appliedPromo.code) : ""}"><button type="button" class="button button-outline" id="apply-promo-btn">Apply</button></div><small class="promo-feedback ${appliedPromo ? "valid" : ""}" id="promo-feedback">${appliedPromo ? appliedPromo.message : ""}</small></div><div class="seat-selector full-field"><span>${bookingQuantity} ${bookingQuantity === 1 ? "seat" : "seats"} selected</span><div>${discountAmount > 0 ? `<s style="opacity: 0.6; margin-right: 6px;">${php(baseTotal)}</s>` : ""}<strong>${php(finalTotal)}</strong></div></div><div class="booking-actions full-field"><button type="button" class="button button-outline" data-action="back">Back</button><button type="submit" class="button button-gold">${finalTotal === 0 ? "Complete free booking <span>✓</span>" : "Continue to payment <span>→</span>"}</button></div></form>`;
    $("#attendee-form").addEventListener("submit", submitAttendee);
    updateTimer();
  } else if (bookingStep === 3) {
    const baseTotal = selectedClass.price * bookingQuantity;
    const finalTotal = totalPrice();
    const discountAmount = Math.max(0, baseTotal - finalTotal);
    bookingContent.innerHTML = `<span class="booking-kicker">STEP 3 · PAY ONLINE</span><h2 id="booking-title">Secure your <em>booking.</em></h2><p class="booking-intro">You’ll continue to HitPay’s secure checkout. Payment options depend on the studio account. No cash or card details are collected here.</p>${summaryHTML()}${holdBanner()}<div class="payment-badges" style="margin: 12px 0 16px;"><span class="pay-badge gcash">GCash</span><span class="pay-badge maya">Maya</span><span class="pay-badge qrph">QR Ph</span><span class="pay-badge cards">Credit / Debit Cards</span><span class="pay-badge banks">Online Banking</span></div><div class="promo-code-wrap"><label for="booking-promo-code">Promo Code or Prepaid Pass</label><div class="promo-code-field"><input id="booking-promo-code" placeholder="e.g. HINGASVIP or WELCOME10" maxlength="20" value="${appliedPromo ? safeHTML(appliedPromo.code) : ''}"><button type="button" class="button button-outline" id="apply-promo-btn">Apply</button></div><small class="promo-feedback ${appliedPromo ? 'valid' : ''}" id="promo-feedback">${appliedPromo ? appliedPromo.message : ''}</small></div><div class="fee-breakdown"><div class="fee-row"><span>${bookingQuantity} × class pass</span><span>${php(baseTotal)}</span></div>${discountAmount > 0 ? `<div class="fee-row" style="color: #15803d; font-weight: bold;"><span>Discount (${appliedPromo.code})</span><span>−${php(discountAmount)}</span></div>` : ''}<div class="fee-row total"><span>Total payable</span><span>${php(finalTotal)}</span></div></div><p class="form-fineprint">Cancellation and refund policy: please contact the studio to confirm the current terms.</p><div class="booking-actions"><button type="button" class="button button-gold" data-action="payment">${finalTotal === 0 ? "Complete free booking <span>✓</span>" : "Continue to secure payment <span>→</span>"}</button></div>`;
    updateTimer();
  } else {
    renderConfirmation();
  }
}

function totalPrice() {
  const base = selectedClass.price * bookingQuantity;
  if (!appliedPromo) return base;
  return Math.max(0, Math.round(base * (1 - appliedPromo.discount) * 100) / 100);
}

function submitAttendee(event) {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  if (holdEndsAt && Date.now() >= holdEndsAt) {
    showToast("Your seat hold expired. Please choose a class again.");
    closeBooking();
    return;
  }
  const details = Object.fromEntries(new FormData(event.currentTarget).entries());
  if (!/^09\d{9}$/.test(details.mobile)) {
    showToast("Enter an 11-digit Philippine mobile number beginning with 09.");
    return;
  }
  bookingDetails = details;
  trackEvent("begin_checkout", { item_name: selectedClass.name, quantity: bookingQuantity, value: totalPrice() });

  if (!API_URL) {
    const bookingId = "HG-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const finalAmount = totalPrice();
    const dateStr = selectedClass.date instanceof Date ? localKey(selectedClass.date) : localKey(selectedDate);
    const mockBooking = {
      reference: bookingId,
      className: selectedClass.name,
      classDate: dateStr,
      classTime: selectedClass.time,
      quantity: bookingQuantity,
      amount: finalAmount,
      name: bookingDetails.name,
      email: bookingDetails.email,
      mobile: bookingDetails.mobile
    };
    bookingDetails = { booking: mockBooking };
    activeHeldClassId = selectedClass.id;
    bookingStep = 4;
    renderBooking();
    showToast("Booking preview confirmed! Your Hingas Studio pass is ready.");
    return;
  }

  const submitButton = $("button[type='submit']", event.currentTarget);
  submitButton.disabled = true;
  $(".dialog-close", bookingModal).disabled = true;
  const submitted = postToBackend("book", {
    sessionId: selectedClass.id,
    seats: bookingQuantity,
    name: bookingDetails.name.trim(),
    mobile: bookingDetails.mobile.trim(),
    email: bookingDetails.email.trim(),
    promoCode: appliedPromo ? appliedPromo.code : ""
  }, event.currentTarget);
  if (!submitted) submitButton.disabled = false;
}

let bookingDetails = null;

function submitPayment(event) {
  event.preventDefault();
  if (totalPrice() === 0 && pendingBookingId) {
    checkBookingStatus(pendingBookingId);
    return;
  }
  if (!bookingCheckoutUrl || !holdEndsAt || Date.now() >= holdEndsAt) {
    showToast("Your seat hold expired. Please choose a class again.");
    closeBooking();
    return;
  }
  window.location.assign(bookingCheckoutUrl);
}

function getSavedBookings() {
  try {
    const raw = localStorage.getItem("hingas_saved_bookings");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveBookingToStorage(booking) {
  try {
    if (!booking || !booking.reference) return;
    const list = getSavedBookings().filter((item) => item.reference !== booking.reference);
    list.unshift({
      reference: booking.reference,
      className: booking.className,
      classDate: booking.classDate,
      classTime: booking.classTime,
      quantity: booking.quantity,
      amount: booking.amount,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem("hingas_saved_bookings", JSON.stringify(list.slice(0, 6)));
  } catch (e) {
    console.warn("Could not save booking to localStorage", e);
  }
}

function renderMyBookings() {
  const container = $("#my-bookings-list");
  if (!container) return;
  const bookings = getSavedBookings();
  if (!bookings.length) {
    container.innerHTML = `<span class="my-booking-empty">No recent bookings saved on this device.</span>`;
    return;
  }
  container.innerHTML = bookings.map((b) => {
    const d = parseLocalDate(b.classDate);
    return `<div class="my-booking-card">
      <span class="booking-ref">${safeHTML(b.reference)}</span>
      <strong>${safeHTML(b.className)}</strong>
      <span class="booking-meta">${safeHTML(shortDate.format(d))} · ${timeLabel(b.classTime)} · ${b.quantity} seat(s)</span>
      <a class="text-link" href="${googleCalendarUrl(b)}" target="_blank" rel="noopener noreferrer" style="font-size: 8px; margin-top: 3px; font-weight: 700; color: var(--ocean-mid);">Add to Google Cal ↗</a>
    </div>`;
  }).join("");
}

async function lookupBookingCode(code) {
  const input = $("#lookup-booking-id");
  const feedback = $("#lookup-feedback");
  const ref = String(code || input?.value || "").trim().toUpperCase();
  if (!/^HG-[A-F0-9]{12}$/.test(ref)) {
    if (feedback) feedback.textContent = "Please enter a valid code like HG-XXXXXXXXXXXX.";
    return;
  }
  if (feedback) feedback.textContent = "Checking booking status…";
  try {
    const result = await apiGet({ action: "booking", bookingId: ref });
    if (!result || !result.ok) {
      if (feedback) feedback.textContent = result?.error || "Booking not found. Please check your reference.";
      return;
    }
    if (result.booking) {
      saveBookingToStorage(result.booking);
      renderMyBookings();
      if (feedback) feedback.textContent = `Verified! Status: ${result.status.toUpperCase()}`;
      bookingDetails = { booking: result.booking };
      bookingStep = 4;
      previousFocus = document.activeElement;
      bookingModal.hidden = false;
      document.body.classList.add("modal-open");
      renderBooking();
      $(".dialog-close", bookingModal).focus();
    } else {
      if (feedback) feedback.textContent = `Booking found · Status: ${result.status.toUpperCase()}`;
      showToast(`Booking ${ref} status: ${result.status}`);
    }
  } catch (err) {
    if (feedback) feedback.textContent = "Could not reach the studio service. Please try again.";
  }
}

function openWaitlist(item) {
  if (!waitlistModal || !item) return;
  $("#waitlist-session-id").value = item.id;
  $("#waitlist-class-name").value = item.name;
  $("#waitlist-class-date").value = localKey(item.date);
  $("#waitlist-class-time").value = item.time;
  $("#waitlist-session-info").textContent = `Waitlist for ${item.name} on ${fullDate.format(item.date)} at ${timeLabel(item.time)}. We'll notify you if a seat opens up.`;
  $("#waitlist-feedback").textContent = "";
  waitlistModal.hidden = false;
  document.body.classList.add("modal-open");
  $('[name="name"]', waitlistForm)?.focus();
}

function closeWaitlist() {
  if (!waitlistModal) return;
  waitlistModal.hidden = true;
  if (bookingModal.hidden) document.body.classList.remove("modal-open");
}

function shareClass(itemId) {
  const item = classes.find((c) => c.id === itemId);
  if (!item) return;
  const url = new URL(window.location.href);
  url.hash = "schedule";
  url.searchParams.set("category", item.name);
  url.searchParams.set("date", localKey(item.date));
  const shareData = {
    title: `Join ${item.name} at Hingas Lifestyle Studio`,
    text: `Let's join ${item.name} on ${shortDate.format(item.date)} at ${timeLabel(item.time)} at Hingas!`,
    url: url.href
  };
  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    navigator.clipboard.writeText(url.href).then(() => {
      showToast("Class link copied to clipboard!");
    }).catch(() => {
      showToast(`Link: ${url.href}`);
    });
  }
}

function googleCalendarUrl(booking) {
  const date = parseLocalDate(booking.classDate);
  const [hours, minutes] = booking.classTime.split(":").map(Number);
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
  const end = new Date(start.getTime() + Number(booking.duration || 60) * 60000);
  const stamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const text = encodeURIComponent(`Hingas · ${booking.className}`);
  const details = encodeURIComponent(`${booking.quantity} seat(s) · Booking Ref: ${booking.reference}\n\nHingas Lifestyle Studio\n2nd Floor, Yamaha Eduhome, Km. 4, Brgy. Luna, Surigao City 8400`);
  const location = encodeURIComponent("Hingas Lifestyle Studio, 2nd Floor, Yamaha Eduhome, Km. 4, Brgy. Luna, Surigao City 8400");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${stamp(start)}/${stamp(end)}&details=${details}&location=${location}`;
}

function calendarData(booking) {
  const date = parseLocalDate(booking.classDate);
  const [hours, minutes] = booking.classTime.split(":").map(Number);
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
  const end = new Date(start.getTime() + Number(booking.duration || 60) * 60000);
  const stamp = (value) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escapeIcs = (value) => String(value).replace(/[\\,;]/g, "\\$&").replace(/\n/g, "\\n");
  const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hingas Lifestyle Studio//Surigao//EN", "BEGIN:VEVENT", `UID:${booking.reference}@hingas.ph`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${escapeIcs(`Hingas · ${booking.className}`)}`, `DESCRIPTION:${escapeIcs(`${booking.quantity} seat(s) · Ref ${booking.reference}`)}`, "LOCATION:2nd Floor, Yamaha Eduhome, Km. 4, Brgy. Luna, Surigao City 8400", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(content)}`;
}

function renderConfirmation() {
  const booking = bookingDetails.booking;
  saveBookingToStorage(booking);
  renderMyBookings();
  trackEvent("purchase", { transaction_id: booking.reference, value: booking.amount, currency: "PHP", item_name: booking.className });
  const date = parseLocalDate(booking.classDate);
  const qrSvg = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="90" height="90"><rect width="100" height="100" fill="#ffffff"/><rect x="8" y="8" width="28" height="28" fill="#0279bb"/><rect x="13" y="13" width="18" height="18" fill="#ffffff"/><rect x="17" y="17" width="10" height="10" fill="#0279bb"/><rect x="64" y="8" width="28" height="28" fill="#0279bb"/><rect x="69" y="13" width="18" height="18" fill="#ffffff"/><rect x="73" y="17" width="10" height="10" fill="#0279bb"/><rect x="8" y="64" width="28" height="28" fill="#0279bb"/><rect x="13" y="69" width="18" height="18" fill="#ffffff"/><rect x="17" y="73" width="10" height="10" fill="#0279bb"/><rect x="44" y="8" width="8" height="8" fill="#263a5b"/><rect x="54" y="16" width="8" height="8" fill="#263a5b"/><rect x="44" y="24" width="8" height="8" fill="#263a5b"/><rect x="42" y="42" width="16" height="16" fill="#c3cd2e"/><rect x="64" y="42" width="8" height="8" fill="#263a5b"/><rect x="74" y="50" width="8" height="8" fill="#263a5b"/><rect x="84" y="58" width="8" height="8" fill="#263a5b"/><rect x="44" y="64" width="8" height="8" fill="#263a5b"/><rect x="54" y="72" width="8" height="8" fill="#263a5b"/><rect x="64" y="80" width="18" height="8" fill="#263a5b"/></svg>`;
  bookingContent.innerHTML = `<div class="confirmation-screen"><div class="success-mark" aria-hidden="true">✓</div><span class="booking-kicker">STEP 4 · PAYMENT CONFIRMED</span><h2 id="booking-title">You’re <em>booked!</em></h2><p class="booking-intro">Your payment has been verified. We can’t wait to see you at the studio.</p><div class="ticket-qr-wrap"><span class="ticket-badge-title">Verified Hingas Studio Pass</span><div class="ticket-qr-code">${qrSvg}</div><div class="ticket-ref-stamp">${safeHTML(booking.reference)}</div><div class="ticket-note">Present this code or confirmation email to the studio desk upon arrival.</div></div><div class="confirmation-details"><div><span>Booking reference</span><strong>${safeHTML(booking.reference)}</strong></div><div><span>Class</span><strong>${safeHTML(booking.className)}</strong></div><div><span>When</span><strong>${safeHTML(fullDate.format(date))} · ${timeLabel(booking.classTime)}</strong></div><div><span>Seats</span><strong>${booking.quantity}</strong></div><div><span>Total paid</span><strong>${php(booking.amount)}</strong></div></div><div class="email-notice">A confirmation email with studio directions has been sent to the address used at checkout.</div><div class="confirmation-buttons"><a class="button button-gcal" href="${googleCalendarUrl(booking)}" target="_blank" rel="noopener noreferrer">Google Calendar <span>↗</span></a><a class="button button-outline" href="${calendarData(booking)}" download="hingas-class.ics">Apple / Outlook .ics <span>↓</span></a><button type="button" class="button button-outline" onclick="window.print()">Print Voucher <span>⎙</span></button><button type="button" class="button button-gold" data-action="finish">Done <span>✓</span></button></div><a class="confirmation-chat" href="https://m.me/hingas" target="_blank" rel="noopener noreferrer">Message the studio on Messenger ↗</a></div>`;
}

function observeScrollReveals(root = document) {
  if (!revealObserver) return;
  const selector = ".section-heading,.program-card,.class-card,.about-image,.value-grid article,.coach-placeholder-grid article,.quote-grid blockquote,.schedule-teaser>div,.featured-media,.reel-card,.gallery-photo,.class-detail-card";
  const targets = [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
  targets.forEach((element, index) => {
    if (element.dataset.revealObserved) return;
    element.dataset.revealObserved = "true";
    element.classList.add("reveal-on-scroll");
    element.style.setProperty("--reveal-delay", `${Math.min(index, 7) * 0.06}s`);
    revealObserver.observe(element);
  });
}

function setupScrollMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  lineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting));
  }, { threshold: 0.2 });
  document.querySelectorAll(".follow-line").forEach((line) => lineObserver.observe(line));
  observeScrollReveals();
  document.documentElement.classList.add("motion-ready");
}

let updateNavIndicator = () => {};

function initNavMotion() {
  const navEl = $("#site-nav");
  if (!navEl) return;
  const indicator = navEl.querySelector(".nav-indicator");
  const links = navEl.querySelectorAll("a");
  const header = $(".site-header");

  function moveTo(el, immediate = false) {
    if (!indicator) return;
    if (!el || window.innerWidth <= 820) {
      indicator.style.opacity = "0";
      return;
    }
    const navRect = navEl.getBoundingClientRect();
    const linkRect = el.getBoundingClientRect();
    if (immediate) {
      indicator.style.transition = "none";
    } else {
      indicator.style.transition = "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), width 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease";
    }
    indicator.style.opacity = "1";
    indicator.style.transform = `translateX(${Math.round(linkRect.left - navRect.left)}px)`;
    indicator.style.width = `${Math.round(linkRect.width)}px`;
    indicator.style.height = `${Math.round(linkRect.height)}px`;
    if (immediate) {
      requestAnimationFrame(() => {
        indicator.style.transition = "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), width 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease";
      });
    }
  }

  updateNavIndicator = function (immediate = false) {
    const active = navEl.querySelector('a[aria-current="page"]');
    if (active) moveTo(active, immediate);
    else if (indicator) indicator.style.opacity = "0";
  };

  links.forEach((link) => {
    link.addEventListener("mouseenter", () => moveTo(link));
    link.addEventListener("focus", () => moveTo(link));
  });

  navEl.addEventListener("mouseleave", () => updateNavIndicator());
  window.addEventListener("resize", () => updateNavIndicator(true));

  if (header) {
    const onScroll = () => {
      const isScrolled = window.scrollY > 15;
      header.classList.toggle("is-scrolled", isScrolled);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  requestAnimationFrame(() => updateNavIndicator(true));
}

function initHeroSpotlight() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty("--hero-mouse-x", `${e.clientX - rect.left}px`);
    hero.style.setProperty("--hero-mouse-y", `${e.clientY - rect.top}px`);
  }, { passive: true });
}

function initialize() {
  initTheme();
  initTypewriter();
  initHeroSpotlight();
  $("#copyright-year").textContent = String(new Date().getFullYear());
  const searchParams = new URLSearchParams(location.search);
  const deepCategory = searchParams.get("category");
  const deepDate = searchParams.get("date");
  if (deepCategory) selectedCategory = deepCategory;
  if (deepDate) {
    const parsed = parseLocalDate(deepDate);
    if (!isNaN(parsed.getTime())) selectedDate = parsed;
  }
  buildDates();
  buildPills();
  renderClasses();
  renderClassDetails();
  renderMediaGallery();
  renderMyBookings();
  updateNextClass();
  const dateInput = $('#rental-form [name="date"]');
  dateInput.min = localKey(today);
  const firstView = location.hash.slice(1);
  if (["classes", "schedule", "gallery", "studio-rental", "contact"].includes(firstView)) setView(firstView);
  else setView("home", { anchor: firstView === "about" || firstView === "classes" ? firstView : "" });
  setupScrollMotion();
  initNavMotion();
  if (API_URL) {
    loadSchedule();
    loadClasses();
    loadMedia();
    window.setInterval(() => {
      loadSchedule();
      loadClasses();
      loadMedia();
    }, 60000);
  }
  const bookingId = new URLSearchParams(location.search).get("booking");
  if (bookingId) checkBookingStatus(bookingId);
}

async function checkBookingStatus(bookingId, attempts = 0) {
  try {
    const result = await apiGet({ action: "booking", bookingId });
    if (result.ok && result.status === "paid" && result.booking) {
      bookingDetails = { booking: result.booking };
      bookingStep = 4;
      previousFocus = document.activeElement;
      bookingModal.hidden = false;
      document.body.classList.add("modal-open");
      renderBooking();
      $(".dialog-close", bookingModal).focus();
      history.replaceState(history.state, "", location.pathname + location.hash);
      loadSchedule();
      return;
    }
    if (result.ok && result.status === "held" && attempts < 8) {
      window.setTimeout(() => checkBookingStatus(bookingId, attempts + 1), 2500);
      return;
    }
    showToast(result.status === "expired" || result.status === "cancelled"
      ? "This payment session expired. Please start a new booking."
      : "Payment is not confirmed yet. We’ll confirm your booking after the provider verifies it.");
  } catch (error) {
    console.error("Could not verify the returned booking status.", error);
    showToast("We could not verify payment yet. Please contact the studio with your booking reference.");
  }
}

$("#date-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-date]");
  if (!tab) return;
  selectedDate = parseLocalDate(tab.dataset.date);
  buildDates();
  renderClasses();
});

$("#filter-pills").addEventListener("click", (event) => {
  const pill = event.target.closest("[data-category]");
  if (!pill) return;
  selectedCategory = pill.dataset.category;
  buildPills();
  renderClasses();
});

$("#class-feed-list").addEventListener("click", (event) => {
  const book = event.target.closest("[data-book]");
  if (book) {
    const item = classes.find((entry) => entry.id === book.dataset.book);
    if (item) openBooking(item);
    return;
  }
  const waitlist = event.target.closest("[data-waitlist]");
  if (waitlist) {
    const item = classes.find((entry) => entry.id === waitlist.dataset.waitlist);
    if (item) openWaitlist(item);
    return;
  }
  const share = event.target.closest("[data-share]");
  if (share) {
    shareClass(share.dataset.share);
    return;
  }
  const detailTrigger = event.target.closest("[data-detail-name]");
  if (detailTrigger && !event.target.closest("button") && !event.target.closest("a")) {
    openClassDetailModal(detailTrigger.dataset.detailName);
    return;
  }
});

const searchInput = $("#class-search-input");
const searchClear = $("#class-search-clear");
searchInput?.addEventListener("input", (e) => {
  classSearchQuery = e.target.value.trim();
  if (searchClear) searchClear.hidden = !classSearchQuery;
  renderClasses();
});
searchClear?.addEventListener("click", () => {
  if (searchInput) searchInput.value = "";
  classSearchQuery = "";
  searchClear.hidden = true;
  renderClasses();
  searchInput?.focus();
});

$("#theme-toggle")?.addEventListener("click", toggleTheme);

classDetailModal?.addEventListener("click", (event) => {
  if (event.target === classDetailModal || event.target.closest("[data-close='class-detail']")) {
    closeClassDetailModal();
    return;
  }
  const bookBtn = event.target.closest("[data-book-detail]");
  if (bookBtn) {
    const item = classes.find((c) => c.id === bookBtn.dataset.bookDetail);
    if (item) {
      closeClassDetailModal();
      openBooking(item);
    }
  }
});

$("#time-chips")?.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-time-filter]");
  if (!chip) return;
  selectedTimeFilter = chip.dataset.timeFilter;
  $$(".time-chip", $("#time-chips")).forEach((el) => el.classList.toggle("active", el === chip));
  renderClasses();
});

$("#lookup-booking-btn")?.addEventListener("click", () => lookupBookingCode());
$("#lookup-booking-id")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    lookupBookingCode();
  }
});

$("#clear-class-filters").addEventListener("click", () => {
  selectedCategory = "All classes";
  buildPills();
  renderClasses();
});

$("#today-button")?.addEventListener("click", () => {
  selectedDate = new Date(today);
  currentCalYear = today.getFullYear();
  currentCalMonth = today.getMonth();
  selectedCategory = "All classes";
  buildDates();
  buildPills();
  renderClasses();
});

$("#btn-view-strip")?.addEventListener("click", () => {
  scheduleViewMode = "strip";
  $("#btn-view-strip")?.classList.add("active");
  $("#btn-view-strip")?.setAttribute("aria-selected", "true");
  $("#btn-view-month")?.classList.remove("active");
  $("#btn-view-month")?.setAttribute("aria-selected", "false");
  if ($("#strip-view-container")) $("#strip-view-container").hidden = false;
  if ($("#full-month-view")) $("#full-month-view").hidden = true;
});

$("#btn-view-month")?.addEventListener("click", () => {
  scheduleViewMode = "month";
  $("#btn-view-month")?.classList.add("active");
  $("#btn-view-month")?.setAttribute("aria-selected", "true");
  $("#btn-view-strip")?.classList.remove("active");
  $("#btn-view-strip")?.setAttribute("aria-selected", "false");
  if ($("#strip-view-container")) $("#strip-view-container").hidden = true;
  if ($("#full-month-view")) $("#full-month-view").hidden = false;
  renderMonthCalendar();
});

$("#cal-prev-month")?.addEventListener("click", () => {
  currentCalMonth--;
  if (currentCalMonth < 0) {
    currentCalMonth = 11;
    currentCalYear--;
  }
  renderMonthCalendar();
});

$("#cal-next-month")?.addEventListener("click", () => {
  currentCalMonth++;
  if (currentCalMonth > 11) {
    currentCalMonth = 0;
    currentCalYear++;
  }
  renderMonthCalendar();
});

$("#scroll-strip-left")?.addEventListener("click", () => {
  $("#date-tabs")?.scrollBy({ left: -260, behavior: "smooth" });
});

$("#scroll-strip-right")?.addEventListener("click", () => {
  $("#date-tabs")?.scrollBy({ left: 260, behavior: "smooth" });
});

$("#month-grid")?.addEventListener("click", (event) => {
  const cell = event.target.closest(".month-cell");
  if (!cell || !cell.dataset.date) return;
  selectedDate = parseLocalDate(cell.dataset.date);
  buildDates();
  renderClasses();
  $$(".month-cell", $("#month-grid")).forEach((c) => c.classList.toggle("is-selected", c.dataset.date === cell.dataset.date));
  $("#selected-date-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-media-index]");
  if (trigger) {
    openMediaViewer(trigger.dataset.mediaIndex, trigger.dataset.mediaKind || "video");
    return;
  }
  if (event.target.closest("[data-close-media]")) closeMediaViewer();
});

mediaViewer.addEventListener("click", (event) => {
  if (event.target === mediaViewer) closeMediaViewer();
});

$("#booking-content").addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  const quantityChange = Number(event.target.closest("[data-quantity]")?.dataset.quantity || 0);
  if (quantityChange) {
    const allowed = Math.max(1, seatsLeft(selectedClass) + bookingQuantity);
    bookingQuantity = Math.max(1, Math.min(allowed, bookingQuantity + quantityChange));
    renderClasses();
    renderBooking();
    return;
  }
  if (action === "cancel") closeBooking();
  if (action === "details") {
    if (holdEndsAt && Date.now() >= holdEndsAt) {
      showToast("Your seat hold expired. Please choose a class again.");
      closeBooking();
      return;
    }
    bookingStep = 2;
    renderBooking();
    $('[name="name"]', bookingContent).focus();
  }
  if (action === "back") {
    bookingStep -= 1;
    renderBooking();
  }
  if (event.target.id === "apply-promo-btn") {
    const input = $("#booking-promo-code");
    const code = String(input ? input.value : "").trim().toUpperCase();
    if (bookingStep === 2) {
      const form = $("#attendee-form");
      if (form) {
        const data = Object.fromEntries(new FormData(form).entries());
        bookingDetails = { ...bookingDetails, ...data };
      }
    }
    if (!code) {
      appliedPromo = null;
      renderBooking();
      return;
    }
    if (code === "HINGASVIP" || code === "FIRSTFREE") {
      appliedPromo = { code, discount: 1.0, message: "100% Pass discount applied!" };
      showToast("100% Pass discount applied!");
    } else if (code === "WELCOME10" || code === "HINGAS10") {
      appliedPromo = { code, discount: 0.10, message: "10% Welcome discount applied!" };
      showToast("10% discount applied!");
    } else {
      appliedPromo = null;
      showToast("Invalid promo or pass code.");
    }
    renderBooking();
    return;
  }
  if (action === "payment") submitPayment(event);
  if (action === "finish") {
    closeBooking();
    navigateTo("schedule");
    showToast("You’re booked! See you at the studio.");
  }
});

$$("#booking-modal [data-close]").forEach((button) => button.addEventListener("click", closeBooking));

bookingModal.addEventListener("click", (event) => {
  if (event.target === bookingModal) closeBooking();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!mediaViewer.hidden) closeMediaViewer();
    else if (classDetailModal && !classDetailModal.hidden) closeClassDetailModal();
    else if (waitlistModal && !waitlistModal.hidden) closeWaitlist();
    else if (!bookingModal.hidden) closeBooking();
  }
  const activeModal = !mediaViewer.hidden ? mediaViewer : (classDetailModal && !classDetailModal.hidden) ? classDetailModal : (waitlistModal && !waitlistModal.hidden) ? waitlistModal : !bookingModal.hidden ? bookingModal : null;
  if (event.key !== "Tab" || !activeModal) return;
  const focusable = $$('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]', activeModal);
  if (!focusable.length) return;
  if (event.shiftKey && document.activeElement === focusable[0]) {
    event.preventDefault();
    focusable.at(-1).focus();
  } else if (!event.shiftKey && document.activeElement === focusable.at(-1)) {
    event.preventDefault();
    focusable[0].focus();
  }
});

menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

const rentalForm = $("#rental-form");
const rentalRoomSelect = rentalForm.elements.roomChoice;
const rentalGroupSizeSelect = rentalForm.elements.groupSize;

function updateRentalGroupOptions() {
  const capacity = Number(rentalRoomSelect.selectedOptions[0]?.dataset.capacity || 30);
  Array.from(rentalGroupSizeSelect.options).forEach((option) => {
    if (!option.dataset.maximum) return;
    option.disabled = Number(option.dataset.minimum) > capacity;
  });
  if (rentalGroupSizeSelect.selectedOptions[0]?.disabled) rentalGroupSizeSelect.value = "";
}

rentalRoomSelect.addEventListener("change", updateRentalGroupOptions);
updateRentalGroupOptions();

const bookingChangeType = $("#booking-change-type");
bookingChangeType.addEventListener("change", () => {
  updateBookingChangeFields();
  clearRescheduleOptions();
});
$$("#booking-change-form [name='bookingId'], #booking-change-form [name='email']").forEach((input) => {
  input.addEventListener("input", clearRescheduleOptions);
});
$("#load-reschedule-options").addEventListener("click", loadRescheduleOptions);
updateBookingChangeFields();

rentalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (rentalSubmitInProgress || !form.reportValidity()) return;
  const startTime = form.elements.startTime.value;
  const endTime = form.elements.endTime.value;
  if (endTime <= startTime) {
    form.elements.endTime.setCustomValidity("Choose an end time after the start time.");
    form.elements.endTime.reportValidity();
    form.elements.endTime.addEventListener("input", () => form.elements.endTime.setCustomValidity(""), { once: true });
    return;
  }
  rentalSubmitInProgress = true;
  const button = $("button[type='submit']", form);
  button.disabled = true;
  $("#rental-feedback").textContent = "";
  const formData = Object.fromEntries(new FormData(form).entries());
  const posted = postToBackend("rental", formData, form);
  if (!posted) {
    rentalSubmitInProgress = false;
    button.disabled = false;
  }
});

$("#package-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (rentalSubmitInProgress || !form.reportValidity()) return;
  rentalSubmitInProgress = true;
  $("button[type='submit']", form).disabled = true;
  $("#package-feedback").textContent = "";
  const posted = postToBackend("package", Object.fromEntries(new FormData(form).entries()), form);
  if (!posted) {
    rentalSubmitInProgress = false;
    $("button[type='submit']", form).disabled = false;
  }
});

$("#booking-change-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (rentalSubmitInProgress || !form.reportValidity()) return;
  rentalSubmitInProgress = true;
  $("button[type='submit']", form).disabled = true;
  $("#booking-change-feedback").textContent = "";
  const posted = postToBackend("booking-change", Object.fromEntries(new FormData(form).entries()), form);
  if (!posted) {
    rentalSubmitInProgress = false;
    $("button[type='submit']", form).disabled = false;
  }
});

$("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (rentalSubmitInProgress || !form.reportValidity()) return;
  rentalSubmitInProgress = true;
  $("button[type='submit']", form).disabled = true;
  $("#contact-feedback").textContent = "";
  const posted = postToBackend("contact", Object.fromEntries(new FormData(form).entries()), form);
  if (!posted) {
    rentalSubmitInProgress = false;
    $("button[type='submit']", form).disabled = false;
  }
});

$$("#waitlist-modal [data-close]").forEach((button) => button.addEventListener("click", closeWaitlist));

waitlistModal?.addEventListener("click", (event) => {
  if (event.target === waitlistModal) closeWaitlist();
});

waitlistForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (rentalSubmitInProgress || !form.reportValidity()) return;
  rentalSubmitInProgress = true;
  $("button[type='submit']", form).disabled = true;
  $("#waitlist-feedback").textContent = "";
  const posted = postToBackend("waitlist", Object.fromEntries(new FormData(form).entries()), form);
  if (!posted) {
    rentalSubmitInProgress = false;
    $("button[type='submit']", form).disabled = false;
  }
});

initialize();
