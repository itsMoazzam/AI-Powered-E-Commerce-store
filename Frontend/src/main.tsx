import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './theme/ThemeProvider'
import App from './App.tsx'
import { store } from './store/index.ts'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from "@react-oauth/google"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
        renderers.forEach((renderer: any, id: any) => {
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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>


      <Provider store={store}>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </GoogleOAuthProvider>

  </StrictMode>,
)
