function buildPopup(hub, lat, lng) {
  const preferredPhone =
    hub.hub_phone ||
    hub.manager_phone ||
    hub.assistant_manager_phone ||
    hub.hub_assistant_phone ||
    "";

  function copyIcon(label) {
    return `<img src="assets/images/copy.png" alt="Copy ${label}" class="inline-copy-icon">`;
  }

  function phoneBox(label, value) {
    return `
      <div class="box box-copy">
        <div class="box-copy-text"><b>${label}:</b> ${value || ""}</div>
        <button
          class="inline-copy-btn"
          onclick='copyTextValue(${JSON.stringify(value || "")}, ${JSON.stringify(label)})'
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

      <div class="hub-popup-body">

        <h2 class="title">Hub Details</h2>

        <div class="box"><b>Name:</b> ${hub.name || ""}</div>

        <div class="box"><b>Address:</b> ${hub.address || ""}</div>

        <div class="grid2">
          <div class="box"><b>Hub ID:</b> ${hub.hub_id || ""}</div>
          <div class="box"><b>Zone:</b> ${hub.zone || ""}</div>
        </div>

        <div class="grid2">
          <div class="box"><b>District:</b> ${hub.district || ""}</div>
          <div class="box"><b>Division:</b> ${hub.division || ""}</div>
        </div>

        <div class="box box-copy">
          <div class="box-copy-text"><b>Coordinates:</b> ${lat}, ${lng}</div>
          <button
            class="inline-copy-btn"
            onclick="copyCoordinates(${lat}, ${lng})"
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
          <div class="box"><b>Hub Asst:</b> ${hub.hub_assistant || ""}</div>
          ${phoneBox("Phone", hub.hub_assistant_phone || "")}
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
            onclick="copyCoordinates(${lat}, ${lng})">
            🧭 Copy Coords
          </button>
        </div>
      </div>

    </div>
  `;
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

function copyTextValue(value, label) {
  if (!value) {
    showMapToast(`${label} not available.`);
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(function() {
      showMapToast(`${label} copied.`);
    }).catch(function() {
      fallbackCopy(value, label);
    });
    return;
  }

  fallbackCopy(value, label);
}

function copyCoordinates(lat, lng) {
  copyTextValue(`${lat}, ${lng}`, "Coordinates");
}

function fallbackCopy(value, label) {
  const temp = document.createElement("textarea");
  temp.value = value;
  document.body.appendChild(temp);
  temp.select();

  try {
    document.execCommand("copy");
    showMapToast(`${label} copied.`);
  } catch (e) {
    showMapToast(`Could not copy ${label.toLowerCase()}.`);
  }

  document.body.removeChild(temp);
}