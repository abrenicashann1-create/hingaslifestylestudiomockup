/**
 * Hingas Lifestyle Studio — Dedicated Booking Portal Logic
 */

(function () {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const API_URL = (window.HINGAS_CONFIG && window.HINGAS_CONFIG.appsScriptUrl) || "";
  const isLiveMode = Boolean(API_URL);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let selectedDate = new Date(today);
  let calendarMonthCursor = new Date(today.getFullYear(), today.getMonth(), 1);
  let activeCalendarView = "strip"; // "strip" or "month"
  let selectedCategory = "All classes";
  let classSearchQuery = "";

  let selectedClass = null;
  let bookingStep = 1;
  let bookingQuantity = 1;
  let appliedPromo = null;
  let holdEndsAt = 0;
  let holdTimerInterval = null;

  // Master Weekly Schedule
  const WEEKLY_STUDIO_SCHEDULE = [
    // Sunday (0)
    [
      { classId: "yoga", name: "Weekend Sunrise Yoga", time: "08:00 - 09:15", coach: "Coach Bea", room: "Aqua Room", seats: 12, price: 250, cat: "Yoga & Wellness" },
      { classId: "kids-gymnastics", name: "Kids Gymnastics Acrobatics", time: "10:00 - 11:30", coach: "Coach Dex", room: "Main Studio", seats: 15, price: 300, cat: "Gymnastics" },
      { classId: "karatedo", name: "Karatedo Fundamentals", time: "14:00 - 15:30", coach: "Sensei Jun", room: "Main Studio", seats: 16, price: 300, cat: "Martial Arts" },
      { classId: "dance-sports", name: "Dance Sports Latin Basics", time: "16:00 - 17:30", coach: "Coach Val", room: "Main Studio", seats: 14, price: 350, cat: "Dance & Cardio" },
      { classId: "step-hype", name: "Sunday Step Hype Cool-Down", time: "18:00 - 19:15", coach: "Coach Kyle", room: "Aqua Room", seats: 14, price: 250, cat: "Dance & Cardio" }
    ],
    // Monday (1)
    [
      { classId: "yoga", name: "Morning Vinyasa Yoga", time: "07:30 - 08:45", coach: "Coach Bea", room: "Aqua Room", seats: 12, price: 250, cat: "Yoga & Wellness" },
      { classId: "basic-ballet", name: "Kids Basic Ballet", time: "10:00 - 11:00", coach: "Teacher Mia", room: "Main Studio", seats: 15, price: 300, cat: "Ballet & Kids" },
      { classId: "step-hype", name: "Step Hype Cardio", time: "17:30 - 18:30", coach: "Coach Kyle", room: "Aqua Room", seats: 14, price: 250, cat: "Dance & Cardio" },
      { classId: "muay-thai", name: "Muay Thai Conditioning", time: "19:00 - 20:30", coach: "Coach Ray", room: "Main Studio", seats: 12, price: 350, cat: "Martial Arts" }
    ],
    // Tuesday (2)
    [
      { classId: "yoga", name: "Gentle Stretch & Mobility", time: "08:00 - 09:00", coach: "Coach Bea", room: "Aqua Room", seats: 12, price: 200, cat: "Yoga & Wellness" },
      { classId: "gymnastics", name: "Gymnastics & Tumbling", time: "14:00 - 15:30", coach: "Coach Dex", room: "Main Studio", seats: 14, price: 300, cat: "Gymnastics" },
      { classId: "zumba", name: "Zumba Fitness Party", time: "17:30 - 18:30", coach: "Coach Zin", room: "Main Studio", seats: 25, price: 200, cat: "Dance & Cardio" },
      { classId: "femme-dance", name: "Femme Dance Choreography", time: "19:00 - 20:15", coach: "Coach Ella", room: "Aqua Room", seats: 14, price: 300, cat: "Dance & Cardio" }
    ],
    // Wednesday (3)
    [
      { classId: "yoga", name: "Morning Power Flow", time: "07:30 - 08:45", coach: "Coach Bea", room: "Aqua Room", seats: 12, price: 250, cat: "Yoga & Wellness" },
      { classId: "basic-ballet", name: "Junior Ballet Form", time: "10:00 - 11:15", coach: "Teacher Mia", room: "Main Studio", seats: 15, price: 300, cat: "Ballet & Kids" },
      { classId: "step-hype", name: "Step Hype Intense", time: "17:30 - 18:30", coach: "Coach Kyle", room: "Aqua Room", seats: 14, price: 250, cat: "Dance & Cardio" },
      { classId: "muay-thai", name: "Muay Thai Striking", time: "19:00 - 20:30", coach: "Coach Ray", room: "Main Studio", seats: 12, price: 350, cat: "Martial Arts" }
    ],
    // Thursday (4)
    [
      { classId: "yoga", name: "Core & Posture Yoga", time: "08:00 - 09:00", coach: "Coach Bea", room: "Aqua Room", seats: 12, price: 200, cat: "Yoga & Wellness" },
      { classId: "gymnastics", name: "Acro Gymnastics Level 1", time: "14:00 - 15:30", coach: "Coach Dex", room: "Main Studio", seats: 14, price: 300, cat: "Gymnastics" },
      { classId: "zumba", name: "Latin Rhythm Zumba", time: "17:30 - 18:30", coach: "Coach Zin", room: "Main Studio", seats: 25, price: 200, cat: "Dance & Cardio" },
      { classId: "female-dancehall", name: "Female Dancehall Groove", time: "19:00 - 20:15", coach: "Coach Ella", room: "Aqua Room", seats: 14, price: 300, cat: "Dance & Cardio" }
    ],
    // Friday (5)
    [
      { classId: "yoga", name: "Flow & Release Yoga", time: "08:00 - 09:15", coach: "Coach Bea", room: "Aqua Room", seats: 12, price: 250, cat: "Yoga & Wellness" },
      { classId: "zumba", name: "TGIF Zumba Fiesta", time: "17:30 - 18:30", coach: "Coach Zin", room: "Main Studio", seats: 25, price: 200, cat: "Dance & Cardio" },
      { classId: "step-hype", name: "Friday Night Step Hype", time: "18:45 - 19:45", coach: "Coach Kyle", room: "Aqua Room", seats: 14, price: 250, cat: "Dance & Cardio" },
      { classId: "dance-sports", name: "Open Studio Latin Jam", time: "20:00 - 21:15", coach: "Coach Val", room: "Main Studio", seats: 20, price: 300, cat: "Dance & Cardio" }
    ],
    // Saturday (6)
    [
      { classId: "yoga", name: "Weekend Vinyasa Sunrise", time: "08:00 - 09:15", coach: "Coach Bea", room: "Aqua Room", seats: 12, price: 250, cat: "Yoga & Wellness" },
      { classId: "basic-ballet", name: "Kids & Teens Ballet", time: "09:30 - 10:45", coach: "Teacher Mia", room: "Main Studio", seats: 15, price: 300, cat: "Ballet & Kids" },
      { classId: "gymnastics", name: "Acro Gymnastics Open", time: "11:00 - 12:30", coach: "Coach Dex", room: "Main Studio", seats: 15, price: 300, cat: "Gymnastics" },
      { classId: "karatedo", name: "Karatedo Sparring & Kata", time: "14:00 - 15:30", coach: "Sensei Jun", room: "Main Studio", seats: 16, price: 300, cat: "Martial Arts" },
      { classId: "zumba", name: "Saturday Sunset Zumba", time: "16:00 - 17:00", coach: "Coach Zin", room: "Main Studio", seats: 25, price: 200, cat: "Dance & Cardio" },
      { classId: "step-hype", name: "Saturday Step Hype Hype", time: "17:30 - 18:45", coach: "Coach Kyle", room: "Aqua Room", seats: 14, price: 250, cat: "Dance & Cardio" }
    ]
  ];

  function formatKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function generateStudioSchedule(startDay, daysCount = 45) {
    const sessions = [];
    const base = new Date(startDay);
    base.setHours(0, 0, 0, 0);

    for (let i = 0; i < daysCount; i++) {
      const cur = new Date(base);
      cur.setDate(base.getDate() + i);
      const dayOfWeek = cur.getDay();
      const dateStr = formatKey(cur);
      const dayClasses = WEEKLY_STUDIO_SCHEDULE[dayOfWeek] || [];

      dayClasses.forEach((tpl, idx) => {
        const timeParts = tpl.time.split(" - ");
        const startTime = timeParts[0];
        const endTime = timeParts[1] || "";
        const sid = `sess-${dateStr}-${tpl.classId}-${idx + 1}`;

        // Read booked seats from localStorage database
        const bookedCount = getBookedSeatsCount(sid);
        const available = Math.max(0, tpl.seats - bookedCount);

        sessions.push({
          sessionId: sid,
          classId: tpl.classId,
          name: tpl.name,
          date: dateStr,
          startTime: startTime,
          endTime: endTime,
          coach: tpl.coach,
          room: tpl.room,
          seatLimit: tpl.seats,
          availableSeats: available,
          price: tpl.price,
          category: tpl.cat,
          active: true
        });
      });
    }
    return sessions;
  }

  let studioSessions = generateStudioSchedule(today, 45);

  // Local Storage Database Helpers
  function getStudioBookings() {
    try {
      return JSON.parse(localStorage.getItem("hingas_studio_bookings") || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveStudioBooking(booking) {
    const bookings = getStudioBookings();
    bookings.unshift(booking);
    localStorage.setItem("hingas_studio_bookings", JSON.stringify(bookings));
    // Refresh sessions
    studioSessions = generateStudioSchedule(today, 45);
  }

  function getBookedSeatsCount(sessionId) {
    const bookings = getStudioBookings();
    return bookings
      .filter((b) => b.sessionId === sessionId && (b.status === "paid" || b.status === "checked-in" || b.status === "held"))
      .reduce((sum, b) => sum + Number(b.seats || 1), 0);
  }

  function getClassesCountForDate(key) {
    return studioSessions.filter((s) => s.date === key && s.active).length;
  }

  // RENDER DATES
  function renderDateStrip() {
    const tabs = $("#date-tabs");
    if (!tabs) return;
    tabs.innerHTML = "";

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const key = formatKey(d);
      const isSelected = key === formatKey(selectedDate);
      const isCurrentDay = i === 0;
      const count = getClassesCountForDate(key);

      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      const dayNum = d.getDate();

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `date-tab ${isSelected ? "active" : ""} ${isCurrentDay ? "is-today" : ""}`;
      btn.innerHTML = `
        <span class="date-tab-day">${isCurrentDay ? "Today" : dayName}</span>
        <strong class="date-tab-num">${dayNum}</strong>
        <span class="date-tab-month">${monthName}</span>
        <span class="date-tab-count">${count > 0 ? `${count} class${count > 1 ? "es" : ""}` : "Open"}</span>
      `;
      btn.addEventListener("click", () => {
        selectedDate = new Date(d);
        renderDateStrip();
        renderClasses();
      });
      tabs.appendChild(btn);
    }
  }

  function renderMonthCalendar() {
    const grid = $("#month-grid");
    const display = $("#cal-month-display");
    if (!grid || !display) return;

    const year = calendarMonthCursor.getFullYear();
    const month = calendarMonthCursor.getMonth();

    display.textContent = calendarMonthCursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    grid.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Previous month filler
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const cell = document.createElement("div");
      cell.className = "month-cell is-other-month";
      cell.innerHTML = `<span class="month-cell-num">${dayNum}</span>`;
      grid.appendChild(cell);
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(year, month, d);
      const key = formatKey(cellDate);
      const isSelected = key === formatKey(selectedDate);
      const isToday = key === formatKey(today);
      const count = getClassesCountForDate(key);

      const cell = document.createElement("div");
      cell.className = `month-cell ${isSelected ? "is-selected" : ""} ${isToday ? "is-today" : ""}`;
      cell.dataset.date = key;
      cell.innerHTML = `
        <span class="month-cell-num">${d}</span>
        ${count > 0 ? `<span class="month-cell-classes">${count} ${count === 1 ? "class" : "classes"}</span>` : `<span class="month-cell-none">—</span>`}
      `;
      cell.addEventListener("click", () => {
        selectedDate = new Date(cellDate);
        renderMonthCalendar();
        renderDateStrip();
        renderClasses();
      });
      grid.appendChild(cell);
    }
  }

  // RENDER FILTER PILLS
  const CATEGORIES = ["All classes", "Dance & Cardio", "Yoga & Wellness", "Ballet & Kids", "Gymnastics", "Martial Arts"];
  function renderFilterPills() {
    const wrap = $("#category-pills");
    if (!wrap) return;
    wrap.innerHTML = "";
    CATEGORIES.forEach((cat) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = `filter-pill ${selectedCategory === cat ? "active" : ""}`;
      pill.textContent = cat;
      pill.addEventListener("click", () => {
        selectedCategory = cat;
        renderFilterPills();
        renderClasses();
      });
      wrap.appendChild(pill);
    });
  }

  // RENDER CLASSES
  function renderClasses() {
    const container = $("#class-list");
    const heading = $("#current-day-label");
    const badge = $("#date-summary-badge");
    if (!container) return;

    const key = formatKey(selectedDate);
    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    if (heading) heading.textContent = `${dayName} Schedule`;

    let filtered = studioSessions.filter((s) => s.date === key && s.active);

    if (selectedCategory !== "All classes") {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    if (classSearchQuery.trim()) {
      const q = classSearchQuery.toLowerCase();
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        (s.coach && s.coach.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
    }

    if (badge) {
      badge.textContent = `${filtered.length} ${filtered.length === 1 ? "session" : "sessions"} available`;
    }

    if (!filtered.length) {
      container.innerHTML = `
        <div class="schedule-empty-state">
          <span class="empty-icon-wrap" style="display:block;margin-bottom:10px;"><svg class="ui-icon" style="width:36px;height:36px;stroke-width:1.5;color:var(--dash-muted);" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span>
          <h3>No classes found</h3>
          <p>There are no sessions matching your search or filters on this date. Try another date or filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((s) => {
      const avail = s.availableSeats;
      let badgeHtml = "";
      if (avail <= 0) badgeHtml = `<span class="seat-badge full"><span class="seat-dot"></span> Full</span>`;
      else if (avail <= 3) badgeHtml = `<span class="seat-badge urgent"><span class="seat-dot"></span> Only ${avail} left</span>`;
      else badgeHtml = `<span class="seat-badge plenty"><span class="seat-dot"></span> ${avail} spots</span>`;

      return `
        <article class="class-card">
          <div class="class-card-time">
            <strong>${s.startTime}</strong>
            <span>${s.endTime ? s.endTime : ""}</span>
          </div>
          <div class="class-card-main">
            <h3>${s.name}</h3>
            <p class="class-meta">${s.coach || "Studio Coach"} · ${s.room || "Studio Room"}</p>
          </div>
          <div class="class-card-tag">${badgeHtml}</div>
          <div class="class-price">
            <strong>₱${s.price}</strong>
            <small>/ session</small>
          </div>
          <div>
            ${avail > 0 ? `
              <button class="button button-gold book-btn" type="button" data-session-id="${s.sessionId}">
                Book spot ↗
              </button>
            ` : `
              <button class="button" disabled style="opacity:0.6;background:#cbd5e1;cursor:not-allowed;">
                Sold Out
              </button>
            `}
          </div>
        </article>
      `;
    }).join("");

    // Wire up Book buttons
    $$(".book-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sid = btn.dataset.sessionId;
        const session = studioSessions.find((s) => s.sessionId === sid);
        if (session) openBookingModal(session);
      });
    });
  }

  // 4-STEP BOOKING MODAL
  function openBookingModal(session) {
    selectedClass = session;
    bookingStep = 1;
    bookingQuantity = 1;
    appliedPromo = null;
    holdEndsAt = Date.now() + 15 * 60 * 1000;

    renderBookingModalContent();
    $("#booking-modal").hidden = false;
    document.body.style.overflow = "hidden";

    startHoldTimer();
  }

  function closeBookingModal() {
    $("#booking-modal").hidden = true;
    document.body.style.overflow = "";
    if (holdTimerInterval) clearInterval(holdTimerInterval);
  }

  function startHoldTimer() {
    if (holdTimerInterval) clearInterval(holdTimerInterval);
    holdTimerInterval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((holdEndsAt - Date.now()) / 1000));
      const el = $("#hold-timer-display");
      if (el) {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        el.textContent = `${m}:${String(s).padStart(2, "0")}`;
      }
      if (remaining <= 0) {
        clearInterval(holdTimerInterval);
        showToast("Hold expired. Please select your seats again.");
        closeBookingModal();
      }
    }, 1000);
  }

  function renderBookingModalContent() {
    const wrap = $("#booking-content");
    if (!wrap || !selectedClass) return;

    const price = selectedClass.price;
    const subtotal = price * bookingQuantity;
    const discount = appliedPromo ? Math.round(subtotal * (appliedPromo.pct / 100)) : 0;
    const total = Math.max(0, subtotal - discount);

    if (bookingStep === 1) {
      wrap.innerHTML = `
        <div class="booking-modal-header">
          <span class="booking-kicker">STEP 1 OF 3 · SELECT TICKETS</span>
          <h2 id="booking-dialog-title">${selectedClass.name}</h2>
          <p class="booking-intro">${selectedClass.date} at ${selectedClass.startTime} · ${selectedClass.coach}</p>
        </div>
        <div class="booking-hold-banner">
          ⏱️ Seats held for <strong id="hold-timer-display">15:00</strong>
        </div>
        <div class="booking-quantity-selector" style="margin:20px 0;display:flex;align-items:center;justify-content:space-between;padding:16px;background:white;border:1px solid #dfe7e4;border-radius:10px;">
          <div>
            <strong>Number of Passes</strong>
            <span style="display:block;font-size:12px;color:#64748b;">₱${price} per attendee</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <button type="button" class="button" id="qty-minus" style="min-height:36px;padding:0 12px;font-size:16px;" ${bookingQuantity <= 1 ? "disabled" : ""}>-</button>
            <strong style="font-size:18px;min-width:24px;text-align:center;">${bookingQuantity}</strong>
            <button type="button" class="button" id="qty-plus" style="min-height:36px;padding:0 12px;font-size:16px;" ${bookingQuantity >= selectedClass.availableSeats ? "disabled" : ""}>+</button>
          </div>
        </div>
        <div class="booking-total-bar" style="margin-bottom:24px;display:flex;justify-content:space-between;font-size:16px;">
          <span>Total:</span>
          <strong>₱${total}</strong>
        </div>
        <button type="button" class="button button-gold" id="btn-to-step-2" style="width:100%;">
          Continue to Details &rarr;
        </button>
      `;

      $("#qty-minus")?.addEventListener("click", () => {
        if (bookingQuantity > 1) {
          bookingQuantity--;
          renderBookingModalContent();
        }
      });
      $("#qty-plus")?.addEventListener("click", () => {
        if (bookingQuantity < selectedClass.availableSeats) {
          bookingQuantity++;
          renderBookingModalContent();
        }
      });
      $("#btn-to-step-2")?.addEventListener("click", () => {
        bookingStep = 2;
        renderBookingModalContent();
      });
      return;
    }

    if (bookingStep === 2) {
      wrap.innerHTML = `
        <div class="booking-modal-header">
          <span class="booking-kicker">STEP 2 OF 3 · ATTENDEE DETAILS</span>
          <h2>Attendee Information</h2>
          <p class="booking-intro">${selectedClass.name} · ${bookingQuantity} ${bookingQuantity === 1 ? "Pass" : "Passes"}</p>
        </div>
        <form id="attendee-form" style="display:flex;flex-direction:column;gap:14px;margin-top:16px;">
          <div>
            <label style="display:block;font-size:11px;font-weight:700;color:#64748b;margin-bottom:4px;">Full Name *</label>
            <input type="text" id="att-name" required placeholder="e.g. Maria Santos" style="width:100%;min-height:42px;padding:0 12px;border:1px solid #dfe7e4;border-radius:6px;font-size:14px;">
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:700;color:#64748b;margin-bottom:4px;">Mobile Number (Philippine 09XX) *</label>
            <input type="tel" id="att-mobile" required placeholder="0917 123 4567" style="width:100%;min-height:42px;padding:0 12px;border:1px solid #dfe7e4;border-radius:6px;font-size:14px;">
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:700;color:#64748b;margin-bottom:4px;">Email Address *</label>
            <input type="email" id="att-email" required placeholder="maria@gmail.com" style="width:100%;min-height:42px;padding:0 12px;border:1px solid #dfe7e4;border-radius:6px;font-size:14px;">
          </div>
          <div class="promo-code-wrap">
            <label>Promo / Voucher Code</label>
            <div class="promo-code-field">
              <input type="text" id="promo-input" placeholder="e.g. HINGASVIP or FIRSTFREE" value="${appliedPromo ? appliedPromo.code : ""}">
              <button type="button" class="button" id="btn-apply-promo">Apply</button>
            </div>
            <div class="promo-feedback ${appliedPromo ? "valid" : ""}">
              ${appliedPromo ? `Applied ${appliedPromo.code} (${appliedPromo.pct}% off)` : ""}
            </div>
          </div>
          <div class="booking-total-bar" style="display:flex;justify-content:space-between;font-size:16px;border-top:1px solid #dfe7e4;padding-top:12px;">
            <span>Total Payable:</span>
            <strong>₱${total}</strong>
          </div>
          <div style="display:flex;gap:10px;margin-top:8px;">
            <button type="button" class="button" id="btn-back-step-1" style="flex:1;">← Back</button>
            <button type="submit" class="button button-gold" style="flex:2;">Confirm & Reserve &rarr;</button>
          </div>
        </form>
      `;

      $("#btn-back-step-1")?.addEventListener("click", () => {
        bookingStep = 1;
        renderBookingModalContent();
      });

      $("#btn-apply-promo")?.addEventListener("click", () => {
        const code = ($("#promo-input")?.value || "").trim().toUpperCase();
        if (code === "HINGASVIP" || code === "FIRSTFREE") {
          appliedPromo = { code, pct: 100 };
          renderBookingModalContent();
          showToast(`100% complimentary pass activated!`);
        } else if (code === "WELCOME10") {
          appliedPromo = { code, pct: 10 };
          renderBookingModalContent();
          showToast(`10% discount applied!`);
        } else {
          showToast(`Code "${code}" is invalid or expired.`);
        }
      });

      $("#attendee-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = $("#att-name")?.value.trim();
        const mobile = $("#att-mobile")?.value.trim();
        const email = $("#att-email")?.value.trim();

        if (!name || !mobile || !email) {
          alert("Please fill in all required fields.");
          return;
        }

        // Generate Reference Code
        const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
        const bookingRef = `HG-${rand}`;

        const newBooking = {
          bookingId: bookingRef,
          sessionId: selectedClass.sessionId,
          className: selectedClass.name,
          date: selectedClass.date,
          time: selectedClass.startTime,
          coach: selectedClass.coach,
          room: selectedClass.room,
          name: name,
          mobile: mobile,
          email: email,
          seats: bookingQuantity,
          amount: total,
          status: "paid", // or checked-in
          paymentMethod: total === 0 ? "Complimentary Pass" : "GCash / Studio Cash",
          createdAt: new Date().toISOString()
        };

        saveStudioBooking(newBooking);

        bookingStep = 4;
        renderConfirmation(newBooking);
      });
      return;
    }
  }

  function renderConfirmation(b) {
    const wrap = $("#booking-content");
    if (!wrap) return;
    if (holdTimerInterval) clearInterval(holdTimerInterval);

    wrap.innerHTML = `
      <div style="text-align:center;">
        <div class="success-mark" style="width:48px;height:48px;margin:0 auto 12px;background:rgba(16,185,129,0.15);color:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;"><svg class="ui-icon" style="width:28px;height:28px;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span class="booking-kicker" style="color:#15803d;">RESERVATION CONFIRMED</span>
        <h2 style="margin:4px 0 10px;font-size:26px;">You're booked for ${b.className}!</h2>
        <p style="font-size:13px;color:#64748b;">Show your digital ticket or QR voucher at the front desk when you arrive.</p>

        <div class="ticket-qr-wrap" style="margin:20px 0;padding:20px;background:#f8fafc;border:2px dashed #0279bb;border-radius:12px;">
          <span class="ticket-badge-title">OFFICIAL STUDIO PASS</span>
          <div style="margin:10px 0;"><svg class="ui-icon" style="width:36px;height:36px;color:var(--gold,#f4d35e);" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg></div>
          <div class="ticket-ref-stamp" style="font-size:18px;font-weight:bold;letter-spacing:2px;color:#0279bb;">${b.bookingId}</div>
          <div style="font-size:13px;color:#334155;margin-top:6px;">
            <strong>${b.name}</strong> · ${b.seats} ${b.seats === 1 ? "seat" : "seats"}<br>
            ${b.date} at ${b.time} (${b.room})
          </div>
          <span class="ticket-note" style="font-size:11px;color:#64748b;margin-top:8px;display:block;">
            Verified Pass · Hingas Lifestyle Studio
          </span>
        </div>

        <div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px;">
          <button type="button" class="button" onclick="window.print()"><svg class="ui-icon" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg> Print Ticket</button>
          <button type="button" class="button button-gold" id="btn-done-booking">Done</button>
        </div>
      </div>
    `;

    $("#btn-done-booking")?.addEventListener("click", () => {
      closeBookingModal();
      renderClasses();
      renderDateStrip();
      if (activeCalendarView === "month") renderMonthCalendar();
    });
  }

  // MY TICKETS LOOKUP
  function openLookupModal() {
    $("#my-bookings-modal").hidden = false;
    document.body.style.overflow = "hidden";
    renderSavedBookingsList();
  }

  function closeLookupModal() {
    $("#my-bookings-modal").hidden = true;
    document.body.style.overflow = "";
  }

  function renderSavedBookingsList(filterQuery = "") {
    const list = $("#my-saved-bookings-list");
    if (!list) return;

    let bookings = getStudioBookings();

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      bookings = bookings.filter((b) =>
        (b.bookingId && b.bookingId.toLowerCase().includes(q)) ||
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.mobile && b.mobile.toLowerCase().includes(q))
      );
    }

    if (!bookings.length) {
      list.innerHTML = `
        <div style="text-align:center;padding:30px 20px;color:#64748b;">
          <span class="empty-icon-wrap" style="display:block;margin-bottom:8px;"><svg class="ui-icon" style="width:36px;height:36px;stroke-width:1.5;color:var(--dash-muted);" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg></span>
          <p>No booked passes found on this device.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = bookings.map((b) => `
      <div class="lookup-card">
        <div class="lookup-card-info">
          <strong>${b.className}</strong>
          <span>Ref: <b style="color:#0279bb;">${b.bookingId}</b> · ${b.seats} ${b.seats === 1 ? "pass" : "passes"}</span>
          <span>${b.date} at ${b.time} (${b.room || "Studio Room"})</span>
          <span>Attendee: ${b.name}</span>
        </div>
        <div style="text-align:right;">
          <span class="lookup-badge ${b.status === "checked-in" ? "checked-in" : "paid"}">
            ${b.status === "checked-in" ? "Checked In" : "Confirmed"}
          </span>
        </div>
      </div>
    `).join("");
  }

  // Package Checkout Modal
  function openPackageCheckout(pkgName, price) {
    const modal = $("#booking-modal");
    const content = $("#booking-content");
    if (!modal || !content) return;

    modal.hidden = false;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    content.innerHTML = `
      <div class="booking-dialog-header">
        <span class="booking-kicker">STUDIO BUNDLE PASS</span>
        <h2>${pkgName}</h2>
        <p>Complete your purchase to receive your multi-session pass code and QR voucher.</p>
      </div>

      <form id="package-checkout-form" class="booking-form" style="display:flex;flex-direction:column;gap:14px;margin-top:16px;">
        <div style="background:var(--paper-2, #eef3f0);padding:14px 18px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong>${pkgName}</strong>
            <span style="display:block;font-size:12px;color:#64748b;">Valid for regular group sessions</span>
          </div>
          <strong style="font-size:22px;color:#0284c7;">₱${price.toLocaleString()}</strong>
        </div>

        <div>
          <label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px;">Full Name *</label>
          <input type="text" id="pkg-name" placeholder="Your full name" required style="width:100%;box-sizing:border-box;padding:10px 14px;border:1px solid #ccc;border-radius:8px;">
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px;">Mobile Number *</label>
            <input type="tel" id="pkg-mobile" placeholder="0917 123 4567" required style="width:100%;box-sizing:border-box;padding:10px 14px;border:1px solid #ccc;border-radius:8px;">
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px;">Email Address *</label>
            <input type="email" id="pkg-email" placeholder="you@example.com" required style="width:100%;box-sizing:border-box;padding:10px 14px;border:1px solid #ccc;border-radius:8px;">
          </div>
        </div>

        <div>
          <label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px;">Payment Channel *</label>
          <select id="pkg-payment" style="width:100%;box-sizing:border-box;padding:10px 14px;border:1px solid #ccc;border-radius:8px;">
            <option value="GCash Direct Transfer">GCash Direct</option>
            <option value="Credit / Debit Card (HitPay)">Credit / Debit Card</option>
            <option value="Maya QR">Maya QR</option>
            <option value="Cash at Front Desk">Pay at Studio Desk</option>
          </select>
        </div>

        <button type="submit" class="button button-gold" style="width:100%;min-height:46px;margin-top:10px;">
          Confirm &amp; Purchase Pass &rarr;
        </button>
      </form>
    `;

    $("#package-checkout-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = ($("#pkg-name")?.value || "").trim();
      const mobile = ($("#pkg-mobile")?.value || "").trim();
      const email = ($("#pkg-email")?.value || "").trim();
      const paymentMethod = $("#pkg-payment")?.value || "GCash Direct Transfer";

      const passCode = "HG-PASS-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      const newPass = {
        bookingId: passCode,
        sessionId: "pkg-" + Date.now(),
        className: pkgName,
        date: "Package Pass",
        time: "Flexible Validity",
        room: "All Studio Rooms",
        coach: "Any Instructor",
        name,
        mobile,
        email,
        seats: pkgName.includes("10") ? 10 : pkgName.includes("5") ? 5 : 30,
        amount: price,
        status: "paid",
        paymentMethod,
        isPackage: true,
        createdAt: new Date().toISOString()
      };

      // Save to studio bookings
      const existing = JSON.parse(localStorage.getItem("hingas_studio_bookings") || "[]");
      existing.unshift(newPass);
      localStorage.setItem("hingas_studio_bookings", JSON.stringify(existing));

      // Save to client lookup
      saveBookingToClient(newPass);

      // Render Confirmation
      content.innerHTML = `
        <div style="text-align:center;padding:10px 0;">
          <div style="width:52px;height:52px;border-radius:50%;background:rgba(16,185,129,0.15);color:#10b981;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
            <svg class="ui-icon" style="width:28px;height:28px;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span class="booking-kicker">PACKAGE CONFIRMED</span>
          <h2 style="margin:4px 0 8px;">You're All Set!</h2>
          <p style="color:#64748b;font-size:13px;margin:0 0 18px;">Your multi-session pass has been activated and saved to your device.</p>

          <div style="background:#0e1726;color:#fff;border-radius:14px;padding:20px;text-align:center;margin-bottom:18px;">
            <span style="font-size:11px;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Official Pass Code</span>
            <div style="font-size:26px;font-weight:900;color:#38bdf8;letter-spacing:2px;margin:6px 0;">${passCode}</div>
            <p style="font-size:12px;color:#cbd5e1;margin:0;">Present this code or your name at reception for entry to any class.</p>
          </div>

          <div style="display:flex;gap:10px;">
            <button type="button" class="button button-glass" style="flex:1;" onclick="window.print()">Print Pass</button>
            <button type="button" class="button button-gold" style="flex:1;" id="btn-finish-pkg">Done</button>
          </div>
        </div>
      `;

      $("#btn-finish-pkg")?.addEventListener("click", closeBookingModal);
      showToast(`Package purchased! Pass code: ${passCode}`);
    });
  }

  // TOAST
  function showToast(msg) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3500);
  }

  // THEME
  function initTheme() {
    const saved = localStorage.getItem("hingas_theme");
    if (saved === "midnight") {
      document.documentElement.classList.add("theme-midnight");
      const icon = $(".theme-icon");
      if (icon) icon.innerHTML = '<svg class="ui-icon theme-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
    }
    $("#theme-toggle")?.addEventListener("click", () => {
      const isDark = document.documentElement.classList.toggle("theme-midnight");
      localStorage.setItem("hingas_theme", isDark ? "midnight" : "light");
      const icon = $(".theme-icon");
      if (icon) icon.innerHTML = isDark ? '<svg class="ui-icon theme-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>' : '<svg class="ui-icon theme-svg" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
    });
  }

  // INITIALIZE
  function init() {
    initTheme();
    renderDateStrip();
    renderMonthCalendar();
    renderFilterPills();
    renderClasses();

    // View toggle listeners
    $("#btn-view-strip")?.addEventListener("click", () => {
      activeCalendarView = "strip";
      $("#btn-view-strip").classList.add("active");
      $("#btn-view-month").classList.remove("active");
      $("#strip-view-wrap").style.display = "flex";
      $("#month-view-wrap").style.display = "none";
    });

    $("#btn-view-month")?.addEventListener("click", () => {
      activeCalendarView = "month";
      $("#btn-view-month").classList.add("active");
      $("#btn-view-strip").classList.remove("active");
      $("#strip-view-wrap").style.display = "none";
      $("#month-view-wrap").style.display = "block";
      renderMonthCalendar();
    });

    // Month navigator
    $("#cal-prev-month")?.addEventListener("click", () => {
      calendarMonthCursor.setMonth(calendarMonthCursor.getMonth() - 1);
      renderMonthCalendar();
    });

    $("#cal-next-month")?.addEventListener("click", () => {
      calendarMonthCursor.setMonth(calendarMonthCursor.getMonth() + 1);
      renderMonthCalendar();
    });

    $("#today-button")?.addEventListener("click", () => {
      calendarMonthCursor = new Date(today.getFullYear(), today.getMonth(), 1);
      selectedDate = new Date(today);
      renderMonthCalendar();
      renderDateStrip();
      renderClasses();
    });

    // Strip scroll buttons
    $("#scroll-strip-left")?.addEventListener("click", () => {
      $("#date-tabs")?.scrollBy({ left: -240, behavior: "smooth" });
    });
    $("#scroll-strip-right")?.addEventListener("click", () => {
      $("#date-tabs")?.scrollBy({ left: 240, behavior: "smooth" });
    });

    // Search input
    const searchInput = $("#class-search-input");
    const clearBtn = $("#class-search-clear");
    searchInput?.addEventListener("input", (e) => {
      classSearchQuery = e.target.value;
      if (clearBtn) clearBtn.style.display = classSearchQuery ? "block" : "none";
      renderClasses();
    });
    clearBtn?.addEventListener("click", () => {
      searchInput.value = "";
      classSearchQuery = "";
      clearBtn.style.display = "none";
      renderClasses();
    });

    // Modals
    $$("#booking-modal [data-close]").forEach((btn) => btn.addEventListener("click", closeBookingModal));
    $("#booking-modal")?.addEventListener("click", (e) => {
      if (e.target.id === "booking-modal") closeBookingModal();
    });

    $("#btn-my-tickets")?.addEventListener("click", openLookupModal);
    $("#close-lookup-modal")?.addEventListener("click", closeLookupModal);
    $("#my-bookings-modal")?.addEventListener("click", (e) => {
      if (e.target.id === "my-bookings-modal") closeLookupModal();
    });

    $("#btn-perform-lookup")?.addEventListener("click", () => {
      const q = $("#lookup-ref-input")?.value || "";
      renderSavedBookingsList(q);
    });

    // View Tabs Switcher (Daily Classes vs Multi-Class Packages)
    const tabSched = $("#tab-view-schedule");
    const tabPkg = $("#tab-view-packages");
    const secSched = $("#section-schedule-view");
    const secPkg = $("#section-packages-view");

    tabSched?.addEventListener("click", () => {
      tabSched.classList.add("active");
      tabPkg?.classList.remove("active");
      if (secSched) secSched.style.display = "block";
      if (secPkg) secPkg.style.display = "none";
    });

    tabPkg?.addEventListener("click", () => {
      tabPkg.classList.add("active");
      tabSched?.classList.remove("active");
      if (secSched) secSched.style.display = "none";
      if (secPkg) secPkg.style.display = "block";
    });

    // Package Buy Buttons
    $$(".btn-buy-package").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pkgName = btn.dataset.name;
        const price = Number(btn.dataset.price);
        openPackageCheckout(pkgName, price);
      });
    });

    // Keyboard escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeBookingModal();
        closeLookupModal();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
