# Vally Ski — Valentina Bernardi

Sito vetrina React + Vite, pagine statiche pre-generate in inglese, italiano e francese.
Modulo contatti tramite Cloudflare Pages Function (`functions/api/contact.ts`) con invio email via Resend.

- Dominio definitivo: `https://www.vallyski.com`
- Anteprima: `https://anto287.github.io/sitoVale/` (non indicizzata, modulo con ripiego su email)
- Node 24

```bash
npm ci
npm run dev
npm run lint
npm test
npm run images
npm run terms
```

Dati e contatti: `src/config.ts`. Testi: `src/i18n/locales/`. Procedura di pubblicazione: [GUIDA-PUBBLICAZIONE.md](GUIDA-PUBBLICAZIONE.md).
