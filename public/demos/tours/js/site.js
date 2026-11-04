(() => {
  const { $, $$, esc, mad, uid, today, frDate, toast, modal, close, calendar, ICON } = window.K;
  const { CFG, STATUS, tour, quote, booked, db } = window.G;
  const img = (n) => `/demos/tours/img/${n}.webp`;
  const WIDGET = location.pathname.replace(/\/$/, '').endsWith('/widget');
  const price = (t) => db.get().prices[t.id] ?? t.p;
  const left = (t, d) => t.cap - booked(db.get(), t.id, d);

  const cards = () => CFG.tours.map((t) => `<article class="tcard"><div class="timg"><img src="${img(t.img)}" alt="${esc(t.n)}" loading="lazy" width="1000" height="667"><span class="tdur">${esc(t.dur)}</span></div>
    <div class="tb"><h3>${esc(t.n)}</h3><p class="muted">${esc(t.desc)}</p><div class="ttags">${t.tags.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
    <div class="tf"><div><span class="muted" style="font-size:.78rem">à partir de</span><b>${mad(price(t))}</b><span class="muted" style="font-size:.78rem"> / adulte</span></div><button class="btn btn-primary btn-sm" data-t="${t.id}">Réserver</button></div></div></article>`).join('');

  if (WIDGET) {
    document.body.classList.add('widget');
    $('#app').innerHTML = `<div class="wrap" style="padding:24px 0"><div class="wbar"><b>Réserver une excursion</b><span class="muted">Module de réservation · Greg Tours</span></div><div class="tours">${cards()}</div></div>`;
  } else {
    $('#top').innerHTML = `<div class="wrap"><a class="brand" href="#"><span class="mark">GT</span>Greg<span class="acc">Tours</span></a>
      <nav class="nav"><a href="#excursions">Excursions</a><a href="#comment">Comment ça marche</a><a href="#integration">Pour votre site</a><a href="#" data-my>Ma réservation</a></nav>
      <a class="btn btn-primary btn-sm" href="#excursions">Réserver</a></div>`;
    $('#app').innerHTML = `
    <section class="hero"><img src="${img('hero')}" alt="Minaret de la Koutoubia devant les sommets enneigés de l’Atlas" width="1800" height="1200" fetchpriority="high">
      <div class="wrap"><span class="eyebrow">Excursions & circuits au Maroc</span><h1>Réservez votre excursion<br>en 2 minutes.</h1>
      <p class="lead">Désert, Atlas, kasbahs et villes impériales. Places disponibles en temps réel, prise en charge à votre hôtel, confirmation immédiate.</p>
      <div class="cta"><a class="btn btn-primary" href="#excursions">Voir les excursions</a><button class="btn btn-light" data-my>Ma réservation</button></div>
      <div class="facts"><div><b>Places en direct</b>pour chaque départ</div><div><b>Prise en charge</b>à votre hôtel ou riad</div><div><b>Acompte ${CFG.deposit} %</b>ou paiement sur place</div><div><b>4 langues</b>FR · EN · ES · DE</div></div></div></section>
    <section class="sec" id="excursions"><div class="wrap"><div class="sec-head"><span class="eyebrow">Excursions</span><h2>Choisissez votre aventure</h2><p class="muted">Excursions et prix d’exemple — remplacés par votre programme.</p></div><div class="tours">${cards()}</div></div></section>
    <section class="sec sec-alt" id="comment"><div class="wrap"><div class="sec-head center"><span class="eyebrow">Simple pour vos clients</span><h2>Comment ça marche</h2></div><div class="grid g4">
      <div class="card"><div class="ico">${ICON.pin}</div><h3>1. Choisir</h3><p class="muted">L’excursion, la date et le nombre de personnes. Les places restantes s’affichent.</p></div>
      <div class="card"><div class="ico">${ICON.truck}</div><h3>2. Prise en charge</h3><p class="muted">Le client indique son hôtel ou riad et la langue du guide.</p></div>
      <div class="card"><div class="ico">${ICON.lock}</div><h3>3. Confirmer</h3><p class="muted">Acompte en ligne ou paiement le jour J, selon votre choix.</p></div>
      <div class="card"><div class="ico">${ICON.clock}</div><h3>4. Rappel</h3><p class="muted">Confirmation et rappel la veille avec l’heure de prise en charge, par WhatsApp.</p></div></div></div></section>
    <section class="sec" id="integration"><div class="wrap split"><img src="${img('travel')}" alt="Carnet de voyage, appareil photo et jumelles" loading="lazy" width="1000" height="667"><div><span class="eyebrow">Vous avez déjà un site ?</span><h2>On ajoute la réservation à votre site actuel</h2>
      <p class="muted">Pas besoin de tout refaire : le module de réservation s’ajoute à votre site existant, sous forme de bouton « Réserver » ou de bloc intégré, avec vos excursions et vos prix.</p>
      <ul class="ticks"><li>Vos clients réservent sans quitter votre site</li><li>Planning des départs, guides et prises en charge dans un tableau de bord</li><li>Fin des réservations perdues dans WhatsApp et les e-mails</li></ul>
      <div class="cta" style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary" href="/demo/tours/widget" target="_blank" rel="noopener">Voir le module seul</a><a class="btn btn-ghost" href="/demo/tours/admin">Voir le tableau de bord</a></div></div></div></section>
    <section class="sec sec-alt"><div class="wrap" style="max-width:820px"><div class="sec-head center"><h2>Questions fréquentes</h2></div>${[
      ['Puis-je annuler ?', 'Annulation gratuite jusqu’à 24 h avant le départ pour les excursions à la journée.'],
      ['Où se fait la prise en charge ?', 'À votre hôtel ou riad. Pour la médina, au point de rendez-vous le plus proche.'],
      ['Les enfants paient-ils ?', `Les enfants de moins de 12 ans paient ${CFG.childPct} % du prix adulte.`],
      ['Une excursion privée est-elle possible ?', 'Oui, avec véhicule et guide rien que pour vous, en option lors de la réservation.'],
    ].map(([q, a]) => `<details class="q"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>`;
    $('#footer').innerHTML = `<div class="foot"><div class="wrap"><div><a class="brand" href="#" style="color:#fff"><span class="mark">GT</span>Greg Tours</a><p style="margin-top:12px">Excursions et circuits au Maroc.</p></div>
      <div><h4>Contact</h4><p>${CFG.phone} (WhatsApp)<br>Adresse à confirmer</p></div><div><h4>Liens</h4><p><a href="#excursions">Excursions</a><br><a href="/demo/tours/widget">Module de réservation</a><br><a href="/demo/tours/admin">Espace agence</a></p></div>
      <div class="legal">Maquette réalisée par <a href="https://mbndev.ma" target="_blank" rel="noopener">MBN DEV</a> pour Greg Tours — excursions, photos et prix donnés à titre d’exemple.</div></div></div>`;
    $('#mbarBtn').textContent = 'Réserver une excursion'; $('#mbarBtn').onclick = () => document.getElementById('excursions').scrollIntoView();
    $$('[data-my]').forEach((a) => a.onclick = (e) => { e.preventDefault(); my(); });
  }
  const rebind = () => $$('[data-t]').forEach((b) => b.onclick = () => book(b.dataset.t));
  rebind();

  function book(tid) {
    const t = tour(tid); const st = { month: today().slice(0, 7), sel: null };
    const sh = modal(`<h2 style="font-size:1.5rem">${esc(t.n)}</h2><p class="muted">${esc(t.dur)} · départ ${t.start} · ${t.cap} places par départ</p>
      <form class="form" id="bk"><div id="cal"></div><p class="muted" id="seats" style="font-size:.88rem;margin:0">Choisissez une date.</p>
      <div class="row2"><label class="f">Adultes<input class="field" type="number" name="adults" min="1" value="2"></label><label class="f">Enfants (−12 ans)<input class="field" type="number" name="kids" min="0" value="0"></label></div>
      <div class="row2"><label class="f">Langue du guide<select class="field" name="lang">${CFG.langs.map((l) => `<option>${l}</option>`).join('')}</select></label><label class="f">Hôtel / riad de prise en charge<input class="field" name="hotel" required placeholder="Riad …, médina"></label></div>
      <label class="check" style="color:inherit"><input type="checkbox" name="priv"> Excursion privée (véhicule et guide rien que pour vous, +${CFG.privatePct} %)</label>
      <div class="row2"><label class="f">Nom complet<input class="field" name="name" required autocomplete="name"></label><label class="f">WhatsApp<input class="field" type="tel" name="phone" required autocomplete="tel"></label></div>
      <div class="row2"><label class="f">E-mail<input class="field" type="email" name="email"></label><label class="f">Pays<input class="field" name="country"></label></div>
      <div class="f" style="font-size:.86rem;font-weight:600">Paiement<div class="opts" style="margin-top:6px"><label class="opt"><input type="radio" name="pay" value="dep" checked><span>Acompte ${CFG.deposit} % en ligne</span></label><label class="opt"><input type="radio" name="pay" value="cash"><span>Tout payer le jour J</span></label></div></div>
      <div class="estimate" id="sum"></div><label class="check"><input type="checkbox" required> J’accepte les conditions d’annulation (gratuite jusqu’à 24 h avant).</label><button class="btn btn-primary">Confirmer la réservation</button></form>`);
    const f = $('#bk', sh);
    calendar($('#cal', sh), st, (d) => { const l = left(t, d); return l <= 0 ? 'busy' : l <= 4 ? 'few' : ''; }, () => calc());
    const calc = () => {
      const a = Math.max(1, Number(f.adults.value) || 1), k = Math.max(0, Number(f.kids.value) || 0);
      const q = quote(t, a, k, f.priv.checked, price(t)); const l = st.sel ? left(t, st.sel) : null;
      $('#seats', sh).innerHTML = !st.sel ? 'Choisissez une date.' : l < a + k ? `<span style="color:#c0392b">Plus que ${Math.max(0, l)} place(s) le ${frDate(st.sel)}.</span>` : `<span style="color:#167a3e">✓ ${l} place(s) disponible(s) le ${frDate(st.sel, { weekday: 'long', day: 'numeric', month: 'long' })}</span>`;
      $('#sum', sh).innerHTML = `<small>${a} adulte(s)${k ? ` + ${k} enfant(s)` : ''}${f.priv.checked ? ' · privée' : ''}</small><div class="big">${mad(q.total)}</div><small>${f.pay.value === 'dep' ? `Acompte aujourd’hui : ${mad(q.deposit)} · reste ${mad(q.total - q.deposit)} le jour J` : 'Paiement complet le jour de l’excursion'}</small>`;
      return st.sel && l >= a + k ? { q, a, k } : null;
    };
    f.oninput = calc; f.onchange = calc; calc();
    f.onsubmit = (e) => {
      e.preventDefault(); const r = calc(); if (!r) { toast(st.sel ? 'Pas assez de places à cette date.' : 'Choisissez une date.'); return; }
      const b = { id: 'GT-' + uid().slice(0, 3), tour: tid, date: st.sel, name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(), country: f.country.value.trim(), adults: r.a, kids: r.k, priv: f.priv.checked, hotel: f.hotel.value.trim(), lang: f.lang.value, status: f.pay.value === 'dep' ? 'paid' : 'new', total: r.q.total, paid: f.pay.value === 'dep' ? r.q.deposit : 0, created: today(), note: '' };
      db.update((s) => s.bookings.unshift(b));
      modal(`<h2 style="font-size:1.5rem">Réservation ${b.status === 'paid' ? 'confirmée' : 'enregistrée'} ✓</h2><p>Merci ${esc(b.name)} ! Référence <b>${b.id}</b>.</p>
        <dl class="kv"><dt>Excursion</dt><dd>${esc(t.n)}</dd><dt>Date</dt><dd>${frDate(b.date, { weekday: 'long', day: 'numeric', month: 'long' })}</dd><dt>Prise en charge</dt><dd>${esc(b.hotel)} · vers ${t.start}</dd><dt>Total</dt><dd>${mad(b.total)}${b.paid ? ` · acompte ${mad(b.paid)} payé (démo)` : ''}</dd></dl>
        <p class="muted">Vous recevez la confirmation sur WhatsApp et un rappel la veille avec l’heure exacte de prise en charge.</p><button class="btn btn-primary" data-close>Parfait</button>`);
    };
  }

  function my() {
    const sh = modal(`<h2 style="font-size:1.5rem">Ma réservation</h2><form class="form" id="mf"><div class="row2"><label class="f">Référence<input class="field" name="ref" required placeholder="GT-XXX"></label><label class="f">WhatsApp<input class="field" type="tel" name="phone" required></label></div><button class="btn btn-primary">Afficher</button></form>
      <p class="muted" style="font-size:.82rem;margin-top:10px">Démo : GT-C3M avec +44 7911 123456</p><div id="mr"></div>`);
    $('#mf', sh).onsubmit = (e) => {
      e.preventDefault(); const dg = (x) => x.replace(/\D/g, '').slice(-8);
      const b = db.get().bookings.find((x) => x.id.toUpperCase() === e.target.ref.value.trim().toUpperCase() && dg(x.phone) === dg(e.target.phone.value));
      if (!b) { $('#mr', sh).innerHTML = '<p style="color:#c0392b">Aucune réservation trouvée.</p>'; return; }
      const t = tour(b.tour); const can = ['new', 'conf', 'paid'].includes(b.status) && K.diffDays(today(), b.date) >= 1;
      $('#mr', sh).innerHTML = `<div class="card" style="margin-top:14px"><span class="bdg ${STATUS[b.status][1]}">${STATUS[b.status][0]}</span><dl class="kv"><dt>Excursion</dt><dd>${esc(t.n)}</dd><dt>Date</dt><dd>${frDate(b.date)} · ${t.start}</dd><dt>Personnes</dt><dd>${b.adults} adulte(s)${b.kids ? ` + ${b.kids} enfant(s)` : ''}</dd><dt>Prise en charge</dt><dd>${esc(b.hotel)}</dd><dt>Total</dt><dd>${mad(b.total)} · payé ${mad(b.paid)}</dd></dl>${can ? '<button class="btn btn-ghost btn-sm" id="cx">Annuler gratuitement</button>' : ''}</div>`;
      const cx = $('#cx', sh); if (cx) cx.onclick = () => { db.update((s) => { s.bookings.find((x) => x.id === b.id).status = 'cancel'; }); toast('Réservation annulée'); close(); };
    };
  }
})();
