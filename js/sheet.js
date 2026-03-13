const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYDLFsB6QUf0Vf0kL-COmVR3eh0jXOLnBG1r6stjL7hVf8-kvpV-KjCAv9R9QKAO0C6E00XGfw7I0q/pub?output=csv";

function loadHubData() {
  Papa.parse(sheetURL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      const hubs = results.data || [];

      hubs.forEach(hub => {
        if (!hub.lat || !hub.lng) return;

        const lat = parseFloat(hub.lat);
        const lng = parseFloat(hub.lng);

        if (isNaN(lat) || isNaN(lng)) return;

        var marker = L.marker([lat, lng]);

        var popup = buildPopup(hub, lat, lng);

        marker.bindPopup(popup, {
          maxWidth: 360,
          minWidth: 360,
          className: "custom-popup"
        });

        marker.hubName = (hub.name || "").toLowerCase();
        marker.hubData = hub;

        markers.addLayer(marker);
        hubMarkers.push(marker);

        allHubs.push({
          name: hub.name || "",
          zone: hub.zone || "",
          district: hub.district || "",
          division: hub.division || "",
          marker: marker,
          raw: hub
        });
      });

      renderTrees(allHubs);
      updateVisibleMarkers(allHubs);
    },
    error: function() {
      const hubTree = document.getElementById("hubTree");
      if (hubTree) {
        hubTree.innerHTML = `<div class="tree-item empty-tree">Failed to load hub data</div>`;
      }
    }
  });
}