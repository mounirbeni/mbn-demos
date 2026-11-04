// Coopérative Avenir d'Exportation de Céramique — B2B export catalogue + quote requests. Prices are indicative examples (EUR, FOB).
(() => {
  const { store, today, addDays } = window.K;

  const CFG = {
    name: 'Coopérative Avenir',
    full: 'Coopérative Avenir d’Exportation de Céramique',
    phone: '+212 720-557298',
    pin: '7205',
    incoterms: ['EXW', 'FOB', 'CIF', 'DAP'],
    cats: [['all', 'Tout', 'All'], ['tableware', 'Arts de la table', 'Tableware'], ['tajine', 'Tajines', 'Tagines'], ['vase', 'Vases & jarres', 'Vases & jars'], ['deco', 'Décoration', 'Decor']],
    products: [
      { ref: 'AV-PL27', cat: 'tableware', img: 'plates', fr: 'Assiette plate émaillée Ø27', en: 'Glazed dinner plate Ø27', dim: 'Ø 27 cm', moq: 200, box: 12, eur: 4.2 },
      { ref: 'AV-BW16', cat: 'tableware', img: 'bowl', fr: 'Bol bicolore Ø16', en: 'Two-tone bowl Ø16', dim: 'Ø 16 × 7 cm', moq: 300, box: 24, eur: 2.8 },
      { ref: 'AV-CP25', cat: 'tableware', img: 'cups', fr: 'Set de gobelets grès (×4)', en: 'Stoneware tumbler set (×4)', dim: '9 × 8 cm', moq: 150, box: 12, eur: 6.5 },
      { ref: 'AV-MG35', cat: 'tableware', img: 'mugs', fr: 'Mug artisanal 35 cl', en: 'Handmade mug 35 cl', dim: '10 × 9 cm', moq: 300, box: 24, eur: 2.4 },
      { ref: 'AV-TJ30', cat: 'tajine', img: 'deco', fr: 'Tajine décoratif peint main Ø30', en: 'Hand-painted decorative tagine Ø30', dim: 'Ø 30 × 28 cm', moq: 100, box: 6, eur: 9.8 },
      { ref: 'AV-TJ25', cat: 'tajine', img: 'jars', fr: 'Tajine de cuisson terre cuite Ø25', en: 'Terracotta cooking tagine Ø25', dim: 'Ø 25 × 22 cm', moq: 150, box: 8, eur: 6.9 },
      { ref: 'AV-VS40', cat: 'vase', img: 'vase', fr: 'Vase boule mat 40 cm', en: 'Matte round vase 40 cm', dim: 'H 40 cm', moq: 60, box: 4, eur: 14.5 },
      { ref: 'AV-VS-SET', cat: 'vase', img: 'vases', fr: 'Trio de vases bouteille', en: 'Bottle vase trio', dim: 'H 18 / 24 / 30 cm', moq: 80, box: 6, eur: 11.0 },
      { ref: 'AV-JR50', cat: 'vase', img: 'jars', fr: 'Jarre brute 50 cm', en: 'Raw clay jar 50 cm', dim: 'H 50 cm', moq: 40, box: 2, eur: 18.0 },
      { ref: 'AV-ZL10', cat: 'deco', img: 'zellige', fr: 'Zellige émaillé 10×10 (m²)', en: 'Glazed zellige tile 10×10 (m²)', dim: '10 × 10 cm', moq: 50, box: 1, eur: 38.0 },
    ],
  };

  const STATUS = { new: ['Nouvelle', 'new'], quoted: ['Devis envoyé', 'warn'], samples: ['Échantillons', 'warn'], order: ['Commande', 'ok'], shipped: ['Expédiée', 'dark'], lost: ['Perdue', 'bad'] };
  const FLOW = ['new', 'quoted', 'samples', 'order', 'shipped'];
  const prod = (ref) => CFG.products.find((p) => p.ref === ref);

  function seed() {
    const t = today();
    const R = (id, d, company, contact, country, email, inc, port, lines, status, extra = {}) => ({ id, created: addDays(t, d), company, contact, country, email, phone: extra.phone || '', incoterm: inc, port, lines: lines.map(([ref, qty]) => ({ ref, qty, price: extra.priced ? prod(ref).eur : null })), status, custom: extra.custom || '', note: extra.note || '', date: extra.date || addDays(t, 60) });
    return {
      prices: {},
      off: [],
      requests: [
        R('RQ-2041', -1, 'Maison Lumière SARL', 'Claire Dubois', 'France', 'achats@maison-lumiere.fr', 'FOB', 'Casablanca', [['AV-PL27', 600], ['AV-BW16', 600], ['AV-MG35', 400]], 'new', { custom: 'Émail vert sauge, logo au dos des assiettes.' }),
        R('RQ-2038', -3, 'Casa Hogar Import', 'Javier Morales', 'Espagne', 'compras@casahogar.es', 'DAP', 'Valencia', [['AV-TJ30', 300], ['AV-VS40', 120]], 'quoted', { priced: true }),
        R('RQ-2033', -8, 'Nordic Clay AB', 'Emma Lindqvist', 'Suède', 'emma@nordicclay.se', 'CIF', 'Göteborg', [['AV-CP25', 450], ['AV-VS-SET', 200]], 'samples', { priced: true, note: 'Échantillons envoyés par DHL, retour attendu.' }),
        R('RQ-2027', -20, 'Atlas Living GmbH', 'Lukas Becker', 'Allemagne', 'einkauf@atlasliving.de', 'FOB', 'Tanger Med', [['AV-ZL10', 400], ['AV-JR50', 80]], 'order', { priced: true }),
        R('RQ-2019', -45, 'Riad Home LLC', 'Sarah Miller', 'États-Unis', 'sarah@riadhome.com', 'CIF', 'New York', [['AV-TJ25', 900], ['AV-PL27', 1200]], 'shipped', { priced: true }),
        R('RQ-2015', -30, 'Bazar Orient', 'Ahmed Saleh', 'Émirats arabes unis', 'info@bazarorient.ae', 'FOB', 'Casablanca', [['AV-TJ30', 150]], 'lost', { note: 'Prix cible trop bas.' }),
      ],
    };
  }

  window.X = { CFG, STATUS, FLOW, prod, db: store('avenir_export_v1', seed) };
})();
