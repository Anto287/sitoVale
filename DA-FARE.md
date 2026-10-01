# Da fare prima di mettere online il sito

Il sito va pubblicato su **Cloudflare Pages**. Tutti i dati da personalizzare stanno in `src/config.ts`.
Dopo ogni modifica: `npm run build` per controllare, poi commit e push su `main`: una volta collegato il
repository, Cloudflare ricostruisce e pubblica il sito da solo.

## 1. Obbligatorio

- [ ] **Note legali** (in Francia obbligatorie, art. 1-1 LCEN): compilare `LEGAL` in `src/config.ts`.
      Finché un campo è vuoto, il sito mostra "[da completare]".
  - `status`: forma giuridica, es. `Entrepreneur individuel (EI)`
  - `address`: indirizzo professionale
  - `siret`: 14 cifre
  - `vat`: n° TVA intracommunautaire, solo se esiste
  - `host`: l'hosting è Cloudflare → `Cloudflare, Inc. — 101 Townsend St, San Francisco, CA 94107, USA — +1 650 319 8930`
    (indirizzo e telefono sono richiesti dalla legge: verificarli sul sito di Cloudflare prima di pubblicare)
- [ ] **Recensioni originali**: incollare in `src/data/reviews.ts`, campo `original`, il testo originale di ogni
      recensione (Google: "Visualizza originale"; Maison Sport: "Mostra originale"). Oggi 12 su 13 mostrano "Tradotta".
- [ ] **Condizioni e cancellazioni**: rileggere le versioni italiana e francese dei PDF (`public/docs/`). In francese
      ho usato *acompte* (anticipo): è il termine giusto se la cifra si perde in caso di annullamento come previsto
      dalle condizioni, ma per un testo contrattuale conviene una verifica con un professionista o con la scuola.
      Per correggere un testo: `scripts/terms-content.mjs`, poi `npm run terms`.
- [ ] **Commit e push**: tutte le modifiche di queste settimane sono ancora solo in locale.

## 2. Cloudflare Pages e dominio www.vallyski.com

- [ ] Account Cloudflare con **autenticazione a due fattori**.
- [ ] **Workers & Pages → Create → Pages → Connect to Git**: repository `Anto287/sitoVale`, branch `main`.
  - Framework preset: **None**
  - Build command: `npm run build`
  - Build output directory: `dist`
  - La versione di Node (24) la legge da sola dal file `.node-version`.
- [ ] Controllare il primo deploy sull'indirizzo provvisorio `…pages.dev`: quell'indirizzo è già marcato
      "non indicizzare" (`public/_headers`), Google indicizzerà solo il dominio.
- [ ] **Dominio su Cloudflare**: *Add a domain* → `vallyski.com`, poi dal registrar del dominio sostituire i
      nameserver con i due indicati da Cloudflare (l'attivazione può richiedere qualche ora).
- [ ] Nel progetto Pages → **Custom domains**: aggiungere `www.vallyski.com` e `vallyski.com`
      (Cloudflare crea da solo i record DNS e il certificato HTTPS).
- [ ] **Rules → Redirect Rules** → modello *Redirect from root to WWW*: `vallyski.com` → `https://www.vallyski.com`.
- [ ] **SSL/TLS → Edge Certificates**: attivare *Always Use HTTPS*. **DNS → Settings**: attivare **DNSSEC**
      (Cloudflare indica il record da copiare dal registrar).
- [ ] Verificare online: `https://www.vallyski.com` si apre, `vallyski.com` porta a `www`,
      `https://www.vallyski.com/robots.txt` dice `Allow: /`.
- [ ] **Spegnere GitHub Pages**: su GitHub *Settings → Pages* → *Unpublish site*, poi cancellare
      `.github/workflows/deploy.yml` (oggi pubblica la versione provvisoria su `anto287.github.io/sitoVale`).

## 3. Email del modulo contatti (Resend)

Il modulo spedisce due email dal dominio: la richiesta a Valentina e una conferma al cliente nella sua lingua
(`functions/api/contact.ts`). Finché questi passaggi non sono fatti, o se il servizio non risponde, il modulo
apre l'app di posta del visitatore con il messaggio già scritto: nessuna richiesta va persa.

- [ ] Account gratuito su [resend.com](https://resend.com) (fino a 3.000 email al mese), con autenticazione a due fattori.
- [ ] **Domains → Add domain** → `vallyski.com`. Con il dominio su Cloudflare, Resend aggiunge da solo i record
      DNS (SPF e DKIM: sono la "firma" che evita lo spam); altrimenti copiarli a mano in **Cloudflare → DNS**.
      Attendere che il dominio risulti *Verified*.
- [ ] **API Keys → Create API key** con permesso *Sending access*.
- [ ] In **Cloudflare → progetto Pages → Settings → Variables and Secrets**: aggiungere `RESEND_API_KEY`
      come **Secret** (ambiente *Production*), incollando la chiave. Poi *Deployments → Retry deployment*.
      La chiave non va mai scritta nei file del sito.
- [ ] Record **DMARC** in Cloudflare → DNS: tipo `TXT`, nome `_dmarc`, valore `v=DMARC1; p=none; rua=mailto:bernardivale46@gmail.com`
      (dopo qualche settimana senza problemi si può passare a `p=quarantine`).
- [ ] **Prova**: dal sito pubblicato inviare una richiesta con un proprio indirizzo email e controllare che
      arrivino entrambe: la richiesta nella Gmail di Valentina e la conferma al proprio indirizzo.
- [ ] **Limite ai tentativi** (contro i bot): in Cloudflare → **Security → WAF → Rate limiting rules**, regola su
      URI path uguale a `/api/contact`: massimo 5 richieste ogni 10 secondi per IP, azione *Block*.
- L'indirizzo mittente è `prenotazioni@vallyski.com` (`MAIL` in `src/config.ts`): non serve che esista una
  casella, le risposte vanno sempre alla Gmail di Valentina.

## 4. Sicurezza degli account

- [ ] Autenticazione a due fattori su **GitHub**, **Cloudflare**, **Resend**, **registrar del dominio** e **Gmail** di Valentina:
      chi entra in uno di questi account può cambiare il sito o il dominio.
- [ ] Se un giorno si vuole anche una casella vera sul dominio (es. `info@vallyski.com`, per ricevere): Cloudflare
      **Email Routing** la inoltra gratis alla Gmail. Poi aggiornare `CONTACT.email`.

## 5. Da controllare

- [ ] **Voto di Lone Kondrup T.** (`src/data/reviews.ts`): nello screenshot di Maison Sport la quinta stella è
      piena solo in parte; ho messo 4,8. Correggere se il voto esatto è diverso.
- [ ] **Anni di esperienza**: calcolati da `FIRST_SEASON = 2021` (inverno 2021/22) in `src/config.ts`.
      Oggi danno 5 anni; aumentano da soli ogni 1° novembre. Correggere l'anno se la prima stagione è un'altra.
- [ ] **Recensioni non ancora sul sito**: tra gli screenshot ci sono due recensioni Google che parlano di
      Valentina, di Gayle Veitch e Adam B. Valutare se aggiungerle (testo + traduzioni + voto).

## 6. Dopo la pubblicazione (consigliato)

- [ ] **Google Search Console**: aggiungere `https://www.vallyski.com` e inviare `https://www.vallyski.com/sitemap.xml`.
- [ ] **Scheda Google Business** di Valentina: per un servizio locale conta più del sito stesso; metterci il link al sito.
- [ ] **Statistiche** (facoltative): account gratuito su [goatcounter.com](https://www.goatcounter.com) e codice in
      `GOATCOUNTER`. Senza cookie: nessun banner necessario, le note legali si aggiornano da sole.
- [ ] **Dependabot** (facoltativo): su GitHub *Settings → Code security* → attivare *Dependabot alerts* e
      *security updates*, per sapere quando una libreria usata dal sito ha una falla.

Già pronto, non serve fare nulla: le intestazioni di sicurezza (Content-Security-Policy, protezione da
iframe, HTTPS obbligatorio) sono in `public/_headers` e Cloudflare le applica da solo. La Content-Security-Policy
si aggiorna in build: attivando GoatCounter in `src/config.ts` viene autorizzato in automatico.

## Promemoria comandi

```bash
npm install      # la prima volta
npm run dev      # sito in locale su http://localhost:5173
npm run build    # controllo completo + pagine pronte in dist/
npm run images   # dopo aver aggiunto o cambiato una foto in photos/
npm run terms    # dopo aver cambiato le condizioni (scripts/terms-content.mjs)
npm test         # build + test di modulo contatti, sicurezza e pagine (prima di ogni pubblicazione)
```

Testi del sito: `src/i18n/locales/it.json`, `en.json`, `fr.json` (l'inglese è il riferimento: se in
un'altra lingua manca una frase, la build si ferma e dice quale).
