# Valentina Bernardi — Maestra di sci a Les Arcs

Sito vetrina statico, una pagina, trilingue (IT / FR / EN).
Nessun framework, nessuna build, nessuna dipendenza: HTML + CSS + JavaScript vanilla.

## Struttura

```
.
├── index.html        tutto il sito: markup, stili, script e traduzioni
├── favicon.svg       icona del sito
├── robots.txt        istruzioni per i motori di ricerca
├── sitemap.xml       mappa del sito per Google Search Console
├── assets/           12 fotografie ottimizzate per il web (~2,7 MB)
└── LEGGIMI.txt       note di personalizzazione in italiano
```

## Avvio locale

Aprire `index.html` nel browser. Per un server locale (utile per testare i percorsi assoluti):

```bash
python3 -m http.server 8000
# poi http://localhost:8000
```

## Prima della pubblicazione

Cercare la parola `PERSONALIZZARE` dentro `index.html`, `robots.txt` e `sitemap.xml`.
Sono sei punti: contatti (WhatsApp, email, Instagram), tariffe, diplomi,
recensioni, dominio nei meta SEO, dominio in robots e sitemap.
Il dettaglio è in `LEGGIMI.txt`.

## Pubblicazione

Il sito è statico: si carica così com'è su GitHub Pages, Netlify, Cloudflare Pages
o qualunque spazio web. La guida completa — hosting, dominio personalizzato,
HTTPS, indicizzazione su Google — è nel PDF allegato al progetto.

## Licenza

Fotografie © Valentina Bernardi, tutti i diritti riservati.
Codice a uso esclusivo di questo sito.
