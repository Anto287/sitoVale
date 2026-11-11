import { useTranslation } from 'react-i18next'
import { CLOUDFLARE_WEB_ANALYTICS, CONTACT, GOATCOUNTER, LEGAL, TURNSTILE_SITE_KEY } from '../config'
import { pathFor, type Language } from '../i18n'
import { SITE_URL } from '../site'

export function LegalNotice({ lang }: { lang: Language }) {
  const { t } = useTranslation()
  const field = (value: string) => value || <em className="legal-todo">{t('legal.todo')}</em>
  const rows: [string, React.ReactNode][] = [
    [t('legal.publisher'), LEGAL.publisher],
    [t('legal.status'), field(LEGAL.status)],
    [t('legal.address'), field(LEGAL.address)],
    [t('legal.siret'), field(LEGAL.siret)],
    ...(LEGAL.vat ? [[t('legal.vat'), LEGAL.vat] as [string, React.ReactNode]] : []),
    [t('legal.contact'), <a key="mail" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>],
    [t('legal.host'), field(LEGAL.host)],
    [t('legal.mediator'), field(LEGAL.mediator)],
  ]

  return (
    <main className="legal wrap">
      <a href={pathFor(lang)}>{t('legal.home')}</a>
      <h1>{t('legal.legalTitle')}</h1>
      <p className="legal-site">{SITE_URL.replace('https://', '')}</p>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <h2>{t('legal.ipTitle')}</h2>
      <p>{t('legal.ip')}</p>
      <h2 id="privacy">{t('legal.privacyTitle')}</h2>
      <p>
        {[
          t('legal.privacyBase'),
          t(GOATCOUNTER || CLOUDFLARE_WEB_ANALYTICS ? 'legal.privacyStats' : 'legal.privacyNoStats'),
          t('legal.privacyForm'),
          ...(TURNSTILE_SITE_KEY ? [t('legal.privacyCaptcha')] : []),
          t('legal.privacyRights'),
        ].join(' ')}
      </p>
    </main>
  )
}
