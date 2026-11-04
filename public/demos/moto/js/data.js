// Tamouda Mobility — content + demo data (localStorage). Prices are examples ("à partir de 200 MAD / jour" comes from the business).
(() => {
  const { store, today, addDays, diffDays } = window.K;

  const CFG = {
    name: 'Tamouda Mobility',
    city: 'Agadir',
    phone: '+212 646-383873',
    wa: '212646383873',
    pinHash: '91279bee849d0908ee46dde2bd757741e731fa3f479473e0bdf43c43b8dd796c', // SHA-256 of 'mbn-demo:moto:<PIN>' — the PIN itself is never in the source
    hours: '7j/7 · 8h – 21h',
    zones: [
      { n: 'Agadir centre & Marina', fee: 0 },
      { n: 'Founty / Cité Dakhla', fee: 0 },
      { n: 'Aourir · Banana Village', fee: 50 },
      { n: 'Tamraght · Taghazout', fee: 80 },
      { n: 'Aéroport Al Massira', fee: 120 },
    ],
    extras: [
      { id: 'helmet2', n: 'Casque passager', p: 30, per: 'jour' },
      { id: 'topcase', n: 'Top case', p: 20, per: 'jour' },
      { id: 'phone', n: 'Support téléphone + chargeur', p: 15, per: 'jour' },
      { id: 'cover', n: 'Protection franchise réduite', p: 60, per: 'jour' },
    ],
    discounts: [{ from: 7, pct: 20 }, { from: 3, pct: 10 }],
    deposit: { scooter: 2000, moto: 5000 },
    fleet: [
      { id: 'sc1', cat: 'scooter', name: 'Scooter 125 Urban', cc: 125, price: 200, units: 4, img: null, color: '#f4b400', feats: ['Automatique', '2 places', 'Coffre sous selle'], lic: 'Permis B (3 ans) ou A1' },
      { id: 'sc2', cat: 'scooter', name: 'Scooter 125 Premium', cc: 125, price: 260, units: 2, img: null, color: '#1f2a44', feats: ['Automatique', 'ABS', 'Top case inclus'], lic: 'Permis B (3 ans) ou A1' },
      { id: 'mt1', cat: 'moto', name: 'Classic 350', cc: 350, price: 450, units: 2, img: 'm6', feats: ['Néo-rétro', 'Confort duo', 'Idéale côte'], lic: 'Permis A' },
      { id: 'mt2', cat: 'moto', name: 'Naked 390', cc: 390, price: 600, units: 2, img: 'm4', feats: ['Légère', 'ABS', 'Routes de montagne'], lic: 'Permis A' },
      { id: 'mt3', cat: 'moto', name: 'Sport 390', cc: 390, price: 650, units: 1, img: 'm2', feats: ['Carénée', 'ABS', 'Quick-shifter'], lic: 'Permis A' },
      { id: 'mt4', cat: 'moto', name: 'Roadster 650', cc: 650, price: 850, units: 1, img: 'm8', feats: ['Couple généreux', 'ABS', 'Longue distance'], lic: 'Permis A' },
      { id: 'mt5', cat: 'moto', name: 'Sport 650', cc: 650, price: 900, units: 1, img: 'm3', feats: ['Sportive', 'Mode pluie', 'ABS'], lic: 'Permis A' },
      { id: 'mt6', cat: 'moto', name: 'Supersport 600', cc: 600, price: 1100, units: 1, img: 'm5', feats: ['Piste & route', 'Expérience pilote', 'ABS'], lic: 'Permis A · 25 ans min.' },
    ],
    rides: [
      { n: 'Agadir → Taghazout', km: '20 km', t: '30 min', d: 'La route côtière des surfeurs, cafés face à l’océan.' },
      { n: 'Paradise Valley', km: '45 km', t: '1 h', d: 'Palmeraie et piscines naturelles dans l’Atlas.' },
      { n: 'Imsouane', km: '90 km', t: '1 h 45', d: 'La plus longue vague du Maroc, pause poisson grillé.' },
      { n: 'Tiznit & Mirleft', km: '120 km', t: '2 h', d: 'Arches de Legzira et route du désert.' },
    ],
  };

  const STATUS = { new: ['Nouvelle', 'new'], confirmed: ['Confirmée', 'ok'], out: ['En cours', 'warn'], done: ['Terminée', 'dark'], cancelled: ['Annulée', 'bad'] };

  function quote(v, from, to, opts = {}) {
    const days = Math.max(1, diffDays(from, to));
    const base = v.price * days;
    const d = CFG.discounts.find((x) => days >= x.from);
    const disc = d ? Math.round(base * d.pct / 100) : 0;
    const ex = (opts.extras || []).reduce((s, id) => { const e = CFG.extras.find((x) => x.id === id); return s + (e ? e.p * days : 0); }, 0);
    const z = CFG.zones[opts.zone ?? 0];
    const fee = opts.delivery ? (z ? z.fee : 0) : 0;
    return { days, base, disc, pct: d ? d.pct : 0, ex, fee, total: base - disc + ex + fee, deposit: CFG.deposit[v.cat] };
  }

  const overlaps = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;
  function freeUnits(s, vid, from, to, ignore) {
    const v = s.fleet.find((x) => x.id === vid); if (!v || v.off) return 0;
    const used = s.bookings.filter((b) => b.vid === vid && b.id !== ignore && !['cancelled', 'done'].includes(b.status) && overlaps(from, to, b.from, b.to)).length;
    return Math.max(0, v.units - used);
  }

  function seed() {
    const t = today();
    const mk = (id, vid, f, n, name, phone, country, status, extra = {}) => {
      const v = CFG.fleet.find((x) => x.id === vid); const from = addDays(t, f); const to = addDays(from, n);
      const q = quote(v, from, to, extra);
      return { id, vid, from, to, time: '10:00', name, phone, country, status, delivery: !!extra.delivery, zone: extra.zone ?? 0, hotel: extra.hotel || '', extras: extra.extras || [], total: q.total, paid: status === 'done' || status === 'out' ? q.total : 0, created: addDays(t, Math.min(f, 0) - 3), note: extra.note || '' };
    };
    return {
      fleet: CFG.fleet.map((v) => ({ id: v.id, price: v.price, units: v.units, off: false })),
      bookings: [
        mk('TM-4K2P', 'sc1', -6, 4, 'Lucas Martin', '+33 6 12 45 78 90', 'France', 'done', { delivery: true, zone: 3, hotel: 'Surf camp Tamraght' }),
        mk('TM-9QX1', 'mt1', -10, 7, 'Sara Benali', '+212 661 23 45 67', 'Maroc', 'done'),
        mk('TM-77AC', 'mt2', -2, 5, 'Jonas Weber', '+49 151 2345 6789', 'Allemagne', 'out', { extras: ['phone'] }),
        mk('TM-2B8N', 'sc1', -1, 3, 'Emma Clarke', '+44 7700 900123', 'Royaume-Uni', 'out', { delivery: true, zone: 0, hotel: 'Hôtel Marina Agadir', extras: ['helmet2'] }),
        mk('TM-5HJ3', 'sc2', 0, 2, 'Youssef Amrani', '+212 670 11 22 33', 'Maroc', 'confirmed', { delivery: true, zone: 1, hotel: 'Résidence Founty' }),
        mk('TM-8LMV', 'mt4', 1, 3, 'Carlos Ruiz', '+34 612 345 678', 'Espagne', 'confirmed', { extras: ['cover'] }),
        mk('TM-3TQE', 'sc1', 2, 7, 'Anna Kowalski', '+48 501 234 567', 'Pologne', 'new', { delivery: true, zone: 3, hotel: 'Taghazout Bay', extras: ['topcase'] }),
        mk('TM-6WRS', 'mt6', 4, 2, 'Mehdi Tazi', '+212 655 44 33 22', 'Maroc', 'new', { note: 'Demande une sortie accompagnée le 1er jour.' }),
        mk('TM-1PZD', 'mt3', 6, 3, 'Noah Dubois', '+32 470 12 34 56', 'Belgique', 'new'),
        mk('TM-0CXA', 'sc2', -15, 3, 'Inès Haddad', '+212 662 98 76 54', 'Maroc', 'cancelled'),
      ],
      log: [],
    };
  }

  window.M = { CFG, STATUS, quote, freeUnits, db: store('tamouda_moto_v1', seed) };
})();
