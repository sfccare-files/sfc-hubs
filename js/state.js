window.APP_STATE = {
  map: null,
  markersLayer: null,
  hubMarkers: [],
  allHubs: [],
  activePulseMarker: null,
  userLocationMarker: null,
  lastKnownUserLocation: null,
  toastTimer: null,
  hubHeatmapLayer: null,

  filters: {
    division: [],
    district: [],
    police_station: []
  },

  selection: {
    type: "",
    value: ""
  },

  storage: {
    recentHubs: [],
    favoriteHubs: []
  },

  loadStats: {
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    duplicateRows: 0,
    blankRows: 0,
    invalidCoordRows: 0,
    missingNameRows: 0,
    parseErrors: 0
  },

  mapLayerState: {
    heatmapEnabled: false
  },

  search: {
    activeSuggestionIndex: -1,
    currentSuggestions: []
  }
};