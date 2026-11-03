// Demo data layer: everything lives in this browser (localStorage) and is shared live between the
// public site and the atelier dashboard (BroadcastChannel). Seeded relative to today so it never looks old.
(function () {
  const KEY = 'atelier_safi_v2';
  const bc = 'BroadcastChannel' in window ? new BroadcastChannel('atelier_safi') : null;
  const listeners = [];
  const day = 864e5;
  const iso = (d) => new Date(d).toISOString().slice(0, 10);
  const plus = (n) => iso(Date.now() + n * day);
  const uid = (p) => `${p}${Math.random().toString(36).slice(2, 8)}`;
  const ref = () => `AS-${Math.floor(1000 + Math.random() * 9000)}`;

  const VENUES = {
    Safi: 'Atelier, Colline des potiers', Marrakech: 'Riad partenaire, Médina', Essaouira: 'Galerie partenaire, Médina',
    Casablanca: 'Espace créatif, Maârif', Paris: 'Atelier partenaire, 11e', Barcelona: 'Taller partner, Gràcia',
    Bruxelles: 'Atelier partenaire, Ixelles', Lyon: 'Atelier partenaire, Croix-Rousse', 'Montréal': 'Studio partenaire, Plateau', 'Genève': 'Atelier partenaire, Carouge',
  };
  const COUNTRY = { Safi: 'MA', Marrakech: 'MA', Essaouira: 'MA', Casablanca: 'MA', Paris: 'FR', Barcelona: 'ES', Bruxelles: 'BE', Lyon: 'FR', 'Montréal': 'CA', 'Genève': 'CH' };

  function seed() {
    const s = (format, city, start, capacity, lang, booked) => ({ id: uid('s'), format, city, country: COUNTRY[city], venue: VENUES[city], start: plus(start), capacity, lang, status: 'open', _booked: booked });
    const sessions = [
      s('initiation', 'Safi', 3, 8, 'fr · ar', 5), s('decouverte', 'Safi', 9, 8, 'fr · en', 6), s('intensif', 'Safi', 18, 6, 'fr · en', 6),
      s('initiation', 'Marrakech', 12, 8, 'fr · en', 3), s('decouverte', 'Essaouira', 26, 8, 'fr · en', 2), s('pro', 'Safi', 34, 5, 'fr · ar', 3),
      s('masterclass', 'Paris', 21, 10, 'fr', 7), s('masterclass', 'Barcelona', 40, 10, 'es · fr', 4), s('masterclass', 'Bruxelles', 55, 10, 'fr', 1),
      s('initiation', 'Casablanca', 30, 8, 'fr · ar', 0), s('masterclass', 'Montréal', 75, 12, 'fr · en', 0), s('intensif', 'Safi', -12, 6, 'fr · en', 6),
    ];
    const people = [
      ['Sophie Martin', 'FR', '+33 6 12 45 78 90'], ['Youssef El Amrani', 'MA', '+212 6 61 22 33 44'], ['Laura García', 'ES', '+34 612 345 678'],
      ['Emma Dubois', 'BE', '+32 470 12 34 56'], ['Karim Bennani', 'MA', '+212 6 70 11 22 33'], ['Chloé Bernard', 'FR', '+33 7 81 23 45 67'],
      ['Nadia Tazi', 'MA', '+212 6 62 98 76 54'], ['Julie Lefèvre', 'CA', '+1 514 555 0142'], ['Marta Puig', 'ES', '+34 655 112 233'],
      ['Thomas Weber', 'CH', '+41 79 123 45 67'], ['Inès Haddad', 'FR', '+33 6 45 67 89 01'], ['Salma Idrissi', 'MA', '+212 6 55 44 33 22'],
    ];
    const bookings = [];
    let p = 0;
    for (const se of sessions) {
      let left = se._booked;
      while (left > 0) {
        const n = Math.min(left, left >= 2 && p % 3 === 0 ? 2 : 1);
        const [name, country, phone] = people[p % people.length]; p++;
        const f = window.ATELIER.formats.find((x) => x.id === se.format);
        const cur = se.country === 'MA' ? 'MAD' : 'EUR';
        const total = n * (cur === 'MAD' ? f.priceMAD : f.priceEUR);
        const paid = p % 4 === 0 ? total : p % 4 === 1 ? 0 : Math.round(total * window.ATELIER.depositPct / 100);
        bookings.push({ id: uid('b'), ref: ref(), sessionId: se.id, name, email: `${name.split(' ')[0].toLowerCase()}@mail.com`, phone, country, seats: n,
          level: ['beginner', 'intermediate', 'beginner', 'advanced'][p % 4], notes: '', total, currency: cur, paid,
          status: paid === 0 ? 'pending' : 'confirmed', source: ['site', 'whatsapp', 'instagram', 'site'][p % 4], attended: se.start < plus(0), createdAt: Date.now() - (p * 2 + 1) * day });
        left -= n;
      }
      delete se._booked;
    }
    // One full session gets a waiting list.
    const full = sessions.find((x) => x.format === 'intensif' && x.start > plus(0));
    bookings.push({ id: uid('b'), ref: ref(), sessionId: full.id, name: 'Lucie Moreau', email: 'lucie@mail.com', phone: '+33 6 98 76 54 32', country: 'FR', seats: 1, level: 'intermediate', notes: '', total: 0, currency: 'MAD', paid: 0, status: 'waitlist', source: 'site', createdAt: Date.now() - day });
    const messages = [
      { id: uid('m'), from: 'client', name: 'Sophie Martin', contact: '+33 6 12 45 78 90', ref: bookings[0].ref, text: 'Bonjour, faut-il apporter quelque chose pour le stage ?', at: Date.now() - 5 * 36e5, read: false },
      { id: uid('m'), from: 'client', name: 'Marta Puig', contact: 'marta@mail.com', ref: null, text: '¿Habrá un curso en Madrid el próximo año? Somos un grupo de 6.', at: Date.now() - 26 * 36e5, read: false },
      { id: uid('m'), from: 'atelier', name: 'Atelier', contact: '+33 6 12 45 78 90', ref: bookings[0].ref, text: 'Bienvenue ! Juste une tenue qui ne craint pas la terre, tout le reste est fourni.', at: Date.now() - 4 * 36e5, read: true },
    ];
    const interests = [
      ['Paris', 'FR', 9], ['Madrid', 'ES', 6], ['Montréal', 'CA', 5], ['Londres', 'GB', 4], ['Lyon', 'FR', 4], ['Genève', 'CH', 3], ['Rabat', 'MA', 3], ['Amsterdam', 'NL', 2],
    ].flatMap(([city, country, n]) => Array.from({ length: n }, (_, i) => ({ id: uid('i'), city, country, contact: `contact${i}@mail.com`, name: '', at: Date.now() - (i + 1) * 3 * day })));
    const hosts = [
      { id: uid('h'), org: 'Association Terre & Feu', city: 'Lyon', country: 'FR', people: 12, period: 'Printemps', contact: 'terreetfeu@mail.com', note: 'Nous avons un four et 12 tours.', at: Date.now() - 2 * day, status: 'new' },
      { id: uid('h'), org: 'École d’art Saint-Luc', city: 'Bruxelles', country: 'BE', people: 20, period: 'Mars', contact: 'ateliers@stluc.be', note: 'Pour nos étudiants de 2e année.', at: Date.now() - 6 * day, status: 'contacted' },
    ];
    const past = sessions.find((x) => x.start < plus(0));
    const pastBookings = bookings.filter((b) => b.sessionId === past.id).slice(0, 2);
    const reviews = pastBookings.map((b, i) => ({ id: uid('r'), bookingRef: b.ref, name: b.name.split(' ')[0], rating: 5, text: i ? 'Cinq jours intenses et passionnants, je repars avec mes pièces et l’envie de continuer.' : 'Un vrai partage de savoir-faire. On sent l’amour du métier à chaque geste.', at: Date.now() - (i + 2) * day, status: 'pending' }));
    const vouchers = [{ id: uid('v'), code: 'CADEAU-7F3K', amount: 1000, balance: 1000, buyer: 'Inès Haddad', to: 'Camille', message: 'Joyeux anniversaire !', contact: '+33 6 45 67 89 01', at: Date.now() - 4 * day, paid: true }];
    const groups = [{ id: uid('g'), kind: 'company', org: 'Agence Atlas Events', people: 18, date: plus(45), city: 'Marrakech', budget: '20 000 DH', contact: 'events@atlas.ma', note: 'Team building pour un séminaire.', at: Date.now() - 3 * day, status: 'new' }];
    const orders = [{ id: uid('o'), ref: 'CMD-' + Math.floor(1000 + Math.random() * 9000), items: [{ id: 'p1', qty: 2 }], name: 'Emma Dubois', contact: '+32 470 12 34 56', delivery: 'abroad', address: 'Bruxelles', total: 950, at: Date.now() - day, status: 'new' }];
    const outbox = [
      { id: uid('n'), kind: 'confirmation', to: `${bookings[0].name} · ${bookings[0].phone}`, text: `Réservation ${bookings[0].ref} confirmée. Acompte reçu, le solde est à régler avant la session.`, at: Date.now() - 2 * day, status: 'sent' },
      { id: uid('n'), kind: 'reminder', to: `${bookings[1].name} · ${bookings[1].phone}`, text: 'Rappel la veille : adresse de l’atelier, horaire 9 h 30, tenue qui ne craint pas la terre.', at: Date.now() - 1 * day, status: 'sent' },
      { id: uid('n'), kind: 'voucher', to: 'Inès Haddad · +33 6 45 67 89 01', text: 'Bon cadeau CADEAU-7F3K de 1 000 DH pour Camille, valable 12 mois.', at: Date.now() - 4 * day, status: 'sent' },
    ];
    return { v: 2, sessions, bookings, messages, interests, hosts, reviews, vouchers, groups, orders, outbox, payments: bookings.filter((b) => b.paid > 0).map((b) => ({ id: uid('p'), bookingRef: b.ref, amount: b.paid, currency: b.currency, method: ['card', 'transfer', 'cash'][b.paid % 3], at: b.createdAt })) };
  }

  let db;
  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { db = null; }
    if (!db || db.v !== 2) { db = seed(); persist(false); }
    return db;
  }
  function persist(broadcast = true) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* private mode */ }
    if (broadcast && bc) bc.postMessage('changed');
    listeners.forEach((fn) => fn(db));
  }
  if (bc) bc.onmessage = () => { load(); listeners.forEach((fn) => fn(db)); };
  window.addEventListener('storage', (e) => { if (e.key === KEY) { load(); listeners.forEach((fn) => fn(db)); } });

  // Automatic messages the real system sends (email / WhatsApp); the demo logs them so the owner sees them.
  const notify = (kind, to, text) => db.outbox.unshift({ id: uid('n'), kind, to, text, at: Date.now(), status: 'sent' });
  const fmt = (amount, cur) => (cur === 'EUR' ? `${Math.round(amount).toLocaleString('fr-FR')} €` : `${Math.round(amount).toLocaleString('fr-FR')} DH`);
  const format = (id) => window.ATELIER.formats.find((f) => f.id === id);
  const endOf = (s) => iso(new Date(s.start).getTime() + (format(s.format).days - 1) * day);
  const seatsTaken = (s) => db.bookings.filter((b) => b.sessionId === s.id && ['pending', 'confirmed', 'paid'].includes(b.status)).reduce((n, b) => n + b.seats, 0);
  const seatsLeft = (s) => Math.max(0, s.capacity - seatsTaken(s));
  const priceOf = (s) => (s.country === 'MA' ? { amount: format(s.format).priceMAD, currency: 'MAD' } : { amount: format(s.format).priceEUR, currency: 'EUR' });

  window.Store = {
    load, fmt, format, endOf, seatsLeft, seatsTaken, priceOf, today: () => plus(0),
    on: (fn) => listeners.push(fn),
    get db() { return db; },
    session: (id) => db.sessions.find((s) => s.id === id),
    book({ sessionId, seats, name, email, phone, country, level, notes, pay, voucher }) {
      const s = this.session(sessionId);
      const free = seatsLeft(s);
      const waitlist = free < seats;
      const { amount, currency } = priceOf(s);
      const total = waitlist ? 0 : amount * seats;
      // A gift voucher pays part or all of the booking (vouchers are in MAD).
      const v = voucher && !waitlist ? this.voucher(voucher) : null;
      const fromVoucher = v ? Math.min(v.balance / (currency === 'EUR' ? window.ATELIER.eurToMad : 1), total) : 0;
      const rest = total - fromVoucher;
      const paidNow = waitlist ? 0 : pay === 'deposit' ? Math.round(rest * window.ATELIER.depositPct / 100) : pay === 'full' ? rest : 0;
      const paid = Math.round(fromVoucher + paidNow);
      const b = { id: uid('b'), ref: ref(), sessionId, name, email, phone, country, seats, level, notes, total, currency, paid, status: waitlist ? 'waitlist' : paid > 0 ? 'confirmed' : 'pending', source: 'site', createdAt: Date.now() };
      db.bookings.unshift(b);
      if (v && fromVoucher > 0) { v.balance = Math.max(0, Math.round(v.balance - fromVoucher * (currency === 'EUR' ? window.ATELIER.eurToMad : 1))); db.payments.unshift({ id: uid('p'), bookingRef: b.ref, amount: Math.round(fromVoucher), currency, method: 'voucher', at: Date.now() }); }
      if (paidNow > 0) db.payments.unshift({ id: uid('p'), bookingRef: b.ref, amount: paidNow, currency, method: 'card', at: Date.now() });
      const f = format(s.format);
      notify(waitlist ? 'waitlist' : 'confirmation', `${name} · ${email} · ${phone}`, waitlist ? `Liste d’attente : ${f.fr.name}, ${s.city}, ${s.start}. Vous serez prévenu dès qu’une place se libère.` : `Réservation ${b.ref} confirmée : ${f.fr.name}, ${s.city}, ${s.start}. Payé ${fmt(paid, currency)} sur ${fmt(total, currency)}.`);
      notify('reminder', `${name} · ${phone}`, `Programmé la veille (${s.start}) : rappel de l’adresse, de l’horaire et de ce qu’il faut apporter.`);
      persist();
      return b;
    },
    findBooking: (r, phone) => db.bookings.find((b) => b.ref.toUpperCase() === String(r).trim().toUpperCase() && b.phone.replace(/\D/g, '').slice(-6) === String(phone).replace(/\D/g, '').slice(-6)),
    pay(refCode, amount, method = 'card') {
      const b = db.bookings.find((x) => x.ref === refCode); if (!b) return;
      b.paid = Math.min(b.total, b.paid + amount); if (b.status === 'pending') b.status = 'confirmed';
      db.payments.unshift({ id: uid('p'), bookingRef: b.ref, amount, currency: b.currency, method, at: Date.now() }); persist();
    },
    setStatus(id, status) { const b = db.bookings.find((x) => x.id === id); if (b) { b.status = status; persist(); } },
    promote(id) {
      const b = db.bookings.find((x) => x.id === id); if (!b) return false;
      const s = this.session(b.sessionId); if (seatsLeft(s) < b.seats) return false;
      const { amount, currency } = priceOf(s); b.total = amount * b.seats; b.currency = currency; b.status = 'pending';
      notify('waitlist', `${b.name} · ${b.phone}`, `Bonne nouvelle : une place s’est libérée pour ${format(s.format).fr.name} à ${s.city}. Lien de paiement envoyé.`); persist(); return true;
    },
    toggleAttended(id) { const b = db.bookings.find((x) => x.id === id); if (b) { b.attended = !b.attended; persist(); } },
    message({ from, name, contact, ref: r, text }) { db.messages.unshift({ id: uid('m'), from, name, contact, ref: r || null, text, at: Date.now(), read: from === 'atelier' }); persist(); },
    markRead(contact) { db.messages.forEach((m) => { if (m.contact === contact) m.read = true; }); persist(); },
    interest({ city, country, contact, name }) { db.interests.unshift({ id: uid('i'), city, country, contact, name, at: Date.now() }); persist(); },
    host(h) { db.hosts.unshift({ id: uid('h'), status: 'new', at: Date.now(), ...h }); persist(); },
    setHost(id, status) { const h = db.hosts.find((x) => x.id === id); if (h) { h.status = status; persist(); } },
    saveSession(s) {
      if (s.id) Object.assign(this.session(s.id), s); else db.sessions.push({ ...s, id: uid('s'), status: 'open' });
      db.sessions.sort((a, b) => a.start.localeCompare(b.start)); persist();
    },
    // Gift vouchers, groups, shop, reviews, broadcasts
    voucher: (code) => db.vouchers.find((v) => v.code.toUpperCase() === String(code || '').trim().toUpperCase() && v.balance > 0) || null,
    buyVoucher({ amount, buyer, to, message, contact }) {
      const v = { id: uid('v'), code: `CADEAU-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, amount, balance: amount, buyer, to, message, contact, at: Date.now(), paid: true };
      db.vouchers.unshift(v); db.payments.unshift({ id: uid('p'), bookingRef: v.code, amount, currency: 'MAD', method: 'card', at: Date.now() });
      notify('voucher', `${buyer} · ${contact}`, `Bon cadeau ${v.code} de ${fmt(amount, 'MAD')} pour ${to}, valable 12 mois.`); persist(); return v;
    },
    group(g) { db.groups.unshift({ id: uid('g'), status: 'new', at: Date.now(), ...g }); persist(); },
    setGroup(id, status) { const g = db.groups.find((x) => x.id === id); if (g) { g.status = status; persist(); } },
    order({ items, name, contact, delivery, address }) {
      const P = window.ATELIER.pieces; let total = 0;
      for (const it of items) { const p = P.find((x) => x.id === it.id); total += p.priceMAD * it.qty; }
      total += window.ATELIER.shippingMAD[delivery] || 0;
      const o = { id: uid('o'), ref: `CMD-${Math.floor(1000 + Math.random() * 9000)}`, items, name, contact, delivery, address, total, at: Date.now(), status: 'new' };
      db.orders.unshift(o); notify('order', `${name} · ${contact}`, `Commande ${o.ref} reçue (${fmt(total, 'MAD')}). Nous vous écrivons pour le paiement et l’envoi.`); persist(); return o;
    },
    setOrder(id, status) { const o = db.orders.find((x) => x.id === id); if (o) { o.status = status; persist(); } },
    review({ bookingRef, name, rating, text }) { db.reviews.unshift({ id: uid('r'), bookingRef, name, rating, text, at: Date.now(), status: 'pending' }); persist(); },
    setReview(id, status) { const r = db.reviews.find((x) => x.id === id); if (r) { r.status = status; persist(); } },
    broadcast(targets, text, label) { targets.forEach((t) => notify('broadcast', t, text)); persist(); return targets.length; },
    reset() { db = seed(); persist(); },
  };
  load();
  db.sessions.sort((a, b) => a.start.localeCompare(b.start));
})();
