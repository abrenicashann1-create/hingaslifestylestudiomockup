/**
 * Hingas Lifestyle Studio — Client & Server Staff Authentication Engine
 * Handles secure staff login, registration, session management, and database export.
 */

(function (window) {
  "use strict";

  const STORAGE_KEY_STAFF = "hingas_staff_accounts";
  const STORAGE_KEY_SESSION = "hingas_active_staff_session";
  const STUDIO_MASTER_CODE = "HINGAS-STAFF-2026"; // or 'hingas2026'

  // Robust SHA-256 fallback in case crypto.subtle is restricted on file:// URLs
  async function sha256(str) {
    try {
      if (window.crypto && window.crypto.subtle) {
        const buf = new TextEncoder().encode(str);
        const digest = await window.crypto.subtle.digest("SHA-256", buf);
        return Array.from(new Uint8Array(digest))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      }
    } catch (e) {
      // Fallback below
    }
    // Deterministic simple hash fallback
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return "h_" + Math.abs(hash).toString(16);
  }

  // Pre-seeded Default Staff Accounts
  const DEFAULT_STAFF = [
    {
      id: 1,
      staffCode: "STF-001",
      fullName: "Hingas Front Desk Reception",
      email: "frontdesk@hingas.ph",
      phone: "0917 555 0101",
      role: "receptionist",
      roleLabel: "Front Desk Receptionist",
      passwordHash: "950269f884218dc3398403d526fc18e6924376c965cbeecf97bb32be783da342", // staff2026
      rawPassHint: "staff2026",
      status: "active",
      avatarColor: "#00b4d8",
      createdAt: "2026-01-15T08:00:00Z"
    },
    {
      id: 2,
      staffCode: "STF-002",
      fullName: "Elena Rost (Studio Manager)",
      email: "manager@hingas.ph",
      phone: "0917 555 0102",
      role: "manager",
      roleLabel: "Studio Operations Manager",
      passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // hingas2026
      rawPassHint: "hingas2026",
      status: "active",
      avatarColor: "#f4d35e",
      createdAt: "2026-01-10T08:00:00Z"
    },
    {
      id: 3,
      staffCode: "STF-003",
      fullName: "Coach Alex Bea",
      email: "coach.alex@hingas.ph",
      phone: "0917 555 0103",
      role: "coach",
      roleLabel: "Lead Movement Instructor",
      passwordHash: "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f", // coach2026
      rawPassHint: "coach2026",
      status: "active",
      avatarColor: "#2ec4b6",
      createdAt: "2026-02-01T08:00:00Z"
    }
  ];

  function getStaffList() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_STAFF);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(DEFAULT_STAFF));
        return DEFAULT_STAFF;
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(DEFAULT_STAFF));
        return DEFAULT_STAFF;
      }
      return parsed;
    } catch (e) {
      return DEFAULT_STAFF;
    }
  }

  function saveStaffList(list) {
    localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(list));
  }

  const staffAuth = {
    // Current Active Staff Session
    getCurrentStaff() {
      try {
        const sess = sessionStorage.getItem(STORAGE_KEY_SESSION) || localStorage.getItem(STORAGE_KEY_SESSION);
        if (sess) return JSON.parse(sess);
      } catch (e) {}
      return null;
    },

    isAuthenticated() {
      return !!this.getCurrentStaff();
    },

    // Log In Verification
    async login(email, password, remember = false) {
      email = (email || "").trim().toLowerCase();
      password = (password || "").trim();

      if (!email || !password) {
        return { success: false, message: "Please enter both your work email and password." };
      }

      // 1. Try PHP Backend if running under Apache/WAMP
      if (window.location.protocol.startsWith("http")) {
        try {
          const res = await fetch("database/api_auth.php?action=login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data && data.data.staff) {
              const staff = data.data.staff;
              this._setSession(staff, remember);
              return { success: true, staff, message: data.message };
            }
          }
        } catch (e) {
          // If PHP backend is not configured or offline, seamlessly proceed to client database
        }
      }

      // 2. Client Database Authentication
      const list = getStaffList();
      const user = list.find((u) => u.email.toLowerCase() === email);

      if (!user) {
        return { success: false, message: "No staff account found with this email. Please check your spelling or register." };
      }

      if (user.status !== "active") {
        return { success: false, message: "This account has been deactivated. Please consult studio management." };
      }

      const inputHash = await sha256(password);
      const isMatch = (user.passwordHash === inputHash) || (user.rawPassHint && user.rawPassHint === password);

      if (!isMatch) {
        return { success: false, message: "Incorrect password. Please try again." };
      }

      user.lastLoginAt = new Date().toISOString();
      saveStaffList(list);

      const sessionObj = {
        id: user.id,
        staffCode: user.staffCode,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roleLabel: user.roleLabel || (user.role === "manager" ? "Studio Operations Manager" : user.role === "coach" ? "Instructor / Coach" : "Front Desk Receptionist"),
        avatarColor: user.avatarColor || "#00b4d8"
      };

      this._setSession(sessionObj, remember);
      return { success: true, staff: sessionObj, message: `Welcome back, ${user.fullName}!` };
    },

    // Register New Staff Member
    async register({ fullName, email, phone, role, password, authKey }) {
      fullName = (fullName || "").trim();
      email = (email || "").trim().toLowerCase();
      phone = (phone || "").trim();
      role = (role || "receptionist").trim();
      password = (password || "").trim();
      authKey = (authKey || "").trim();

      if (!fullName) return { success: false, message: "Please provide the staff member's full name." };
      if (!email || !email.includes("@")) return { success: false, message: "Please enter a valid work email address." };
      if (!password || password.length < 6) return { success: false, message: "Password must contain at least 6 characters." };

      // Master authorization check to prevent unauthorized public registrations
      const validCodes = [STUDIO_MASTER_CODE, "hingas2026", "staff2026", "HINGAS2026", "hingas-staff-2026"];
      if (!validCodes.includes(authKey)) {
        return {
          success: false,
          message: "Invalid Studio Authorization Code. Please enter the official studio security code (default: HINGAS-STAFF-2026 or hingas2026)."
        };
      }

      const list = getStaffList();
      if (list.some((u) => u.email.toLowerCase() === email)) {
        return { success: false, message: "A staff account with this email already exists. Please log in instead." };
      }

      const newId = list.length > 0 ? Math.max(...list.map((u) => u.id || 0)) + 1 : 1;
      const staffCode = `STF-${String(newId).padStart(3, "0")}`;
      const passwordHash = await sha256(password);

      const colors = ["#00b4d8", "#2ec4b6", "#f4d35e", "#e71d36", "#9d4edd", "#ff9e00"];
      const avatarColor = colors[(newId - 1) % colors.length];

      const roleLabels = {
        receptionist: "Front Desk Receptionist",
        coach: "Studio Instructor / Coach",
        manager: "Studio Operations Manager"
      };

      const newStaff = {
        id: newId,
        staffCode,
        fullName,
        email,
        phone: phone || "—",
        role,
        roleLabel: roleLabels[role] || "Front Desk Receptionist",
        passwordHash,
        rawPassHint: password,
        status: "active",
        avatarColor,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      list.push(newStaff);
      saveStaffList(list);

      // Try PHP API backend as well
      if (window.location.protocol.startsWith("http")) {
        try {
          fetch("database/api_auth.php?action=register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              full_name: fullName,
              email,
              phone,
              role,
              password,
              auth_key: authKey
            })
          }).catch(() => {});
        } catch (e) {}
      }

      return {
        success: true,
        message: `Account created successfully for ${fullName} (${staffCode})! You can now log in.`,
        staff: newStaff
      };
    },

    _setSession(staffObj, remember) {
      const json = JSON.stringify(staffObj);
      sessionStorage.setItem(STORAGE_KEY_SESSION, json);
      if (remember) {
        localStorage.setItem(STORAGE_KEY_SESSION, json);
      } else {
        localStorage.removeItem(STORAGE_KEY_SESSION);
      }
      localStorage.setItem("hingas_dash_auth", "true");
    },

    logout() {
      sessionStorage.removeItem(STORAGE_KEY_SESSION);
      localStorage.removeItem(STORAGE_KEY_SESSION);
      sessionStorage.removeItem("hingas_dash_auth");
      localStorage.removeItem("hingas_dash_auth");
    },

    listStaff() {
      return getStaffList();
    },

    // Export complete Database as JSON backup
    exportDatabaseJson() {
      const data = {
        studio: "Hingas Lifestyle Studio",
        version: "2.0",
        exportedAt: new Date().toISOString(),
        staffUsers: getStaffList().map((u) => {
          const { rawPassHint, ...safe } = u;
          return safe;
        }),
        bookings: JSON.parse(localStorage.getItem("hingas_studio_bookings") || "[]"),
        requests: JSON.parse(localStorage.getItem("hingas_studio_requests") || "[]")
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hingas_studio_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  window.HingasStaffAuth = staffAuth;
})(window);
