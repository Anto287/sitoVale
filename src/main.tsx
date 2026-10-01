import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
// Font ospitati dal sito: niente richieste a Google, niente blocco del primo rendering.
import './fonts.css'
import '@fontsource-variable/jost/index.css'
import i18n, { loadLanguage, type Language } from './i18n'
import './lib/gsap'
import 'lenis/dist/lenis.css'
import './styles.css'
import App from './App'

// In produzione i testi della pagina sono già nell'HTML; in sviluppo si scaricano qui.
// changeLanguage dopo il caricamento: senza, i18next non considera "attiva" la lingua appena
// arrivata (resolvedLanguage vuoto) e nessun pulsante EN/IT/FR risulta selezionato.
const lng = i18n.language as Language
await loadLanguage(lng)
await i18n.changeLanguage(lng)

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// In produzione la pagina arriva già disegnata (pre-generata): React la "aggancia" senza ridisegnarla.
// In sviluppo il contenitore è vuoto e React la disegna da zero.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
