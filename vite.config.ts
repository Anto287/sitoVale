import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { CONTACT, GOATCOUNTER, SITE_URL as FINAL_SITE_URL } from './src/config.ts'
import images from './src/data/images.json' with { type: 'json' }
import { capSizes } from './src/lib/sizes.ts'

const SITE_URL = (process.env.VITE_SITE_URL || FINAL_SITE_URL).replace(/\/$/, '')
const BASE = process.env.BASE_PATH ? `${process.env.BASE_PATH.replace(/\/$/, '')}/` : '/'

const CRITICAL_FONTS = /\/(bodoni-moda-latin-opsz-(normal|italic)|jost-latin-wght-normal)-[^/]+\.woff2$/

function siteHtml(): Plugin {
  const hero = images['lezioni/mare-di-nuvole'].files as [number, string][]
  const preload = `<link rel="preload" as="image" type="image/webp" fetchpriority="high" imagesizes="${capSizes('100vw')}" imagesrcset="${hero.map(([w, url]) => `${BASE}${url.slice(1)} ${w}w`).join(', ')}">`
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
  const stats =
    GOATCOUNTER && SITE_URL === FINAL_SITE_URL
      ? `<script data-goatcounter="https://${GOATCOUNTER}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`
      : ''
  return {
    name: 'site-html',
    transformIndexHtml: (html, ctx) => {
      // I caratteri della prima schermata partono insieme all'HTML, senza aspettare il CSS (solo in build: in dev non c'è il bundle).
      const fonts = Object.keys(ctx.bundle ?? {})
        .filter((file) => CRITICAL_FONTS.test(file))
        .sort()
        .map((file) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="${BASE}${file}">`)
        .join('\n')
      return html
        .replaceAll('%SITE_URL%', SITE_URL)
        .replace('<!--hero-preload-->', [preload, fonts].filter(Boolean).join('\n'))
        .replace('<!--json-ld-->', `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>${stats}`)
    },
  }
}

export default defineConfig({
  base: BASE,
  plugins: [react(), siteHtml()],
  ssr: { noExternal: ['gsap', '@gsap/react'] },
})
