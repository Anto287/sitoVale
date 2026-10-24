import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './fonts.css'
import '@fontsource-variable/jost/index.css'
import i18n, { loadLanguage, type Language } from './i18n'
import './lib/gsap'
import 'lenis/dist/lenis.css'
import './styles.css'
import App from './App'

const lng = i18n.language as Language
await loadLanguage(lng)
await i18n.changeLanguage(lng)

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
