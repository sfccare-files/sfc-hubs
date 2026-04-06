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
    return `
      <div class="box box-copy phone-copy-target" data-phone-value="${escapeHtmlAttr(value || "")}">
        <div class="box-copy-text"><b>${label}:</b> ${value || ""}</div>
        <button
          class="inline-copy-btn"
          onclick='copyTextValue(${JSON.stringify(value || "")}, ${JSON.stringify(label)}, this)'
          aria-label="Copy ${label}"
          title="Copy ${label}"
          ${value ? "" : "disabled"}>
          ${copyIcon(label)}
        </button>
      </div>
    `;
  }

  return `
    <div class="hub-popup">
      <button
        class="hub-favorite-btn"
        onclick='toggleFavoriteFromPopup(${JSON.stringify(hub.name)})'
        aria-label="Toggle favorite"
        title="Toggle favorite">
        ${favoriteIcon}
      </button>

      <div class="hub-popup-body">
        <h2 class="title">Hub Details</h2>

        <div class="box"><b>Name:</b> ${hub.name || ""}</div>
        <div class="box"><b>Address:</b> ${hub.address || ""}</div>

        <div class="grid2">
          <div class="box"><b>Hub ID:</b> ${hub.hub_id || ""}</div>
          <div class="box"><b>Distance:</b> ${distanceValue}</div>
        </div>

        <div class="grid2">
          <div class="box"><b>District:</b> ${hub.district || ""}</div>
          <div class="box"><b>Division:</b> ${hub.division || ""}</div>
        </div>

        <div class="box"><b>Police Station:</b> ${policeStation}</div>

        <div class="grid2">
          <div class="box"><b>Zonal Manager:</b> ${zonalManager}</div>
          ${phoneBox("Phone", zonalManagerPhone)}
        </div>

        <div class="box box-copy">
          <div class="box-copy-text"><b>Coordinates:</b> ${lat}, ${lng}</div>
          <button
            class="inline-copy-btn"
            onclick="copyCoordinates(${lat}, ${lng}, this)"
            aria-label="Copy Coordinates"
            title="Copy Coordinates">
            ${copyIcon("Coordinates")}
          </button>
        </div>

        <hr>

        <div class="section">Contact Details</div>

        <div class="grid2">
          <div class="box"><b>Hub IP:</b> ${hub.hub_ip || ""}</div>
          ${phoneBox("Hub Phone", hub.hub_phone || "")}
        </div>

        <div class="grid2">
          <div class="box"><b>Manager:</b> ${hub.manager || ""}</div>
          ${phoneBox("Phone", hub.manager_phone || "")}
        </div>

        <div class="grid2">
          <div class="box"><b>Asst. Manager:</b> ${hub.assistant_manager || ""}</div>
          ${phoneBox("Phone", hub.assistant_manager_phone || "")}
        </div>

        <div class="grid2">
          <div class="box"><b>Team Leader:</b> ${teamLeader}</div>
          ${phoneBox("Phone", teamLeaderPhone)}
        </div>
      </div>

      <div class="hub-popup-footer">
        <button class="direction-btn" onclick="openDirections(${lat},${lng})">
          📍 Get Directions
        </button>

        <div class="hub-popup-secondary-actions">
          <button
            class="secondary-action-btn"
            onclick='callPhone(${JSON.stringify(preferredPhone)})'
            ${preferredPhone ? "" : "disabled"}>
            📞 Call
          </button>

          <button
            class="secondary-action-btn"
            onclick='openWhatsappGroup(${JSON.stringify(whatsappGroup)})'
            ${whatsappGroup ? "" : "disabled"}>
            💬 Whatsapp
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

function toggleFavoriteFromPopup(hubName) {
  const hub = allHubs.find(function(item) {
    return item.name === hubName;
  });

  if (!hub) return;

  toggleFavoriteHub(hub);
}

function openDirections(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function callPhone(phone) {
  if (!phone) {
    showMapToast("Phone number not available.");
    return;
  }

  window.location.href = `tel:${phone}`;
}

function openWhatsappGroup(link) {
  if (!link) {
    showMapToast("Whatsapp group link not available.");
    return;
  }

  const trimmedLink = String(link).trim();

  if (!trimmedLink.startsWith("https://chat.whatsapp.com/")) {
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
  if (tooltip) {
    tooltip.textContent = "Copied";
  }

  clearTimeout(triggerEl._copyTimer);
  triggerEl._copyTimer = setTimeout(function() {
    triggerEl.classList.remove("copy-success");
    if (tooltip) {
      tooltip.textContent = "Copy";
    }
  }, 1000);
}

function highlightPhoneBox(triggerEl) {
  if (!triggerEl || window.innerWidth > 768) return;

  const targetBox = triggerEl.closest(".phone-copy-target");
  if (!targetBox) return;

  targetBox.classList.add("phone-tap-active");

  clearTimeout(targetBox._tapTimer);
  targetBox._tapTimer = setTimeout(function() {
    targetBox.classList.remove("phone-tap-active");
  }, 700);
}

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}