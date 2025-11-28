import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'custom'

type ThemeContextValue = {
  theme: Theme
  primary: string
  text: string
  bg: string
  surface: string
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

  const [text, setTextState] = useState<string>(() => {
    try { return localStorage.getItem('theme:text') || defaultText } catch { return defaultText }
  })

  const [bg, setBgState] = useState<string>(() => {
    try { return localStorage.getItem('theme:bg') || defaultBg } catch { return defaultBg }
  })

  const [surface, setSurfaceState] = useState<string>(() => {
    try { return localStorage.getItem('theme:surface') || defaultSurface } catch { return defaultSurface }
  })

  const [contrast, setContrastState] = useState<number>(() => {
    try { const v = Number(localStorage.getItem('theme:contrast')); return Number.isFinite(v) && v > 0 ? v : defaultContrast } catch { return defaultContrast }
  })

  useEffect(() => {
    try { localStorage.setItem('theme', theme) } catch {}
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem('theme:primary', primary) } catch {}
    document.documentElement.style.setProperty('--color-primary', primary)
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
    document.documentElement.style.setProperty('--surface', surface)
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
    <ThemeContext.Provider value={{ theme, primary, text, bg, surface, contrast, setTheme, setPrimary, setText, setBg, setSurface, setContrast, toggle }}>
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
