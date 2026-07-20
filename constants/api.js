// Shared API config. Kept minimal on purpose (per your existing pattern
// of calling fetch directly in each screen) — just pulls the repeated
// base URL + ngrok header into one place.

export const BASE_URL = "https://unjuicy-schizogenous-gibson.ngrok-free.dev/api";

export const NGROK_HEADERS = {
  "ngrok-skip-browser-warning": "true",
};
