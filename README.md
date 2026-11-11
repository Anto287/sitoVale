# Vally Ski — Valentina Bernardi

Sito React + Vite con HTML prerenderizzato in inglese, italiano e francese. Il modulo usa una Cloudflare Pages Function e Resend.

- Dominio di produzione: `https://www.vallyski.com`
- Node 24
- Dati e contatti: `src/config.ts`. Testi: `src/i18n/locales/`. Condizioni: `scripts/terms-content.mjs`.

## Collaudo locale

```sh
npm ci
npm run lint
npm test
npm run preview -- --host 127.0.0.1
```

`npm test` genera `dist` e prova anche la Function con servizi simulati. L’anteprima Vite serve gli asset statici, comprese le pagine legali generate. La consegna reale passa da Cloudflare Pages.

## Prima del lancio

- Verificare il dominio in Resend aggiungendo nel DNS Cloudflare solo i record di autenticazione indicati da Resend. L’operazione è indipendente dal deploy web.
- Usare il branch locale o l’anteprima pubblica [GitHub Pages](https://anto287.github.io/sitoVale/) per il collaudo grafico. L’anteprima è marcata noindex e serve asset statici. Conservare il progetto di manutenzione come origine del dominio durante la preparazione.
- Raccogliere i dati ufficiali e completare condizioni e privacy. Nella repo pubblica inserire solo i dati destinati a comparire sul sito.

`npm run build:cloudflare` controlla i campi legali obbligatori del progetto prima della build. Il controllo verifica la presenza dei valori, mentre la verifica dei dati e dei testi resta manuale. `npm run build` e `npm test` restano disponibili per lo sviluppo locale.

## Cloudflare Pages con GitHub

Tenere il dominio in manutenzione finché Valentina fornisce i dati. Compilare `LEGAL` in `src/config.ts`, verificare i testi di privacy e condizioni con i dati effettivi e rigenerare i PDF con `npm run terms` se cambiano le condizioni.

Dopo il via libera, portare su GitHub il branch revisionato, poi creare un progetto Pages con **Connect to Git**, scegliere `Anto287/sitoVale` e impostare:

| Campo | Valore |
| --- | --- |
| Branch di produzione | `main` |
| Root directory | Radice della repo |
| Build command | `npm run build:cloudflare` |
| Build output directory | `dist` |
| Node | 24, da `.node-version` |
| URL e base path di produzione | Lasciare `VITE_SITE_URL` e `BASE_PATH` ai valori predefiniti |

GitHub Actions esegue lint e test e pubblica da main l’anteprima GitHub Pages. Cloudflare Pages esegue il deploy di produzione e compila `functions/api/contact.ts` dalla root. Se il progetto esistente è Direct Upload, crearne uno nuovo per l’integrazione Git. La cartella `maintenance/` contiene solo la pagina statica di attesa, i suoi asset, robots e 404 ed è separata da `dist`.

Le anteprime Git sono pubbliche per impostazione predefinita. Se in futuro serve una preview Cloudflare riservata, applicare Cloudflare Access e verificare da una finestra anonima prima di condividere l’URL. La policy per le preview non copre l’hostname principale `<progetto>.pages.dev` né i domini personalizzati. Fino ad allora usare l’anteprima locale.

- [Cloudflare Pages e GitHub](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Accesso alle anteprime](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Domini personalizzati](https://developers.cloudflare.com/pages/configuration/custom-domains/)

## Resend e dominio

1. Verificare `vallyski.com` in Resend con i record forniti dal pannello, aggiunti nel DNS Cloudflare. Il codice invia da `prenotazioni@vallyski.com` alla casella pubblicata in `CONTACT.email` e usa l’email del cliente come Reply-To. Il cliente risponde alla casella di Valentina.
2. Salvare `RESEND_API_KEY` come secret di produzione in Pages. Per Turnstile configurare la site key pubblica in `src/config.ts` e `TURNSTILE_SECRET_KEY` come secret. La Function accetta richieste dal dominio canonico di produzione.
3. Collegare `www.vallyski.com` al progetto completo e configurare il 301 dall’apice a www conservando percorso e query. Verificare 200 sulle tre home, robots, sitemap, 404 su un URL inesistente e l’assenza di `noindex` sulle home di produzione. Tenere pronto il ritorno alla manutenzione.
4. Inviare una richiesta di prova e verificare entrambe le consegne e i Reply-To. Controllare le attività in Resend e i log della Function. Verificare anche Safari/iPhone e Chrome/Android. Poi inviare la sitemap in Search Console.

[Verifica domini Resend](https://resend.com/docs/dashboard/domains/introduction)
