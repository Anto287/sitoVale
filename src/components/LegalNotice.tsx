import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CONTACT, LEGAL } from '../config'
import { SITE_URL } from '../site'
import { gsap, prefersReducedMotion } from '../lib/gsap'

/**
 * Note legali / mentions légales (in Francia obbligatorie per un sito professionale).
 * <dialog> nativo: focus, Esc e accessibilità li gestisce il browser. I dati stanno in src/config.ts.
 */
export function LegalNotice() {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)

  const open = () => {
    const d = ref.current!
    d.showModal()
    if (!prefersReducedMotion()) gsap.fromTo(d, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' })
  }
  const close = () => {
    const d = ref.current!
    if (prefersReducedMotion()) return d.close()
    gsap.to(d, { y: 16, autoAlpha: 0, duration: 0.3, ease: 'power2.in', onComplete: () => d.close() })
  }

  const field = (value: string) => value || <em className="legal-todo">{t('legal.todo')}</em>
  const rows: [string, React.ReactNode][] = [
    [t('legal.publisher'), LEGAL.publisher],
    [t('legal.status'), field(LEGAL.status)],
    [t('legal.address'), field(LEGAL.address)],
    [t('legal.siret'), field(LEGAL.siret)],
    ...(LEGAL.vat ? [[t('legal.vat'), LEGAL.vat] as [string, React.ReactNode]] : []),
    [t('legal.contact'), <a key="mail" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>],
    [t('legal.host'), field(LEGAL.host)],
  ]

  return (
    <>
      <button type="button" className="footer-legal" onClick={open}>
        {t('legal.legal')}
      </button>
      <dialog
        ref={ref}
        className="legal"
        aria-labelledby="legal-title"
        onCancel={(e) => {
          e.preventDefault()
          close()
        }}
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div className="legal-body">
          <button type="button" className="legal-close" aria-label={t('legal.close')} onClick={close}>
            ×
          </button>
          <h2 id="legal-title">{t('legal.legalTitle')}</h2>
          <p className="legal-site">{SITE_URL.replace('https://', '')}</p>
          <dl>
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <h3>{t('legal.ipTitle')}</h3>
          <p>{t('legal.ip')}</p>
          <h3>{t('legal.privacyTitle')}</h3>
          <p>{t('legal.privacy')}</p>
        </div>
      </dialog>
    </>
  )
}
