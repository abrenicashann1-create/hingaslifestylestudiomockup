/**
 * Hingas Lifestyle Studio — Studio Management Dashboard Logic
 */

(function () {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const DEFAULT_PIN = "hingas2026";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function formatKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const todayStr = formatKey(today);

  // Initial Sample Seed Bookings if empty
  function initSeedData() {
    const existing = localStorage.getItem("hingas_studio_bookings");
    if (!existing || existing === "[]") {
      const sampleBookings = [
        {
          bookingId: "HG-7A9B1C",
          sessionId: `sess-${todayStr}-zumba-1`,
          className: "Zumba Fitness Party",
          date: todayStr,
          time: "17:30 - 18:30",
          coach: "Coach Zin",
          room: "Main Studio",
          name: "Maria Santos",
          mobile: "0917 555 1234",
          email: "maria.santos@gmail.com",
          seats: 1,
          amount: 200,
          status: "checked-in",
          paymentMethod: "GCash Direct",
          createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
        },
        {
          bookingId: "HG-8B2C4D",
          sessionId: `sess-${todayStr}-yoga-1`,
          className: "Gentle Stretch & Mobility",
          date: todayStr,
          time: "08:00 - 09:00",
          coach: "Coach Bea",
          room: "Aqua Room",
          name: "Carlos Reyes",
          mobile: "0928 444 8899",
          email: "carlos.r@yahoo.com",
          seats: 2,
          amount: 400,
          status: "checked-in",
          paymentMethod: "Credit Card (HitPay)",
          createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
        },
        {
          bookingId: "HG-3C8E9F",
          sessionId: `sess-${todayStr}-zumba-1`,
          className: "Zumba Fitness Party",
          date: todayStr,
          time: "17:30 - 18:30",
          coach: "Coach Zin",
          room: "Main Studio",
          name: "Jasmine Tan",
          mobile: "0908 777 2211",
          email: "jasmine.tan@outlook.com",
          seats: 1,
          amount: 200,
          status: "paid",
          paymentMethod: "GCash Direct",
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
        },
        {
          bookingId: "HG-9D4F2A",
          sessionId: `sess-${todayStr}-gymnastics-1`,
          className: "Gymnastics & Tumbling",
          date: todayStr,
          time: "14:00 - 15:30",
          coach: "Coach Dex",
          room: "Main Studio",
          name: "Andrea Ramos",
          mobile: "0918 333 7744",
          email: "andrea.ramos@gmail.com",
          seats: 1,
          amount: 300,
          status: "checked-in",
          paymentMethod: "Complimentary Pass",
          createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
        },
        {
          bookingId: "HG-5E1A7C",
          sessionId: `sess-${todayStr}-femme-dance-1`,
          className: "Femme Dance Choreography",
          date: todayStr,
          time: "19:00 - 20:15",
          coach: "Coach Ella",
          room: "Aqua Room",
          name: "Patricia Lee",
          mobile: "0927 888 1122",
          email: "patricia.lee@gmail.com",
          seats: 2,
          amount: 600,
          status: "paid",
          paymentMethod: "Maya QR",
          createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
        }
      ];
      localStorage.setItem("hingas_studio_bookings", JSON.stringify(sampleBookings));
    }

    // Sample Inquiries if empty
    const existingReq = localStorage.getItem("hingas_studio_requests");
    if (!existingReq || existingReq === "[]") {
      const sampleRequests = [
        {
          id: "REQ-01",
          type: "Studio Rental",
          room: "Aqua Room",
          name: "Surigao Dance Troupe",
          phone: "0917 888 3322",
          email: "dance@surigao.ph",
          date: todayStr,
          time: "20:30 - 22:30",
          groupSize: 16,
          purpose: "Rehearsal for City Fiesta Dance Competition",
          status: "Pending"
        },
        {
          id: "REQ-02",
          type: "Monthly Package",
          room: "Main Studio",
          name: "Kenneth Gomez",
          phone: "0922 444 9911",
          email: "kenneth.g@gmail.com",
          date: todayStr,
          time: "Flexible",
          groupSize: 1,
          purpose: "Inquiring about 12-session Unlimited Zumba & Yoga package",
          status: "Contacted"
        }
      ];
      localStorage.setItem("hingas_studio_requests", JSON.stringify(sampleRequests));
    }
  }

  // Storage Getters & Setters
  function getBookings() {
    try {
      return JSON.parse(localStorage.getItem("hingas_studio_bookings") || "[]");
    } catch (e) {
      return [];
    }
  }

  function setBookings(bookings) {
    localStorage.setItem("hingas_studio_bookings", JSON.stringify(bookings));
  }

  function getRequests() {
    try {
      return JSON.parse(localStorage.getItem("hingas_studio_requests") || "[]");
    } catch (e) {
      return [];
    }
  }

  // Staff Authentication & Profile Management
  function getInitials(name) {
    if (!name) return "ST";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  function updateStaffTopbar(staff) {
    if (!staff) return;
    const avatar = $("#dash-staff-avatar");
    const nameEl = $("#dash-staff-name");
    const roleEl = $("#dash-staff-role");

    if (avatar) {
      avatar.textContent = getInitials(staff.fullName);
      if (staff.avatarColor) avatar.style.background = staff.avatarColor;
    }
    if (nameEl) nameEl.textContent = staff.fullName || "Staff Member";
    if (roleEl) roleEl.textContent = staff.roleLabel || staff.role || "Receptionist";
  }

  function checkAuth() {
    const auth = window.HingasStaffAuth;
    const staff = auth ? auth.getCurrentStaff() : null;

    if (staff) {
      $("#pin-gate").style.display = "none";
      $("#dashboard-app").style.display = "block";
      updateStaffTopbar(staff);
      refreshDashboard();
    } else {
      $("#pin-gate").style.display = "flex";
      $("#dashboard-app").style.display = "none";
    }
  }

  function setupAuthEvents() {
    const auth = window.HingasStaffAuth;

    const tabLogin = $("#tab-btn-login");
    const tabRegister = $("#tab-btn-register");
    const formLogin = $("#staff-login-form");
    const formRegister = $("#staff-register-form");

    function switchAuthTab(target) {
      if (target === "register") {
        tabRegister?.classList.add("active");
        tabLogin?.classList.remove("active");
        if (formRegister) formRegister.style.display = "block";
        if (formLogin) formLogin.style.display = "none";
      } else {
        tabLogin?.classList.add("active");
        tabRegister?.classList.remove("active");
        if (formLogin) formLogin.style.display = "block";
        if (formRegister) formRegister.style.display = "none";
      }
    }

    tabLogin?.addEventListener("click", () => switchAuthTab("login"));
    tabRegister?.addEventListener("click", () => switchAuthTab("register"));

    $("#btn-open-add-staff")?.addEventListener("click", () => {
      $("#pin-gate").style.display = "flex";
      $("#dashboard-app").style.display = "none";
      switchAuthTab("register");
    });

    // Password visibility toggle
    $(".auth-pw-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        if (!input) return;
        const isPw = input.type === "password";
        input.type = isPw ? "text" : "password";
        btn.innerHTML = isPw ? '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>' : '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
      });
    });

    // Quick Credential Chips for seamless testing
    $(".cred-chip").forEach((chip) => {
      chip.addEventListener("click", async () => {
        const email = chip.dataset.email;
        const pass = chip.dataset.pass;
        if ($("#login-email")) $("#login-email").value = email;
        if ($("#login-password")) $("#login-password").value = pass;

        if (auth) {
          const res = await auth.login(email, pass, true);
          if (res.success) {
            showToast("Signed in as " + res.staff.fullName + " (" + res.staff.roleLabel + ")");
            checkAuth();
          } else {
            showToast(res.message);
          }
        }
      });
    });

    // Handle Login Submit
    formLogin?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const feedback = $("#login-feedback");
      const email = ($("#login-email")?.value || "").trim();
      const password = ($("#login-password")?.value || "").trim();
      const remember = $("#login-remember")?.checked || false;

      if (feedback) {
        feedback.style.display = "none";
        feedback.className = "auth-alert";
      }

      if (auth) {
        const res = await auth.login(email, password, remember);
        if (res.success) {
          showToast("Welcome back, " + res.staff.fullName + "!");
          checkAuth();
        } else {
          if (feedback) {
            feedback.textContent = res.message || "Invalid credentials. Please try again.";
            feedback.className = "auth-alert error";
            feedback.style.display = "block";
          }
        }
      }
    });

    // Handle Registration Submit
    formRegister?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const feedback = $("#register-feedback");
      const fullName = ($("#reg-name")?.value || "").trim();
      const email = ($("#reg-email")?.value || "").trim();
      const phone = ($("#reg-phone")?.value || "").trim();
      const role = ($("#reg-role")?.value || "receptionist").trim();
      const password = ($("#reg-password")?.value || "").trim();
      const confirmPass = ($("#reg-confirm")?.value || "").trim();
      const authKey = ($("#reg-authcode")?.value || "").trim();

      if (feedback) {
        feedback.style.display = "none";
        feedback.className = "auth-alert";
      }

      if (password !== confirmPass) {
        if (feedback) {
          feedback.textContent = "Passwords do not match. Please re-enter.";
          feedback.className = "auth-alert error";
          feedback.style.display = "block";
        }
        return;
      }

      if (auth) {
        const res = await auth.register({ fullName, email, phone, role, password, authKey });
        if (res.success) {
          await auth.login(email, password, true);
          showToast("Staff account registered! Welcome to the team, " + fullName + ".");
          checkAuth();
        } else {
          if (feedback) {
            feedback.textContent = res.message;
            feedback.className = "auth-alert error";
            feedback.style.display = "block";
          }
        }
      }
    });

    // Sign Out Button
    $("#btn-staff-signout")?.addEventListener("click", () => {
      if (confirm("Sign out of the staff terminal?")) {
        auth?.logout();
        location.reload();
      }
    });
  }

  // Render Staff Directory Table in Tab 5
  function renderStaffTable() {
    const tbody = $("#staff-table-body");
    if (!tbody || !window.HingasStaffAuth) return;

    const staffList = window.HingasStaffAuth.listStaff();
    if (staffList.length === 0) {
      tbody.innerHTML = "<tr><td colspan=\"7\" style=\"text-align:center;color:var(--dash-muted);padding:24px;\">No staff records found.</td></tr>";
      return;
    }

    const roleBadgeClasses = {
      manager: "paid",
      coach: "checked-in",
      receptionist: "held"
    };

    tbody.innerHTML = staffList.map((s) => {
      const initials = getInitials(s.fullName);
      const roleClass = roleBadgeClasses[s.role] || "paid";
      const lastLoginStr = s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never";
      return `
        <tr>
          <td><code style="color:var(--gold,#f4d35e);font-weight:700;">${s.staffCode || "STF-00" + s.id}</code></td>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="width:28px;height:28px;border-radius:50%;background:${s.avatarColor || "#00b4d8"};color:#0b1320;font-weight:800;font-size:11px;display:flex;align-items:center;justify-content:center;">
                ${initials}
              </span>
              <div>
                <strong style="color:#fff;display:block;">${s.fullName}</strong>
              </div>
            </div>
          </td>
          <td><span style="color:#94a3b8;font-size:12px;">${s.email}</span></td>
          <td><span style="color:#cbd5e1;font-size:12px;">${s.phone || "—"}</span></td>
          <td><span class="table-badge ${roleClass}">${s.roleLabel || s.role}</span></td>
          <td><span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#10b981;"><span class="status-dot"></span> Active</span></td>
          <td><span style="font-size:11px;color:var(--dash-muted);">${lastLoginStr}</span></td>
        </tr>
      `;
    }).join("");
  }

  // Live Clock
  function updateLiveClock() {
    const el = $("#dash-live-clock");
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
      " · " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  // KPI Calculations
  function calculateKPIs() {
    const bookings = getBookings();
    const todayBookings = bookings.filter((b) => b.date === todayStr);

    const totalSeatsToday = todayBookings.reduce((sum, b) => sum + Number(b.seats || 1), 0);
    const checkedInToday = todayBookings.filter((b) => b.status === "checked-in");
    const checkinRate = todayBookings.length ? Math.round((checkedInToday.length / todayBookings.length) * 100) : 0;

    const todayRev = todayBookings
      .filter((b) => b.status === "paid" || b.status === "checked-in")
      .reduce((sum, b) => sum + Number(b.amount || 0), 0);

    const monthRev = bookings
      .filter((b) => b.status === "paid" || b.status === "checked-in")
      .reduce((sum, b) => sum + Number(b.amount || 0), 0);

    // Update KPI elements
    if ($("#kpi-today-bookings")) $("#kpi-today-bookings").textContent = todayBookings.length;
    if ($("#kpi-today-seats")) $("#kpi-today-seats").textContent = `${totalSeatsToday} seats reserved`;
    if ($("#kpi-checkin-rate")) $("#kpi-checkin-rate").textContent = `${checkinRate}%`;
    if ($("#kpi-checkin-count")) $("#kpi-checkin-count").textContent = `${checkedInToday.length} of ${todayBookings.length} checked in`;
    if ($("#kpi-today-revenue")) $("#kpi-today-revenue").textContent = `₱${todayRev.toLocaleString()}`;
    if ($("#kpi-month-revenue")) $("#kpi-month-revenue").textContent = `Month: ₱${monthRev.toLocaleString()}`;

    // Distinct sessions today
    const sessionsToday = new Set(todayBookings.map((b) => b.className));
    if ($("#kpi-active-sessions")) $("#kpi-active-sessions").textContent = sessionsToday.size || 4;
  }

  // Roster Rendering & Filtering
  function renderRoster() {
    const tbody = $("#roster-tbody");
    const emptyState = $("#roster-empty");
    if (!tbody) return;

    let bookings = getBookings();
    const searchQuery = ($("#roster-search-input")?.value || "").toLowerCase().trim();
    const classFilter = $("#filter-roster-class")?.value || "all";
    const statusFilter = $("#filter-roster-status")?.value || "all";

    // Populate class filter dropdown options dynamically
    const classSelect = $("#filter-roster-class");
    if (classSelect && classSelect.options.length <= 1) {
      const uniqueClasses = Array.from(new Set(bookings.map((b) => b.className).filter(Boolean)));
      uniqueClasses.forEach((cls) => {
        const opt = document.createElement("option");
        opt.value = cls;
        opt.textContent = cls;
        classSelect.appendChild(opt);
      });
    }

    if (searchQuery) {
      bookings = bookings.filter((b) =>
        (b.name && b.name.toLowerCase().includes(searchQuery)) ||
        (b.bookingId && b.bookingId.toLowerCase().includes(searchQuery)) ||
        (b.mobile && b.mobile.toLowerCase().includes(searchQuery)) ||
        (b.className && b.className.toLowerCase().includes(searchQuery))
      );
    }

    if (classFilter !== "all") {
      bookings = bookings.filter((b) => b.className === classFilter);
    }

    if (statusFilter !== "all") {
      bookings = bookings.filter((b) => b.status === statusFilter);
    }

    if (!bookings.length) {
      tbody.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    tbody.innerHTML = bookings.map((b) => {
      const isCheckedIn = b.status === "checked-in";
      return `
        <tr>
          <td><strong style="color:#38bdf8;font-family:monospace;">${b.bookingId}</strong></td>
          <td>
            <strong>${b.name}</strong>
            ${b.paymentMethod ? `<small style="display:block;color:#64748b;font-size:11px;">${b.paymentMethod}</small>` : ""}
          </td>
          <td>
            <span>${b.mobile || "—"}</span>
            <small style="display:block;color:#64748b;font-size:11px;">${b.email || ""}</small>
          </td>
          <td>
            <strong>${b.className}</strong>
            <small style="display:block;color:#94a3b8;font-size:11px;">${b.date} · ${b.time} (${b.room || "Main Studio"})</small>
          </td>
          <td><strong>${b.seats || 1}</strong></td>
          <td><strong>₱${b.amount || 0}</strong></td>
          <td>
            <span class="table-badge ${isCheckedIn ? "checked-in" : "paid"}">
              ${isCheckedIn ? "Checked In" : "Confirmed"}
            </span>
          </td>
          <td>
            <div class="roster-actions-cell">
              <button type="button" class="checkin-action-btn ${isCheckedIn ? "is-checked" : "not-checked"}" data-booking-id="${b.bookingId}">
                ${isCheckedIn ? "Checked" : "Check In"}
              </button>
              <button type="button" class="roster-sms-btn" data-booking-id="${b.bookingId}" title="Send SMS schedule reminder">
                SMS
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    // Wire up Check-in toggles
    $$(".checkin-action-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const bid = btn.dataset.bookingId;
        toggleCheckIn(bid);
      });
    });

    // Wire up SMS Reminders
    $$(".roster-sms-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const bid = btn.dataset.bookingId;
        openSMSModal(bid);
      });
    });
  }

  function toggleCheckIn(bookingId) {
    const bookings = getBookings();
    const item = bookings.find((b) => b.bookingId === bookingId);
    if (!item) return;

    if (item.status === "checked-in") {
      item.status = "paid";
      showToast(`Marked ${item.name} as pending check-in.`);
    } else {
      item.status = "checked-in";
      item.checkedInAt = new Date().toISOString();
      showToast(`Checked in: ${item.name} (${item.className})`);
    }

    setBookings(bookings);
    calculateKPIs();
    renderRoster();
  }

  // Fast QR Scanner / Validator
  function setupQRValidator() {
    const input = $("#scanner-input");
    const btn = $("#btn-verify-ticket");
    const resultBox = $("#scanner-result");

    function verify() {
      const code = (input?.value || "").trim().toUpperCase();
      if (!code) return;

      const bookings = getBookings();
      const match = bookings.find((b) => b.bookingId === code || (b.mobile && b.mobile.includes(code)));

      if (resultBox) resultBox.style.display = "block";

      if (!match) {
        if (resultBox) {
          resultBox.innerHTML = `
            <div style="color:#ef4444;text-align:center;">
              <span class="scanner-status-icon error"><svg class="ui-icon" style="width:36px;height:36px;color:#ef4444;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></span>
              <h4>Invalid Ticket Reference</h4>
              <p>No active booking found matching "${code}". Please verify the customer's voucher.</p>
            </div>
          `;
        }
        return;
      }

      const isChecked = match.status === "checked-in";
      if (resultBox) {
        resultBox.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
            <div>
              <span style="color:#10b981;font-weight:bold;font-size:12px;letter-spacing:1px;text-transform:uppercase;">
                VERIFIED STUDIO PASS
              </span>
              <h3 style="margin:4px 0 6px;color:#fff;font-size:20px;">${match.name}</h3>
              <p style="margin:0 0 6px;color:#94a3b8;font-size:13px;">
                <strong>${match.className}</strong> · ${match.date} at ${match.time}
              </p>
              <p style="margin:0;color:#64748b;font-size:12px;">
                Ref: <b style="color:#38bdf8;">${match.bookingId}</b> · ${match.seats} Pass(es) · ₱${match.amount} Paid (${match.paymentMethod || "Direct"})
              </p>
            </div>
            <div>
              <button type="button" class="button ${isChecked ? "button-glass" : "button-gold"}" id="btn-scanner-checkin" style="min-height:42px;">
                ${isChecked ? "Already Checked In" : "Check In Attendee Now"}
              </button>
            </div>
          </div>
        `;

        $("#btn-scanner-checkin")?.addEventListener("click", () => {
          toggleCheckIn(match.bookingId);
          verify();
        });
      }
    }

    btn?.addEventListener("click", verify);
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") verify();
    });
  }

  // Walk-In Student Modal
  function setupWalkInModal() {
    const modal = $("#walkin-modal");
    const openBtn = $("#btn-open-walkin");
    const closeBtn = $("#close-walkin-modal");
    const form = $("#walkin-form");
    const sessionSelect = $("#walkin-session-select");
    const feeDisplay = $("#walkin-total-fee");
    const seatsInput = $("#walkin-seats");

    const sampleTodaySessions = [
      { id: `sess-${todayStr}-zumba-1`, name: "Zumba Fitness Party (17:30 - 18:30) · Main Studio", price: 200 },
      { id: `sess-${todayStr}-yoga-1`, name: "Gentle Stretch & Mobility (08:00 - 09:00) · Aqua Room", price: 200 },
      { id: `sess-${todayStr}-gymnastics-1`, name: "Gymnastics & Tumbling (14:00 - 15:30) · Main Studio", price: 300 },
      { id: `sess-${todayStr}-femme-dance-1`, name: "Femme Dance Choreography (19:00 - 20:15) · Aqua Room", price: 300 }
    ];

    function updateFee() {
      const idx = sessionSelect?.selectedIndex || 0;
      const sess = sampleTodaySessions[idx] || sampleTodaySessions[0];
      const qty = Number(seatsInput?.value || 1);
      if (feeDisplay) feeDisplay.textContent = `₱${(sess.price * qty).toLocaleString()}`;
    }

    openBtn?.addEventListener("click", () => {
      if (sessionSelect) {
        sessionSelect.innerHTML = sampleTodaySessions.map((s) => `<option value="${s.id}">${s.name} - ₱${s.price}</option>`).join("");
      }
      updateFee();
      if (modal) modal.hidden = false;
      document.body.style.overflow = "hidden";
    });

    closeBtn?.addEventListener("click", () => {
      if (modal) modal.hidden = true;
      document.body.style.overflow = "";
    });

    modal?.addEventListener("click", (e) => {
      if (e.target.id === "walkin-modal") {
        modal.hidden = true;
        document.body.style.overflow = "";
      }
    });

    sessionSelect?.addEventListener("change", updateFee);
    seatsInput?.addEventListener("input", updateFee);

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const idx = sessionSelect?.selectedIndex || 0;
      const sess = sampleTodaySessions[idx] || sampleTodaySessions[0];
      const name = ($("#walkin-name")?.value || "").trim();
      const mobile = ($("#walkin-mobile")?.value || "").trim();
      const seats = Number($("#walkin-seats")?.value || 1);
      const paymentMethod = $("#walkin-payment-method")?.value || "Cash at Front Desk";
      const autoCheckIn = $("#walkin-auto-checkin")?.checked;

      const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
      const ref = `HG-W${rand}`;

      const newBooking = {
        bookingId: ref,
        sessionId: sess.id,
        className: sess.name.split(" (")[0],
        date: todayStr,
        time: sess.name.includes("(") ? sess.name.split("(")[1].split(")")[0] : "17:30 - 18:30",
        coach: "Front Desk Walk-In",
        room: sess.name.includes("Aqua") ? "Aqua Room" : "Main Studio",
        name: name,
        mobile: mobile,
        email: "walkin@frontdesk.hingas",
        seats: seats,
        amount: sess.price * seats,
        status: autoCheckIn ? "checked-in" : "paid",
        paymentMethod: paymentMethod,
        createdAt: new Date().toISOString()
      };

      const bookings = getBookings();
      bookings.unshift(newBooking);
      setBookings(bookings);

      showToast(`Walk-in registered: ${name} (${ref})!`);
      if (modal) modal.hidden = true;
      document.body.style.overflow = "";
      form.reset();

      refreshDashboard();
    });
  }

  // 1-Click Attendee SMS / Message Modal
  let activeSMSBooking = null;

  function openSMSModal(bookingId) {
    const bookings = getBookings();
    const item = bookings.find((b) => b.bookingId === bookingId);
    if (!item) return;

    activeSMSBooking = item;
    const modal = $("#sms-modal");
    if (!modal) return;

    if ($("#sms-recipient-name")) $("#sms-recipient-name").textContent = item.name || "Student";
    if ($("#sms-recipient-phone")) $("#sms-recipient-phone").textContent = item.mobile || "No Mobile Number";
    if ($("#sms-recipient-class")) {
      $("#sms-recipient-class").textContent = `${item.className || "Studio Class"} · ${item.date || "Today"} (${item.time || "Schedule"})`;
    }

    if ($("#sms-avatar")) {
      const parts = (item.name || "ST").trim().split(" ");
      const initials = (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
      $("#sms-avatar").textContent = initials || "ST";
    }

    if ($("#sms-template-picker")) $("#sms-template-picker").value = "reminder";
    updateSMSText();

    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function updateSMSText() {
    if (!activeSMSBooking) return;
    const tpl = $("#sms-template-picker")?.value || "reminder";
    const b = activeSMSBooking;

    let text = "";
    if (tpl === "reminder") {
      text = `Hi ${b.name}! Reminder from Hingas Lifestyle Studio: Your ${b.className} class is on ${b.date || "today"} at ${b.time || "scheduled time"} in ${b.room || "Main Studio"}. Ref: ${b.bookingId}. Please arrive 10-15 mins early. See you on the mat!`;
    } else if (tpl === "confirmation") {
      text = `Hi ${b.name}! Your reservation at Hingas Lifestyle Studio is confirmed. Ref: ${b.bookingId} (${b.className}, ${b.date} at ${b.time}, ${b.seats || 1} pass). Status: Paid. See you at 2F J&F Bldg, Taytay Rizal!`;
    } else if (tpl === "bring-gear") {
      text = `Hi ${b.name}! Quick prep for your ${b.className} class at Hingas Studio: Please bring a personal water bottle, workout towel, and grip socks (for ballet/mobility). Free filtered water is available at front desk!`;
    } else if (tpl === "reschedule") {
      text = `Hi ${b.name}! Hingas Studio Advisory: For your class ${b.className} on ${b.date}, your room assignment is ${b.room || "Main Studio"}. Front desk staff will guide you upon entry. Hotline: 0917-123-4567.`;
    }

    const textarea = $("#sms-message-text");
    if (textarea) {
      textarea.value = text;
      updateSMSCharCount();
    }

    updateSMSAppHref(text);
  }

  function updateSMSCharCount() {
    const len = $("#sms-message-text")?.value.length || 0;
    const counter = $("#sms-char-count");
    if (counter) {
      counter.textContent = `${len} characters`;
      counter.style.color = len > 160 ? "#f59e0b" : "#94a3b8";
    }
  }

  function updateSMSAppHref(text) {
    const phone = (activeSMSBooking?.mobile || "").replace(/[^0-9+]/g, "");
    const openBtn = $("#btn-open-sms-app");
    if (!openBtn) return;
    const encodedBody = encodeURIComponent(text);
    openBtn.href = `sms:${phone}?body=${encodedBody}`;
  }

  function setupSMSModal() {
    const modal = $("#sms-modal");
    const closeBtn = $("#close-sms-modal");
    const picker = $("#sms-template-picker");
    const textarea = $("#sms-message-text");
    const copyBtn = $("#btn-copy-sms");

    closeBtn?.addEventListener("click", () => {
      if (modal) modal.hidden = true;
      document.body.style.overflow = "";
    });

    modal?.addEventListener("click", (e) => {
      if (e.target.id === "sms-modal") {
        modal.hidden = true;
        document.body.style.overflow = "";
      }
    });

    picker?.addEventListener("change", updateSMSText);

    textarea?.addEventListener("input", () => {
      updateSMSCharCount();
      updateSMSAppHref(textarea.value);
    });

    copyBtn?.addEventListener("click", () => {
      const txt = textarea?.value || "";
      if (!txt) return;
      try {
        navigator.clipboard.writeText(txt);
        showToast("SMS Message copied to clipboard!");
      } catch (err) {
        showToast("Could not auto-copy. Please copy text manually.");
      }
    });
  }

  // Export to CSV
  function exportCSV() {
    const bookings = getBookings();
    if (!bookings.length) {
      alert("No bookings to export.");
      return;
    }
    const headers = ["Booking ID", "Name", "Mobile", "Email", "Class", "Date", "Time", "Seats", "Amount (PHP)", "Status", "Payment Method", "Created At"];
    const rows = bookings.map((b) => [
      b.bookingId,
      `"${b.name || ""}"`,
      `"${b.mobile || ""}"`,
      `"${b.email || ""}"`,
      `"${b.className || ""}"`,
      b.date,
      b.time,
      b.seats,
      b.amount,
      b.status,
      `"${b.paymentMethod || ""}"`,
      b.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hingas_Studio_Roster_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Render Requests Tab
  function renderRequests() {
    const list = $("#dash-requests-list");
    const badge = $("#inquiry-count-badge");
    if (!list) return;

    const requests = getRequests();
    if (badge) badge.textContent = requests.length;

    if (!requests.length) {
      list.innerHTML = `<div class="dash-empty-state"><span class="empty-icon-wrap"><svg class="ui-icon" style="width:36px;height:36px;stroke-width:1.5;" viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg></span><h4>No inquiries yet</h4><p>Rental and package requests will appear here.</p></div>`;
      return;
    }

    list.innerHTML = requests.map((r) => `
      <div class="request-card">
        <div>
          <h4>${r.type}: ${r.room || "Studio"}</h4>
          <p><strong>${r.name}</strong> · ${r.phone} · ${r.email}</p>
          <p style="color:#f8fafc;">Date: ${r.date} · Time: ${r.time} · Group Size: ${r.groupSize || 1}</p>
          <p style="font-style:italic;">"${r.purpose || "No additional notes"}"</p>
        </div>
        <div style="text-align:right;">
          <span class="table-badge ${r.status === "Approved" ? "paid" : "held"}">${r.status || "Pending"}</span>
        </div>
      </div>
    `).join("");
  }

  // Render Schedule Grid
  function renderScheduleGrid() {
    const grid = $("#dash-schedule-grid");
    if (!grid) return;

    const sampleSchedule = [
      { name: "Morning Vinyasa Yoga", time: "07:30 - 08:45", coach: "Coach Bea", room: "Aqua Room", cap: 12, booked: 8 },
      { name: "Kids Basic Ballet", time: "10:00 - 11:00", coach: "Teacher Mia", room: "Main Studio", cap: 15, booked: 12 },
      { name: "Step Hype Cardio", time: "17:30 - 18:30", coach: "Coach Kyle", room: "Aqua Room", cap: 14, booked: 14 },
      { name: "Muay Thai Conditioning", time: "19:00 - 20:30", coach: "Coach Ray", room: "Main Studio", cap: 12, booked: 9 }
    ];

    grid.innerHTML = sampleSchedule.map((s) => {
      const isFull = s.booked >= s.cap;
      return `
        <div class="dash-session-card">
          <h4>${s.name}</h4>
          <p>${s.coach} · ${s.room}</p>
          <p style="color:#38bdf8;margin-top:4px;">${s.time}</p>
          <div class="dash-session-bar">
            <span>Occupancy: <strong>${s.booked} / ${s.cap}</strong></span>
            <span class="table-badge ${isFull ? "held" : "paid"}">${isFull ? "Full" : "Available"}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  // Toast
  function showToast(msg) {
    const toast = $("#dash-toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3500);
  }

  // Refresh All
  function refreshDashboard() {
    calculateKPIs();
    renderRoster();
    renderRequests();
    renderScheduleGrid();
    renderStaffTable();
  }

  // Init
  function init() {
    initSeedData();
    checkAuth();
    setupAuthEvents();
    setupQRValidator();
    setupWalkInModal();
    setupSMSModal();

    // Live clock interval
    updateLiveClock();
    setInterval(updateLiveClock, 1000);

    // Navigation Tabs
    $(".dash-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        $(".dash-tab").forEach((t) => t.classList.remove("active"));
        $(".dash-tab-content").forEach((c) => c.classList.remove("active"));
        tab.classList.add("active");
        const targetId = tab.dataset.tab;
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add("active");
        if (targetId === "tab-database") renderStaffTable();
      });
    });

    // Database Actions (Tab 5)
    $("#btn-export-db-json")?.addEventListener("click", () => {
      if (window.HingasStaffAuth) {
        window.HingasStaffAuth.exportDatabaseJson();
        showToast("Live database snapshot exported as JSON!");
      }
    });

    $("#btn-reseed-data")?.addEventListener("click", () => {
      if (confirm("Reset bookings and staff records to original studio defaults?")) {
        localStorage.removeItem("hingas_studio_bookings");
        localStorage.removeItem("hingas_studio_requests");
        localStorage.removeItem("hingas_staff_accounts");
        initSeedData();
        refreshDashboard();
        showToast("Studio database reseeded to clean defaults.");
      }
    });

    // Roster search and filters
    $("#roster-search-input")?.addEventListener("input", renderRoster);
    $("#filter-roster-class")?.addEventListener("change", renderRoster);
    $("#filter-roster-status")?.addEventListener("change", renderRoster);

    // Export & Print
    $("#btn-export-csv")?.addEventListener("click", exportCSV);
    $("#btn-print-roster")?.addEventListener("click", () => window.print());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
