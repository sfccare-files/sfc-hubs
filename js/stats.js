function updateStats(filteredHubs) {
  const totalHubs = allHubs.length;
  const visibleHubs = filteredHubs.length;

  const divisions = [...new Set(filteredHubs.map(h => h.division).filter(Boolean))].length;
  const districts = [...new Set(filteredHubs.map(h => h.district).filter(Boolean))].length;
  const zones = [...new Set(filteredHubs.map(h => h.zone).filter(Boolean))].length;

  const totalHubsEl = document.getElementById("totalHubsCount");
  const visibleHubsEl = document.getElementById("visibleHubsCount");
  const divisionCountEl = document.getElementById("divisionCount");
  const districtCountEl = document.getElementById("districtCount");
  const zoneCountEl = document.getElementById("zoneCount");

  if (totalHubsEl) totalHubsEl.textContent = totalHubs;
  if (visibleHubsEl) visibleHubsEl.textContent = visibleHubs;
  if (divisionCountEl) divisionCountEl.textContent = divisions;
  if (districtCountEl) districtCountEl.textContent = districts;
  if (zoneCountEl) zoneCountEl.textContent = zones;
}