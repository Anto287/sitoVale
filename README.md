# Vally Ski

Sito React/Vite con pagine statiche EN/IT/FR e Cloudflare Pages Function per il modulo contatti.
Dominio previsto: `https://www.vallyski.com`. Richiede Node 24.

Avvio locale: `npm ci`, poi `npm run dev`. Verifica: `npm run lint` e `npm test`.
La build genera `dist/`; il bundle SSR temporaneo viene rimosso dal prerender. I test intercettano
il servizio email e non inviano messaggi reali.

**Il push serve soltanto alla revisione.** La CI non pubblica. Iniziare i commit di revisione con
`[CF-Pages-Skip]` per evitare deploy da eventuali integrazioni Git di Pages; un branch separato
può comunque attivare preview. Non aprire PR o effettuare merge durante questa fase.

Configurazione, dati mancanti e futuro lancio: [DA-FARE.md](DA-FARE.md). `wrangler.jsonc` prepara
Pages ma non crea progetti né avvia pubblicazioni. Non aggiungere chiavi o token al repository:
`RESEND_API_KEY` va soltanto sul server.

File principali: `src/config.ts` per dati e dominio, `src/i18n/locales/` per testi,
`scripts/prerender.mjs` per SEO e CSP, `public/_headers` per gli asset statici,
`functions/api/contact.ts` per l'endpoint. Foto e PDF sono locali; la CI usa gli asset già generati.
