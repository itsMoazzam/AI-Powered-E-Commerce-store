// Utility function to detect brightness of a hex color and return contrasting text color
function getContrastingTextColor(hexBg: string): string {
  // Remove # if present
  const hex = hexBg.replace('#', '')
  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  // Calculate luminance using relative luminance formula (WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  // Return black text for bright backgrounds, white for dark
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'custom'

type ThemeContextValue = {
  theme: Theme
  primary: string
  primaryText: string
  text: string
  bg: string
  surface: string
  surfaceText: string
  contrast: number
  setTheme: (t: Theme) => void
  setPrimary: (c: string) => void
  setText: (c: string) => void
  setBg: (c: string) => void
  setSurface: (c: string) => void
  setContrast: (v: number) => void
  toggle: () => void
}

const defaultPrimary = '#6366f1'
const defaultText = '#111827'
const defaultBg = '#ffffff'
const defaultSurface = '#ffffff'
const defaultContrast = 100
const defaultPrimaryText = '#ffffff'
const defaultSurfaceText = '#000000'

const ThemeContext = createContext<ThemeContextValue | null>(null)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const raw = localStorage.getItem('theme')
      return (raw as Theme) || 'light'
    } catch { return 'light' }
  })

  const [primary, setPrimaryState] = useState<string>(() => {
    try { return localStorage.getItem('theme:primary') || defaultPrimary } catch { return defaultPrimary }
  })

  const [primaryText, setPrimaryTextState] = useState<string>(() => {
    try { return localStorage.getItem('theme:primaryText') || getContrastingTextColor(defaultPrimary) } catch { return getContrastingTextColor(defaultPrimary) }
  })

  const [text, setTextState] = useState<string>(() => {
    try { return localStorage.getItem('theme:text') || defaultText } catch { return defaultText }
  })

  const [bg, setBgState] = useState<string>(() => {
    try { return localStorage.getItem('theme:bg') || defaultBg } catch { return defaultBg }
  })

  const [surface, setSurfaceState] = useState<string>(() => {
    try { return localStorage.getItem('theme:surface') || defaultSurface } catch { return defaultSurface }
  })

  const [surfaceText, setSurfaceTextState] = useState<string>(() => {
    try { return localStorage.getItem('theme:surfaceText') || getContrastingTextColor(defaultSurface) } catch { return getContrastingTextColor(defaultSurface) }
  })

  const [contrast, setContrastState] = useState<number>(() => {
    try { const v = Number(localStorage.getItem('theme:contrast')); return Number.isFinite(v) && v > 0 ? v : defaultContrast } catch { return defaultContrast }
  })

  useEffect(() => {
    try { localStorage.setItem('theme', theme) } catch {}
    document.documentElement.setAttribute('data-theme', theme)
    // ensure Tailwind `dark:` variants still work by toggling the `dark` class
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch {}
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem('theme:primary', primary) } catch {}
    const computedText = getContrastingTextColor(primary)
    setPrimaryTextState(computedText)
    try { localStorage.setItem('theme:primaryText', computedText) } catch {}
    document.documentElement.style.setProperty('--color-primary', primary)
    document.documentElement.style.setProperty('--color-primary-text', computedText)
  }, [primary])

  useEffect(() => {
    try { localStorage.setItem('theme:text', text) } catch {}
    document.documentElement.style.setProperty('--text', text)
  }, [text])

  useEffect(() => {
    try { localStorage.setItem('theme:bg', bg) } catch {}
    document.documentElement.style.setProperty('--bg', bg)
  }, [bg])

  useEffect(() => {
    try { localStorage.setItem('theme:surface', surface) } catch {}
    const computedSurfaceText = getContrastingTextColor(surface)
    setSurfaceTextState(computedSurfaceText)
    try { localStorage.setItem('theme:surfaceText', computedSurfaceText) } catch {}
    document.documentElement.style.setProperty('--surface', surface)
    document.documentElement.style.setProperty('--surface-text', computedSurfaceText)
  }, [surface])

  useEffect(() => {
    try { localStorage.setItem('theme:contrast', String(contrast)) } catch {}
    document.documentElement.style.setProperty('--contrast', `${contrast}%`)
  }, [contrast])

  const setTheme = (t: Theme) => setThemeState(t)
  const setPrimary = (c: string) => setPrimaryState(c)
  const setText = (c: string) => setTextState(c)
  const setBg = (c: string) => setBgState(c)
  const setSurface = (c: string) => setSurfaceState(c)
  const setContrast = (v: number) => setContrastState(v)
  const toggle = () => setThemeState((s) => (s === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, primary, primaryText, text, bg, surface, surfaceText, contrast, setTheme, setPrimary, setText, setBg, setSurface, setContrast, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export default ThemeProvider
