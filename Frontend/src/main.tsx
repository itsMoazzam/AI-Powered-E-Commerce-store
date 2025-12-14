import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './theme/ThemeProvider'
import App from './App.tsx'
import { store } from './store/index.ts'
import { Provider } from 'react-redux'
// Temporarily disable Google OAuth wrapper so the app behaves as a non-authenticated user
// import { GoogleOAuthProvider } from "@react-oauth/google"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Runtime flag to indicate whether the GoogleOAuthProvider wrapper is active.
// When the provider is commented out for local testing this remains false.
if (typeof window !== 'undefined') {
  (window as any).__GOOGLE_OAUTH_PROVIDER__ = false;
}

// if (!GOOGLE_CLIENT_ID) {
//   console.warn(
//     '⚠️ Google Client ID is not configured. OAuth login will not work.\n' +
//     'To fix this:\n' +
//     '1. Create a .env.local file in the Frontend directory\n' +
//     '2. Add: VITE_GOOGLE_CLIENT_ID=your-client-id-here\n' +
//     '3. Get your Client ID from https://console.cloud.google.com/\n' +
//     '4. Restart the dev server'
//   );
// }

// Helpful advisory for debugging origin errors (403 from Google)
// if (GOOGLE_CLIENT_ID && typeof window !== 'undefined') {
//   try {
//     console.info(`[Google OAuth] Client ID is set. Current origin: ${window.location.origin}`)
//     console.info(`[Google OAuth] If you see 403 'origin not allowed', add ${window.location.origin} to the OAuth client's Authorized JavaScript origins (Google Cloud Console). See GOOGLE_OAUTH_FIX.md`)
//   } catch (e) {}
// }

// Workaround: Some third-party renderers register with React DevTools without a valid
// semver `version` string which causes the DevTools backend to throw:
// "Invalid argument not valid semver ('') received". Patch the global hook's
// `inject` briefly to normalize empty version strings before any renderer injects.
if (typeof window !== 'undefined') {
  const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
  if (hook && typeof hook.inject === 'function') {
    // Normalize any already-registered renderers (some bundlers/extensions
    // may have registered renderers before our code runs). Ensure the
    // `version` field is a valid semver string when it's an empty string.
    try {
      const renderers = hook.renderers
      if (renderers && typeof renderers.forEach === 'function') {
        renderers.forEach((renderer: any) => {
          try {
            if (renderer && typeof renderer.version === 'string' && renderer.version.trim() === '') {
              renderer.version = '0.0.0'
            }
          } catch (e) {
            // ignore individual renderer normalization errors
          }
        })
      }
    } catch (e) {
      // ignore errors while attempting to normalize existing renderers
    }
    const originalInject = hook.inject.bind(hook)
    hook.inject = (renderer: any) => {
      try {
        if (renderer && typeof renderer.version === 'string' && renderer.version.trim() === '') {
          renderer.version = '0.0.0'
        }
      } catch (e) {
        // swallow any unexpected errors here to avoid breaking app startup
        // and allow original inject to proceed.
        // eslint-disable-next-line no-console
        console.warn('DevTools hook normalization failed', e)
      }
      return originalInject(renderer)
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Google OAuth intentionally commented out for local testing as a guest/non-user */}
    {/* Google provider is disabled; Redux Provider still required for app to function */}
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
