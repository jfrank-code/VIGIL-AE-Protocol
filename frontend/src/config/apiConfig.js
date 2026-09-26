// Centralized backend URL configuration.
//
// This is ALWAYS read from the VITE_API_URL environment variable (set in
// your frontend's .env / .env.local file, or in your hosting provider's
// env vars: Vercel, Netlify, etc.). Never hardcode a specific backend URL
// here (Lightning AI, ngrok, etc.) — those URLs are usually temporary and
// change between sessions/deploys, which was the root cause of the
// production site getting stuck on "Connecting..." indefinitely.
//
// In local development, if VITE_API_URL isn't set, it falls back to localhost:8000.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

if (!import.meta.env.VITE_API_URL) {
  console.warn(
    '[VIGIL-AE] VITE_API_URL is not defined. Using the development fallback ' +
    '(http://localhost:8000). Define VITE_API_URL in your .env file or in your ' +
    'hosting provider\'s environment variables before deploying to production.'
  );
}

export const API_URL = API_BASE;
export default API_BASE;
