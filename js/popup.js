/* =========================
   BUILD POPUP (V3.6 FINAL)
========================= */

function buildPopup(hub, lat, lng, distanceFromUser) {
  const policeStation = hub.police_station || "";
  const zonalManager = hub.zonal || "";
  const zonalManagerPhone = hub.phone || "";
  const teamLeader = hub.team_leader || "";
  const teamLeaderPhone = hub.team_leader_phone || "";
  const whatsappGroup = hub.whatsapp_group || "";

  const preferredPhone =
    hub.hub_phone ||
    hub.manager_phone ||
    hub.assistant_manager_phone ||
    teamLeaderPhone ||
    zonalManagerPhone ||
    "";

  const favoriteIcon = isFavoriteHub(hub.name) ? "★" : "☆";
  const distanceValue = distanceFromUser || "Not available";

  function copyIcon(label) {
    return `
      <span class="copy-btn-inner">
        <img src="assets/images/copy.png" alt="Copy ${label}" class="inline-copy-icon">
        <span class="copy-tooltip">Copy</span>
      </span>
    `;
  }

  function phoneBox(label, value) {
    const safeValue = value || "";

    return `
      <div class="box box-copy phone-copy-target" data-phone-value="${escapeHtmlAttr(safeValue)}">
        <div class="box-copy-text"><b>${label}:</b> ${escapeHtmlText(safeValue)}</div>
        <button
          class="inline-copy-btn"
          onclick='copyTextValue(${JSON.stringify(safeValue)}, ${JSON.stringify(label)}, this)'
          ${safeValue ? "" : "disabled"}>
          ${copyIcon(label)}
        </button>
      </div>
    `;
  }

  return `
    <div class="hub-popup">

      <!-- HEADER -->
      <div class="hub-popup-header">
        <div class="hub-header-title">
          ${escapeHtmlText(hub.name || "Hub")}
        </div>

        <div class="hub-header-actions">
          <button
            class="hub-icon-btn"
            onclick='toggleFavoriteFromPopup(${JSON.stringify(hub.name)})'
            title="Favorite">
            ${favoriteIcon}
          </button>

          <button
            class="hub-icon-btn hub-close-btn"
            onclick="closeHubPopup()"
            title="Close">
            ×
          </button>
        </div>
      </div>

      <!-- BODY -->
      <div class="hub-popup-body">

        <div class="section-title">Hub Details</div>

        <div class="box"><b>Name:</b> ${escapeHtmlText(hub.name || "")}</div>
        <div class="box"><b>Address:</b> ${escapeHtmlText(hub.address || "")}</div>

        <div class="grid2">
          <div class="box"><b>Hub ID:</b> ${escapeHtmlText(hub.hub_id || "")}</div>
          <div class="box"><b>Distance:</b> ${escapeHtmlText(distanceValue)}</div>
        </div>

        <div class="grid2">
          <div class="box"><b>District:</b> ${escapeHtmlText(hub.district || "")}</div>
          <div class="box"><b>Division:</b> ${escapeHtmlText(hub.division || "")}</div>
        </div>

        <div class="box"><b>Police Station:</b> ${escapeHtmlText(policeStation)}</div>

        <div class="grid2">
          <div class="box"><b>Zonal Manager:</b> ${escapeHtmlText(zonalManager)}</div>
          ${phoneBox("Phone", zonalManagerPhone)}
        </div>

        <div class="box box-copy">
          <div class="box-copy-text"><b>Coordinates:</b> ${lat}, ${lng}</div>
          <button
            class="inline-copy-btn"
            onclick="copyCoordinates(${lat}, ${lng}, this)">
            ${copyIcon("Coordinates")}
          </button>
        </div>

        <hr>

        <div class="section-title">Contact Details</div>

        <div class="grid2">
          <div class="box"><b>Hub IP:</b> ${escapeHtmlText(hub.hub_ip || "")}</div>
          ${phoneBox("Hub Phone", hub.hub_phone || "")}
        </div>

        <div class="grid2">
          <div class="box"><b>Manager:</b> ${escapeHtmlText(hub.manager || "")}</div>
          ${phoneBox("Phone", hub.manager_phone || "")}
        </div>

        <div class="grid2">
          <div class="box"><b>Asst. Manager:</b> ${escapeHtmlText(hub.assistant_manager || "")}</div>
          ${phoneBox("Phone", hub.assistant_manager_phone || "")}
        </div>

        <div class="grid2">
          <div class="box"><b>Team Leader:</b> ${escapeHtmlText(teamLeader)}</div>
          ${phoneBox("Phone", teamLeaderPhone)}
        </div>

      </div>

      <!-- FOOTER (UPDATED) -->
      <div class="hub-popup-footer">

        <div class="hub-popup-secondary-actions ${getActionClassExtended(preferredPhone, whatsappGroup)}">

          <button
            class="secondary-action-btn"
            onclick="openDirections(${lat},${lng})">
            📍 Directions
          </button>

          <button
            class="secondary-action-btn"
            onclick='callPhone(${JSON.stringify(preferredPhone)})'
            ${isCallablePhone(preferredPhone) ? "" : "disabled"}>
            📞 Call
          </button>

          <button
            class="secondary-action-btn"
            onclick='openWhatsappGroup(${JSON.stringify(whatsappGroup)})'
            ${isValidWhatsappGroupLink(whatsappGroup) ? "" : "disabled"}>
            💬 WhatsApp
          </button>

          <button
            class="secondary-action-btn"
            onclick="copyCoordinates(${lat}, ${lng}, this)">
            🧭 Copy Coords
          </button>

        </div>

      </div>
    </div>
  `;
}

/* =========================
   UPDATED GRID LOGIC
========================= */

function getActionClassExtended(phone, whatsapp) {
  const count =
    1 + // Directions always exists
    (isCallablePhone(phone) ? 1 : 0) +
    (isValidWhatsappGroupLink(whatsapp) ? 1 : 0) +
    1; // Copy always exists

  if (count <= 2) return "actions-2";
  if (count === 3) return "actions-3";
  return "actions-4";
}

/* =========================
   CLOSE SYSTEM
========================= */

function closeHubPopup() {
  const panel = document.getElementById("hubDetailsPanel");
  const overlay = document.getElementById("mapOverlay");

  if (panel) panel.classList.add("hidden");
  if (overlay) overlay.classList.add("hidden");
}

/* =========================
   EXISTING FUNCTIONS (UNCHANGED)
========================= */

function toggleFavoriteFromPopup(hubName) {
  const hub = getState().allHubs.find(function(item) {
    return item.name === hubName;
  });

  if (!hub) return;

  toggleFavoriteHub(hub);
}

function openDirections(lat, lng) {
  if (typeof lat !== "number" || typeof lng !== "number") {
    showMapToast("Directions are not available.");
    return;
  }

  const url = "https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lng;
  window.open(url, "_blank", "noopener,noreferrer");
}

function callPhone(phone) {
  const normalizedPhone = normalizePhoneForCall(phone);

  if (!isCallablePhone(normalizedPhone)) {
    showMapToast("Phone number not available.");
    return;
  }

  window.location.href = "tel:" + normalizedPhone;
}

function openWhatsappGroup(link) {
  const trimmedLink = String(link || "").trim();

  if (!trimmedLink) {
    showMapToast("Whatsapp group link not available.");
    return;
  }

  if (!isValidWhatsappGroupLink(trimmedLink)) {
    showMapToast("Invalid Whatsapp group link.");
    return;
  }

  window.open(trimmedLink, "_blank", "noopener,noreferrer");
}

function copyTextValue(value, label, triggerEl) {
  if (!value) {
    showMapToast(label + " not available.");
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(function() {
      showMapToast(label + " copied.");
      showCopySuccess(triggerEl);
      highlightPhoneBox(triggerEl);
    }).catch(function() {
      fallbackCopy(value, label, triggerEl);
    });
    return;
  }

  fallbackCopy(value, label, triggerEl);
}

function copyCoordinates(lat, lng, triggerEl) {
  copyTextValue(lat + ", " + lng, "Coordinates", triggerEl);
}

function fallbackCopy(value, label, triggerEl) {
  const temp = document.createElement("textarea");
  temp.value = value;
  document.body.appendChild(temp);
  temp.select();

  try {
    document.execCommand("copy");
    showMapToast(label + " copied.");
    showCopySuccess(triggerEl);
    highlightPhoneBox(triggerEl);
  } catch (e) {
    showMapToast("Could not copy " + label.toLowerCase() + ".");
  }

  document.body.removeChild(temp);
}

function showCopySuccess(triggerEl) {
  if (!triggerEl) return;

  triggerEl.classList.add("copy-success");

  const tooltip = triggerEl.querySelector(".copy-tooltip");
  if (tooltip) tooltip.textContent = "Copied";

  clearTimeout(triggerEl._copyTimer);
  triggerEl._copyTimer = setTimeout(function() {
    triggerEl.classList.remove("copy-success");
    if (tooltip) tooltip.textContent = "Copy";
  }, 1000);
}

function highlightPhoneBox(triggerEl) {
  if (!triggerEl || window.innerWidth > getConfig().ui.mobileBreakpoint) return;

  const targetBox = triggerEl.closest(".phone-copy-target");
  if (!targetBox) return;

  targetBox.classList.add("phone-tap-active");

  clearTimeout(targetBox._tapTimer);
  targetBox._tapTimer = setTimeout(function() {
    targetBox.classList.remove("phone-tap-active");
  }, 700);
}