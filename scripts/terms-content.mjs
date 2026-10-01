/**
 * Testi di "Condizioni e cancellazioni" nelle tre lingue del sito, per scripts/build-terms.mjs.
 * L'inglese è l'originale di Valentina; italiano e francese ne sono la traduzione.
 * **testo** = grassetto. Dopo una modifica: npm run terms
 */
export const TERMS = {
  en: {
    eyebrow: 'Winter season · Terms & cancellation policy',
    title: 'Private ski lessons',
    role: 'Ski instructor',
    booking: {
      title: '1. Booking & confirmation',
      boxes: [
        ['Booking deposit', '30% deposit required to secure dates'],
        ['Balance payment', '70% remaining balance due 1 week prior'],
      ],
      items: [
        ['Request & confirmation', 'Bookings must be made in writing (via email or message) and will be considered fully confirmed upon receipt of a **30% deposit**.'],
        ['Balance payment', 'The remaining balance (**70%**) must be settled at least **7 days (1 week)** before the start of the first lesson.'],
        ['Inclusions', 'Rates cover professional ski instruction only. Lift passes, equipment rental, personal accident insurance, and meals/drinks are not included.'],
      ],
    },
    cancellation: {
      title: '2. Cancellation & refund policy',
      intro: 'In the event of a cancellation by the client, the following refund conditions apply:',
      head: ['Cancellation notice', 'Applicable refund', 'Deposit / payment status'],
      rows: [
        ['**More than 14 days** before the lesson', '100% refund', 'Full refund of all amounts paid.'],
        ['**Between 14 days and 7 days** before', 'Deposit retained', 'Balance refunded if paid; 30% deposit retained.'],
        ['**Less than 7 days** before or no-show', 'No refund', 'Full charge of the lesson fee (100%).'],
      ],
    },
    weather: {
      title: '3. Weather conditions & mountain safety',
      items: [
        ['Operation in bad weather', 'Lessons run as scheduled in snow, rain, fog, or cold conditions. Clients are expected to arrive dressed in appropriate winter ski attire.'],
        ['Partial resort / lift closures', 'If the resort or lift system is partially open/operating, lessons will go ahead as planned. Partial closures do not entitle the client to cancellations or refunds.'],
        ['Full resort closure / force majeure', 'If local authorities or the lift company decide to close the entire resort for safety reasons (e.g., severe winds, extreme avalanche risk), any affected lesson will be rescheduled or fully refunded.'],
        ['Safety interruptions', "The instructor reserves the right to modify or stop a lesson if a client's physical condition or mountain safety levels require it."],
      ],
    },
    lateness: {
      title: '4. Lateness & meeting points',
      items: [
        ['Punctuality', 'Client delays will not result in extended lesson times or makeup time. Lessons will finish at the originally scheduled time.'],
        ['Meeting location', 'The exact meeting point (e.g., top station, base lifts, or agreed spot) will be reconfirmed 24 hours prior to the lesson.'],
      ],
    },
    contacts: ['Ski instructor', 'Phone / WhatsApp', 'Email'],
    acceptance: 'Booking confirmation implies full acceptance of these terms and conditions.',
    date: 'Date',
  },

  it: {
    eyebrow: 'Stagione invernale · Condizioni e cancellazioni',
    title: 'Lezioni private di sci',
    role: 'Maestra di sci',
    booking: {
      title: '1. Prenotazione e conferma',
      boxes: [
        ['Acconto', '30% per bloccare le date'],
        ['Saldo', '70% entro 1 settimana prima'],
      ],
      items: [
        ['Richiesta e conferma', "Le prenotazioni si fanno per iscritto (email o messaggio) e sono confermate a tutti gli effetti al ricevimento dell'**acconto del 30%**."],
        ['Saldo', "Il restante **70%** va versato almeno **7 giorni (1 settimana)** prima dell'inizio della prima lezione."],
        ['Cosa è incluso', "La tariffa comprende solo l'insegnamento professionale. Skipass, noleggio dell'attrezzatura, assicurazione infortuni e pasti/bevande non sono inclusi."],
      ],
    },
    cancellation: {
      title: '2. Cancellazioni e rimborsi',
      intro: 'Se la lezione viene cancellata dal cliente, valgono le seguenti condizioni di rimborso:',
      head: ['Preavviso', 'Rimborso', 'Acconto / pagamenti'],
      rows: [
        ['**Più di 14 giorni** prima della lezione', 'Rimborso 100%', 'Rimborso completo di quanto versato.'],
        ['**Tra 14 e 7 giorni** prima', 'Acconto trattenuto', "Saldo rimborsato se già versato; l'acconto del 30% viene trattenuto."],
        ['**Meno di 7 giorni** prima o mancata presentazione', 'Nessun rimborso', "È dovuto l'intero importo della lezione (100%)."],
      ],
    },
    weather: {
      title: '3. Meteo e sicurezza in montagna',
      items: [
        ['Maltempo', 'Le lezioni si svolgono regolarmente con neve, pioggia, nebbia o freddo. Si chiede di presentarsi con un abbigliamento da sci invernale adeguato.'],
        ['Chiusura parziale di piste o impianti', 'Se la stazione o gli impianti sono aperti anche solo in parte, la lezione si svolge come previsto. Le chiusure parziali non danno diritto a cancellazioni o rimborsi.'],
        ['Chiusura totale / forza maggiore', "Se le autorità locali o la società degli impianti chiudono l'intera stazione per motivi di sicurezza (ad es. vento forte, rischio valanghe molto elevato), la lezione viene spostata o rimborsata per intero."],
        ['Interruzione per sicurezza', 'La maestra può modificare o interrompere la lezione se le condizioni fisiche del cliente o la sicurezza in montagna lo richiedono.'],
      ],
    },
    lateness: {
      title: "4. Ritardi e punto d'incontro",
      items: [
        ['Puntualità', "In caso di ritardo del cliente la lezione non viene prolungata né recuperata: termina all'orario previsto."],
        ["Punto d'incontro", "Il punto d'incontro esatto (ad es. arrivo di un impianto, partenza degli impianti o altro luogo concordato) viene riconfermato 24 ore prima della lezione."],
      ],
    },
    contacts: ['Maestra di sci', 'Telefono / WhatsApp', 'Email'],
    acceptance: "La conferma della prenotazione implica l'accettazione integrale di queste condizioni.",
    date: 'Data',
  },

  fr: {
    eyebrow: "Saison d'hiver · Conditions et annulation",
    title: 'Cours de ski particuliers',
    role: 'Monitrice de ski',
    booking: {
      title: '1. Réservation et confirmation',
      boxes: [
        ['Acompte', '30 % pour bloquer les dates'],
        ['Solde', '70 % à régler 1 semaine avant'],
      ],
      items: [
        ['Demande et confirmation', "Les réservations se font par écrit (email ou message) et sont définitivement confirmées à réception d'un **acompte de 30 %**."],
        ['Solde', 'Le solde restant (**70 %**) doit être réglé au moins **7 jours (1 semaine)** avant le début du premier cours.'],
        ['Ce qui est inclus', "Le tarif comprend uniquement l'enseignement du ski. Forfaits, location de matériel, assurance individuelle accident et repas/boissons ne sont pas inclus."],
      ],
    },
    cancellation: {
      title: '2. Annulation et remboursement',
      intro: "En cas d'annulation par le client, les conditions de remboursement suivantes s'appliquent :",
      head: ["Délai d'annulation", 'Remboursement', 'Acompte / paiements'],
      rows: [
        ['**Plus de 14 jours** avant le cours', 'Remboursement 100 %', 'Remboursement intégral des sommes versées.'],
        ['**Entre 14 et 7 jours** avant', 'Acompte conservé', "Solde remboursé s'il a été versé ; l'acompte de 30 % est conservé."],
        ['**Moins de 7 jours** avant ou absence', 'Aucun remboursement', 'Le prix total du cours est dû (100 %).'],
      ],
    },
    weather: {
      title: '3. Météo et sécurité en montagne',
      items: [
        ['Mauvais temps', 'Les cours ont lieu comme prévu par neige, pluie, brouillard ou froid. Merci de venir avec une tenue de ski adaptée.'],
        ['Fermeture partielle du domaine ou des remontées', 'Si le domaine ou les remontées mécaniques sont partiellement ouverts, le cours a lieu comme prévu. Une fermeture partielle ne donne droit ni à une annulation ni à un remboursement.'],
        ['Fermeture totale / force majeure', "Si les autorités locales ou l'exploitant des remontées ferment tout le domaine pour des raisons de sécurité (vent violent, risque d'avalanche très élevé…), le cours concerné est reporté ou intégralement remboursé."],
        ['Interruption pour sécurité', "La monitrice se réserve le droit de modifier ou d'interrompre un cours si l'état physique du client ou les conditions de sécurité en montagne l'exigent."],
      ],
    },
    lateness: {
      title: '4. Retards et lieu de rendez-vous',
      items: [
        ['Ponctualité', "Un retard du client ne donne lieu à aucune prolongation ni rattrapage : le cours se termine à l'heure prévue."],
        ['Lieu de rendez-vous', "Le lieu exact (sommet d'une remontée, départ des remontées ou autre lieu convenu) est reconfirmé 24 heures avant le cours."],
      ],
    },
    contacts: ['Monitrice de ski', 'Téléphone / WhatsApp', 'Email'],
    acceptance: 'La confirmation de la réservation vaut acceptation pleine et entière des présentes conditions.',
    date: 'Date',
  },
}
