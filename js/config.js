window.APP_CONFIG = {
  sheetURL:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYDLFsB6QUf0Vf0kL-COmVR3eh0jXOLnBG1r6stjL7hVf8-kvpV-KjCAv9R9QKAO0C6E00XGfw7I0q/pub?output=csv",

  map: {
    defaultCenter: [23.6850, 90.3563],
    defaultZoom: 7,
    focusZoom: 12,
    nearestZoom: 13,
    singleHubZoom: 12,
    fitPadding: [30, 30],
    flyDuration: 0.8
  },

  ui: {
    toastDuration: 2400,
    hoverCardMaxWidth: 190,
    hoverCardMaxHeight: 90,
    mobileBreakpoint: 768
  },

  search: {
    suggestionLimit: 8,
    debounceMs: 180
  },

  sidebar: {
    maxRecentHubs: 5
  },

  app: {
    startupCheckIntervalMs: 150,
    startupMaxTries: 100
  },

  geolocation: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
};