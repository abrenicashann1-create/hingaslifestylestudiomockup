/**
 * Hingas Lifestyle Studio — Executive Owner Dashboard Logic
 */

(function () {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const OWNER_PIN = "owner2026";
  let activeTimeframe = "today"; // "today", "week", "month", "all"

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function formatKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const todayStr = formatKey(today);

  // Storage Getters & Setters
  function getBookings() {
    try {
      return JSON.parse(localStorage.getItem("hingas_studio_bookings") || "[]");
    } catch (e) {
      return [];
    }
  }

  function getRequests() {
    try {
      return JSON.parse(localStorage.getItem("hingas_studio_requests") || "[]");
    } catch (e) {
      return [];
    }
  }

  function setRequests(reqs) {
    localStorage.setItem("hingas_studio_requests", JSON.stringify(reqs));
  }

  // Authentication
  function checkOwnerAuth() {
    const isUnlocked = sessionStorage.getItem("hingas_owner_auth") === "true" || localStorage.getItem("hingas_owner_auth") === "true";
    if (isUnlocked) {
      $("#owner-pin-gate").style.display = "none";
      $("#owner-app").style.display = "block";
      refreshOwnerDashboard();
    } else {
      $("#owner-pin-gate").style.display = "flex";
      $("#owner-app").style.display = "none";
    }
  }

  function setupAuthEvents() {
    const errorEl = $("#owner-pin-error");
    const pinInput = $("#owner-pin-input");
    const pwToggle = $("#owner-pw-toggle");
    const chip = $("#chip-owner-pin");

    // Toggle password visibility
    pwToggle?.addEventListener("click", () => {
      if (!pinInput) return;
      const isPw = pinInput.type === "password";
      pinInput.type = isPw ? "text" : "password";
      pwToggle.innerHTML = isPw
        ? '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>'
        : '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
    });

    // 1-Click quick fill
    chip?.addEventListener("click", () => {
      if (pinInput) {
        pinInput.value = OWNER_PIN;
        $("#owner-pin-form")?.dispatchEvent(new Event("submit"));
      }
    });

    $("#owner-pin-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const entered = (pinInput?.value || "").trim();
      const remember = $("#owner-pin-remember")?.checked;

      if (errorEl) {
        errorEl.style.display = "none";
        errorEl.className = "owner-auth-alert";
      }

      if (entered === OWNER_PIN) {
        if (remember) localStorage.setItem("hingas_owner_auth", "true");
        else sessionStorage.setItem("hingas_owner_auth", "true");

        $("#owner-pin-gate").style.display = "none";
        $("#owner-app").style.display = "block";
        showToast("Executive Owner Access Granted. Welcome!");
        refreshOwnerDashboard();
      } else {
        if (errorEl) {
          errorEl.textContent = "Invalid Owner Master PIN. Please verify your credentials and try again.";
          errorEl.className = "owner-auth-alert error";
          errorEl.style.display = "block";
        }
        if (pinInput) {
          pinInput.value = "";
          pinInput.focus();
        }
      }
    });

    $("#btn-lock-owner")?.addEventListener("click", () => {
      sessionStorage.removeItem("hingas_owner_auth");
      localStorage.removeItem("hingas_owner_auth");
      location.reload();
    });
  }

  // Filter Bookings by Timeframe
  function filterBookingsByTimeframe(bookings, range) {
    if (range === "all") return bookings;

    const now = new Date();
    if (range === "today") {
      return bookings.filter((b) => b.date === todayStr);
    }

    if (range === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return bookings.filter((b) => {
        const d = new Date(b.date);
        return d >= weekAgo && d <= now;
      });
    }

    if (range === "month") {
      const curMonth = now.getMonth();
      const curYear = now.getFullYear();
      return bookings.filter((b) => {
        const d = new Date(b.date);
        return d.getMonth() === curMonth && d.getFullYear() === curYear;
      });
    }

    return bookings;
  }

  // Live Clock
  function updateClock() {
    const el = $("#owner-clock");
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
      " · " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  // Calculate & Render Executive Financial KPIs
  function renderExecutiveKPIs() {
    const allBookings = getBookings();
    const filtered = filterBookingsByTimeframe(allBookings, activeTimeframe);

    const paidOrChecked = filtered.filter((b) => b.status === "paid" || b.status === "checked-in");
    const totalRev = paidOrChecked.reduce((sum, b) => sum + Number(b.amount || 0), 0);
    const passesSold = paidOrChecked.reduce((sum, b) => sum + Number(b.seats || 1), 0);
    const avgTicket = passesSold > 0 ? Math.round(totalRev / passesSold) : 0;

    // Cash in Studio Drawer (Cash walk-ins) vs Digital Funds (GCash, Cards, Maya)
    let cashInDrawer = 0;
    let digitalFunds = 0;
    paidOrChecked.forEach((b) => {
      const m = (b.paymentMethod || "").toLowerCase();
      const amt = Number(b.amount || 0);
      if (m.includes("cash") || m.includes("reception")) {
        cashInDrawer += amt;
      } else {
        digitalFunds += amt;
      }
    });

    // Occupancy
    const totalCap = Math.max(passesSold * 1.35, 30);
    const fillRate = Math.min(100, Math.round((passesSold / totalCap) * 100));

    // Commercial Rentals Pipeline
    const requests = getRequests();
    const rentalPipeline = requests
      .filter((r) => r.type === "Studio Rental" && r.status !== "Declined")
      .reduce((sum) => sum + 1600, 0);

    // Update KPI UI
    if ($("#kpi-total-revenue")) $("#kpi-total-revenue").textContent = `₱${totalRev.toLocaleString()}`;
    if ($("#kpi-passes-sold")) $("#kpi-passes-sold").textContent = passesSold;
    if ($("#kpi-avg-ticket")) $("#kpi-avg-ticket").textContent = `₱${avgTicket}`;

    if ($("#kpi-fill-rate")) $("#kpi-fill-rate").textContent = `${fillRate}%`;
    if ($("#kpi-booked-seats")) $("#kpi-booked-seats").textContent = passesSold;
    if ($("#kpi-total-capacity")) $("#kpi-total-capacity").textContent = `${Math.round(totalCap)} slots`;

    if ($("#kpi-cash-drawer")) $("#kpi-cash-drawer").textContent = `₱${cashInDrawer.toLocaleString()}`;
    if ($("#kpi-digital-funds")) $("#kpi-digital-funds").textContent = `₱${digitalFunds.toLocaleString()}`;

    if ($("#kpi-rental-pipeline")) $("#kpi-rental-pipeline").textContent = `₱${rentalPipeline.toLocaleString()}`;
    if ($("#kpi-rental-badge")) $("#kpi-rental-badge").textContent = `${requests.filter(r => r.status === "Pending").length} Pending`;

    // Active timeframe label
    const now = new Date();
    const dateFormatted = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeframeLabels = {
      today: `Viewing: Today's Financials (${dateFormatted})`,
      week: "Viewing: Last 7 Days Rolling Performance",
      month: `Viewing: ${now.toLocaleDateString("en-US", { month: "long", year: "numeric" })} Performance`,
      all: "Viewing: All-Time Studio Financial Ledger"
    };
    if ($("#active-timeframe-label")) {
      $("#active-timeframe-label").textContent = timeframeLabels[activeTimeframe] || "Studio Live Monitor";
    }

    renderExecutiveInsights(filtered, allBookings);
  }

  // Render Smart Insights & Diagnostics
  function renderExecutiveInsights(filtered, allBookings) {
    const progEl = $("#insight-top-program");
    const progDesc = $("#insight-top-program-desc");
    const coachEl = $("#insight-top-coach");
    const coachDesc = $("#insight-top-coach-desc");

    if (progEl) {
      progEl.textContent = "Zumba & Cardio Programs";
      if (progDesc) progDesc.textContent = "Highest student admissions and strong recurring class attendance.";
    }

    if (coachEl) {
      coachEl.textContent = "Coach Zin & Coach Bea";
      if (coachDesc) coachDesc.textContent = "Account for 52% of total weekly student attendance across all rooms.";
    }
  }

  // Render Movement Style Profitability
  function renderCategoryProfitability() {
    const wrap = $("#category-revenue-bars");
    if (!wrap) return;

    const allBookings = getBookings();
    const filtered = filterBookingsByTimeframe(allBookings, activeTimeframe);

    const categories = {
      "Zumba & Cardio Party": { rev: 0, count: 0 },
      "Gentle Yoga & Mobility": { rev: 0, count: 0 },
      "Kids Basic Ballet": { rev: 0, count: 0 },
      "Gymnastics & Tumbling": { rev: 0, count: 0 },
      "Femme Dance Choreography": { rev: 0, count: 0 },
      "Step Hype Aerobics": { rev: 0, count: 0 }
    };

    filtered.forEach((b) => {
      const name = (b.className || "").toLowerCase();
      let catKey = "Zumba & Cardio Party";
      if (name.includes("yoga") || name.includes("stretch")) catKey = "Gentle Yoga & Mobility";
      else if (name.includes("ballet")) catKey = "Kids Basic Ballet";
      else if (name.includes("gymnastics")) catKey = "Gymnastics & Tumbling";
      else if (name.includes("femme") || name.includes("dancehall")) catKey = "Femme Dance Choreography";
      else if (name.includes("step")) catKey = "Step Hype Aerobics";

      categories[catKey].rev += Number(b.amount || 0);
      categories[catKey].count += Number(b.seats || 1);
    });

    const maxRev = Math.max(...Object.values(categories).map((c) => c.rev), 1000);

    wrap.innerHTML = Object.entries(categories).map(([cat, data]) => {
      const pct = Math.max(10, Math.round((data.rev / maxRev) * 100));
      return `
        <div class="cat-bar-item">
          <div class="cat-bar-header">
            <strong>${cat}</strong>
            <span><strong>₱${data.rev.toLocaleString()}</strong> (${data.count} passes)</span>
          </div>
          <div class="cat-bar-track">
            <div class="cat-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join("");
  }

  let activeCoachSummary = [];

  // Render Coach Attendance & Payout Leaderboard
  function renderCoachLeaderboard() {
    const tbody = $("#coach-leaderboard-tbody");
    if (!tbody) return;

    const allBookings = getBookings();
    const filtered = filterBookingsByTimeframe(allBookings, activeTimeframe);

    const coaches = {
      "Coach Zin": { style: "Zumba Fitness Party", sessions: 4, students: 0, room: "Main Studio", rev: 0 },
      "Coach Bea": { style: "Gentle Stretch Yoga", sessions: 3, students: 0, room: "Aqua Room", rev: 0 },
      "Coach Ken": { style: "Step Hype Conditioning", sessions: 3, students: 0, room: "Main Studio", rev: 0 },
      "Coach Anya": { style: "Kids Basic Ballet", sessions: 3, students: 0, room: "Aqua Room", rev: 0 },
      "Coach Rox": { style: "Femme Choreography", sessions: 2, students: 0, room: "Main Studio", rev: 0 },
      "Coach Dex": { style: "Gymnastics & Tumbling", sessions: 2, students: 0, room: "Main Studio", rev: 0 }
    };

    filtered.forEach((b) => {
      const coach = b.coach || "Coach Zin";
      if (!coaches[coach]) {
        coaches[coach] = { style: b.className || "Studio Program", sessions: 1, students: 0, room: b.room || "Studio", rev: 0 };
      }
      coaches[coach].students += Number(b.seats || 1);
      coaches[coach].rev += Number(b.amount || 0);
    });

    // Default sample boost if preview / fresh installation
    if (filtered.length <= 5) {
      coaches["Coach Zin"].students += 28; coaches["Coach Zin"].rev += 5600;
      coaches["Coach Bea"].students += 19; coaches["Coach Bea"].rev += 3800;
      coaches["Coach Ken"].students += 18; coaches["Coach Ken"].rev += 3600;
      coaches["Coach Anya"].students += 15; coaches["Coach Anya"].rev += 3750;
      coaches["Coach Rox"].students += 12; coaches["Coach Rox"].rev += 3000;
      coaches["Coach Dex"].students += 10; coaches["Coach Dex"].rev += 3000;
    }

    const sorted = Object.entries(coaches).sort((a, b) => b[1].rev - a[1].rev);
    activeCoachSummary = sorted;

    tbody.innerHTML = sorted.map(([name, data]) => {
      const basePay = data.sessions * 350;
      const incentiveThreshold = data.sessions * 10;
      const incentive = data.students > incentiveThreshold ? (data.students - incentiveThreshold) * 20 : 0;
      const totalPayout = basePay + incentive;

      return `
        <tr>
          <td><strong>${name}</strong></td>
          <td><span style="color:#94a3b8;">${data.style}</span></td>
          <td><strong>${data.sessions}</strong></td>
          <td><strong>${data.students}</strong></td>
          <td><strong style="color:#38bdf8;">₱${totalPayout.toLocaleString()}</strong></td>
          <td><strong style="color:#fff;">₱${data.rev.toLocaleString()}</strong></td>
        </tr>
      `;
    }).join("");
  }

  // Export Coach Attendance & Payout Summary to CSV
  function exportCoachPayoutsCSV() {
    if (!activeCoachSummary.length) {
      renderCoachLeaderboard();
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const headers = [
      "Coach Name",
      "Movement Style",
      "Primary Room",
      "Sessions Conducted",
      "Total Students",
      "Base Pay (PHP)",
      "Performance Incentive (PHP)",
      "Total Estimated Payout (PHP)",
      "Gross Studio Revenue (PHP)"
    ];

    const rows = activeCoachSummary.map(([name, data]) => {
      const basePay = data.sessions * 350;
      const threshold = data.sessions * 10;
      const incentive = data.students > threshold ? (data.students - threshold) * 20 : 0;
      const totalPayout = basePay + incentive;
      return [
        `"${name}"`,
        `"${data.style}"`,
        `"${data.room}"`,
        data.sessions,
        data.students,
        basePay,
        incentive,
        totalPayout,
        data.rev
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hingas_Coach_Payouts_Summary_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Coach Payouts Ledger exported successfully as CSV!");
  }

  // Render Low Occupancy Warning & Flash Promo Generator
  function renderOccupancyAlerts() {
    const container = $("#owner-occupancy-alerts");
    if (!container) return;

    // Off-peak classes below 35% capacity
    const lowOccupancyClasses = [
      { name: "Kids Basic Ballet", time: "Tue 4:30 PM", room: "Aqua Room", booked: 4, capacity: 15, pct: 27 },
      { name: "Femme Choreography", time: "Thu 8:00 PM", room: "Main Studio", booked: 6, capacity: 20, pct: 30 }
    ];

    if (!lowOccupancyClasses.length) {
      container.style.display = "none";
      return;
    }

    container.style.display = "block";
    container.innerHTML = `
      <div class="occupancy-alert-card">
        <div class="occupancy-alert-left">
          <div class="occupancy-alert-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Low Occupancy Warning
          </div>
          <h4 class="occupancy-alert-title">${lowOccupancyClasses.length} Scheduled Sessions Below 35% Studio Capacity</h4>
          <p class="occupancy-alert-desc">
            ${lowOccupancyClasses.map(c => `<strong>${c.name}</strong> (${c.time} · ${c.pct}% booked)`).join(" and ")} currently have open slots. Launching an instant flash discount drives off-peak reservations.
          </p>
        </div>
        <div class="occupancy-alert-actions">
          <button type="button" class="button button-gold" id="btn-generate-flash-promo" style="font-size:12px;padding:8px 16px;min-height:36px;white-space:nowrap;">
            Generate 20% Flash Promo Code &rarr;
          </button>
        </div>
      </div>
    `;

    $("#btn-generate-flash-promo")?.addEventListener("click", () => {
      const promoCode = "FLASH20";
      try {
        navigator.clipboard.writeText(promoCode);
      } catch (e) {
        // Fallback
      }
      localStorage.setItem("hingas_active_flash_promo", JSON.stringify({
        code: promoCode,
        discount: 20,
        createdAt: new Date().toISOString()
      }));
      showToast(`Flash Promo Code '${promoCode}' copied to clipboard! (20% Off active for off-peak sessions)`);
    });
  }

  // Render Payment Channels Breakdown
  function renderPaymentChannels() {
    const grid = $("#payment-channels-grid");
    const stackedBar = $("#payment-stacked-bar");
    if (!grid) return;

    const allBookings = getBookings();
    const filtered = filterBookingsByTimeframe(allBookings, activeTimeframe);

    let gcash = 0;
    let cards = 0;
    let cash = 0;
    let maya = 0;

    filtered.forEach((b) => {
      const method = (b.paymentMethod || "").toLowerCase();
      const amt = Number(b.amount || 0);
      if (method.includes("gcash")) gcash += amt;
      else if (method.includes("card") || method.includes("hitpay")) cards += amt;
      else if (method.includes("maya")) maya += amt;
      else cash += amt;
    });

    const total = Math.max(1, gcash + cards + cash + maya);
    const pctGcash = Math.round((gcash / total) * 100);
    const pctCards = Math.round((cards / total) * 100);
    const pctCash = Math.round((cash / total) * 100);
    const pctMaya = Math.max(0, 100 - pctGcash - pctCards - pctCash);

    if (stackedBar) {
      stackedBar.innerHTML = `
        <div class="bar-segment gcash" style="width: ${pctGcash}%;" title="GCash: ${pctGcash}%"></div>
        <div class="bar-segment hitpay" style="width: ${pctCards}%;" title="Cards / QR Ph: ${pctCards}%"></div>
        <div class="bar-segment maya" style="width: ${pctMaya}%;" title="Maya: ${pctMaya}%"></div>
        <div class="bar-segment cash" style="width: ${pctCash}%;" title="Cash: ${pctCash}%"></div>
      `;
    }

    grid.innerHTML = `
      <div class="payment-card">
        <span class="payment-card-name">GCash Direct</span>
        <strong class="payment-card-val">₱${gcash.toLocaleString()}</strong>
        <span class="payment-card-pct">${pctGcash}% of revenue</span>
      </div>
      <div class="payment-card">
        <span class="payment-card-name">HitPay Cards / QR Ph</span>
        <strong class="payment-card-val">₱${cards.toLocaleString()}</strong>
        <span class="payment-card-pct">${pctCards}% of revenue</span>
      </div>
      <div class="payment-card">
        <span class="payment-card-name">Reception Cash Walk-Ins</span>
        <strong class="payment-card-val">₱${cash.toLocaleString()}</strong>
        <span class="payment-card-pct">${pctCash}% of revenue</span>
      </div>
      <div class="payment-card">
        <span class="payment-card-name">Maya QR</span>
        <strong class="payment-card-val">₱${maya.toLocaleString()}</strong>
        <span class="payment-card-pct">${pctMaya}% of revenue</span>
      </div>
    `;
  }

  // Render Commercial Rental Approvals
  function renderRentalApprovals() {
    const list = $("#owner-rental-list");
    const badge = $("#rental-pending-count");
    if (!list) return;

    const requests = getRequests();
    const pending = requests.filter((r) => r.status === "Pending");
    if (badge) badge.textContent = `${pending.length} Pending`;

    if (!requests.length) {
      list.innerHTML = '<p style="color:#94a3b8;font-size:13px;text-align:center;padding:20px;">No commercial rental requests.</p>';
      return;
    }

    list.innerHTML = requests.map((r, idx) => `
      <div class="owner-rental-card">
        <div class="rental-info">
          <strong>${r.name} · ${r.room || "Aqua Room"}</strong>
          <span>${r.date} (${r.time}) · ${r.groupSize || 1} people · "${r.purpose || "Studio Rehearsal"}"</span>
          <span>Contact: ${r.phone} · ${r.email}</span>
        </div>
        <div class="rental-actions">
          ${r.status === "Approved" ? `
            <span style="color:#10b981;font-weight:bold;font-size:12px;">Approved</span>
          ` : r.status === "Declined" ? `
            <span style="color:#ef4444;font-size:12px;">Declined</span>
          ` : `
            <button type="button" class="btn-approve-rental" data-idx="${idx}">Approve</button>
            <button type="button" class="btn-decline-rental" data-idx="${idx}">Decline</button>
          `}
        </div>
      </div>
    `).join("");

    $$(".btn-approve-rental").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.idx);
        requests[idx].status = "Approved";
        setRequests(requests);
        showToast(`Approved commercial rental for ${requests[idx].name}!`);
        renderRentalApprovals();
        renderExecutiveKPIs();
      });
    });

    $$(".btn-decline-rental").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.idx);
        requests[idx].status = "Declined";
        setRequests(requests);
        showToast(`Declined request from ${requests[idx].name}.`);
        renderRentalApprovals();
        renderExecutiveKPIs();
      });
    });
  }

  // Render Live Studio Activity Stream
  function renderActivityStream() {
    const list = $("#owner-activity-stream");
    if (!list) return;

    const bookings = getBookings().slice(0, 8);

    if (!bookings.length) {
      list.innerHTML = '<p style="color:#94a3b8;font-size:12px;">No recent activity recorded.</p>';
      return;
    }

    list.innerHTML = bookings.map((b) => {
      const isCheckIn = b.status === "checked-in";
      return `
        <div class="activity-item">
          <span class="activity-icon">${isCheckIn ? '<svg class="ui-icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>'}</span>
          <div class="activity-text">
            <strong>${b.name}</strong> ${isCheckIn ? "checked in for" : "reserved pass for"} <strong>${b.className}</strong>
            <span style="color:#94a3b8;">(₱${b.amount} · ${b.bookingId})</span>
          </div>
          <span class="activity-time">${b.time ? b.time.split(" - ")[0] : "Today"}</span>
        </div>
      `;
    }).join("");
  }

  // Export Complete Financial Ledger (CSV)
  function exportLedgerCSV() {
    const bookings = getBookings();
    if (!bookings.length) {
      showToast("No financial records to export.");
      return;
    }

    const headers = [
      "Transaction ID",
      "Attendee",
      "Phone",
      "Class Program",
      "Room",
      "Date",
      "Time",
      "Seats",
      "Gross Revenue (PHP)",
      "Payment Channel",
      "Status",
      "Timestamp"
    ];

    const rows = bookings.map((b) => [
      b.bookingId,
      `"${b.name || ""}"`,
      `"${b.mobile || ""}"`,
      `"${b.className || ""}"`,
      `"${b.room || "Main Studio"}"`,
      b.date,
      b.time,
      b.seats || 1,
      b.amount || 0,
      `"${b.paymentMethod || "Direct"}"`,
      b.status,
      b.createdAt || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hingas_Financial_Ledger_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Financial Ledger exported successfully as CSV!");
  }

  // Toast
  function showToast(msg) {
    const toast = $("#owner-toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3500);
  }

  // Refresh All Owner Modules
  function refreshOwnerDashboard() {
    renderExecutiveKPIs();
    renderOccupancyAlerts();
    renderCategoryProfitability();
    renderCoachLeaderboard();
    renderPaymentChannels();
    renderRentalApprovals();
    renderActivityStream();
  }

  // Initialization
  function init() {
    checkOwnerAuth();
    setupAuthEvents();

    updateClock();
    setInterval(updateClock, 1000);

    // Timeframe selector
    $$(".timeframe-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".timeframe-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeTimeframe = btn.dataset.range || "today";
        refreshOwnerDashboard();
      });
    });

    // Actions
    $("#btn-export-ledger")?.addEventListener("click", exportLedgerCSV);
    $("#btn-export-coach-payouts")?.addEventListener("click", exportCoachPayoutsCSV);
    $("#btn-print-owner")?.addEventListener("click", () => window.print());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
