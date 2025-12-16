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
// `inject` and `registerRendererInterface` briefly to normalize empty version
// strings and guard against thrown errors so the page doesn't crash during dev.
// Only apply these devtools guards during development builds
if (typeof window !== 'undefined' && import.meta.env.DEV) {
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
        console.warn('DevTools hook normalization failed (inject)', e)
      }
      return originalInject(renderer)
    }

    // Some DevTools backends call `registerRendererInterface` which may in turn
    // validate a version string. Wrap it to normalize empty values and to
    // prevent an uncaught exception from bubbling up to the page.
    if (typeof hook.registerRendererInterface === 'function') {
      const origRegister = hook.registerRendererInterface.bind(hook)
      hook.registerRendererInterface = (rendererInterface: any, ...rest: any[]) => {
        try {
          if (rendererInterface && typeof rendererInterface.version === 'string' && rendererInterface.version.trim() === '') {
            rendererInterface.version = '0.0.0'
          }
        } catch (err) {
          // ignore normalization errors, but don't let them crash the page
          // eslint-disable-next-line no-console
          console.warn('DevTools hook normalization failed (registerRendererInterface)', err)
        }
        try {
          return origRegister(rendererInterface, ...rest)
        } catch (err) {
          // Guard: if DevTools throws here (e.g., invalid semver), swallow the
          // error in development so it doesn't break the app. Log a warning for
          // visibility.
          // eslint-disable-next-line no-console
          console.warn('React DevTools registerRendererInterface threw, suppressing in dev:', err)
          return undefined
        }
      }
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

// Dev-only: quick backend reachability check to give a helpful console warning
// when the Vite proxy cannot connect to the backend (helps diagnose
// `ECONNREFUSED` proxy errors during local development).
if (import.meta.env.DEV) {
  ; (async () => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 2000)
      try {
        // Probe a lightweight products endpoint which commonly exists; if it
        // returns non-OK (404/etc) we assume the backend is reachable and do
        // not warn — only network/connection errors should trigger guidance.
        const probe = await fetch('/api/products/?page_size=1', { method: 'GET', signal: controller.signal })
        if (!probe.ok) {
          // backend responded with a non-OK status (404/400 etc). That's fine —
          // backend is reachable. Do not warn to avoid noisy messages.
        }
      } finally {
        clearTimeout(timeout)
      }
    } catch (err: any) {
      if (err && err.name === 'AbortError') return
      // Friendly multi-line console guidance for network/connectivity issues
      // eslint-disable-next-line no-console
      console.warn('\n[dev] Unable to reach backend through Vite proxy (network error). This usually means the backend is not running or the proxy target is incorrect.\n' +
        ' - Check your backend is running (default: http://localhost:8000)\n' +
        ' - Or set VITE_API_BASE_URL in your environment to the correct backend URL\n' +
        ' - Examples: VITE_API_BASE_URL=http://localhost:8000 or http://127.0.0.1:8000\n')
    }
  })()
}
