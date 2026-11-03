(() => {
  const { $, $$, esc, mad, uid, today, frDate, toast, modal, close, csv, adminGate, MONTHS } = window.K;
  const { CFG, STATUS, FLOW, pack, db } = window.P;
  const TABS = [['book', 'Réservations'], ['cal', 'Calendrier'], ['gal', 'Galeries clients'], ['money', 'Revenus']];
  let tab = 'book', month = today().slice(0, 7);
  const bdg = (s) => `<span class="bdg ${STATUS[s][1]}">${STATUS[s][0]}</span>`;
  const img = (n) => `/demos/photo/img/${n}.webp`;

  function shell() {
    const s = db.get(); const n = s.bookings.filter((b) => ['req', 'hold'].includes(b.status)).length;
    $('#root').innerHTML = `<div class="adm"><aside><a class="brand" href="/demo/photo"><span class="mark mv">◎</span>Magic Vision</a>
      ${TABS.map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}${k === 'book' && n ? `<span class="cnt">${n}</span>` : ''}</button>`).join('')}
      <div class="sp">Démo MBN DEV · données locales<br><a href="#" id="reset" style="color:#aaa">Réinitialiser</a></div></aside><main id="main"></main></div>`;
    $$('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; shell(); });
    $('#reset').onclick = (e) => { e.preventDefault(); if (confirm('Remettre les données de démonstration ?')) { db.reset(); shell(); } };
    ({ book: vBook, cal: vCal, gal: vGal, money: vMoney })[tab]();
  }

  function vBook() {
    const s = db.get(); const up = s.bookings.filter((b) => b.date >= today() && b.status !== 'cancel').sort((a, b) => a.date.localeCompare(b.date));
    const past = s.bookings.filter((b) => b.date < today() || b.status === 'cancel').sort((a, b) => b.date.localeCompare(a.date));
    const tbl = (l) => l.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Date</th><th>Client</th><th>Événement</th><th>Formule</th><th>Acompte / payé</th><th>Statut</th></tr></thead><tbody>${l.map((b) => `<tr class="click" data-b="${b.id}"><td><b>${frDate(b.date)}</b><br><span class="muted" style="font-size:.8rem">${b.id}</span></td><td>${esc(b.name)}<br><span class="muted" style="font-size:.8rem">${esc(b.phone)}</span></td><td>${esc(b.type)}<br><span class="muted" style="font-size:.8rem">${esc(b.place)}${b.guests ? ` · ${b.guests} invités` : ''}</span></td><td>${esc(pack(b.pack).n)}<br><span class="muted" style="font-size:.8rem">${mad(b.price)}</span></td><td>${mad(b.paid)}</td><td>${bdg(b.status)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="card empty">Aucune réservation.</div>';
    $('#main').innerHTML = `<h1>Réservations</h1><div class="kpis"><div class="card"><b>${s.bookings.filter((b) => b.status === 'req').length}</b><span>nouvelles demandes</span></div><div class="card"><b>${s.bookings.filter((b) => b.status === 'hold').length}</b><span>options 48 h à relancer</span></div><div class="card"><b>${up.filter((b) => b.status === 'conf').length}</b><span>événements confirmés à venir</span></div><div class="card"><b>${s.bookings.filter((b) => b.status === 'shot').length}</b><span>à livrer</span></div></div>
      <div class="toolbar"><h3 style="margin:0">À venir</h3><span class="sp"></span><button class="btn btn-ghost btn-sm" id="csv">Export CSV</button></div>${tbl(up)}<h3 style="margin-top:26px">Passées & annulées</h3>${tbl(past)}`;
    $$('[data-b]').forEach((r) => r.onclick = () => detail(r.dataset.b));
    $('#csv').onclick = () => csv('reservations-magic-vision.csv', [['Réf', 'Date', 'Client', 'Téléphone', 'Type', 'Lieu', 'Invités', 'Formule', 'Prix', 'Payé', 'Statut'], ...s.bookings.map((b) => [b.id, b.date, b.name, b.phone, b.type, b.place, b.guests, pack(b.pack).n, b.price, b.paid, STATUS[b.status][0]])]);
  }

  function detail(id) {
    const b = db.get().bookings.find((x) => x.id === id); const i = FLOW.indexOf(b.status); const nxt = i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
    const dep = Math.round(b.price * CFG.deposit / 100);
    const sh = modal(`<h2 style="font-size:1.4rem">${esc(b.name)} ${bdg(b.status)}</h2><dl class="kv"><dt>Référence</dt><dd>${b.id}</dd><dt>Date</dt><dd>${frDate(b.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</dd><dt>Événement</dt><dd>${esc(b.type)} · ${esc(b.place)}${b.guests ? ` · ${b.guests} invités` : ''}</dd>
      <dt>Formule</dt><dd>${esc(pack(b.pack).n)} · ${mad(b.price)}</dd><dt>Payé</dt><dd>${mad(b.paid)} (acompte ${mad(dep)})</dd><dt>WhatsApp</dt><dd>${esc(b.phone)}</dd><dt>Note</dt><dd>${esc(b.note || '—')}</dd></dl>
      <div class="toolbar">${nxt ? `<button class="btn btn-primary btn-sm" data-to="${nxt}">→ ${STATUS[nxt][0]}</button>` : ''}
      ${b.paid < dep && b.status !== 'cancel' ? `<button class="btn btn-ghost btn-sm" data-pay="${dep}">Acompte reçu (${mad(dep)})</button>` : ''}${b.paid < b.price && b.paid >= dep ? `<button class="btn btn-ghost btn-sm" data-pay="${b.price}">Solde reçu</button>` : ''}
      ${b.status === 'shot' || b.status === 'deliv' ? '<button class="btn btn-ghost btn-sm" id="mkgal">Créer la galerie client</button>' : ''}
      <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://wa.me/${b.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${b.name}, c’est Magic Vision 📸 Merci pour votre demande du ${frDate(b.date)}. L’acompte de ${dep} MAD confirme définitivement la date.`)}">WhatsApp</a>
      ${['req', 'hold', 'conf'].includes(b.status) ? '<button class="btn btn-ghost btn-sm" data-to="cancel" style="color:#b42318">Annuler</button>' : ''}</div>`);
    $$('[data-to]', sh).forEach((x) => x.onclick = () => { db.update((s) => { const r = s.bookings.find((y) => y.id === id); r.status = x.dataset.to; if (x.dataset.to === 'conf' && r.paid < dep) r.paid = dep; }); toast(`→ ${STATUS[x.dataset.to][0]}`); close(); shell(); });
    $$('[data-pay]', sh).forEach((x) => x.onclick = () => { db.update((s) => { const r = s.bookings.find((y) => y.id === id); r.paid = Number(x.dataset.pay); if (r.status === 'hold' || r.status === 'req') r.status = 'conf'; }); toast('Paiement enregistré'); close(); shell(); });
    const mk = $('#mkgal', sh); if (mk) mk.onclick = () => { db.update((s) => { if (!s.galleries.find((g) => g.code === b.id)) s.galleries.unshift({ code: b.id, phone: b.phone, name: b.name, imgs: CFG.portfolio.map((p) => p.img), fav: [], max: 40, created: today() }); }); tab = 'gal'; close(); shell(); toast(`Galerie ${b.id} prête — code envoyé au client`); };
  }

  function vCal() {
    const s = db.get(); const [y, m] = month.split('-').map(Number); const days = new Date(y, m, 0).getDate(); const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    let h = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => `<div class="mh">${d}</div>`).join('') + '<div></div>'.repeat(lead);
    for (let d = 1; d <= days; d++) { const ds = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`; const ev = s.bookings.filter((b) => b.date === ds && b.status !== 'cancel');
      h += `<div class="md${ds === today() ? ' td' : ''}"><span>${d}</span>${ev.map((b) => `<button class="ev ${STATUS[b.status][1]}" data-b="${b.id}">${esc(b.type)} · ${esc(b.name)}</button>`).join('')}</div>`; }
    $('#main').innerHTML = `<h1>Calendrier</h1><div class="toolbar"><button class="btn btn-ghost btn-sm" data-m="-1">‹</button><b style="min-width:160px;text-align:center">${MONTHS[m - 1]} ${y}</b><button class="btn btn-ghost btn-sm" data-m="1">›</button><span class="sp"></span><span class="muted" style="font-size:.85rem">Les dates confirmées ou en option sont bloquées sur le site.</span></div><div class="month">${h}</div>`;
    $$('[data-m]').forEach((b) => b.onclick = () => { const d = new Date(y, m - 1 + Number(b.dataset.m), 1); month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; vCal(); });
    $$('[data-b]').forEach((b) => b.onclick = () => detail(b.dataset.b));
  }

  function vGal() {
    const s = db.get();
    $('#main').innerHTML = `<h1>Galeries clients</h1><p class="muted">Chaque client accède à sa galerie avec son code et son téléphone, et choisit les photos de son album.</p>
      <div class="grid g2">${s.galleries.map((g) => `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><div><b>${esc(g.name)}</b><br><span class="muted" style="font-size:.85rem">Code ${g.code} · ${g.imgs.length} photos · créée le ${frDate(g.created)}</span></div><span class="bdg ${g.fav.length ? 'ok' : 'warn'}">${g.fav.length}/${g.max} choisies</span></div>
        <div class="thumbs">${g.imgs.map((i) => `<img src="${img(i)}" alt="" loading="lazy" class="${g.fav.includes(i) ? 'on' : ''}">`).join('')}</div>
        <div class="toolbar" style="margin:12px 0 0"><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://wa.me/${g.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${g.name} ! Vos photos sont prêtes ✨ Ouvrez votre galerie sur notre site avec le code ${g.code}.`)}">Envoyer le code</a>${g.fav.length ? `<button class="btn btn-ghost btn-sm" data-ex="${g.code}">Liste album (CSV)</button>` : ''}</div></div>`).join('') || '<div class="card empty">Aucune galerie.</div>'}</div>`;
    $$('[data-ex]').forEach((b) => b.onclick = () => { const g = db.get().galleries.find((x) => x.code === b.dataset.ex); csv(`album-${g.code}.csv`, [['Photo'], ...g.fav.map((f) => [f + '.jpg'])]); });
  }

  function vMoney() {
    const s = db.get(); const ok = s.bookings.filter((b) => ['conf', 'shot', 'deliv'].includes(b.status));
    const tot = ok.reduce((a, b) => a + b.price, 0); const paid = s.bookings.reduce((a, b) => a + b.paid, 0);
    const byM = {}; ok.forEach((b) => { const k = b.date.slice(0, 7); byM[k] = (byM[k] || 0) + b.price; }); const max = Math.max(1, ...Object.values(byM));
    const byP = CFG.packs.map((p) => [p.n, ok.filter((b) => b.pack === p.id).length]);
    $('#main').innerHTML = `<h1>Revenus</h1><div class="kpis"><div class="card"><b>${mad(tot)}</b><span>chiffre confirmé</span></div><div class="card"><b>${mad(paid)}</b><span>encaissé</span></div><div class="card"><b>${mad(Math.max(0, tot - paid))}</b><span>reste à encaisser</span></div><div class="card"><b>${ok.length}</b><span>événements</span></div></div>
      <div class="grid g2"><div class="card"><h3>Par mois</h3>${Object.keys(byM).sort().map((k) => `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:.9rem"><span>${MONTHS[Number(k.slice(5)) - 1]} ${k.slice(0, 4)}</span><b>${mad(byM[k])}</b></div><div class="bar"><i style="width:${byM[k] / max * 100}%"></i></div></div>`).join('')}</div>
      <div class="card"><h3>Formules vendues</h3>${byP.map(([n, c]) => `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:.9rem"><span>${n}</span><b>${c}</b></div><div class="bar"><i style="width:${ok.length ? c / ok.length * 100 : 0}%"></i></div></div>`).join('')}</div></div>`;
  }

  adminGate('mv_admin', CFG.pin, shell, '/demo/photo');
})();
