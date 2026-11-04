// Greg Tours — excursions & circuits booking module. Tours, prices and capacities are examples to replace with the agency's own.
(() => {
  const { store, today, addDays } = window.K;

  const CFG = {
    name: 'Greg Tours',
    phone: '+212 661-347269',
    pinHash: '9ac6598cfbf056fbd9cd8a2c7bc9087a9c8decc30a2f81b75e0ad82fca018b0a', // SHA-256 of 'mbn-demo:tours:<PIN>' — the PIN itself is never in the source
    deposit: 20,
    langs: ['Français', 'English', 'Español', 'Deutsch'],
    childPct: 50,
    privatePct: 60,
    tours: [
      { id: 'agafay', img: 'agafay', n: 'Désert d’Agafay au coucher du soleil', dur: 'Demi-journée · 6 h', days: 1, p: 450, cap: 16, start: '15:00', tags: ['Balade à dos de dromadaire', 'Dîner berbère', 'Transfert inclus'], desc: 'Le désert de pierres à 40 minutes de la ville : dromadaires au coucher du soleil, thé et dîner sous la tente, retour à l’hôtel.' },
      { id: 'ourika', img: 'atlas', n: 'Vallée de l’Ourika & cascades', dur: 'Journée · 8 h', days: 1, p: 380, cap: 16, start: '08:30', tags: ['Randonnée facile', 'Déjeuner en terrasse', 'Guide local'], desc: 'Villages berbères, coopérative d’argan et marche jusqu’aux cascades de Setti Fatma dans le Haut Atlas.' },
      { id: 'ait', img: 'kasbah', n: 'Aït Ben Haddou & Ouarzazate', dur: 'Journée · 12 h', days: 1, p: 550, cap: 16, start: '07:00', tags: ['Col du Tichka', 'Ksar UNESCO', 'Studios de cinéma'], desc: 'La route spectaculaire du Tichka, le ksar d’Aït Ben Haddou classé à l’UNESCO et la palmeraie de Ouarzazate.' },
      { id: 'merzouga', img: 'desert', n: 'Merzouga : 3 jours dans le Sahara', dur: '3 jours · 2 nuits', days: 3, p: 1650, cap: 14, start: '07:00', tags: ['Nuit en camp de luxe', 'Gorges du Todra', 'Dunes de l’Erg Chebbi'], desc: 'Vallée du Dadès, gorges du Todra et nuit sous les étoiles au pied des dunes de l’Erg Chebbi.' },
      { id: 'medina', img: 'medina', n: 'Visite guidée de la médina', dur: 'Demi-journée · 4 h', days: 1, p: 250, cap: 12, start: '09:30', tags: ['Guide officiel', 'Palais & médersas', 'Souks'], desc: 'Palais, médersa, souks et artisans avec un guide officiel, à pied et à votre rythme.' },
      { id: 'imperial', img: 'chaouen', n: 'Villes impériales & Chefchaouen', dur: '6 jours · 5 nuits', days: 6, p: 5900, cap: 12, start: '08:00', tags: ['Fès, Meknès, Rabat', 'La ville bleue', 'Riads sélectionnés'], desc: 'Un circuit complet : Rabat, Meknès, Volubilis, Fès et la ville bleue de Chefchaouen, hébergement en riads.' },
    ],
  };

  const STATUS = { new: ['À confirmer', 'new'], conf: ['Confirmée', 'ok'], paid: ['Acompte payé', 'ok'], done: ['Effectuée', 'dark'], cancel: ['Annulée', 'bad'] };
  const tour = (id) => CFG.tours.find((t) => t.id === id);

  function quote(t, adults, kids, priv, price) {
    const p = price ?? t.p; const base = p * adults + Math.round(p * CFG.childPct / 100) * kids;
    const extra = priv ? Math.round(base * CFG.privatePct / 100) : 0; const total = base + extra;
    return { base, extra, total, deposit: Math.round(total * CFG.deposit / 100) };
  }

  function booked(s, tid, date, ignore) {
    return s.bookings.filter((b) => b.tour === tid && b.date === date && b.status !== 'cancel' && b.id !== ignore).reduce((n, b) => n + b.adults + b.kids, 0);
  }

  function seed() {
    const t = today();
    const B = (id, tid, d, name, phone, country, adults, kids, hotel, lang, status, extra = {}) => {
      const q = quote(tour(tid), adults, kids, !!extra.priv);
      return { id, tour: tid, date: addDays(t, d), name, phone, email: extra.email || '', country, adults, kids, priv: !!extra.priv, hotel, lang, status, total: q.total, paid: status === 'paid' ? q.deposit : status === 'done' ? q.total : 0, created: addDays(t, Math.min(d, 0) - 4), note: extra.note || '' };
    };
    return {
      prices: {}, guides: {},
      bookings: [
        B('GT-A1K', 'agafay', 0, 'Martin Leroy', '+33 6 45 12 78 90', 'France', 2, 0, 'Riad Dar Anika, médina', 'Français', 'paid'),
        B('GT-B7Q', 'agafay', 0, 'Sophie Wagner', '+49 160 1234567', 'Allemagne', 2, 2, 'Hôtel Es Saadi, Hivernage', 'Deutsch', 'conf'),
        B('GT-C3M', 'ourika', 1, 'James Carter', '+44 7911 123456', 'Royaume-Uni', 4, 0, 'Movenpick Mansour Eddahbi', 'English', 'paid'),
        B('GT-D9X', 'ait', 1, 'Lucía Fernández', '+34 611 223 344', 'Espagne', 2, 1, 'Riad Kniza', 'Español', 'new'),
        B('GT-E2P', 'merzouga', 2, 'Famille Dubois', '+32 475 11 22 33', 'Belgique', 2, 2, 'Riad Yasmine', 'Français', 'paid', { priv: true, note: 'Végétariens, anniversaire de la fille le 2e soir.' }),
        B('GT-F5R', 'medina', 3, 'Anna Rossi', '+39 333 123 4567', 'Italie', 2, 0, 'La Mamounia', 'English', 'conf'),
        B('GT-G8T', 'ourika', 1, 'Yassine Alaoui', '+212 661 98 76 54', 'Maroc', 3, 1, 'Résidence Gueliz', 'Français', 'conf'),
        B('GT-H4W', 'imperial', 9, 'Robert Miller', '+1 917 555 0142', 'États-Unis', 2, 0, 'Arrivée aéroport RAK', 'English', 'paid', { priv: true }),
        B('GT-J6Z', 'agafay', 4, 'Clara Martin', '+33 7 81 22 33 44', 'France', 6, 0, 'Hôtel Ibis Menara', 'Français', 'new', { note: 'Enterrement de vie de jeune fille.' }),
        B('GT-K1N', 'ait', -3, 'Pieter de Vries', '+31 6 98765432', 'Pays-Bas', 2, 0, 'Riad Laaroussa', 'English', 'done'),
        B('GT-L2S', 'agafay', -2, 'Emma Schulz', '+49 151 7654321', 'Allemagne', 2, 0, 'Riad Be', 'Deutsch', 'done'),
        B('GT-M3V', 'ourika', -5, 'Hugo Petit', '+33 6 11 22 33 44', 'France', 2, 0, 'Riad Jardin Secret', 'Français', 'cancel'),
      ],
    };
  }

  window.G = { CFG, STATUS, tour, quote, booked, db: store('greg_tours_v1', seed) };
})();
