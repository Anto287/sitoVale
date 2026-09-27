import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { CONTACT, SITE_URL as FINAL_SITE_URL } from './src/config'
import images from './src/data/images.json'

/**
 * Completa index.html con i dati di src/config.ts e del manifest delle foto,
 * così dominio, contatti e nomi dei file stanno in un posto solo.
 * (Titolo, descrizione e hreflang di ogni lingua li aggiunge scripts/prerender.mjs.)
 */
// Indirizzo e cartella di pubblicazione: li passa la GitHub Action (vedi src/site.ts).
// In locale: dominio definitivo e radice.
const SITE_URL = (process.env.VITE_SITE_URL || FINAL_SITE_URL).replace(/\/$/, '')
const BASE = process.env.BASE_PATH ? `${process.env.BASE_PATH.replace(/\/$/, '')}/` : '/'

function siteHtml(): Plugin {
  const hero = images['lezioni/mare-di-nuvole'].files as [number, string][]
  const preload = `<link rel="preload" as="image" type="image/webp" fetchpriority="high" imagesizes="100vw" imagesrcset="${hero.map(([w, url]) => `${BASE}${url.slice(1)} ${w}w`).join(', ')}">`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#valentina`,
        name: 'Valentina Bernardi',
        jobTitle: 'Ski instructor',
        url: `${SITE_URL}/`,
        image: `${SITE_URL}${(images['valentina/ritratto-casco'].files as [number, string][]).at(-1)![1]}`,
        knowsLanguage: ['it', 'fr', 'en'],
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${SITE_URL}/#vally-ski`,
        name: 'Vally Ski — Valentina Bernardi, ski instructor',
        description: "Private, children's and family ski lessons in Les Arcs, Val d'Isère and Tignes (Tarentaise, Savoie).",
        url: `${SITE_URL}/`,
        image: `${SITE_URL}/og-image.jpg`,
        logo: `${SITE_URL}/icons/icon-512.png`,
        founder: { '@id': `${SITE_URL}/#valentina` },
        availableLanguage: ['it', 'fr', 'en'],
        areaServed: ['Les Arcs', "Val d'Isère", 'Tignes'].map((name) => ({ '@type': 'Place', name: `${name}, Savoie, France` })),
        address: { '@type': 'PostalAddress', addressRegion: 'Savoie', addressCountry: 'FR' },
        telephone: `+${CONTACT.whatsapp}`,
        email: CONTACT.email,
        sameAs: [CONTACT.instagram],
      },
    ],
  }
  return {
    name: 'site-html',
    transformIndexHtml: (html) =>
      html
        .replaceAll('%SITE_URL%', SITE_URL)
        .replace('<!--hero-preload-->', preload)
        .replace('<!--json-ld-->', `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`),
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [react(), siteHtml()],
  // nel build SSR (pre-generazione delle pagine) GSAP va incluso nel bundle: i suoi plugin non sono moduli ESM per Node
  ssr: { noExternal: ['gsap', '@gsap/react'] },
})
