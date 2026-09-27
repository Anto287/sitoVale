import { useTranslation } from 'react-i18next'
import { CONTACT } from '../config'
import { LegalNotice } from './LegalNotice'

const LINKS = [
  ['#chi', 'nav.about'],
  ['#lezioni', 'nav.lessons'],
  ['#tariffe', 'nav.rates'],
  ['#recensioni', 'nav.reviews'],
  ['#dove', 'nav.where'],
  ['#galleria', 'nav.gallery'],
] as const

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <a className="footer-name" href="#top">
            Valentina Bernardi
          </a>
          <p>{t('footer.role')}</p>
          <p>{t('footer.places')}</p>
        </div>
        <nav aria-label={t('footer.explore')}>
          <p className="footer-title">{t('footer.explore')}</p>
          <ul>
            {LINKS.map(([href, key]) => (
              <li key={href}>
                <a href={href}>{t(key)}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="footer-title">{t('footer.reach')}</p>
          <ul>
            <li>
              <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`}>Email</a>
            </li>
            <li>
              <a href={CONTACT.instagram} target="_blank" rel="noopener">
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-bottom">
        {/* l'anno della pagina pre-generata può differire da quello del visitatore a gennaio */}
        <span suppressHydrationWarning>© {new Date().getFullYear()} Valentina Bernardi</span>
        <span className="footer-bottom-links">
          <LegalNotice />
          <a href="#top">{t('footer.top')}</a>
        </span>
      </div>
    </footer>
  )
}
