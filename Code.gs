const SHEET_HEADERS = {
  Classes: ["id", "name", "description", "ageGroup", "level", "bring", "photoUrl", "price"],
  Schedule: ["sessionId", "classId", "date", "startTime", "durationMin", "coach", "seatLimit", "active"],
  Media: ["type", "title", "url", "poster", "order", "visible"],
  Bookings: ["bookingId", "sessionId", "name", "mobile", "email", "seats", "amount", "status", "createdAt", "heldUntil", "paymentId", "paidAt", "customerEmailSent", "studioEmailSent"],
  Requests: ["requestId", "type", "name", "mobile", "email", "date", "startTime", "endTime", "groupSize", "purpose", "message", "createdAt"],
  Staff: ["staffCode", "fullName", "email", "phone", "role", "passwordHash", "status", "createdAt", "lastLoginAt"]
};
const HOLD_MINUTES = 15;
const HITPAY_SANDBOX_URL = "https://api.sandbox.hit-pay.com/v1/payment-requests";
const HITPAY_LIVE_URL = "https://api.hit-pay.com/v1/payment-requests";

function setupHingas() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("Set SPREADSHEET_ID in Apps Script project properties first.");
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  Object.keys(SHEET_HEADERS).forEach(function (name) {
    let sheet = spreadsheet.getSheetByName(name);
    if (!sheet) sheet = spreadsheet.insertSheet(name);
    const headers = SHEET_HEADERS[name];
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    } else {
      const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
      if (headers.some(function (header, index) { return current[index] !== header; })) {
        throw new Error("The " + name + " sheet headers do not match the template. Do not overwrite existing data.");
      }
    }
  });
  ScriptApp.getProjectTriggers().filter(function (trigger) {
    return trigger.getHandlerFunction() === "expireHolds";
  }).forEach(function (trigger) { ScriptApp.deleteTrigger(trigger); });
  ScriptApp.newTrigger("expireHolds").timeBased().everyMinutes(5).create();
  return "Hingas sheets and the five-minute expiry trigger are ready.";
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "";
  if (action === "schedule") {
    const result = { ok: true, sessions: listSessions() };
    return jsonResponse(result, e.parameter.callback);
  }
  if (action === "classes") {
    return jsonResponse({ ok: true, classes: listClasses() }, e.parameter.callback);
  }
  if (action === "media") {
    return jsonResponse({ ok: true, media: listMedia() }, e.parameter.callback);
  }
  if (action === "booking") {
    return jsonResponse(getBookingStatus((e.parameter.bookingId || "").trim()), e.parameter.callback);
  }
  if (action === "reschedule_options") {
    return jsonResponse(listRescheduleOptions(
      String(e.parameter.bookingId || "").trim(),
      String(e.parameter.email || "").trim().toLowerCase()
    ), e.parameter.callback);
  }
  return ContentService.createTextOutput("Hingas booking service is running.");
}

function doPost(e) {
  const parameters = (e && e.parameter) || {};
  const action = parameters.action || "";
  if (action === "hitpay_webhook" || parameters.hmac) {
    try {
      processHitPayWebhook(parameters);
      return ContentService.createTextOutput("OK");
    } catch (error) {
      console.error("HitPay webhook rejected: " + error.message);
      return ContentService.createTextOutput("Webhook rejected: " + error.message);
    }
  }

  const nonce = parameters.nonce || "";
  try {
    if (action === "book") {
      const checkout = createBooking(parameters);
      return frameResponse({
        type: "payment-ready",
        nonce: nonce,
        bookingId: checkout.bookingId,
        checkoutUrl: checkout.checkoutUrl,
        heldUntil: checkout.heldUntil
      });
    }
    if (action === "rental" || action === "contact" || action === "package" || action === "waitlist") {
      saveRequest(action, parameters);
      return frameResponse({ type: "request-saved", nonce: nonce });
    }
    if (action === "booking-change") {
      saveBookingChangeRequest(parameters);
      return frameResponse({ type: "request-saved", nonce: nonce });
    }
    throw new Error("Unknown request.");
  } catch (error) {
    console.error("Hingas request failed: " + error.message);
    return frameResponse({ type: "request-error", nonce: nonce, message: error.message });
  }
}

function listClasses() {
  return readRows("Classes").map(function (row) {
    return {
      id: String(row.id || ""),
      name: String(row.name || ""),
      description: String(row.description || ""),
      ageGroup: String(row.ageGroup || ""),
      level: String(row.level || ""),
      bring: String(row.bring || ""),
      photoUrl: String(row.photoUrl || ""),
      price: Number(row.price) > 0 ? Number(row.price) : null
    };
  }).filter(function (classInfo) {
    return classInfo.id && classInfo.name;
  });
}

function listMedia() {
  return readRows("Media").filter(function (row) {
    const type = String(row.type || "").trim().toLowerCase();
    return isTrue(row.visible) && (type === "photo" || type === "video") &&
      String(row.url || "").trim() && (type !== "video" || String(row.poster || "").trim());
  }).map(function (row) {
    return {
      type: String(row.type).trim().toLowerCase(),
      title: String(row.title || "").trim(),
      url: String(row.url || "").trim(),
      poster: String(row.poster || "").trim(),
      order: Number(row.order) || 0
    };
  }).sort(function (a, b) {
    return a.order - b.order;
  });
}

function listSessions() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  const timezone = Session.getScriptTimeZone();
  const classes = readRows("Classes").reduce(function (map, row) {
    map[String(row.id)] = row;
    return map;
  }, {});
  const bookings = readRows("Bookings");
  return readRows("Schedule").filter(function (session) {
    const classInfo = classes[String(session.classId)];
    const date = asDate(session.date);
    return classInfo && isTrue(session.active) && date && date >= today && date < end;
  }).map(function (session) {
    const classInfo = classes[String(session.classId)];
    const date = asDate(session.date);
    const sessionId = String(session.sessionId);
    const occupied = bookings.reduce(function (sum, booking) {
      if (String(booking.sessionId) !== sessionId) return sum;
      if (booking.status === "paid") return sum + Number(booking.seats || 0);
      if (booking.status === "held" && asDateTime(booking.heldUntil) > now) return sum + Number(booking.seats || 0);
      return sum;
    }, 0);
    return {
      id: sessionId,
      name: String(classInfo.name),
      description: String(classInfo.description || ""),
      bring: String(classInfo.bring || ""),
      photoUrl: String(classInfo.photoUrl || ""),
      date: Utilities.formatDate(date, timezone, "yyyy-MM-dd"),
      time: normalizeTime(session.startTime),
      duration: Number(session.durationMin),
      level: String(classInfo.level || "To be confirmed"),
      group: String(classInfo.ageGroup || "To be confirmed"),
      coach: String(session.coach || ""),
      capacity: Number(session.seatLimit),
      price: Number(classInfo.price) > 0 ? Number(classInfo.price) : null,
      seatsLeft: Math.max(0, Number(session.seatLimit) - occupied)
    };
  }).sort(function (a, b) {
    return (a.date + a.time).localeCompare(b.date + b.time);
  });
}

function listRescheduleOptions(bookingId, email) {
  if (!/^HG-[A-F0-9]{12}$/.test(bookingId)) {
    return { ok: false, error: "We could not verify a paid booking with those details." };
  }
  const booking = findBooking(bookingId);
  if (!booking || booking.status !== "paid" ||
      String(booking.email || "").trim().toLowerCase() !== email) {
    return { ok: false, error: "We could not verify a paid booking with those details." };
  }
  const originalSession = findSession(String(booking.sessionId));
  if (!originalSession) return { ok: false, error: "The booked class details could not be found." };
  const originalClassId = String(originalSession.classId);
  const sessions = listSessions().filter(function (session) {
    if (session.id === String(booking.sessionId) || session.seatsLeft < Number(booking.seats || 1)) return false;
    const candidate = findSession(String(session.id));
    return candidate && String(candidate.classId) === originalClassId;
  }).map(function (session) {
    return {
      id: session.id,
      name: session.name,
      date: session.date,
      time: session.time,
      seatsLeft: session.seatsLeft
    };
  });
  return { ok: true, sessions: sessions };
}

function createBooking(data) {
  const name = requiredText(data.name, "Name", 120);
  const mobile = String(data.mobile || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const sessionId = String(data.sessionId || "").trim();
  const seats = Number(data.seats);
  if (!/^09\d{9}$/.test(mobile)) throw new Error("Enter an 11-digit Philippine mobile number beginning with 09.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  if (!Number.isInteger(seats) || seats < 1 || seats > 8) throw new Error("Choose between one and eight seats.");
  const settings = getSettings();
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  let booking;
  try {
    const now = new Date();
    const session = findSession(sessionId);
    if (!session || !isTrue(session.active)) throw new Error("That class session is no longer available.");
    const scheduleDate = asDate(session.date);
    const sessionStart = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());
    const timeParts = normalizeTime(session.startTime).split(":");
    sessionStart.setHours(Number(timeParts[0]), Number(timeParts[1]), 0, 0);
    if (sessionStart <= now) throw new Error("That class has already started.");
    const classInfo = findClass(String(session.classId));
    if (!classInfo || !Number.isFinite(Number(classInfo.price)) || Number(classInfo.price) <= 0) {
      throw new Error("The studio has not set a valid price for this class yet.");
    }
    const allBookings = readRows("Bookings");
    const occupied = allBookings.reduce(function (sum, row) {
      if (String(row.sessionId) !== sessionId) return sum;
      if (row.status === "paid") return sum + Number(row.seats || 0);
      if (row.status === "held" && asDateTime(row.heldUntil) > now) return sum + Number(row.seats || 0);
      return sum;
    }, 0);
    if (seats > Number(session.seatLimit) - occupied) throw new Error("Not enough seats remain. Refresh the schedule and try again.");
    const bookingId = "HG-" + Utilities.getUuid().replace(/-/g, "").substring(0, 12).toUpperCase();
    const heldUntil = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);
    const promoCode = String(data.promoCode || "").trim().toUpperCase();
    let discount = 0;
    if (promoCode === "HINGASVIP" || promoCode === "FIRSTFREE") {
      discount = 1.0;
    } else if (promoCode === "WELCOME10" || promoCode === "HINGAS10") {
      discount = 0.10;
    }
    const rawAmount = Math.round(Number(classInfo.price) * seats * 100) / 100;
    const amount = Math.max(0, Math.round(rawAmount * (1 - discount) * 100) / 100);
    
    if (amount === 0) {
      appendRow("Bookings", {
        bookingId: bookingId,
        sessionId: sessionId,
        name: name,
        mobile: mobile,
        email: email,
        seats: seats,
        amount: 0,
        status: "paid",
        createdAt: now,
        heldUntil: heldUntil,
        paymentId: "PROMO-" + (promoCode || "FREE"),
        paidAt: now,
        customerEmailSent: false,
        studioEmailSent: false
      });
      lock.releaseLock();
      sendBookingEmails(bookingId, settings);
      return {
        bookingId: bookingId,
        checkoutUrl: settings.siteUrl.replace(/\/+$/, "") + "/?booking=" + encodeURIComponent(bookingId),
        heldUntil: heldUntil.toISOString(),
        isPrepaid: true
      };
    }

    appendRow("Bookings", {
      bookingId: bookingId,
      sessionId: sessionId,
      name: name,
      mobile: mobile,
      email: email,
      seats: seats,
      amount: amount,
      status: "held",
      createdAt: now,
      heldUntil: heldUntil,
      paymentId: "",
      paidAt: "",
      customerEmailSent: false,
      studioEmailSent: false
    });
    booking = { bookingId: bookingId, sessionId: sessionId, name: name, email: email, amount: amount, heldUntil: heldUntil.toISOString() };
  } finally {
    lock.releaseLock();
  }

  try {
    return {
      bookingId: booking.bookingId,
      checkoutUrl: createHitPayRequest(booking, settings),
      heldUntil: booking.heldUntil
    };
  } catch (error) {
    setBookingStatus(booking.bookingId, "cancelled");
    throw new Error("We could not start secure checkout. Your seat hold was released. Please try again.");
  }
}

function createHitPayRequest(booking, settings) {
  const baseUrl = settings.hitpayMode === "live" ? HITPAY_LIVE_URL : HITPAY_SANDBOX_URL;
  const siteUrl = settings.siteUrl.replace(/\/+$/, "");
  const payload = {
    amount: booking.amount.toFixed(2),
    currency: "PHP",
    email: booking.email,
    name: booking.name,
    purpose: "Hingas class booking " + booking.bookingId,
    reference_number: booking.bookingId,
    redirect_url: siteUrl + "/?booking=" + encodeURIComponent(booking.bookingId),
    webhook: settings.webhookUrl,
    allow_repeated_payments: "false"
  };
  const response = UrlFetchApp.fetch(baseUrl, {
    method: "post",
    headers: { "X-BUSINESS-API-KEY": settings.hitpayApiKey },
    payload: payload,
    muteHttpExceptions: true
  });
  const status = response.getResponseCode();
  let result;
  try {
    result = JSON.parse(response.getContentText());
  } catch (error) {
    throw new Error("HitPay returned an invalid response.");
  }
  const checkoutUrl = result.url || result.checkout_url;
  if (status < 200 || status >= 300 || !checkoutUrl || !/^https:\/\/[^/]+/.test(checkoutUrl)) {
    console.error("HitPay checkout creation failed with HTTP " + status + ".");
    throw new Error("HitPay could not create checkout.");
  }
  return checkoutUrl;
}

function processHitPayWebhook(parameters) {
  const settings = getSettings();
  if (!verifyHitPaySignature(parameters, settings.hitpaySalt)) throw new Error("Invalid signature.");
  const bookingId = String(parameters.reference_number || "");
  const providerStatus = String(parameters.status || "").toLowerCase();
  const booking = findBooking(bookingId);
  if (!booking) throw new Error("Unknown booking reference.");
  if (providerStatus !== "completed") return;
  if (parameters.currency && String(parameters.currency).toUpperCase() !== "PHP") throw new Error("Payment currency does not match.");
  if (Math.abs(Number(parameters.amount) - Number(booking.amount)) > 0.001) throw new Error("Payment amount does not match.");
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const current = findBooking(bookingId);
    if (!current) throw new Error("Booking was not found.");
    if (current.status !== "paid" && (current.status !== "held" || asDateTime(current.heldUntil) <= new Date())) {
      notifyStudio(settings.studioEmail, "Late HitPay payment requires review",
        "Booking " + bookingId + " completed after its hold expired. Check the provider dashboard before confirming or refunding.");
      setBookingStatus(bookingId, "expired");
      return;
    }
    if (current.status !== "paid") {
      updateBooking(bookingId, {
        status: "paid",
        paymentId: String(parameters.payment_id || parameters.id || ""),
        paidAt: new Date()
      });
    }
  } finally {
    lock.releaseLock();
  }
  sendBookingEmails(bookingId, settings);
}

function verifyHitPaySignature(parameters, salt) {
  const supplied = String(parameters.hmac || "").toLowerCase();
  if (!supplied || !salt) return false;
  const message = Object.keys(parameters).filter(function (key) {
    return key !== "hmac" && key !== "action";
  }).sort().map(function (key) {
    return key + "=" + parameters[key];
  }).join("&");
  const bytes = Utilities.computeHmacSha256Signature(message, salt, Utilities.Charset.UTF_8);
  const expected = bytes.map(function (byte) {
    return ("0" + ((byte + 256) % 256).toString(16)).slice(-2);
  }).join("");
  return constantTimeEquals(supplied, expected);
}

function expireHolds() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet("Bookings");
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const statusColumn = headers.indexOf("status");
    const expiryColumn = headers.indexOf("heldUntil");
    const now = new Date();
    for (let row = 1; row < values.length; row += 1) {
      if (values[row][statusColumn] === "held" && asDateTime(values[row][expiryColumn]) <= now) {
        sheet.getRange(row + 1, statusColumn + 1).setValue("expired");
      }
    }
  } finally {
    lock.releaseLock();
  }
}

function saveRequest(type, data) {
  if (String(data.website || "").trim()) return;
  const name = requiredText(data.name, "Name", 120);
  const mobile = String(data.mobile || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const message = String(data.message || "").trim().slice(0, 2000);
  if (!/^09\d{9}$/.test(mobile)) throw new Error("Enter an 11-digit Philippine mobile number beginning with 09.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  if (!message && type !== "package" && type !== "waitlist") throw new Error("Add a short message so the studio can help.");
  const request = {
    requestId: Utilities.getUuid(),
    type: type,
    name: name,
    mobile: mobile,
    email: email,
    date: "",
    startTime: "",
    endTime: "",
    groupSize: "",
    purpose: "",
    message: message,
    createdAt: new Date()
  };
  if (type === "rental") {
    request.date = String(data.date || "");
    request.startTime = String(data.startTime || "");
    request.endTime = String(data.endTime || "");
    request.groupSize = String(data.groupSize || "");
    request.purpose = String(data.purpose || "");
    const roomChoice = String(data.roomChoice || "");
    const roomCapacities = { "Lemon Room": 30, "Aqua Room": 20, "Not sure yet": 30 };
    const groupMatch = request.groupSize.match(/^(\d+)[–-](\d+) people$/);
    if (!request.date || !request.startTime || !request.endTime || request.endTime <= request.startTime ||
        !request.groupSize || !request.purpose || !Object.prototype.hasOwnProperty.call(roomCapacities, roomChoice) ||
        !groupMatch || Number(groupMatch[2]) > roomCapacities[roomChoice] ||
        !["Casual photoshoot", "Studio session", "Other (please describe below)", "Rehearsal", "Workshop", "Event", "Fitness"].includes(request.purpose)) {
      throw new Error("Check the requested room, group size, purpose, date, and time.");
    }
    request.message = "Room requested: " + roomChoice + "\n\n" + message;
    const requestedDate = new Date(request.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(requestedDate.getTime()) || requestedDate < today) throw new Error("Choose a date that is today or later.");
  } else if (type === "package") {
    const packageClasses = ["Basic Ballet", "Dance Sports", "Female Dancehall", "Femme Dance", "Gymnastics", "Karatedo", "Modern Dance", "Step Hype", "Yoga"];
    request.purpose = requiredText(data.className, "Class", 80);
    if (packageClasses.indexOf(request.purpose) < 0) throw new Error("Choose a class from the package inquiry list.");
    const ageGroup = String(data.ageGroup || "").trim().slice(0, 80);
    request.message = [ageGroup ? "Age group or level: " + ageGroup : "", message || "Please contact me about current package details."].filter(String).join("\n\n");
  } else if (type === "waitlist") {
    request.date = String(data.classDate || "");
    request.startTime = String(data.classTime || "");
    request.groupSize = String(data.seats || "1") + " seat(s)";
    request.purpose = "Waitlist: " + String(data.className || "Class");
    request.message = "Session ID: " + String(data.sessionId || "") + "\nSeats requested: " + request.groupSize + (message ? "\nNote: " + message : "");
  }
  appendRow("Requests", request);
  const settings = getStudioSettings();
  const requestDetails = type === "rental"
    ? [request.date + " · " + request.startTime + "–" + request.endTime, request.message.split("\n\n")[0], "Purpose: " + request.purpose, "Group size: " + request.groupSize, request.message.split("\n\n").slice(1).join("\n\n")]
    : type === "package"
      ? ["Class: " + request.purpose, request.message]
      : type === "waitlist"
        ? [request.purpose, "When: " + request.date + " at " + request.startTime, "Seats requested: " + request.groupSize, request.message]
        : [message];
  notifyStudio(settings.studioEmail, "New Hingas " + type + " inquiry",
    [name, mobile, email].concat(requestDetails).filter(String).join("\n"));
}

function saveBookingChangeRequest(data) {
  if (String(data.website || "").trim()) return;
  const bookingId = String(data.bookingId || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const changeType = String(data.changeType || "");
  const message = String(data.message || "").trim().slice(0, 1000);
  if (!/^HG-[A-F0-9]{12}$/.test(bookingId) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !["cancel", "reschedule"].includes(changeType)) {
    throw new Error("Enter your booking reference, booking email, and requested change.");
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const booking = findBooking(bookingId);
    if (!booking || String(booking.email || "").trim().toLowerCase() !== email || booking.status !== "paid") {
      throw new Error("We could not verify a paid booking with those details. Check them or contact the studio.");
    }
    const originalSession = findSession(String(booking.sessionId));
    if (!originalSession) throw new Error("The booked class details could not be found. Please contact the studio.");
    const request = {
      requestId: Utilities.getUuid(),
      type: "booking-change",
      name: String(booking.name || ""),
      mobile: String(booking.mobile || ""),
      email: email,
      date: "",
      startTime: "",
      endTime: "",
      groupSize: String(booking.seats || ""),
      purpose: changeType === "cancel" ? "Cancellation request" : "Reschedule request",
      message: "",
      createdAt: new Date()
    };
    const details = [
      "Booking reference: " + bookingId,
      "Original session: " + String(originalSession.date) + " at " + normalizeTime(originalSession.startTime),
      "Seats: " + String(booking.seats || 1)
    ];
    if (changeType === "reschedule") {
      const targetSessionId = String(data.desiredSessionId || "").trim();
      const targetSession = findSession(targetSessionId);
      const originalClassId = String(originalSession.classId);
      const targetClassId = targetSession ? String(targetSession.classId) : "";
      const targetDate = targetSession && asDate(targetSession.date);
      const targetStart = targetDate && new Date(targetDate.getTime());
      if (targetStart) {
        const timeParts = normalizeTime(targetSession.startTime).split(":");
        targetStart.setHours(Number(timeParts[0]), Number(timeParts[1]), 0, 0);
      }
      if (!targetSession || targetSessionId === String(booking.sessionId) || !isTrue(targetSession.active) || targetClassId !== originalClassId ||
          !targetStart || targetStart <= new Date()) {
        throw new Error("Choose a future session of the same class, or contact the studio.");
      }
      const targetCapacity = Number(targetSession.seatLimit);
      const occupied = readRows("Bookings").reduce(function (sum, currentBooking) {
        if (String(currentBooking.sessionId) !== targetSessionId) return sum;
        if (currentBooking.status === "paid") return sum + Number(currentBooking.seats || 0);
        if (currentBooking.status === "held" && asDateTime(currentBooking.heldUntil) > new Date()) {
          return sum + Number(currentBooking.seats || 0);
        }
        return sum;
      }, 0);
      if (!Number.isFinite(targetCapacity) || targetCapacity - occupied < Number(booking.seats || 1)) {
        throw new Error("That class time does not currently have enough seats. Choose another time or contact the studio.");
      }
      request.date = Utilities.formatDate(targetDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      request.startTime = normalizeTime(targetSession.startTime);
      request.endTime = "";
      details.push("Requested new session: " + request.date + " at " + request.startTime);
    } else {
      const originalDate = asDate(originalSession.date);
      if (originalDate) request.date = Utilities.formatDate(originalDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      request.startTime = normalizeTime(originalSession.startTime);
      request.endTime = request.startTime;
    }
    if (message) details.push("Customer note: " + message);
    request.message = details.join("\n");
    appendRow("Requests", request);
    const settings = getStudioSettings();
    notifyStudio(settings.studioEmail, "Hingas booking " + request.purpose.toLowerCase(),
      [request.name, request.mobile, email, request.message].join("\n"));
  } finally {
    lock.releaseLock();
  }
}

function sendBookingEmails(bookingId, settings) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const booking = findBooking(bookingId);
    const session = findSession(booking.sessionId);
    const classInfo = findClass(String(session.classId));
    const date = asDate(session.date);
    const dateText = Utilities.formatDate(date, Session.getScriptTimeZone(), "EEEE, MMMM d, yyyy");
    const time = normalizeTime(session.startTime);
    const address = "2nd Floor, Yamaha Eduhome, Km. 4, Brgy. Luna, Surigao City 8400";
    const customerBody = "Your payment is confirmed.\n\nBooking: " + booking.bookingId +
      "\nClass: " + classInfo.name + "\nWhen: " + dateText + " at " + time +
      "\nSeats: " + booking.seats + "\nAmount: PHP " + Number(booking.amount).toFixed(2) +
      "\nAddress: " + address + "\nWhat to bring: " + (classInfo.bring || "Please contact the studio to confirm.") +
      "\n\nCancellation and refund policy: please contact the studio for the current policy.";
    const customerHtml = '<div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">' +
      '<div style="background:#263A5B;padding:26px 20px;text-align:center;color:#ffffff;">' +
        '<h1 style="margin:0;font-size:22px;letter-spacing:1px;color:#c3cd2e;">HINGAS LIFESTYLE STUDIO</h1>' +
        '<p style="margin:5px 0 0;font-size:12px;opacity:0.85;">Health. Harmony. Hingas.</p>' +
      '</div>' +
      '<div style="padding:26px 22px;color:#18283d;">' +
        '<h2 style="margin:0 0 10px;color:#05609a;font-size:18px;">Your Booking is Confirmed! ✓</h2>' +
        '<p style="margin:0 0 18px;font-size:13px;color:#4f5f70;line-height:1.6;">Hello ' + booking.name + ', your payment has been verified. We look forward to seeing you in class!</p>' +
        '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;">' +
          '<tr style="border-bottom:1px solid #edf2f7;"><td style="padding:8px 0;color:#64748b;">Booking Reference:</td><td style="padding:8px 0;font-weight:bold;text-align:right;color:#05609a;">' + booking.bookingId + '</td></tr>' +
          '<tr style="border-bottom:1px solid #edf2f7;"><td style="padding:8px 0;color:#64748b;">Class:</td><td style="padding:8px 0;font-weight:bold;text-align:right;">' + classInfo.name + '</td></tr>' +
          '<tr style="border-bottom:1px solid #edf2f7;"><td style="padding:8px 0;color:#64748b;">When:</td><td style="padding:8px 0;font-weight:bold;text-align:right;">' + dateText + ' at ' + time + '</td></tr>' +
          '<tr style="border-bottom:1px solid #edf2f7;"><td style="padding:8px 0;color:#64748b;">Reserved Seats:</td><td style="padding:8px 0;font-weight:bold;text-align:right;">' + booking.seats + ' seat(s)</td></tr>' +
          '<tr style="border-bottom:1px solid #edf2f7;"><td style="padding:8px 0;color:#64748b;">Total Paid:</td><td style="padding:8px 0;font-weight:bold;text-align:right;color:#15803d;">PHP ' + Number(booking.amount).toFixed(2) + '</td></tr>' +
          '<tr><td style="padding:8px 0;color:#64748b;">What to bring:</td><td style="padding:8px 0;text-align:right;font-size:12px;">' + (classInfo.bring || 'Standard workout attire and water.') + '</td></tr>' +
        '</table>' +
        '<div style="background:#f1f5f9;padding:14px;border-radius:8px;font-size:12px;color:#334155;line-height:1.6;margin-bottom:20px;">' +
          '<strong>Studio Location:</strong><br>' + address + '<br>' +
          '<a href="https://maps.google.com/?q=2nd+Floor,+Yamaha+Eduhome,+Km.+4,+Brgy.+Luna,+Surigao+City" style="color:#0279bb;text-decoration:none;font-weight:bold;display:inline-block;margin-top:5px;">Open in Google Maps ↗</a>' +
        '</div>' +
        '<p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.5;">Questions or need to contact us? Call <strong>0917 193 0061</strong> or reply to this email.</p>' +
      '</div>' +
      '<div style="background:#f8fafc;padding:14px 20px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8;">' +
        '© ' + new Date().getFullYear() + ' Hingas Lifestyle Studio · Surigao City' +
      '</div>' +
    '</div>';
    if (!isTrue(booking.customerEmailSent)) {
      MailApp.sendEmail({ to: booking.email, subject: "Hingas booking confirmed · " + booking.bookingId, body: customerBody, htmlBody: customerHtml, replyTo: settings.studioEmail });
      const smsText = "Hingas Studio: Booking " + booking.bookingId + " for " + classInfo.name + " on " + dateText + " at " + time + " is CONFIRMED (" + booking.seats + " seat/s). See you at 2F Yamaha Eduhome!";
      sendSMS(booking.mobile, smsText);
      updateBooking(bookingId, { customerEmailSent: true });
    }
    if (!isTrue(booking.studioEmailSent)) {
      notifyStudio(settings.studioEmail, "Paid class booking · " + booking.bookingId,
        classInfo.name + "\n" + dateText + " at " + time + "\n" + booking.seats + " seat(s)\nPHP " + Number(booking.amount).toFixed(2) +
        "\n" + booking.name + " · " + booking.mobile + " · " + booking.email);
      updateBooking(bookingId, { studioEmailSent: true });
    }
  } finally {
    lock.releaseLock();
  }
}

function getBookingStatus(bookingId) {
  if (!/^HG-[A-F0-9]{12}$/.test(bookingId)) return { ok: false, error: "Booking reference is invalid." };
  let booking = findBooking(bookingId);
  if (!booking) return { ok: false, error: "Booking was not found." };
  if (booking.status === "held" && asDateTime(booking.heldUntil) <= new Date()) {
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const current = findBooking(bookingId);
      if (current && current.status === "held" && asDateTime(current.heldUntil) <= new Date()) {
        setBookingStatus(bookingId, "expired");
      }
      booking = findBooking(bookingId);
    } finally {
      lock.releaseLock();
    }
  }
  const session = findSession(booking.sessionId);
  const classInfo = session && findClass(String(session.classId));
  return {
    ok: true,
    status: booking.status,
    booking: booking.status === "paid" ? {
      reference: booking.bookingId,
      className: classInfo ? String(classInfo.name) : "Class",
      classDate: Utilities.formatDate(asDate(session.date), Session.getScriptTimeZone(), "yyyy-MM-dd"),
      classTime: normalizeTime(session.startTime),
      duration: Number(session.durationMin),
      quantity: Number(booking.seats),
      amount: Number(booking.amount)
    } : null
  };
}

function getSettings() {
  const properties = PropertiesService.getScriptProperties();
  const settings = {
    hitpayApiKey: properties.getProperty("HITPAY_API_KEY") || "",
    hitpaySalt: properties.getProperty("HITPAY_SALT") || "",
    hitpayMode: properties.getProperty("HITPAY_MODE") || "sandbox",
    siteUrl: properties.getProperty("SITE_URL") || "",
    webhookUrl: properties.getProperty("WEBHOOK_URL") || (ScriptApp.getService().getUrl() + "?action=hitpay_webhook"),
    studioEmail: getStudioSettings().studioEmail
  };
  if (!settings.hitpayApiKey || !settings.hitpaySalt || !settings.siteUrl || !settings.webhookUrl) {
    throw new Error("Complete the Apps Script configuration properties before accepting requests.");
  }
  if (settings.hitpayMode !== "sandbox" && settings.hitpayMode !== "live") throw new Error("HITPAY_MODE must be sandbox or live.");
  return settings;
}

function getStudioSettings() {
  return {
    studioEmail: PropertiesService.getScriptProperties().getProperty("STUDIO_EMAIL") || "hingaslifestylestudio@gmail.com"
  };
}

function readRows(sheetName) {
  const sheet = getSheet(sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).filter(function (row) { return row.some(function (cell) { return cell !== ""; }); })
    .map(function (row) {
      return headers.reduce(function (record, header, index) {
        record[header] = row[index];
        return record;
      }, {});
    });
}

function getSheet(name) {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("SPREADSHEET_ID is not configured.");
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(name);
  if (!sheet) throw new Error("Missing " + name + " sheet. Run setupHingas().");
  return sheet;
}

function appendRow(sheetName, record) {
  const headers = SHEET_HEADERS[sheetName];
  getSheet(sheetName).appendRow(headers.map(function (header) { return record[header] === undefined ? "" : record[header]; }));
}

function findSession(sessionId) {
  return readRows("Schedule").find(function (row) { return String(row.sessionId) === sessionId; }) || null;
}

function findClass(classId) {
  return readRows("Classes").find(function (row) { return String(row.id) === classId; }) || null;
}

function findBooking(bookingId) {
  return readRows("Bookings").find(function (row) { return String(row.bookingId) === bookingId; }) || null;
}

function setBookingStatus(bookingId, status) {
  updateBooking(bookingId, { status: status });
}

function updateBooking(bookingId, updates) {
  const sheet = getSheet("Bookings");
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf("bookingId");
  const rowIndex = values.findIndex(function (row, index) { return index > 0 && String(row[idIndex]) === bookingId; });
  if (rowIndex < 1) throw new Error("Booking was not found.");
  Object.keys(updates).forEach(function (key) {
    const column = headers.indexOf(key);
    if (column >= 0) sheet.getRange(rowIndex + 1, column + 1).setValue(updates[key]);
  });
}

function jsonResponse(data, callback) {
  const json = JSON.stringify(data);
  if (callback && /^[A-Za-z_$][\w.$]{0,80}$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + json + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function frameResponse(data) {
  const encoded = JSON.stringify(data).replace(/</g, "\\u003c");
  return HtmlService.createHtmlOutput("<!doctype html><meta charset=\"utf-8\"><script>window.parent.postMessage(" +
    encoded + ",\"*\");</script>").setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function notifyStudio(to, subject, body) {
  MailApp.sendEmail({ to: to, subject: subject, body: body });
}

function sendSMS(mobile, message) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("SEMAPHORE_API_KEY");
  if (!apiKey || !mobile) return;
  const senderName = PropertiesService.getScriptProperties().getProperty("SEMAPHORE_SENDER_NAME") || "SEMAPHORE";
  try {
    UrlFetchApp.fetch("https://api.semaphore.co/api/v4/messages", {
      method: "post",
      payload: {
        apikey: apiKey,
        number: mobile,
        message: message,
        sendername: senderName
      },
      muteHttpExceptions: true
    });
  } catch (err) {
    console.warn("SMS dispatch skipped or failed: " + err.message);
  }
}

function requiredText(value, label, maxLength) {
  const text = String(value || "").trim();
  if (!text || text.length > maxLength) throw new Error(label + " is required.");
  return text;
}

function asDate(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  if (!value) return null;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function asDateTime(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function normalizeTime(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), "HH:mm");
  const text = String(value || "").trim();
  const match = text.match(/^(\d{1,2}):(\d{2})/);
  if (!match) throw new Error("Schedule contains an invalid start time.");
  return ("0" + match[1]).slice(-2) + ":" + match[2];
}

function isTrue(value) {
  return value === true || String(value).toLowerCase() === "true" || String(value) === "1";
}

function constantTimeEquals(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}
