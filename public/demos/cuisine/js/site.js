(() => {
  const { $, $$, esc, mad, uid, today, addDays, frDate, toast, modal, lightbox, calendar, ICON } = window.K;
  const { CFG, estimate, db } = window.C;
  const O = { shape: 'L', m: 4, front: 'lac', top: 'quartz', extras: ['led'] };
  const img = (n) => `/demos/cuisine/img/${n}.webp`;

  $('#top').innerHTML = `<div class="wrap"><a class="brand" href="#"><span class="mark">EPS</span>EPS Design <span class="thin">Cuisine</span></a>
    <nav class="nav"><a href="#realisations">Réalisations</a><a href="#methode">Notre méthode</a><a href="#materiaux">Matériaux</a><a href="#estimer">Estimation</a><a href="#faq">FAQ</a></nav>
    <a class="btn btn-primary btn-sm" href="#estimer">Devis gratuit</a></div>`;

  $('#app').innerHTML = `
  <section class="hero"><img src="${img('hero')}" alt="Cuisine sur mesure gris vert avec étagères ouvertes" width="1800" height="1200" fetchpriority="high">
    <div class="wrap"><span class="eyebrow">Cuisines sur mesure · conception, fabrication, pose</span>
    <h1>La cuisine qui ressemble<br>à votre façon de vivre.</h1>
    <p class="lead">Du métré à la pose, une seule équipe. Plan 3D avant fabrication, matériaux choisis avec vous, chantier propre et délais tenus.</p>
    <div class="cta"><a class="btn btn-primary" href="#estimer">Estimer ma cuisine en 1 minute</a><a class="btn btn-light" href="#realisations">Voir nos réalisations</a></div>
    <div class="facts"><div><b>Métré gratuit</b>à domicile</div><div><b>Plan 3D</b>avant de signer</div><div><b>Fabrication</b>dans notre atelier</div><div><b>Pose & SAV</b>par nos équipes</div></div></div></section>

  <section class="sec" id="realisations"><div class="wrap"><div class="sec-head"><span class="eyebrow">Réalisations</span><h2>Chaque cuisine est unique</h2><p class="muted">Quelques styles que nous réalisons. Touchez une photo pour l’agrandir.</p></div>
    <div class="chips" id="gf">${[['all', 'Toutes'], ['moderne', 'Moderne'], ['classique', 'Classique'], ['ilot', 'Avec îlot'], ['petit', 'Petits espaces']].map(([k, l], i) => `<button class="chip${i ? '' : ' on'}" data-g="${k}">${l}</button>`).join('')}</div>
    <div class="gal" id="gal"></div><p class="muted" style="font-size:.82rem;margin-top:14px">Photos d’illustration — remplacées par vos propres chantiers.</p></div></section>

  <section class="sec sec-alt" id="methode"><div class="wrap"><div class="sec-head center"><span class="eyebrow">Notre méthode</span><h2>4 étapes, zéro mauvaise surprise</h2></div>
    <div class="grid g4">
      <div class="card"><div class="ico">${ICON.ruler}</div><div class="num">01</div><h3>Visite & métré</h3><p class="muted">Un concepteur vient chez vous, prend les mesures exactes et écoute vos habitudes.</p></div>
      <div class="card"><div class="ico">${ICON.cube}</div><div class="num">02</div><h3>Plan 3D & devis</h3><p class="muted">Vous voyez votre cuisine en 3D, avec un devis détaillé poste par poste.</p></div>
      <div class="card"><div class="ico">${ICON.saw}</div><div class="num">03</div><h3>Fabrication</h3><p class="muted">Découpe et assemblage dans notre atelier, contrôle qualité avant livraison.</p></div>
      <div class="card"><div class="ico">${ICON.key}</div><div class="num">04</div><h3>Pose & SAV</h3><p class="muted">Pose par nos équipes, réglages finaux, et un interlocuteur après la livraison.</p></div></div></div></section>

  <section class="sec" id="materiaux"><div class="wrap split"><img src="${img('k8')}" alt="Plan de travail en quartz et robinetterie dorée" loading="lazy" width="1000" height="667">
    <div><span class="eyebrow">Matériaux</span><h2>Des finitions qui durent</h2>
    <div class="mat"><h3>Façades</h3>${CFG.fronts.map((f) => `<div><b>${esc(f.n)}</b><span class="muted">${esc(f.d)}</span></div>`).join('')}</div>
    <div class="mat"><h3>Plans de travail</h3><div><b>Stratifié</b><span class="muted">Économique, nombreux décors</span></div><div><b>Quartz</b><span class="muted">Non poreux, très résistant aux taches</span></div><div><b>Marbre & granit</b><span class="muted">Pièce unique, aspect noble</span></div></div>
    <ul class="ticks"><li>Charnières et coulisses à fermeture amortie</li><li>Caissons hydrofuges sous évier</li><li>Électroménager encastrable sur demande</li></ul></div></div></section>

  <section class="sec sec-dark" id="estimer"><div class="wrap"><div class="sec-head"><span class="eyebrow">Estimation gratuite</span><h2>Combien coûterait votre cuisine ?</h2><p>Une fourchette indicative en quelques clics. Le prix exact est fixé après le métré.</p></div>
    <div class="est-grid"><form class="form" id="cfg">
      <div class="f"><b>1. Forme</b><div class="shapes">${CFG.shapes.map((s) => `<label class="opt shape"><input type="radio" name="shape" value="${s.id}" ${O.shape === s.id ? 'checked' : ''}><span><svg viewBox="0 0 60 60" aria-hidden="true">${s.svg}</svg>${esc(s.n)}</span></label>`).join('')}</div></div>
      <label class="f"><b>2. Longueur de meubles : <output id="mv">${O.m} m</output></b><input type="range" name="m" min="2" max="12" step="0.5" value="${O.m}"><span class="muted" style="font-weight:400">Mètres linéaires de meubles bas (ajoutez les côtés d’un L ou d’un U).</span></label>
      <div class="f"><b>3. Façades</b><div class="opts">${CFG.fronts.map((f) => `<label class="opt"><input type="radio" name="front" value="${f.id}" ${O.front === f.id ? 'checked' : ''}><span>${esc(f.n)}</span></label>`).join('')}</div></div>
      <div class="f"><b>4. Plan de travail</b><div class="opts">${CFG.tops.map((f) => `<label class="opt"><input type="radio" name="top" value="${f.id}" ${O.top === f.id ? 'checked' : ''}><span>${esc(f.n)}</span></label>`).join('')}</div></div>
      <div class="f"><b>5. Options</b><div class="opts">${CFG.extras.map((f) => `<label class="opt"><input type="checkbox" name="ex" value="${f.id}" ${O.extras.includes(f.id) ? 'checked' : ''}><span>${esc(f.n)}</span></label>`).join('')}</div></div>
    </form>
    <aside class="est-side"><div class="estimate" id="est"></div><button class="btn btn-primary" id="go" style="width:100%;margin-top:14px">Recevoir mon devis + métré gratuit</button><p class="muted" style="font-size:.82rem;margin-top:10px">Prix d’exemple, à adapter à vos tarifs réels depuis l’espace gérant.</p></aside></div></div></section>

  <section class="sec" id="faq"><div class="wrap split" style="align-items:start"><div><span class="eyebrow">Questions fréquentes</span><h2>Bon à savoir</h2><p class="muted">Une autre question ? Écrivez-nous sur WhatsApp, nous répondons rapidement.</p><a class="btn btn-ghost" href="#estimer">Demander un métré</a></div>
    <div>${[
      ['Le métré est-il vraiment gratuit ?', 'Oui. Le concepteur se déplace, prend les mesures et vous conseille, sans engagement.'],
      ['Quel est le délai de fabrication ?', 'En général 3 à 5 semaines après validation du plan 3D, selon les matériaux choisis.'],
      ['Comment se passe le paiement ?', 'Un acompte à la signature, le solde à la pose. Le détail figure sur le devis.'],
      ['Vous occupez-vous de la plomberie et de l’électricité ?', 'Nous coordonnons les raccordements nécessaires à la cuisine avec nos partenaires.'],
      ['Puis-je garder mon électroménager ?', 'Bien sûr, il suffit de nous donner les dimensions lors du métré.'],
    ].map(([q, a]) => `<details class="q"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></div></section>`;

  $('#footer').innerHTML = `<div class="foot"><div class="wrap"><div><a class="brand" href="#" style="color:#fff"><span class="mark">EPS</span>EPS Design Cuisine</a><p style="margin-top:12px">Conception, fabrication et pose de cuisines sur mesure.</p></div>
    <div><h4>Contact</h4><p>Showroom : adresse à confirmer<br>${CFG.hours}<br>WhatsApp : à confirmer</p></div>
    <div><h4>Liens</h4><p><a href="#realisations">Réalisations</a><br><a href="#estimer">Estimation</a><br><a href="/demo/cuisine/admin">Espace gérant</a></p></div>
    <div class="legal">Maquette réalisée par <a href="https://mbndev.ma" target="_blank" rel="noopener">MBN DEV</a> pour EPS Design Cuisine — photos, prix et coordonnées donnés à titre d’exemple.</div></div></div>`;

  function gal(cat) {
    $('#gal').innerHTML = CFG.gallery.filter((g) => cat === 'all' || g.c === cat).map((g) => `<figure data-src="${img(g.img)}" data-cap="${esc(g.t)} — ${esc(g.s)}"><img src="${img(g.img)}" alt="${esc(g.t)}" loading="lazy" width="1000" height="667"><figcaption><b>${esc(g.t)}</b>${esc(g.s)}</figcaption></figure>`).join('');
    $$('#gal figure').forEach((f) => f.onclick = () => lightbox(f.dataset.src, f.dataset.cap));
  }
  gal('all');
  $$('#gf .chip').forEach((c) => c.onclick = () => { $$('#gf .chip').forEach((x) => x.classList.toggle('on', x === c)); gal(c.dataset.g); });

  const read = () => { const f = $('#cfg'); O.shape = f.shape.value; O.m = Number(f.m.value); O.front = f.front.value; O.top = f.top.value; O.extras = $$('input[name=ex]:checked', f).map((x) => x.value); };
  const draw = () => {
    read(); const e = estimate(O, db.get().prices); $('#mv').textContent = `${O.m} m`;
    const sh = CFG.shapes.find((s) => s.id === O.shape);
    $('#est').innerHTML = `<small>Cuisine ${esc(sh.n.toLowerCase())} · ${O.m} m · ${esc(CFG.fronts.find((x) => x.id === O.front).n)}</small><div class="big">${e.lo.toLocaleString('fr-FR')} – ${mad(e.hi)}</div>
      <div class="lines"><div><span>Meubles & façades</span><b>${mad(e.furn)}</b></div><div><span>Plan de travail</span><b>${mad(e.top)}</b></div><div><span>Options</span><b>${mad(e.ex)}</b></div><div><span>Livraison & pose</span><b>${mad(e.pose)}</b></div></div>`;
  };
  $('#cfg').oninput = draw; draw();
  $('#go').onclick = request;

  $('#mbarBtn').textContent = 'Estimer ma cuisine';
  $('#mbarBtn').onclick = () => document.getElementById('estimer').scrollIntoView();

  function request() {
    read(); const e = estimate(O, db.get().prices); const st = { month: today().slice(0, 7), sel: null }; let slot = null;
    const taken = (d) => db.get().leads.filter((l) => l.visit === d).map((l) => l.slot);
    const sh = modal(`<h2 style="font-size:1.5rem">Devis gratuit & métré à domicile</h2><p class="muted">Estimation : <b>${mad(e.lo)} – ${mad(e.hi)}</b>. Choisissez un créneau pour la visite.</p>
      <form class="form" id="rq"><div id="cal"></div><div class="opts" id="slots"><span class="muted" style="font-size:.88rem">Choisissez d’abord une date.</span></div>
      <div class="row2"><label class="f">Nom complet<input class="field" name="name" required autocomplete="name"></label><label class="f">Téléphone / WhatsApp<input class="field" name="phone" type="tel" required autocomplete="tel"></label></div>
      <label class="f">Ville & quartier<input class="field" name="city" required placeholder="Casablanca · Maârif"></label>
      <label class="f">Votre projet<textarea class="field" name="note" placeholder="Neuf ou rénovation, dimensions approximatives, délai souhaité…"></textarea></label>
      <label class="f">Photos de la pièce (facultatif)<input class="field" type="file" name="files" accept="image/*" multiple></label>
      <label class="check"><input type="checkbox" required> J’accepte d’être recontacté pour ce projet.</label>
      <button class="btn btn-primary">Confirmer ma demande</button></form>`);
    calendar($('#cal', sh), st, (d) => { const w = new Date(d + 'T12:00:00').getDay(); if (w === 0) return 'busy'; const n = taken(d).length; return n >= CFG.slots.length ? 'busy' : n ? 'few' : ''; }, (d) => {
      const tk = taken(d); slot = null;
      $('#slots', sh).innerHTML = CFG.slots.map((s) => `<label class="opt"><input type="radio" name="slot" value="${s}" ${tk.includes(s) ? 'disabled' : ''}><span${tk.includes(s) ? ' style="opacity:.4;text-decoration:line-through"' : ''}>${s}</span></label>`).join('');
      $$('input[name=slot]', sh).forEach((r) => r.onchange = () => slot = r.value);
    });
    $('#rq', sh).onsubmit = (ev) => {
      ev.preventDefault(); const f = ev.target;
      if (!st.sel || !slot) { toast('Choisissez une date et un créneau pour le métré.'); return; }
      const lead = { id: 'EPS-' + uid().slice(0, 3), created: today(), name: f.name.value.trim(), phone: f.phone.value.trim(), city: f.city.value.trim(), status: 'visit', ...O, extras: [...O.extras], lo: e.lo, hi: e.hi, visit: st.sel, slot, amount: 0, paid: 0, note: f.note.value.trim(), files: [...f.files.files].map((x) => x.name), history: [{ at: today(), s: 'new' }, { at: today(), s: 'visit' }] };
      db.update((s) => s.leads.unshift(lead));
      K.modal(`<h2 style="font-size:1.5rem">C’est noté ✓</h2><p>Merci ${esc(lead.name)} ! Votre métré gratuit est réservé le <b>${frDate(lead.visit, { weekday: 'long', day: 'numeric', month: 'long' })} à ${lead.slot}</b>.</p>
        <dl class="kv"><dt>Référence</dt><dd>${lead.id}</dd><dt>Adresse</dt><dd>${esc(lead.city)}</dd><dt>Estimation</dt><dd>${mad(lead.lo)} – ${mad(lead.hi)}</dd></dl><p class="muted">Un rappel vous sera envoyé sur WhatsApp la veille de la visite.</p><button class="btn btn-primary" data-close>Parfait</button>`);
    };
  }
})();
