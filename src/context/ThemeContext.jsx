import { createContext, useContext, useState, useEffect } from 'react'
import { getTheme } from '../utils/github.js'

const DEFAULT_THEME = {
  primaryColor: '#3b82f6',
  fontFamily: 'system',
  radius: 8,
  cardSpacing: 20,
  layout: 'sidebar',
  headerStyle: 'clean',
  showExcerpt: true,
  showReadingTime: true,
  showTags: true,
  sidebarTitle: '关于本站',
  sidebarBio: '记录技术学习与成长的点滴',
}

const FONT_MAP = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  serif: '"Noto Serif SC", "Source Han Serif", Georgia, serif',
  mono: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
}

const ThemeContext = createContext({ theme: DEFAULT_THEME, applyTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME)

  useEffect(() => {
    async function load() {
      const t = await getTheme()
      if (t) setTheme({ ...DEFAULT_THEME, ...t })
    }
    load()
  }, [])

  useEffect(() => {
    applyThemeToCSS(theme)
  }, [theme])

  function applyThemeToCSS(t) {
    const root = document.documentElement
    root.style.setProperty('--primary', t.primaryColor)
    root.style.setProperty('--primary-dark', shadeColor(t.primaryColor, -15))
    root.style.setProperty('--radius', `${t.radius}px`)
    root.style.setProperty('--card-spacing', `${t.cardSpacing}px`)
    root.style.setProperty('--font-main', FONT_MAP[t.fontFamily] || FONT_MAP.system)
  }

  function shadeColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.max(0, Math.min(255, (num >> 16) + Math.round(255 * percent / 100)))
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * percent / 100)))
    const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round(255 * percent / 100)))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
