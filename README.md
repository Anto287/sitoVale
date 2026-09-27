# Valentina Bernardi — Maestra di sci in Tarentaise (Les Arcs, Val d'Isère, Tignes)

Sito vetrina a una pagina, trilingue (EN / IT / FR).
React 19 + TypeScript + Vite, traduzioni con i18next, animazioni con GSAP.

## Comandi

```bash
npm install
npm run dev      # sviluppo su http://localhost:5173
npm run images   # converte photos/ in WebP responsive (da rilanciare quando si aggiunge una foto)
npm run build    # type-check + build + pagine pre-generate per lingua in dist/
npm run preview  # prova in locale la build di produzione
npm run lint     # oxlint
```

## Struttura

```
.
├── index.html                  modello della pagina (completato in build da vite.config.ts e prerender)
├── netlify.toml, vercel.json   comando di build e cache per l'hosting
├── photos/                     FOTO ORIGINALI (sorgenti, non pubblicate)
│   ├── valentina/              foto in cui c'è Valentina
│   ├── lezioni/                lezioni e momenti con i clienti
│   └── panorami/               paesaggi delle stazioni
├── scripts/build-images.mjs    photos/ → public/images/ in WebP + manifest; icone da favicon.svg
├── scripts/prerender.mjs       pagine HTML complete per en / it / fr, sitemap.xml, robots.txt
├── public/
│   ├── images/<cartella>/      WebP generate (<nome>-<larghezza>.<impronta>.webp), non modificare a mano
│   ├── icons/                  icone PNG per iPhone/Android/Google (generate da favicon.svg)
│   ├── og-image.jpg            anteprima 1200×630 per i link condivisi (generata)
│   ├── favicon.svg             icona del sito (segno del logo Vally)
│   ├── site.webmanifest        nome e icone per "aggiungi a schermata Home"
│   └── _headers                regole di cache per Netlify / Cloudflare Pages
└── src/
    ├── main.tsx, App.tsx       entry point e composizione delle sezioni
    ├── config.ts               dominio, contatti, dati legali: UNICO punto  ← PERSONALIZZARE
    ├── entry-server.tsx        usato solo in build per pre-generare le pagine
    ├── fonts.css               font ospitati dal sito + ripieghi tarati (niente salti di layout)
    ├── styles.css              palette, tipografia, layout, dark mode
    ├── i18n/
    │   ├── locales/en.json     testi inglesi (riferimento: definiscono le chiavi)
    │   ├── locales/it.json     testi italiani
    │   ├── locales/fr.json     testi francesi
    │   ├── index.ts            configurazione i18next + rilevamento lingua
    │   └── i18next.d.ts        chiavi di traduzione tipizzate
    ├── data/
    │   ├── reviews.ts          recensioni: autore, fonte, data
    │   └── images.json         manifest delle foto (generato da npm run images)
    ├── lib/gsap.ts             plugin GSAP e helper di animazione condivisi
    ├── lib/photos.ts           URL e srcset delle foto
    └── components/             una sezione per file; Photo.tsx per tutte le immagini
```

## Lingue e indirizzi

Ogni lingua ha il suo indirizzo: `/` inglese, `/it/` italiano, `/fr/` francese. In build ogni pagina viene
pre-generata con tutti i testi già nell'HTML, titolo e descrizione nella sua lingua, `canonical` e `hreflang`
verso le altre versioni: Google indicizza tutte e tre le lingue e le mostra a chi cerca in quella lingua.

Chi apre la home `/` viene portato alla lingua del browser (it/fr), altrimenti resta in inglese. Chi sceglie
una lingua con i pulsanti EN/IT/FR la ritrova le volte successive (`localStorage`, `vb-lang`). Chi apre
direttamente `/it/` o `/fr/` vede sempre quella lingua.

Un file JSON per lingua in `src/i18n/locales/`. L'inglese è il riferimento: se a `it.json` o `fr.json`
manca una chiave, `npm run build` si ferma con un errore che dice quale.

## Foto

1. Mettere l'originale (JPG, la qualità più alta disponibile) nella cartella giusta di `photos/`.
2. `npm run images`: crea le WebP in 3–5 larghezze (480 → 2048 px, mai più dell'originale),
   un'anteprima sfocata di pochi byte e aggiorna `src/data/images.json`.
3. Usarla con `<Photo photo="valentina/nome" alt="…" sizes="…" />`.

Il browser scarica solo la misura che serve (telefono ≈ 800 px, desktop retina ≈ 1600 px); sugli schermi 3×
la densità è limitata a 2×, che a occhio è identica ma pesa meno della metà. WebP a qualità 80,
senza metadati (niente GPS). Finché una foto non arriva si vede la sua anteprima sfocata.

## Prestazioni (misurate)

| | prima | ora |
|---|---|---|
| peso totale pagina, telefono | 4,8 MB | 1,96 MB |
| peso totale pagina, desktop retina | 4,8 MB | 3,0 MB |
| spostamenti di layout (CLS) su rete lenta | 0,022 | 0 |
| frame oltre 50 ms, scroll di tutta la pagina | 0 | 0 |

Font ospitati dal sito (niente Google Fonts: più veloce e conforme al GDPR), solo alfabeti latini,
con font di ripiego tarati sulle stesse misure: all'arrivo dei font il testo non salta.
Pagine pre-generate: su mobile lento il contenuto principale compare in ≈0,5 s invece di ≈0,9 s.

## Cache

- `/assets/*` (JS, CSS, font) e `/images/*` hanno l'impronta del contenuto nel nome → cache di un anno.
  Se un file cambia, cambia il nome: non esiste il rischio di vedere una versione vecchia.
- Pagine HTML, icone, anteprima, sitemap: `no-cache`, il browser ricontrolla a ogni visita (risposta
  di pochi byte se nulla è cambiato). Dopo un aggiornamento del sito tutti vedono subito la versione nuova.

Regole in `public/_headers` (Netlify, Cloudflare Pages) e `vercel.json` (Vercel).

## Animazioni

Tutte in GSAP (ScrollTrigger, SplitText, ScrollToPlugin), create con `useGSAP` così si puliscono da sole.
Con `prefers-reduced-motion: reduce` non viene creata nessuna animazione e il contenuto è subito visibile.

- ingresso della hero (parte quando la foto è pronta), neve, parallasse, indicatore di scroll
- titoli riga per riga, lineette fucsia che si disegnano, foto che si scoprono, contatori
- striscia di panorami che scorre con la pagina; slider delle recensioni con "Leggi tutto"
- lightbox FLIP dalla miniatura, frecce, contatore, swipe su telefono, tastiera (← → Esc)
- nav che si nasconde scendendo; barra "Prenota" + WhatsApp su telefono; bottoni magnetici col mouse

## Prima della pubblicazione

Tutto in `src/config.ts`: dominio (già `https://www.vallyski.com`), contatti, dati per le note legali.
Da lì vengono anche i dati per Google, le anteprime social, `sitemap.xml` e `robots.txt`.
`lastmod` nella sitemap è la data della build: dice a Google quando il sito è cambiato l'ultima volta.

## Recensioni

13 recensioni reali da Google e Maison Sport, in `src/data/reviews.ts`. Ognuna va mostrata nella lingua in cui
è stata scritta: basta incollare il testo originale in `original` (su Google "Visualizza originale", su
Maison Sport "Mostra originale"). Finché manca, il sito mostra la traduzione nella lingua del visitatore
(`locales/*.json` → `reviews.items.<id>`) con l'etichetta "Tradotta". Oggi l'originale c'è solo per Mary Kenny.

## Note legali

Riquadro "Note legali / Mentions légales" dal footer (`src/components/LegalNotice.tsx`), con i dati di
`LEGAL` in `src/config.ts`. In Francia sono obbligatorie per un sito professionale (art. 1-1 LCEN):
nome, statuto, indirizzo, SIRET, contatto, hosting. I campi vuoti compaiono come "[da completare]".

## Palette

Ripresa dalla divisa: antracite (`--ink`, fasce scure), rosa cipria (`--ground-2`),
rosa chiaro (`--accent-soft`, fascia Tariffe) e fucsia (`--accent`, linee e bottoni principali).
Tutti i token sono in cima a `src/styles.css`, con la variante dark.

## Pubblicazione

`npm run build` e caricare il contenuto di `dist/` su qualunque hosting statico
(Netlify, Vercel, Cloudflare Pages, GitHub Pages…). Su Netlify/Vercel/Cloudflare basta
collegare il repository: comando di build `npm run build`, cartella `dist`.

## Licenza

Fotografie © Valentina Bernardi, tutti i diritti riservati.
Codice a uso esclusivo di questo sito.
