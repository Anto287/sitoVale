# Preparazione al lancio di Vally Ski

**Stato: revisione senza pubblicazione.** Dominio canonico: `https://www.vallyski.com`.
Non cambiare DNS, account remoti o hosting durante questa fase.

## Push senza mettere online

La vecchia `.github/workflows/deploy.yml` pubblicava GitHub Pages da `main`. Ora è sostituita
da `.github/workflows/ci.yml`: installazione, lint, build e test, senza deploy o token di pubblicazione.

- Usare il branch di revisione `codex/sitovale-review-2026-10-24`, senza merge su `main`.
- **Iniziare ogni messaggio di commit da caricare con `[CF-Pages-Skip]`**. Esempio:
  `[CF-Pages-Skip] Prepara Vally Ski per revisione`. Pages salta il deploy del commit, comprese
  le anteprime; GitHub Actions può ancora eseguire le verifiche. Evitare il generico `skip ci`.
- Un branch separato da solo non basta: un'integrazione Git Cloudflare può creare preview pubbliche.
  Anche aprire una PR può generare preview. Non aprire PR o avviare retry/deploy hook in questa fase.
- Il prefisso riguarda Pages: eventuali altri servizi e webhook richiedono una verifica separata.
- Controllo del 24 ottobre 2026: l'integrazione Cloudflare **non è stata confermata né esclusa**.
  Il dashboard richiede login e non sono disponibili credenziali Wrangler. Gli stati del commit
  remoto consultato non mostravano deploy Cloudflare: questo non dimostra l'assenza dell'integrazione.
  Nessun account o record DNS è stato modificato.

Per un blocco persistente, in una futura sessione autorizzata: Pages → Settings → Builds & deployments,
disabilitare **Enable automatic production branch deployments**, impostare preview **None** e salvare.
Controllare anche GitHub → Settings → Pages e le GitHub Apps installate. Cambiare il workflow non
ritira un sito già pubblicato.

Fonti: [skip commit e GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/),
[controlli dei branch](https://developers.cloudflare.com/pages/configuration/branch-build-controls/).

## Dati reali ancora mancanti o da verificare

- [ ] `LEGAL` in `src/config.ts`: forma giuridica, indirizzo professionale, SIRET, IVA se applicabile,
  dati dell'hosting verificati. I valori vuoti mostrano `[da completare]`; non inventarli.
- [ ] Informativa privacy coerente con i servizi effettivi: finalità, conservazione nella casella email,
  Cloudflare/Resend/Gmail, trasferimenti e gestione delle richieste. Evitare affermazioni assolute
  sull'assenza di dati nei servizi esterni; far confermare il testo prima del lancio.
- [ ] Contatti e `FIRST_SEASON = 2021` da confermare con Valentina.
- [ ] Recensioni: mancano 12 originali su 13 in `src/data/reviews.ts`. Recuperare testi esatti e fonti,
  verificare date e voti. **Il voto 4,8 di Lone Kondrup T. è una stima preesistente non verificata**:
  correggerlo dalla fonte o rimuovere la recensione prima del lancio. Non dedurre voti dalle immagini.
- [ ] Condizioni EN/IT/FR: approvare i testi in `scripts/terms-content.mjs` e i PDF in `public/docs/`,
  in particolare la gestione dell'anticipo. Rigenerare con `npm run terms` dopo l'approvazione.

## Cloudflare Pages: futuro lancio autorizzato

Queste operazioni possono mettere online il sito o cambiare l'infrastruttura: non eseguirle come parte
di un semplice push di revisione.

| Impostazione | Valore |
| --- | --- |
| Prodotto | Cloudflare **Pages** |
| Repository | `Anto287/sitoVale` |
| Root directory | radice del repository |
| Production branch futura | `main` |
| Framework preset | None / React (Vite), build esplicita |
| Build command | `npm run build` |
| Output | `dist` |
| Node | 24 (`.node-version`; `NODE_VERSION=24` se necessario) |
| Dominio e percorso | lasciare `VITE_SITE_URL` e `BASE_PATH` non impostate |
| Secret email | `RESEND_API_KEY`, solo Production, dopo protezioni antiabuso |
| Preview | nessun secret email; automatiche None finché richiesto |

`wrangler.jsonc` dichiara output, compatibility date e nome proposto `vallyski`; non crea un progetto
né pubblica. Allineare `name` al nome effettivo, se diverso, prima di usarlo. La build non necessita
credenziali Cloudflare o Resend. Non usare `CF_PAGES_URL` come canonico: cambia per ogni deploy.

In alternativa all'integrazione Git, **Direct Upload via Wrangler** permette caricamenti manuali.
La scelta del tipo di progetto non si cambia liberamente in seguito. **Il drag-and-drop del dashboard
non compila `functions/`**, quindi non è adatto al modulo di questo repository. Un futuro caricamento
Wrangler va eseguito dalla radice del repository, affinché includa `functions/api/contact.ts`.

Fonti: [build Vite](https://developers.cloudflare.com/pages/configuration/build-configuration/),
[Direct Upload e Functions](https://developers.cloudflare.com/pages/get-started/direct-upload/).

### Dominio canonico

1. Pages → Custom domains: associare **prima** `www.vallyski.com`; poi configurare il CNAME richiesto.
   Con DNS esterno, `www` può puntare a `<progetto>.pages.dev` senza migrare tutti i nameserver.
   Non inventare il target prima di conoscere il progetto.
2. Per associare anche `vallyski.com` a Pages serve una zona Cloudflare attiva: pianificare l'eventuale
   migrazione dei nameserver preservando tutti i record esistenti, soprattutto quelli email.
3. Configurare una Redirect Rule permanente dall'apice a `https://www.vallyski.com`, preservando
   percorso e query: `/it/?x=1` deve arrivare a `https://www.vallyski.com/it/?x=1`.
4. Verificare certificato e HTTPS. Le regole per host e HTTP si configurano nel pannello:
   `_redirects` di Pages non supporta redirect tra domini.
5. Dopo l'attivazione del dominio, valutare un Bulk Redirect da `<progetto>.pages.dev` a `www`,
   evitando di coinvolgere le preview se servono per QA.

Fonti: [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/),
[limiti redirect](https://developers.cloudflare.com/pages/configuration/redirects/),
[redirect pages.dev](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/).

## Modulo contatti e Resend

La Function invia la richiesta a Valentina e una conferma EN/IT/FR al visitatore. Si tratta di una
richiesta di disponibilità, non di una prenotazione. I test non inviano email reali.

- [ ] Verificare il dominio in Resend; applicare SPF/DKIM del servizio preservando gli altri record
  email. Definire DMARC con chi gestisce il dominio.
- [ ] Chiave con permesso di solo invio, salvata come **Secret Production** su Pages. Mai inserirla
  nel repository o in variabili `VITE_*`, che vengono incluse nel browser.
- [ ] Prima di abilitarla, proteggere `/api/contact` con rate limiting verificato sul piano Cloudflare
  effettivo e limiti al volume/costo email. Verificare anche gli host alternativi. Honeypot e Origin
  non fermano un bot che costruisce richieste HTTP; valutare Turnstile con verifica server se necessario.
- [ ] Durante il lancio autorizzato, provare l'invio con dati propri: ricezione nella Gmail, conferma
  nella lingua scelta, Reply-To corretti. L'API accetta soltanto JSON dall'origine HTTPS canonica;
  sulle preview rimane il ripiego email/WhatsApp. Nessun secret nelle preview.
- [ ] Validare gestione rimbalzi e monitoraggio dei volumi sul provider.

Le risposte della Function hanno protezioni e `no-store` propri: `_headers` riguarda solo asset statici.
Input non validi o oltre 20 KB vengono rifiutati senza invii. La conferma non ripete date, composizione
del gruppo o messaggio libero, evitando link arbitrari. Gli errori non registrano dati del cliente
né risposte del provider. Dopo il primo invio riuscito, la conferma continua con `waitUntil` per non
ritardare il browser. Un errore di rete può lasciare incerto l'esito: il ripiego manuale può generare
un duplicato. Non sono previsti retry automatici o garanzie di consegna.

## Verifiche online, dopo autorizzazione al lancio

- [ ] Home, `/it/`, `/fr/`: HTTP 200, lingua corretta, canonical e hreflang su `www`.
- [ ] URL casuale inesistente: vero HTTP 404 e noindex, evitando fallback SPA con HTTP 200.
- [ ] `robots.txt`: Allow e sitemap canonica con tre lingue.
- [ ] `pages.dev`: header `X-Robots-Tag: noindex`; il noindex non è controllo degli accessi.
- [ ] CSP senza violazioni, foto/PDF funzionanti e form verificato con dati propri.
- [ ] Apice `/it/?x=1` → `https://www.vallyski.com/it/?x=1`.
- [ ] Gestire separatamente l'eventuale vecchio sito GitHub Pages già online.
- [ ] Dopo il passaggio, inviare sitemap a Search Console e aggiornare i profili pubblici.

Già predisposti: prerender EN/IT/FR, metadata social, JSON-LD senza voti/recensioni strutturati non
verificati, CSP per hash, protezione iframe, cache immutabile per asset con hash, `404.html` e
noindex per Pages. Regole del dominio, certificato e intestazioni richiedono verifica sull'hosting reale.

## Comandi locali

```bash
npm ci          # dipendenze dal lockfile
npm run dev     # sito locale
npm run lint    # controllo statico
npm test        # TypeScript, build e test, senza email reali
npm run images  # dopo modifiche agli originali in photos/
npm run terms   # dopo approvazione/modifica delle condizioni
```

Usare MFA su GitHub, Cloudflare, registrar, Resend e casella di destinazione; attivare avvisi sulle
dipendenze. Le statistiche sono disattivate (`GOATCOUNTER = ''`): prima di attivarle verificare anche
l'informativa rispetto alla configurazione effettiva.

Audit dipendenze del 24 ottobre 2026: il controllo completo con accesso npm ha rilevato **5
segnalazioni (4 high, 1 low), tutte nell'albero di sviluppo**. Sono coinvolti Sharp, source-map-js,
PostCSS, Vite e il plugin React, con segnalazioni dirette e propagate tra pacchetti. Sharp e Vite non
sono runtime del sito pubblicato, ma vanno comunque aggiornati per proteggere elaborazione immagini,
build e server locale. Non esporre il server di sviluppo come hosting pubblico.

Aggiornamento applicato nello stesso controllo: Sharp **0.35.5**, Vite **8.3.5** e source-map-js
**1.2.2** nel lockfile, senza aggiornamenti major o `--force`. Il successivo audit completo ha
restituito **0 vulnerabilità**. Ripetere audit, lint e test prima del lancio: l'esito riguarda
le dipendenze disponibili e gli advisory noti alla data del controllo, non una garanzia futura.

Fonti: [Sharp](https://github.com/advisories/GHSA-wq5f-xc86-pv6w),
[source-map-js](https://github.com/advisories/GHSA-68fv-2mgg-jv7q),
[Vite](https://github.com/advisories/GHSA-rq7h-c2jc-7f22).
