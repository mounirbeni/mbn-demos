// EPS Design Cuisine — content + demo data. All prices are example values (per linear metre) to be set by the business.
(() => {
  const { store, today, addDays } = window.K;

  const CFG = {
    name: 'EPS Design Cuisine',
    pinHash: '594ee00821caeeddc86b8b122eea81fa92d6585ebfccc551a2fb54ae792debf4', // SHA-256 of 'mbn-demo:cuisine:<PIN>' — the PIN itself is never in the source
    hours: 'Lun – Sam · 9h – 19h',
    shapes: [
      { id: 'line', n: 'Linéaire', k: 1, svg: '<rect x="6" y="14" width="48" height="10" rx="2"/>' },
      { id: 'L', n: 'En L', k: 1.08, svg: '<path d="M6 14h48v10H16v26H6z"/>' },
      { id: 'U', n: 'En U', k: 1.15, svg: '<path d="M6 14h48v36H44V24H16v26H6z"/>' },
      { id: 'island', n: 'Avec îlot', k: 1.25, svg: '<path d="M6 14h48v10H6z"/><rect x="18" y="34" width="24" height="12" rx="2"/>' },
      { id: 'par', n: 'Parallèle', k: 1.1, svg: '<rect x="6" y="12" width="48" height="10" rx="2"/><rect x="6" y="38" width="48" height="10" rx="2"/>' },
    ],
    fronts: [
      { id: 'mel', n: 'Mélaminé', d: 'Résistant, large choix de décors', p: 2600 },
      { id: 'lac', n: 'Laqué mat ou brillant', d: 'Finition lisse, couleurs sur mesure', p: 3900 },
      { id: 'wood', n: 'Bois massif', d: 'Chêne, noyer, frêne — chaleur naturelle', p: 5200 },
    ],
    tops: [
      { id: 'strat', n: 'Stratifié', p: 450 },
      { id: 'quartz', n: 'Quartz', p: 1600 },
      { id: 'marble', n: 'Marbre / granit', p: 1900 },
    ],
    extras: [
      { id: 'led', n: 'Éclairage LED sous meubles', p: 1800 },
      { id: 'tall', n: 'Colonne four + micro-ondes', p: 3500 },
      { id: 'sink', n: 'Évier sous plan + mitigeur', p: 2400 },
      { id: 'appl', n: 'Pack électroménager encastrable', p: 16000 },
      { id: 'soft', n: 'Tiroirs à fermeture amortie partout', p: 2200 },
    ],
    slots: ['09:30', '11:30', '14:30', '16:30'],
    gallery: [
      { img: 'k1', t: 'Cuisine blanche & îlot', c: 'ilot', s: 'Laqué blanc, plan quartz' },
      { img: 'k5', t: 'Graphite & bois', c: 'moderne', s: 'Façades anthracite, plan marbre' },
      { img: 'k2', t: 'Cuisine classique', c: 'classique', s: 'Moulures, poignées laiton' },
      { img: 'k3', t: 'Atelier du chef', c: 'classique', s: 'Évier céramique, crédence métro' },
      { img: 'k4', t: 'Blanc & noir', c: 'moderne', s: 'Ouverte sur le séjour' },
      { img: 'k6', t: 'Îlot central', c: 'ilot', s: 'Rangements des deux côtés' },
      { img: 'k7', t: 'Petit espace optimisé', c: 'petit', s: 'Rangements muraux' },
      { img: 'k8', t: 'Plan de travail quartz', c: 'moderne', s: 'Robinetterie dorée' },
      { img: 'hero', t: 'Cuisine en L', c: 'petit', s: 'Gris vert, étagères ouvertes' },
    ],
  };

  const STATUS = {
    new: ['Nouvelle demande', 'new'], visit: ['Métré planifié', 'warn'], quote: ['Devis envoyé', 'warn'],
    signed: ['Signé', 'ok'], build: ['En fabrication', 'ok'], done: ['Posée', 'dark'], lost: ['Perdu', 'bad'],
  };
  const FLOW = ['new', 'visit', 'quote', 'signed', 'build', 'done'];

  function estimate(o, prices) {
    const P = prices || {};
    const sh = CFG.shapes.find((x) => x.id === o.shape) || CFG.shapes[0];
    const fr = CFG.fronts.find((x) => x.id === o.front) || CFG.fronts[0];
    const tp = CFG.tops.find((x) => x.id === o.top) || CFG.tops[0];
    const m = Number(o.m) || 3;
    const furn = m * (P[fr.id] ?? fr.p) * sh.k;
    const top = m * (P[tp.id] ?? tp.p) * (o.shape === 'island' ? 1.35 : 1);
    const ex = (o.extras || []).reduce((s, id) => s + ((CFG.extras.find((x) => x.id === id) || {}).p || 0), 0);
    const pose = Math.round(m * 350);
    const mid = furn + top + ex + pose;
    const r = (n) => Math.round(n / 500) * 500;
    return { furn, top, ex, pose, mid, lo: r(mid * 0.88), hi: r(mid * 1.12) };
  }

  function seed() {
    const t = today();
    const L = (id, d, name, phone, city, status, o, extra = {}) => {
      const e = estimate(o);
      return { id, created: addDays(t, d), name, phone, city, status, ...o, lo: e.lo, hi: e.hi, visit: extra.visit || null, slot: extra.slot || null, amount: extra.amount || 0, paid: extra.paid || 0, note: extra.note || '', history: [{ at: addDays(t, d), s: 'new' }] };
    };
    return {
      prices: {},
      leads: [
        L('EPS-71Q', -1, 'Nadia El Fassi', '+212 661 22 33 44', 'Casablanca · Bourgogne', 'new', { shape: 'L', m: 4.5, front: 'lac', top: 'quartz', extras: ['led', 'sink'] }, { note: 'Appartement neuf, livraison en février.' }),
        L('EPS-3KD', -2, 'Omar Benjelloun', '+212 670 98 12 45', 'Rabat · Agdal', 'visit', { shape: 'island', m: 6, front: 'wood', top: 'marble', extras: ['tall', 'appl', 'soft'] }, { visit: addDays(t, 2), slot: '11:30' }),
        L('EPS-9ZA', -4, 'Salma Idrissi', '+212 655 41 77 20', 'Casablanca · Maârif', 'visit', { shape: 'line', m: 3, front: 'mel', top: 'strat', extras: [] }, { visit: addDays(t, 1), slot: '16:30' }),
        L('EPS-5MH', -9, 'Karim Lahlou', '+212 662 10 20 30', 'Mohammedia', 'quote', { shape: 'U', m: 7, front: 'lac', top: 'quartz', extras: ['led', 'tall'] }, { amount: 68000, note: 'Hésite entre laqué blanc et vert sauge.' }),
        L('EPS-2PL', -21, 'Leila Chraibi', '+212 668 55 44 11', 'Bouskoura', 'signed', { shape: 'island', m: 5.5, front: 'lac', top: 'quartz', extras: ['led', 'sink', 'soft'] }, { amount: 79500, paid: 39750 }),
        L('EPS-8RT', -40, 'Hicham Tazi', '+212 661 78 90 12', 'Casablanca · CIL', 'build', { shape: 'L', m: 4, front: 'wood', top: 'marble', extras: ['tall'] }, { amount: 61000, paid: 30500 }),
        L('EPS-4WB', -75, 'Sofia Alami', '+212 670 33 21 09', 'Rabat · Souissi', 'done', { shape: 'par', m: 6, front: 'mel', top: 'quartz', extras: ['appl'] }, { amount: 64000, paid: 64000 }),
        L('EPS-6CN', -30, 'Youssef Berrada', '+212 654 12 98 76', 'Casablanca', 'lost', { shape: 'line', m: 3.5, front: 'mel', top: 'strat', extras: [] }, { note: 'Budget trop serré pour cette année.' }),
      ],
    };
  }

  window.C = { CFG, STATUS, FLOW, estimate, db: store('eps_cuisine_v1', seed) };
})();
