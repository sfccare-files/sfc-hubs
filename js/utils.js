function getConfig() {
  return window.APP_CONFIG;
}

function getState() {
  return window.APP_STATE;
}

function safeReadStoredList(key) {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.warn("Failed to parse localStorage list for key:", key, error);
    try {
      localStorage.removeItem(key);
    } catch (_) {
      // Ignore cleanup errors.
    }
    return [];
  }
}

function saveStoredList(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Failed to write localStorage list for key:", key, error);
  }
}

function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeHeaderKey(key) {
  return String(key || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function normalizeCellValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function parseCoordinate(value) {
  if (value === "") return NaN;
  return parseFloat(String(value).replace(/,/g, "").trim());
}

function isValidLatitude(lat) {
  return !isNaN(lat) && lat >= -90 && lat <= 90;
}

function isValidLongitude(lng) {
  return !isNaN(lng) && lng >= -180 && lng <= 180;
}

function normalizePhoneForCall(phone) {
  return String(phone || "").replace(/[^\d+]/g, "").trim();
}

function isCallablePhone(phone) {
  const normalized = normalizePhoneForCall(phone);
  return normalized.length >= 5;
}

function isValidWhatsappGroupLink(link) {
  const trimmedLink = String(link || "").trim();
  return trimmedLink.startsWith("https://chat.whatsapp.com/");
}

function debounce(fn, delay) {
  let timer = null;

  return function() {
    const context = this;
    const args = arguments;

    clearTimeout(timer);

    timer = setTimeout(function() {
      fn.apply(context, args);
    }, delay);
  };
}