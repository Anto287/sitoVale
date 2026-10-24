# Guida: mettere online www.vallyski.com e farlo conoscere

Situazione al 24 ottobre 2026:

- Dominio `vallyski.com` acquistato su **Cloudflare Registrar** (scade il 22/10/2027: attivare il rinnovo automatico). I DNS sono già su Cloudflare, ma non c'è ancora nessun record per `www` né per la posta.
- Codice su GitHub: `Anto287/sitoVale` (repository **pubblico**). Ogni push su `main` esegue i controlli e pubblica l'anteprima su `https://anto287.github.io/sitoVale/` (non indicizzata da Google).
- Su Cloudflare non esiste ancora un progetto Pages per il sito.
- Il modulo contatti funziona solo su Cloudflare (serve la Function `/api/contact` + Resend). Su GitHub Pages, e finché Resend non è configurato, il modulo apre l'app email del visitatore con la richiesta già scritta: nessuna richiesta va persa.

Segui i passi in ordine. Quelli segnati **[Valentina]** richiedono dati o account suoi.

---

## 1. Dati da completare prima del lancio

File: `src/config.ts`.

- [ ] **Note legali (obbligatorie in Francia, legge LCEN)** — oggi compaiono come "[da completare]":
  - `status`: es. `Entrepreneur individuel (EI)` / micro-entrepreneur **[Valentina]**
  - `address`: indirizzo professionale **[Valentina]**
  - `siret`: 14 cifre **[Valentina]**
  - `vat`: n° TVA intracommunautaire, solo se esiste **[Valentina]**
  - `host`: `Cloudflare, Inc. — 101 Townsend St, San Francisco, CA 94107, USA` (verificare sul sito Cloudflare al momento del lancio)
- [ ] Confermare WhatsApp, email, Instagram e `FIRST_SEASON = 2021` (gli "anni di esperienza" si calcolano da lì) **[Valentina]**
- [ ] Recensioni (`src/data/reviews.ts`): verificare testi, date e voti con le fonti originali (Google, Maison Sport). Togliere quelle che non si possono verificare **[Valentina]**
- [ ] Condizioni di prenotazione/cancellazione (`scripts/terms-content.mjs` → PDF in `public/docs/`): farle approvare, poi `npm run terms` **[Valentina]**
- [ ] Informativa privacy (testi `legal.*` in `src/i18n/locales/*.json`): deve citare Cloudflare (hosting), Resend (invio email) e Gmail (ricezione).

Dopo ogni modifica: `npm test`, poi commit e push su `main`.

---

## 2. Cloudflare Pages: creare il progetto

1. Cloudflare dashboard → **Workers & Pages** → **Create** → scheda **Pages** → **Connect to Git**.
2. Autorizza GitHub e scegli `Anto287/sitoVale`.
3. Impostazioni di build:

| Campo | Valore |
| --- | --- |
| Project name | `vallyski` (deve coincidere con `name` in `wrangler.jsonc`) |
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (vuoto) |
| Variabile d'ambiente | `NODE_VERSION` = `24` |

   Non impostare `VITE_SITE_URL` né `BASE_PATH`: servono solo a GitHub Pages.
4. **Save and Deploy**. Al termine il sito è su `https://vallyski.pages.dev` (con `noindex`, voluto).
5. Settings → Builds & deployments → **Preview deployments: None** (evita copie pubbliche di ogni branch).

Non usare il caricamento "drag & drop": non compila la cartella `functions/` e il modulo non funzionerebbe.

---

## 3. Collegare il dominio

1. Progetto Pages → **Custom domains** → **Set up a custom domain** → `www.vallyski.com` → Continue. Cloudflare crea da solo il record CNAME (la zona è già nello stesso account).
2. Aggiungi anche `vallyski.com` (senza www) come custom domain.
3. Redirect dalla versione senza www: dashboard → `vallyski.com` → **Rules** → **Redirect Rules** → Create:
   - Quando: `Hostname equals vallyski.com`
   - Allora: Dynamic, espressione `concat("https://www.vallyski.com", http.request.uri.path)`, codice **301**, **Preserve query string** attivo.
   È importante: il modulo contatti accetta richieste solo da `https://www.vallyski.com`.
4. SSL/TLS → modalità **Full (strict)**; Edge Certificates → **Always Use HTTPS** attivo.
5. Controlla: `https://www.vallyski.com`, `/it/`, `/fr/` si aprono; `https://vallyski.com/it/` porta a `https://www.vallyski.com/it/`; un indirizzo inventato dà la pagina 404.

---

## 4. Email del modulo contatti (Resend)

1. Crea un account su <https://resend.com> (piano gratuito: 3.000 email/mese, 100 al giorno). Attiva l'autenticazione a due fattori.
2. **Domains** → Add domain → `vallyski.com` (regione EU). Scegli la configurazione automatica con Cloudflare, oppure copia a mano in Cloudflare → DNS i record indicati (MX e TXT `send`, TXT DKIM `resend._domainkey`). Attendi lo stato **Verified**.
3. Aggiungi in Cloudflare DNS un record DMARC: tipo `TXT`, nome `_dmarc`, valore `v=DMARC1; p=none; rua=mailto:bernardivale46@gmail.com`.
4. Resend → **API Keys** → Create, permesso **Sending access**, dominio `vallyski.com`. Copia la chiave (inizia con `re_`).
5. Cloudflare → progetto Pages → **Settings → Variables and Secrets** → Add → tipo **Secret**, nome `RESEND_API_KEY`, ambiente **Production**, incolla la chiave. Salva e rifai un deploy (Deployments → ultimo → Retry).
   **La chiave non va mai nel codice, nel repository o in una variabile `VITE_*`.**
6. Protezione antispam (le protezioni nel codice sono già attive; queste si fanno dal pannello di Cloudflare):
   - **Turnstile** (verifica "non sono un robot" di Cloudflare, gratuita e quasi sempre invisibile): dashboard → **Turnstile** → Add widget → nome `vallyski`, hostname `www.vallyski.com`, modalità **Managed**. Copia la **Site Key** in `TURNSTILE_SITE_KEY` in `src/config.ts` (è pubblica, può stare nel codice), commit e push. Copia la **Secret Key** in Pages → Settings → Variables and Secrets come Secret `TURNSTILE_SECRET_KEY` (Production). Rifai il deploy. Da quel momento ogni invio senza verifica viene rifiutato.
   - **Rate limiting di Cloudflare**: `vallyski.com` → **Security → WAF → Rate limiting rules** → regola su `URI Path equals /api/contact` e metodo `POST`, massimo 5 richieste ogni 10 minuti per IP, azione Block per 10 minuti.
7. Prova: compila il modulo su `https://www.vallyski.com/it/` con il tuo indirizzo. Devono arrivare:
   - a `bernardivale46@gmail.com` la richiesta (mittente `prenotazioni@vallyski.com`, "Rispondi" scrive al cliente);
   - all'indirizzo inserito la conferma nella lingua del sito, con il link al PDF delle condizioni.
   Se qualcosa non arriva: Resend → **Emails/Logs**; Cloudflare → Pages → Functions → **Real-time logs**.
8. (Facoltativo) Casella `info@vallyski.com` che inoltra a Gmail: Cloudflare → **Email → Email Routing** → Enable → Custom address `info` → destinazione Gmail. Compatibile con Resend (Resend usa il sottodominio `send`).

---

## 5. Google

### Search Console (indicizzazione)
1. <https://search.google.com/search-console> → Aggiungi proprietà → **Dominio** → `vallyski.com`.
2. Google mostra un record TXT: con "Cloudflare" come provider la verifica è automatica; altrimenti aggiungilo a mano in Cloudflare DNS.
3. **Sitemap** → invia `https://www.vallyski.com/sitemap.xml`.
4. **Controllo URL** → `https://www.vallyski.com/`, `/it/`, `/fr/` → **Richiedi indicizzazione**.
5. Dopo 1–2 settimane controlla "Pagine" e "Esperienza".

### Google Business Profile (fondamentale per "maestra di sci Les Arcs")
1. <https://business.google.com> **[Valentina]**, con il suo account Google.
2. Categoria: **Ski school** / **Ski instructor**. Attività senza sede aperta al pubblico → "servo i clienti presso la loro sede": aree servite Les Arcs, Bourg-Saint-Maurice, Val d'Isère, Tignes.
3. Sito `https://www.vallyski.com`, telefono/WhatsApp, orari stagionali, lingue IT/FR/EN, foto delle lezioni (le stesse del sito).
4. Verifica (video o cartolina). Poi chiedi ai clienti soddisfatti una recensione con il link "Chiedi recensioni".
5. Bing Places (<https://www.bingplaces.com>) permette di importare la scheda da Google in un clic.

### Statistiche (facoltativo, senza cookie e senza banner)
- **Cloudflare Web Analytics**: progetto Pages → Metrics → Enable. Nessun codice da aggiungere.
- Oppure **GoatCounter**: crea un account, poi metti il codice in `GOATCOUNTER` in `src/config.ts` (conta anche i clic su WhatsApp/email/modulo).
- Google Analytics richiede un banner cookie e un aggiornamento della privacy: sconsigliato per un sito vetrina.

---

## 6. Pubblicità e visibilità

Gratuito, da fare subito:
- [ ] Link al sito nella bio Instagram `@vally.it` e nei profili Maison Sport / altre piattaforme dove Valentina è presente.
- [ ] Profilo su piattaforme di maestri: Maison Sport, CheckYeti, Skiinstructor-booking, Snowmonkey (danno anche recensioni verificate).
- [ ] Biglietti da visita / volantini con **QR code** verso `https://www.vallyski.com` per noleggi, hotel e chalet di Les Arcs, Val d'Isère, Tignes.
- [ ] Gruppi Facebook di stagionali e famiglie italiane che sciano in Francia.
- [ ] Ogni stagione: 2–3 post/reel a settimana su Instagram, con link "prenota" che porta a `/it/#contatti`.

A pagamento (quando il sito è indicizzato e il modulo funziona):
- **Google Ads**, campagna Search, budget di prova 5–10 €/giorno da metà novembre a marzo.
  - Parole chiave: `maestra di sci les arcs`, `lezioni sci les arcs italiano`, `ski instructor les arcs english`, `cours de ski particulier les arcs`, `maestro sci val d'isere italiano`, `lezioni sci bambini tignes`.
  - Annunci separati per IT / EN / FR, ognuno verso la pagina della propria lingua.
  - Conversioni: clic su WhatsApp e invio del modulo (si collegano facilmente se si attiva GoatCounter o Google Tag Manager — quest'ultimo richiede banner cookie).
- **Meta Ads** (Instagram/Facebook): video brevi delle lezioni, pubblico in Italia, UK, Belgio, Paesi Bassi interessato a sci e Les Arcs, 2–3 settimane prima delle vacanze (Natale, febbraio).

---

## 7. Dopo il lancio

- [ ] Rimuovere l'anteprima GitHub Pages: GitHub → Settings → Pages → Source **None** (e cancellare `.github/workflows/deploy.yml`, oppure lasciarlo solo per i controlli). Evita un doppione del sito.
- [ ] Attivare MFA su GitHub, Cloudflare, Resend, Google.
- [ ] GitHub → Settings → Code security → **Dependabot alerts** attivo.
- [ ] Una volta all'anno: rinnovo dominio (automatico su Cloudflare), aggiornare foto e recensioni, `npm audit` e `npm test`.

---

## Comandi utili

```bash
npm ci          # installa le dipendenze
npm run dev     # sito in locale
npm test        # build completa + 42 test (nessuna email reale)
npm run images  # rigenera le foto dopo aver cambiato gli originali in photos/
npm run terms   # rigenera i PDF delle condizioni
```
