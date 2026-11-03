// Magic Vision Nador — content + demo data. Packs and prices are examples to be set by the studio.
(() => {
  const { store, today, addDays } = window.K;

  const CFG = {
    name: 'Magic Vision',
    city: 'Nador',
    phone: '+212 677-884535',
    pin: '2611',
    hours: '7j/7 sur rendez-vous',
    deposit: 30,
    types: ['Mariage', 'Fiançailles', 'Henné', 'Anniversaire', 'Baptême / Aqiqa', 'Portrait / famille', 'Entreprise / produit'],
    packs: [
      { id: 'ess', n: 'Essentiel', p: 4500, d: 'Photo · jusqu’à 6 h', items: ['1 photographe', '300+ photos retouchées', 'Galerie privée en ligne', 'Livraison en 3 semaines'] },
      { id: 'sig', n: 'Signature', p: 9000, d: 'Photo + vidéo · jusqu’à 10 h', feat: true, items: ['1 photographe + 1 vidéaste', 'Film résumé 4–6 min', '500+ photos retouchées', 'Galerie privée + sélection album'] },
      { id: 'pre', n: 'Prestige', p: 15000, d: 'Journée complète', items: ['2 photographes + 1 vidéaste', 'Prises de vue drone', 'Film complet + teaser réseaux', 'Album photo 30×30 inclus'] },
    ],
    portfolio: [
      { img: 'p1', c: 'mariage', t: 'Entrée des mariés', tall: false },
      { img: 'p2', c: 'mariage', t: 'Séance couple', tall: true },
      { img: 'p3', c: 'details', t: 'Les alliances', tall: false },
      { img: 'hero', c: 'mariage', t: 'Bouquet de la mariée', tall: false },
      { img: 'p5', c: 'evenement', t: 'Sortie de cérémonie', tall: true },
      { img: 'p4', c: 'details', t: 'Main dans la main', tall: false },
      { img: 'p6', c: 'exterieur', t: 'Lever de soleil sur le Rif', tall: false },
      { img: 'p8', c: 'exterieur', t: 'En coulisses', tall: false },
      { img: 'p7', c: 'studio', t: 'Notre matériel', tall: false },
    ],
  };

  const STATUS = { req: ['Demande', 'new'], hold: ['Option 48 h', 'warn'], conf: ['Confirmée', 'ok'], shot: ['Réalisée', 'dark'], deliv: ['Livrée', 'ok'], cancel: ['Annulée', 'bad'] };
  const FLOW = ['req', 'hold', 'conf', 'shot', 'deliv'];
  const pack = (id) => CFG.packs.find((p) => p.id === id);

  function seed() {
    const t = today();
    const B = (id, d, name, phone, type, packId, place, guests, status, extra = {}) => ({ id, date: addDays(t, d), name, phone, type, pack: packId, place, guests, status, price: pack(packId).p, paid: extra.paid ?? (['conf', 'shot', 'deliv'].includes(status) ? Math.round(pack(packId).p * CFG.deposit / 100) : 0), note: extra.note || '', created: addDays(t, Math.min(d, 0) - 20) });
    return {
      bookings: [
        B('MV-4821', -12, 'Amina & Karim', '+212 661 45 78 12', 'Mariage', 'pre', 'Salle Riad Al Andalous, Nador', 350, 'deliv', { paid: 15000 }),
        B('MV-7310', -4, 'Famille Bouazza', '+212 670 12 34 56', 'Aqiqa', 'ess', 'Selouane', 80, 'shot', { paid: 4500 }),
        B('MV-2611', -20, 'Salma & Yassine', '+33 6 22 41 87 90', 'Mariage', 'sig', 'Villa Mar Chica', 220, 'deliv', { paid: 9000 }),
        B('MV-5904', 5, 'Hanane & Mehdi', '+212 662 88 10 44', 'Henné', 'ess', 'Beni Ansar', 120, 'conf'),
        B('MV-1188', 9, 'Ilham & Anouar', '+31 6 1234 5678', 'Mariage', 'pre', 'Hôtel Mercure Rif, Nador', 400, 'conf', { note: 'Mariés venant des Pays-Bas — prévoir drone au port.' }),
        B('MV-6602', 12, 'Nour El Houda', '+212 655 32 21 90', 'Fiançailles', 'sig', 'Zeghanghane', 150, 'hold'),
        B('MV-3377', 16, 'Société Rif Agro', '+212 536 60 00 00', 'Entreprise / produit', 'ess', 'Zone industrielle Selouane', 0, 'req', { note: 'Photos produits + portraits de l’équipe.' }),
        B('MV-9045', 23, 'Khadija & Samir', '+49 151 9876 5432', 'Mariage', 'sig', 'Salle Les Jardins, Nador', 300, 'req'),
        B('MV-8120', 30, 'Rania & Bilal', '+212 661 77 66 55', 'Mariage', 'pre', 'Driouch', 500, 'conf'),
      ],
      galleries: [
        { code: 'MV-2611', phone: '+33 6 22 41 87 90', name: 'Salma & Yassine', imgs: ['p1', 'p2', 'p3', 'p4', 'p5', 'hero', 'p6', 'p8'], fav: ['p2', 'p5'], max: 40, created: addDays(t, -3) },
        { code: 'MV-4821', phone: '+212 661 45 78 12', name: 'Amina & Karim', imgs: ['p5', 'p1', 'hero', 'p3', 'p4', 'p2'], fav: ['p1', 'p3', 'hero', 'p4'], max: 60, created: addDays(t, -2) },
      ],
    };
  }

  window.P = { CFG, STATUS, FLOW, pack, db: store('magic_vision_v1', seed) };
})();
