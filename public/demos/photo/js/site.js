(() => {
  const { $, $$, esc, mad, uid, today, frDate, toast, modal, lightbox, calendar, ICON } = window.K;
  const { CFG, pack, db } = window.P;
  const img = (n) => `/demos/photo/img/${n}.webp`;
  const busyDays = () => { const m = {}; db.get().bookings.filter((b) => ['hold', 'conf'].includes(b.status)).forEach((b) => { m[b.date] = (m[b.date] || 0) + 1; }); return m; };

  $('#top').innerHTML = `<div class="wrap"><a class="brand" href="#"><span class="mark mv">◎</span>Magic<span class="gold">Vision</span></a>
    <nav class="nav"><a href="#services">Services</a><a href="#portfolio">Portfolio</a><a href="#formules">Formules</a><a href="#dates">Disponibilités</a><a href="#" data-gal>Espace client</a></nav>
    <a class="btn btn-primary btn-sm" href="#dates">Réserver ma date</a></div>`;

  $('#app').innerHTML = `
  <section class="hero"><img src="${img('hero')}" alt="Mariée tenant son bouquet dans la lumière du soir" width="1800" height="1200" fetchpriority="high">
    <div class="wrap"><span class="eyebrow">Photographie & vidéo · ${CFG.city} et tout le Rif</span>
    <h1>Vos plus beaux moments,<br><em>racontés en images.</em></h1>
    <p class="lead">Mariages, fiançailles, henné, événements et entreprises. Un regard discret, des images qui durent, un film qui vous fera revivre la journée.</p>
    <div class="cta"><a class="btn btn-primary" href="#dates">Vérifier ma date</a><a class="btn btn-ghost light" href="#portfolio">Voir le portfolio</a></div></div></section>

  <section class="sec" id="services"><div class="wrap"><div class="sec-head center"><span class="eyebrow">Services</span><h2>Photo, vidéo, drone</h2><p class="muted">Une équipe pour tous vos événements, à Nador, Driouch, Al Hoceima et partout au Maroc.</p></div>
    <div class="grid g4">
      <div class="card"><div class="ico">${ICON.heart}</div><h3>Mariages</h3><p class="muted">Préparatifs, cérémonie, soirée : chaque moment, sans mise en scène forcée.</p></div>
      <div class="card"><div class="ico">${ICON.camera}</div><h3>Événements</h3><p class="muted">Fiançailles, henné, aqiqa, anniversaires — reportage complet.</p></div>
      <div class="card"><div class="ico">${ICON.film}</div><h3>Films</h3><p class="muted">Film résumé de 4 à 6 minutes, film complet et teaser pour les réseaux.</p></div>
      <div class="card"><div class="ico">${ICON.drone}</div><h3>Drone & entreprise</h3><p class="muted">Vues aériennes, photos produits, portraits d’équipe, vidéos promo.</p></div></div></div></section>

  <section class="sec sec-alt" id="portfolio"><div class="wrap"><div class="sec-head"><span class="eyebrow">Portfolio</span><h2>Quelques images</h2></div>
    <div class="chips" id="pf">${[['all', 'Tout'], ['mariage', 'Mariages'], ['evenement', 'Événements'], ['details', 'Détails'], ['exterieur', 'Extérieur']].map(([k, l], i) => `<button class="chip${i ? '' : ' on'}" data-c="${k}">${l}</button>`).join('')}</div>
    <div class="masonry" id="gal"></div><p class="muted" style="font-size:.82rem;margin-top:14px">Photos d’illustration — remplacées par vos propres reportages.</p></div></section>

  <section class="sec" id="formules"><div class="wrap"><div class="sec-head center"><span class="eyebrow">Formules</span><h2>Choisissez votre formule</h2><p class="muted">Acompte de ${CFG.deposit} % pour bloquer la date, solde le jour de l’événement.</p></div>
    <div class="grid g3">${CFG.packs.map((p) => `<div class="card price${p.feat ? ' feat' : ''}">${p.feat ? '<span class="tag" style="align-self:flex-start">Recommandé</span>' : ''}<h3 style="margin-top:10px">${esc(p.n)}</h3><p class="muted" style="margin:0">${esc(p.d)}</p><div class="amt">${mad(p.p)}</div><span class="muted" style="font-size:.82rem">à partir de</span>
      <ul class="ticks">${p.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul><button class="btn ${p.feat ? 'btn-primary' : 'btn-ghost'}" data-pack="${p.id}">Réserver cette formule</button></div>`).join('')}</div>
    <p class="muted" style="text-align:center;font-size:.82rem;margin-top:16px">Prix d’exemple — à remplacer par vos tarifs. Déplacement hors province de Nador sur devis.</p></div></section>

  <section class="sec sec-alt" id="dates"><div class="wrap split" style="align-items:start"><div><span class="eyebrow">Disponibilités</span><h2>Votre date est-elle libre ?</h2>
    <p class="muted">Les dates barrées sont déjà réservées. Choisissez la vôtre : nous la bloquons 48 h le temps de confirmer ensemble.</p>
    <ul class="ticks"><li>Réponse sur WhatsApp dans la journée</li><li>Option gratuite pendant 48 h</li><li>Date confirmée à réception de l’acompte</li></ul></div>
    <div class="card"><div id="cal"></div><div class="legend"><span>● point : 1 événement déjà prévu</span><span>barré : complet</span></div><button class="btn btn-primary" id="pick" style="width:100%;margin-top:16px" disabled>Choisissez une date</button></div></div></section>

  <section class="sec"><div class="wrap split"><img src="${img('p2')}" alt="Couple de mariés en séance photo" loading="lazy" width="1000" height="667">
    <div><span class="eyebrow">Après l’événement</span><h2>Votre galerie privée</h2><p class="muted">Vos photos sont livrées dans un espace protégé par code. Vous les regardez en famille, choisissez vos préférées pour l’album d’un simple cœur, et les partagez avec vos proches.</p>
    <ul class="ticks"><li>Accès avec votre code + numéro de téléphone</li><li>Sélection des photos de l’album en ligne</li><li>Téléchargement en haute définition</li></ul><button class="btn btn-primary" data-gal>Ouvrir mon espace client</button></div></div></section>

  <section class="sec sec-alt" id="faq"><div class="wrap" style="max-width:820px"><div class="sec-head center"><span class="eyebrow">Questions</span><h2>Questions fréquentes</h2></div>
    ${[
      ['Combien de temps pour recevoir les photos ?', 'Une sélection de 30 photos sous 7 jours, la galerie complète sous 3 semaines, le film sous 6 semaines.'],
      ['Vous déplacez-vous hors de Nador ?', 'Oui, dans tout le Maroc et à l’étranger. Les frais de déplacement sont indiqués sur le devis.'],
      ['Peut-on payer l’acompte à distance ?', 'Oui : virement, Cash Plus / Wafacash, ou paiement en ligne. Idéal pour les familles de la diaspora.'],
      ['Faites-vous aussi des séances couple avant le mariage ?', 'Oui, en extérieur (corniche, Mar Chica, Gourougou) ou en studio, sur demande.'],
    ].map(([q, a]) => `<details class="q"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>`;

  $('#footer').innerHTML = `<div class="foot"><div class="wrap"><div><a class="brand" href="#" style="color:#fff"><span class="mark mv">◎</span>Magic Vision</a><p style="margin-top:12px">Photographe & vidéaste à Nador.</p></div>
    <div><h4>Contact</h4><p>${CFG.phone} (WhatsApp)<br>${CFG.hours}<br>Nador, Maroc</p></div>
    <div><h4>Liens</h4><p><a href="#portfolio">Portfolio</a><br><a href="#formules">Formules</a><br><a href="/demo/photo/admin">Espace studio</a></p></div>
    <div class="legal">Maquette réalisée par <a href="https://mbndev.ma" target="_blank" rel="noopener">MBN DEV</a> pour Magic Vision — photos, formules et prix donnés à titre d’exemple.</div></div></div>`;

  function gal(c) {
    $('#gal').innerHTML = CFG.portfolio.filter((g) => c === 'all' || g.c === c).map((g) => `<figure data-src="${img(g.img)}" data-cap="${esc(g.t)}"><img src="${img(g.img)}" alt="${esc(g.t)}" loading="lazy"><figcaption>${esc(g.t)}</figcaption></figure>`).join('');
    $$('#gal figure').forEach((f) => f.onclick = () => lightbox(f.dataset.src, f.dataset.cap));
  }
  gal('all');
  $$('#pf .chip').forEach((c) => c.onclick = () => { $$('#pf .chip').forEach((x) => x.classList.toggle('on', x === c)); gal(c.dataset.c); });

  const st = { month: today().slice(0, 7), sel: null };
  const dayCls = (d) => { const n = busyDays()[d] || 0; return n >= 2 ? 'busy' : n ? 'few' : ''; };
  const redraw = calendar($('#cal'), st, dayCls, (d) => { const b = $('#pick'); b.disabled = false; b.textContent = `Réserver le ${frDate(d, { weekday: 'long', day: 'numeric', month: 'long' })}`; });
  $('#pick').onclick = () => book(null, st.sel);
  $$('[data-pack]').forEach((b) => b.onclick = () => book(b.dataset.pack, st.sel));
  $$('[data-gal]').forEach((a) => a.onclick = (e) => { e.preventDefault(); gallery(); });
  $('#mbarBtn').textContent = 'Vérifier ma date';
  $('#mbarBtn').onclick = () => document.getElementById('dates').scrollIntoView();

  function book(packId, date) {
    const sh = modal(`<h2 style="font-size:1.6rem">Réserver une date</h2><p class="muted">Option gratuite 48 h — nous vous confirmons sur WhatsApp.</p>
      <form class="form" id="bf"><div class="row2"><label class="f">Date de l’événement<input class="field" type="date" name="date" min="${today()}" value="${date || ''}" required></label><label class="f">Type<select class="field" name="type">${CFG.types.map((t) => `<option>${t}</option>`).join('')}</select></label></div>
      <div class="f" style="font-size:.86rem;font-weight:600">Formule<div class="opts" style="margin-top:6px">${CFG.packs.map((p) => `<label class="opt"><input type="radio" name="pack" value="${p.id}" ${(packId || 'sig') === p.id ? 'checked' : ''}><span>${esc(p.n)} · ${mad(p.p)}</span></label>`).join('')}</div></div>
      <div class="row2"><label class="f">Lieu (salle, ville)<input class="field" name="place" required placeholder="Salle des fêtes, Nador"></label><label class="f">Nombre d’invités<input class="field" type="number" name="guests" min="0" placeholder="200"></label></div>
      <div class="row2"><label class="f">Vos prénoms<input class="field" name="name" required placeholder="Salma & Yassine"></label><label class="f">WhatsApp<input class="field" name="phone" type="tel" required></label></div>
      <label class="f">Message<textarea class="field" name="note" placeholder="Programme de la journée, demandes particulières…"></textarea></label>
      <p class="muted" id="av" style="font-size:.88rem;margin:0"></p><div class="estimate" id="sum"></div>
      <label class="check"><input type="checkbox" required> J’accepte d’être contacté(e) sur WhatsApp pour finaliser la réservation.</label><button class="btn btn-primary">Bloquer cette date</button></form>`);
    const f = $('#bf', sh);
    const calc = () => { const p = pack(f.pack.value); const n = f.date.value ? busyDays()[f.date.value] || 0 : 0;
      $('#av', sh).innerHTML = !f.date.value ? '' : n >= 2 ? '<span style="color:#c0392b">Cette date est complète — choisissez-en une autre.</span>' : n ? '<span style="color:#9a6700">Un événement est déjà prévu ce jour-là : nous vérifions la deuxième équipe.</span>' : '<span style="color:#167a3e">✓ Date libre</span>';
      $('#sum', sh).innerHTML = `<small>${esc(p.n)} · ${esc(p.d)}</small><div class="big">${mad(p.p)}</div><small>Acompte ${CFG.deposit} % pour confirmer : ${mad(p.p * CFG.deposit / 100)} · solde le jour J</small>`; return n < 2; };
    f.oninput = calc; calc();
    f.onsubmit = (e) => {
      e.preventDefault(); if (!calc()) { toast('Date complète.'); return; }
      const b = { id: 'MV-' + uid().slice(0, 4), date: f.date.value, name: f.name.value.trim(), phone: f.phone.value.trim(), type: f.type.value, pack: f.pack.value, place: f.place.value.trim(), guests: Number(f.guests.value) || 0, status: 'hold', price: pack(f.pack.value).p, paid: 0, note: f.note.value.trim(), created: today() };
      db.update((s) => s.bookings.push(b)); redraw();
      modal(`<h2 style="font-size:1.6rem">Date bloquée 48 h ✓</h2><p>Merci ${esc(b.name)} ! Le <b>${frDate(b.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</b> est en option pour vous.</p>
        <dl class="kv"><dt>Référence</dt><dd>${b.id}</dd><dt>Formule</dt><dd>${esc(pack(b.pack).n)} · ${mad(b.price)}</dd><dt>Acompte</dt><dd>${mad(b.price * CFG.deposit / 100)}</dd></dl><p class="muted">Nous vous écrivons sur WhatsApp pour confirmer le programme et le paiement de l’acompte.</p><button class="btn btn-primary" data-close>Parfait</button>`);
    };
  }

  function gallery() {
    const sh = modal(`<h2 style="font-size:1.6rem">Espace client</h2><p class="muted">Entrez le code reçu après votre événement.</p>
      <form class="form" id="gf"><div class="row2"><label class="f">Code galerie<input class="field" name="code" placeholder="MV-XXXX" required></label><label class="f">Téléphone<input class="field" name="phone" type="tel" required></label></div><button class="btn btn-primary">Ouvrir ma galerie</button></form>
      <p class="muted" style="font-size:.82rem;margin-top:12px">Démo : MV-2611 avec +33 6 22 41 87 90</p>`);
    $('#gf', sh).onsubmit = (e) => {
      e.preventDefault(); const dg = (x) => x.replace(/\D/g, '').slice(-8);
      const g = db.get().galleries.find((x) => x.code.toUpperCase() === e.target.code.value.trim().toUpperCase() && dg(x.phone) === dg(e.target.phone.value));
      if (!g) { toast('Code ou téléphone incorrect.'); return; }
      open(g.code);
    };
    function open(code) {
      const g = db.get().galleries.find((x) => x.code === code);
      const s2 = modal(`<h2 style="font-size:1.6rem">${esc(g.name)}</h2><p class="muted">${g.imgs.length} photos · touchez ♥ pour choisir vos photos d’album (${g.fav.length}/${g.max})</p>
        <div class="cgal">${g.imgs.map((i) => `<figure><img src="${img(i)}" alt="" loading="lazy" data-src="${img(i)}"><button class="fav${g.fav.includes(i) ? ' on' : ''}" data-f="${i}" aria-label="Ajouter à l’album">♥</button></figure>`).join('')}</div>
        <div class="toolbar" style="margin-top:16px"><button class="btn btn-primary" id="send">Envoyer ma sélection (${g.fav.length})</button><button class="btn btn-ghost" id="dl">Télécharger tout (HD)</button></div>`, { wide: true });
      $$('[data-f]', s2).forEach((b) => b.onclick = () => { db.update((s) => { const gg = s.galleries.find((x) => x.code === code); const i = gg.fav.indexOf(b.dataset.f); if (i >= 0) gg.fav.splice(i, 1); else if (gg.fav.length < gg.max) gg.fav.push(b.dataset.f); }); open(code); });
      $('#send', s2).onclick = () => toast('Sélection envoyée au studio ✓');
      $('#dl', s2).onclick = () => toast('Démo : sur le vrai site, le téléchargement HD démarre ici.');
    }
  }
})();
