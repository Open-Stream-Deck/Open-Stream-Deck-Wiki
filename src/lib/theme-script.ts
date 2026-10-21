export const STORAGE_KEY = 'theme'
export const QUERY = '(prefers-color-scheme: dark)'

export const themeScript = `(() => {
  try {
    const stored = localStorage.getItem('${STORAGE_KEY}')
    const dark = stored === 'dark' || (stored !== 'light' && matchMedia('${QUERY}').matches)
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  } catch {}
})()`
