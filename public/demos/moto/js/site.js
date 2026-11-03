(() => {
  const { $, $$, esc, mad, uid, today, addDays, frDate, toast, modal, close, ICON } = window.K;
  const { CFG, STATUS, quote, freeUnits, db } = window.M;
  const S = { from: addDays(today(), 1), to: addDays(today(), 4), cat: 'all' };

  const scooterArt = (c) => `<svg viewBox="0 0 320 214" role="img" aria-label="Illustration scooter 125">
    <rect width="320" height="214" fill="#f3efe6"/><circle cx="252" cy="52" r="58" fill="#ffd9a0" opacity=".5"/><rect y="178" width="320" height="36" fill="#e7dfcf"/>
    <ellipse cx="160" cy="182" rx="118" ry="7" fill="#000" opacity=".12"/>
    <circle cx="84" cy="156" r="26" fill="#1d1d1d"/><circle cx="84" cy="156" r="11" fill="#c9c9c9"/>
    <circle cx="236" cy="156" r="26" fill="#1d1d1d"/><circle cx="236" cy="156" r="11" fill="#c9c9c9"/>
    <path d="M52 148c2-30 22-50 58-54l38-2c10 0 14 6 12 14l-6 26h44l18-58 18 4-20 70H62z" fill="${c}"/>
    <path d="M56 140c6-22 22-34 48-36" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M96 92c2-12 14-18 32-18h30c10 0 12 8 8 14l-4 6z" fill="#262626"/>
    <path d="M206 82l22 5" stroke="#262626" stroke-width="6" stroke-linecap="round"/>
    <path d="M222 60l8 26M216 58h26" stroke="#262626" stroke-width="6" stroke-linecap="round"/>
    <path d="M232 90l12 3-4 14-11-3z" fill="#fff6c2"/><circle cx="236" cy="156" r="30" fill="none" stroke="${c}" stroke-width="6" stroke-dasharray="60 200" transform="rotate(200 236 156)"/>
    <rect x="44" y="120" width="10" height="8" rx="2" fill="#d33"/></svg>`;

  const vImg = (v) => v.img ? `<img src="/demos/moto/img/${v.img}.webp" alt="${esc(v.name)}" loading="lazy" width="1000" height="667">` : scooterArt(v.color);

  function header() {
    $('#top').innerHTML = `<div class="wrap"><a class="brand" href="#"><span class="mark">TM</span>Tamouda<span style="color:var(--accent)">Mobility</span></a>
      <nav class="nav"><a href="#flotte">Flotte</a><a href="#comment">Comment ça marche</a><a href="#balades">Balades</a><a href="#conditions">Conditions</a><a href="#" data-my>Ma réservation</a></nav>
      <a class="btn btn-primary btn-sm" href="#flotte">Réserver</a></div>`;
  }

  function searchBox() {
    return `<form class="search" id="search"><label class="f">Départ<input class="field" type="date" name="from" value="${S.from}" min="${today()}" required></label>
      <label class="f">Retour<input class="field" type="date" name="to" value="${S.to}" min="${addDays(today(), 1)}" required></label>
      <label class="f">Type<select class="field" name="cat"><option value="all">Tous</option><option value="scooter">Scooters</option><option value="moto">Motos</option></select></label>
      <button class="btn btn-primary">Voir les disponibilités</button></form>`;
  }

  function fleetCards() {
    const s = db.get();
    const list = CFG.fleet.filter((v) => S.cat === 'all' || v.cat === S.cat);
    return list.map((v) => {
      const live = s.fleet.find((x) => x.id === v.id); const vv = { ...v, price: live.price };
      const free = freeUnits(s, v.id, S.from, S.to); const q = quote(vv, S.from, S.to);
      return `<article class="vcard${free ? '' : ' full'}"><div class="vimg">${vImg(v)}<span class="vcat">${v.cat === 'scooter' ? 'Scooter' : 'Moto'} · ${v.cc} cc</span></div>
        <div class="vbody"><h3>${esc(v.name)}</h3><p class="muted vfeat">${v.feats.map(esc).join(' · ')}</p>
        <div class="vprice"><div><b>${mad(vv.price)}</b><span>/ jour</span></div><div class="vtot">${q.days} j : <b>${mad(q.base - q.disc)}</b>${q.pct ? `<em>-${q.pct}%</em>` : ''}</div></div>
        <div class="vfoot"><span class="avail ${free ? (free === 1 ? 'few' : 'ok') : 'no'}">${free ? (free === 1 ? 'Dernier disponible' : `${free} disponibles`) : 'Complet sur ces dates'}</span>
        <button class="btn btn-primary btn-sm" data-book="${v.id}" ${free ? '' : 'disabled'}>Réserver</button></div></div></article>`;
    }).join('');
  }

  function page() {
    $('#app').innerHTML = `
    <section class="hero"><img src="/demos/moto/img/hero.webp" alt="Motard sur la route côtière au coucher du soleil" width="1800" height="1200" fetchpriority="high">
      <div class="wrap"><span class="eyebrow">Location scooter & moto · ${CFG.city}</span>
      <h1>Agadir, Taghazout, l’Atlas.<br>À votre rythme.</h1>
      <p class="lead">Scooters et motos livrés à votre hôtel, casque inclus. Réservez en 2 minutes, disponibilité confirmée en temps réel.</p>
      ${searchBox()}
      <div class="facts"><div><b>dès 200 MAD</b>par jour</div><div><b>Livraison</b>hôtel ou adresse</div><div><b>-20 %</b>à partir de 7 jours</div><div><b>${CFG.hours}</b>assistance WhatsApp</div></div></div></section>

    <section class="sec" id="flotte"><div class="wrap"><div class="sec-head"><span class="eyebrow">Notre flotte</span><h2>Choisissez votre monture</h2><p class="muted" id="range"></p></div>
      <div class="chips" id="cats">${[['all', 'Tous'], ['scooter', 'Scooters'], ['moto', 'Motos']].map(([k, l]) => `<button class="chip${S.cat === k ? ' on' : ''}" data-cat="${k}">${l}</button>`).join('')}</div>
      <div class="fleet" id="fleet"></div><p class="muted note">Photos d’illustration — remplacées par vos propres véhicules.</p></div></section>

    <section class="sec sec-alt" id="comment"><div class="wrap"><div class="sec-head center"><span class="eyebrow">Simple et rapide</span><h2>Comment ça marche</h2></div>
      <div class="grid g3">
        <div class="card"><div class="num">01</div><h3>Choisissez vos dates</h3><p class="muted">Les disponibilités sont à jour : ce que vous voyez est libre.</p></div>
        <div class="card"><div class="num">02</div><h3>Réservez en ligne</h3><p class="muted">Indiquez votre hôtel, vos options et votre permis. Confirmation sur WhatsApp.</p></div>
        <div class="card"><div class="num">03</div><h3>On vous livre</h3><p class="muted">Remise des clés et casques à votre hôtel ou à l’agence, à l’heure choisie.</p></div></div></div></section>

    <section class="sec"><div class="wrap split"><img src="/demos/moto/img/m1.webp" alt="Moto garée devant un mur" loading="lazy" width="1000" height="667">
      <div><span class="eyebrow">Inclus dans chaque location</span><h2>Partez l’esprit tranquille</h2>
      <div class="grid g2 incl">
        <div><div class="ico">${ICON.helmet}</div><h3>Casque homologué</h3><p class="muted">Un casque inclus, casque passager en option.</p></div>
        <div><div class="ico">${ICON.truck}</div><h3>Livraison à l’hôtel</h3><p class="muted">Gratuite à Agadir centre, Marina et Founty.</p></div>
        <div><div class="ico">${ICON.shield}</div><h3>Assurance</h3><p class="muted">Responsabilité civile incluse, franchise réduite en option.</p></div>
        <div><div class="ico">${ICON.clock}</div><h3>Assistance 7j/7</h3><p class="muted">Une panne ? On vous dépanne ou on échange le véhicule.</p></div></div></div></div></section>

    <section class="sec sec-alt" id="balades"><div class="wrap"><div class="sec-head"><span class="eyebrow">Idées de balades</span><h2>Au départ d’Agadir</h2></div>
      <div class="grid g4">${CFG.rides.map((r) => `<div class="card ride"><div class="ico">${ICON.pin}</div><h3>${esc(r.n)}</h3><p class="muted">${esc(r.d)}</p><div class="rmeta"><span>${r.km}</span><span>${r.t}</span></div></div>`).join('')}</div>
      <div class="card zones"><h3>Zones de livraison</h3><div class="ztable">${CFG.zones.map((z) => `<div><span>${esc(z.n)}</span><b>${z.fee ? '+' + mad(z.fee) : 'Gratuit'}</b></div>`).join('')}</div></div></div></section>

    <section class="sec" id="conditions"><div class="wrap split" style="align-items:start"><div><span class="eyebrow">Conditions</span><h2>Bon à savoir</h2>
      <ul class="ticks"><li>Pièce d’identité ou passeport + permis valide</li><li>Caution : ${mad(CFG.deposit.scooter)} (scooter) · ${mad(CFG.deposit.moto)} (moto), restituée au retour</li><li>Âge minimum : 21 ans (25 ans pour les sportives)</li><li>Kilométrage illimité</li><li>Annulation gratuite jusqu’à 24 h avant le départ</li></ul>
      <a class="btn btn-ghost" href="#" data-my>Retrouver ma réservation</a></div>
      <div>${[
        ['Quel permis faut-il ?', 'Scooter 125 : permis B depuis 3 ans ou A1. Motos : permis A. Le permis international est conseillé pour les visiteurs hors UE.'],
        ['Puis-je payer sur place ?', 'Oui : espèces ou carte à la remise des clés. Un acompte en ligne peut aussi être activé.'],
        ['Que se passe-t-il en cas de panne ?', 'Appelez-nous sur WhatsApp : nous intervenons à Agadir et environs et remplaçons le véhicule si besoin.'],
        ['Peut-on rouler jusqu’à Essaouira ou Marrakech ?', 'Oui avec les motos, sur demande. Indiquez votre itinéraire dans la réservation.'],
        ['Le carburant est-il inclus ?', 'Le véhicule est remis avec le plein et doit être rendu avec le même niveau.'],
      ].map(([q, a]) => `<details class="q"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></div></section>

    <section class="sec cta-band"><div class="wrap"><h2>Prêt à rouler ?</h2><p>Réservez en ligne ou écrivez-nous, on vous répond en quelques minutes.</p>
      <div class="cta"><a class="btn btn-primary" href="#flotte">Réserver maintenant</a><a class="btn btn-light" href="#" data-my>Ma réservation</a></div></div></section>`;

    $('#footer').innerHTML = `<div class="foot"><div class="wrap"><div><a class="brand" href="#" style="color:#fff"><span class="mark">TM</span>Tamouda Mobility</a><p style="margin-top:12px">Location de scooters et motos à Agadir. Livraison à votre hôtel.</p></div>
      <div><h4>Contact</h4><p>${CFG.phone} (WhatsApp)<br>${CFG.hours}<br>Agadir, Maroc</p></div>
      <div><h4>Liens</h4><p><a href="#flotte">Flotte</a><br><a href="#conditions">Conditions</a><br><a href="/demo/moto/admin">Espace gérant</a></p></div>
      <div class="legal">Maquette réalisée par <a href="https://mbndev.ma" target="_blank" rel="noopener">MBN DEV</a> pour Tamouda Mobility — prix, flotte et conditions donnés à titre d’exemple, à valider.</div></div></div>`;

    $('#mbarBtn').textContent = 'Réserver un scooter ou une moto';
    $('#mbarBtn').onclick = () => location.hash = 'flotte';
    drawFleet();
    bind();
  }

  function drawFleet() {
    $('#fleet').innerHTML = fleetCards();
    $('#range').textContent = `Disponibilités du ${frDate(S.from)} au ${frDate(S.to)} · ${Math.max(1, K.diffDays(S.from, S.to))} jour(s)`;
    $$('[data-book]').forEach((b) => b.onclick = () => book(b.dataset.book));
  }

  function bind() {
    $('#search').onsubmit = (e) => {
      e.preventDefault(); const f = e.target;
      if (f.to.value <= f.from.value) { toast('La date de retour doit être après le départ.'); return; }
      S.from = f.from.value; S.to = f.to.value; S.cat = f.cat.value;
      $$('#cats .chip').forEach((c) => c.classList.toggle('on', c.dataset.cat === S.cat));
      drawFleet(); document.getElementById('flotte').scrollIntoView();
    };
    $$('#cats .chip').forEach((c) => c.onclick = () => { S.cat = c.dataset.cat; $$('#cats .chip').forEach((x) => x.classList.toggle('on', x === c)); drawFleet(); });
    $$('[data-my]').forEach((a) => a.onclick = (e) => { e.preventDefault(); myBooking(); });
  }

  function book(vid) {
    const s = db.get(); const v0 = CFG.fleet.find((x) => x.id === vid); const v = { ...v0, price: s.fleet.find((x) => x.id === vid).price };
    const sh = modal(`<h2 style="font-size:1.6rem">${esc(v.name)}</h2><p class="muted">${v.cat === 'scooter' ? 'Scooter' : 'Moto'} ${v.cc} cc · ${esc(v.lic)}</p>
      <form class="form" id="bk">
        <div class="row2"><label class="f">Départ<input class="field" type="date" name="from" value="${S.from}" min="${today()}" required></label><label class="f">Retour<input class="field" type="date" name="to" value="${S.to}" min="${addDays(today(), 1)}" required></label></div>
        <div class="row2"><label class="f">Heure de remise<select class="field" name="time">${['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((h) => `<option${h === '10:00' ? ' selected' : ''}>${h}</option>`).join('')}</select></label>
        <label class="f">Remise des clés<select class="field" name="delivery"><option value="0">À l’agence</option><option value="1" selected>Livraison à mon hôtel / adresse</option></select></label></div>
        <div id="dl" class="row2"><label class="f">Zone<select class="field" name="zone">${CFG.zones.map((z, i) => `<option value="${i}">${esc(z.n)}${z.fee ? ` (+${z.fee} MAD)` : ''}</option>`).join('')}</select></label><label class="f">Hôtel / adresse<input class="field" name="hotel" placeholder="Nom de l’hôtel, n° de chambre"></label></div>
        <div class="f" style="font-size:.86rem;font-weight:600">Options<div class="opts" style="margin-top:6px">${CFG.extras.map((e) => `<label class="opt"><input type="checkbox" name="ex" value="${e.id}"><span>${esc(e.n)} · ${e.p} MAD/${e.per}</span></label>`).join('')}</div></div>
        <div class="row2"><label class="f">Nom complet<input class="field" name="name" required autocomplete="name"></label><label class="f">WhatsApp<input class="field" name="phone" type="tel" required placeholder="+33 6 …" autocomplete="tel"></label></div>
        <div class="row2"><label class="f">Pays<input class="field" name="country" placeholder="France"></label><label class="f">N° de permis<input class="field" name="lic" placeholder="Pour préparer le contrat"></label></div>
        <label class="f">Message (facultatif)<textarea class="field" name="note" placeholder="Itinéraire, taille de casque…"></textarea></label>
        <div class="estimate" id="est"></div>
        <label class="check"><input type="checkbox" required> J’ai lu les conditions (permis, caution, âge minimum) et j’accepte d’être contacté sur WhatsApp.</label>
        <button class="btn btn-primary">Envoyer la réservation</button>
      </form>`);
    const f = $('#bk', sh);
    const calc = () => {
      const ok = f.to.value > f.from.value;
      const free = ok ? freeUnits(db.get(), vid, f.from.value, f.to.value) : 0;
      $('#dl', sh).style.display = f.delivery.value === '1' ? '' : 'none';
      if (!ok) { $('#est', sh).innerHTML = 'Choisissez une date de retour après le départ.'; return null; }
      const q = quote(v, f.from.value, f.to.value, { extras: $$('input[name=ex]:checked', f).map((x) => x.value), delivery: f.delivery.value === '1', zone: Number(f.zone.value) });
      $('#est', sh).innerHTML = `<small>${q.days} jour(s) · ${frDate(f.from.value)} → ${frDate(f.to.value)}</small>
        <div class="big">${mad(q.total)}</div>
        <small>Location ${mad(q.base)}${q.disc ? ` · remise -${q.pct}% (−${mad(q.disc)})` : ''}${q.ex ? ` · options ${mad(q.ex)}` : ''}${q.fee ? ` · livraison ${mad(q.fee)}` : ''}<br>Caution à la remise : ${mad(q.deposit)} · paiement sur place</small>
        ${free ? '' : '<p style="color:#ff9a8a;margin:10px 0 0">Ce véhicule n’est plus disponible sur ces dates.</p>'}`;
      return free ? q : null;
    };
    f.oninput = calc; calc();
    f.onsubmit = (e) => {
      e.preventDefault(); const q = calc(); if (!q) { toast('Choisissez d’autres dates.'); return; }
      const b = { id: 'TM-' + uid(), vid, from: f.from.value, to: f.to.value, time: f.time.value, name: f.name.value.trim(), phone: f.phone.value.trim(), country: f.country.value.trim(), lic: f.lic.value.trim(), status: 'new', delivery: f.delivery.value === '1', zone: Number(f.zone.value), hotel: f.hotel.value.trim(), extras: $$('input[name=ex]:checked', f).map((x) => x.value), total: q.total, paid: 0, created: today(), note: f.note.value.trim() };
      db.update((s) => { s.bookings.unshift(b); s.log.unshift({ at: new Date().toISOString(), to: b.phone, msg: `Bonjour ${b.name}, votre demande ${b.id} (${v.name}, ${frDate(b.from)} → ${frDate(b.to)}) est bien reçue. Nous la confirmons sur WhatsApp très vite. Tamouda Mobility` }); });
      modal(`<h2 style="font-size:1.6rem">Demande envoyée ✓</h2><p>Merci ${esc(b.name)} ! Votre référence : <b>${b.id}</b></p>
        <dl class="kv"><dt>Véhicule</dt><dd>${esc(v.name)}</dd><dt>Dates</dt><dd>${frDate(b.from)} → ${frDate(b.to)} à ${b.time}</dd><dt>Remise</dt><dd>${b.delivery ? esc(CFG.zones[b.zone].n + (b.hotel ? ' — ' + b.hotel : '')) : 'À l’agence'}</dd><dt>Total</dt><dd><b>${mad(b.total)}</b></dd></dl>
        <p class="muted">Vous recevez la confirmation sur WhatsApp (${esc(b.phone)}). Conservez la référence pour retrouver votre réservation.</p>
        <button class="btn btn-primary" data-close>Parfait</button>`);
      drawFleet();
    };
  }

  function myBooking() {
    const sh = modal(`<h2 style="font-size:1.6rem">Ma réservation</h2><p class="muted">Entrez votre référence et votre numéro WhatsApp.</p>
      <form class="form" id="mf"><label class="f">Référence<input class="field" name="ref" placeholder="TM-XXXXX" required></label><label class="f">WhatsApp<input class="field" name="phone" type="tel" required></label><button class="btn btn-primary">Afficher</button></form>
      <p class="muted" style="font-size:.82rem;margin-top:12px">Démo : essayez TM-5HJ3 avec +212 670 11 22 33</p><div id="mr"></div>`);
    $('#mf', sh).onsubmit = (e) => {
      e.preventDefault(); const digits = (x) => x.replace(/\D/g, '').slice(-8);
      const b = db.get().bookings.find((x) => x.id.toUpperCase() === e.target.ref.value.trim().toUpperCase() && digits(x.phone) === digits(e.target.phone.value));
      if (!b) { $('#mr', sh).innerHTML = '<p style="color:#c0392b">Aucune réservation trouvée.</p>'; return; }
      const v = CFG.fleet.find((x) => x.id === b.vid); const [lab, cls] = STATUS[b.status];
      const canCancel = ['new', 'confirmed'].includes(b.status) && K.diffDays(today(), b.from) >= 1;
      $('#mr', sh).innerHTML = `<div class="card" style="margin-top:16px"><span class="bdg ${cls}">${lab}</span><dl class="kv"><dt>Véhicule</dt><dd>${esc(v.name)}</dd><dt>Dates</dt><dd>${frDate(b.from)} → ${frDate(b.to)} à ${b.time}</dd><dt>Remise</dt><dd>${b.delivery ? esc(CFG.zones[b.zone].n + (b.hotel ? ' — ' + b.hotel : '')) : 'À l’agence'}</dd><dt>Total</dt><dd>${mad(b.total)}</dd></dl>
        ${canCancel ? '<button class="btn btn-ghost btn-sm" id="cx">Annuler gratuitement</button>' : ''}</div>`;
      const cx = $('#cx', sh); if (cx) cx.onclick = () => { db.update((s) => { s.bookings.find((x) => x.id === b.id).status = 'cancelled'; }); toast('Réservation annulée.'); close(); drawFleet(); };
    };
  }

  header(); page();
})();
