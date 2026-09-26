import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { AppProvider } from './AppContext'
import App from './App'
import './index.css'

registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)

// Warm on-device OCR after first paint so the first scan is fast
const warm = () => {
  import('./ocr/localOcr')
    .then((m) => m.warmLocalOcr())
    .catch(() => {})
}
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(warm, { timeout: 4000 })
  } else {
    window.setTimeout(warm, 1200)
  }
}
