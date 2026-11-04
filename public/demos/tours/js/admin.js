(() => {
  const { $, $$, esc, mad, today, addDays, frDate, toast, modal, close, csv, adminGate } = window.K;
  const { CFG, STATUS, tour, booked, db } = window.G;
  const TABS = [['day', 'Prises en charge'], ['book', 'Réservations'], ['dep', 'Départs & guides'], ['tours', 'Excursions & prix'], ['money', 'Revenus']];
  const GUIDES = ['—', 'Hassan (FR/EN)', 'Fatima (FR/ES)', 'Omar (EN/DE)', 'Youssef (FR/EN)'];
  let tab = 'day', day = today(), filter = 'all';
  const bdg = (s) => `<span class="bdg ${STATUS[s][1]}">${STATUS[s][0]}</span>`;
  const pax = (b) => b.adults + b.kids;

  function shell() {
    const n = db.get().bookings.filter((b) => b.status === 'new').length;
    $('#root').innerHTML = `<div class="adm"><aside><a class="brand" href="/demo/tours"><span class="mark">GT</span>Greg Tours</a>
      ${TABS.map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}${k === 'book' && n ? `<span class="cnt">${n}</span>` : ''}</button>`).join('')}
      <div class="sp">Démo MBN DEV · données locales<br><a href="#" id="reset" style="color:#aaa">Réinitialiser</a></div></aside><main id="main"></main></div>`;
    $$('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; shell(); });
    $('#reset').onclick = (e) => { e.preventDefault(); if (confirm('Remettre les données de démonstration ?')) { db.reset(); shell(); } };
    ({ day: vDay, book: vBook, dep: vDep, tours: vTours, money: vMoney })[tab]();
  }

  const table = (l) => l.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Réf.</th><th>Client</th><th>Excursion</th><th>Date</th><th>Pers.</th><th>Prise en charge</th><th>Total / payé</th><th>Statut</th></tr></thead><tbody>${l.map((b) => `<tr class="click" data-b="${b.id}"><td><b>${b.id}</b></td><td>${esc(b.name)}<br><span class="muted" style="font-size:.8rem">${esc(b.phone)} · ${esc(b.lang)}</span></td><td>${esc(tour(b.tour).n)}${b.priv ? ' <span class="bdg dark">Privée</span>' : ''}</td><td>${frDate(b.date)}</td><td>${b.adults}${b.kids ? ` + ${b.kids}` : ''}</td><td>${esc(b.hotel)}</td><td>${mad(b.total)}<br><span class="muted" style="font-size:.8rem">${mad(b.paid)}</span></td><td>${bdg(b.status)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="card empty">Rien à afficher.</div>';
  const bindRows = () => $$('[data-b]').forEach((r) => r.onclick = () => detail(r.dataset.b));

  function vDay() {
    const s = db.get(); const list = s.bookings.filter((b) => b.date === day && b.status !== 'cancel').sort((a, b) => tour(a.tour).start.localeCompare(tour(b.tour).start));
    const groups = CFG.tours.map((t) => ({ t, l: list.filter((b) => b.tour === t.id) })).filter((g) => g.l.length);
    $('#main').innerHTML = `<h1>Prises en charge</h1><div class="toolbar"><button class="btn btn-ghost btn-sm" data-d="-1">‹</button><b style="min-width:200px;text-align:center">${frDate(day, { weekday: 'long', day: 'numeric', month: 'long' })}</b><button class="btn btn-ghost btn-sm" data-d="1">›</button><span class="sp"></span><button class="btn btn-ghost btn-sm" id="csv">Feuille de route (CSV)</button></div>
      <div class="kpis"><div class="card"><b>${list.reduce((a, b) => a + pax(b), 0)}</b><span>voyageurs</span></div><div class="card"><b>${groups.length}</b><span>départs</span></div><div class="card"><b>${new Set(list.map((b) => b.hotel)).size}</b><span>hôtels à desservir</span></div><div class="card"><b>${mad(list.reduce((a, b) => a + b.total - b.paid, 0))}</b><span>à encaisser sur place</span></div></div>
      ${groups.map(({ t, l }) => { const g = s.guides[`${t.id}|${day}`] || '—'; return `<div class="card" style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><b>${t.start} · ${esc(t.n)}</b><br><span class="muted" style="font-size:.85rem">${l.reduce((a, b) => a + pax(b), 0)} / ${t.cap} places · guide : ${esc(g)}</span></div></div>
        <div class="tbl-wrap" style="margin-top:12px"><table class="tbl"><thead><tr><th>Hôtel</th><th>Client</th><th>Pers.</th><th>Langue</th><th>À encaisser</th></tr></thead><tbody>${l.map((b) => `<tr class="click" data-b="${b.id}"><td><b>${esc(b.hotel)}</b></td><td>${esc(b.name)}<br><span class="muted" style="font-size:.8rem">${esc(b.phone)}</span></td><td>${b.adults}${b.kids ? ` + ${b.kids}` : ''}</td><td>${esc(b.lang)}</td><td>${mad(b.total - b.paid)}</td></tr>`).join('')}</tbody></table></div></div>`; }).join('') || '<div class="card empty">Aucune prise en charge ce jour-là.</div>'}`;
    $$('[data-d]').forEach((b) => b.onclick = () => { day = addDays(day, Number(b.dataset.d)); vDay(); });
    $('#csv').onclick = () => csv(`prises-en-charge-${day}.csv`, [['Heure', 'Excursion', 'Hôtel', 'Client', 'Téléphone', 'Pers.', 'Langue', 'À encaisser'], ...list.map((b) => [tour(b.tour).start, tour(b.tour).n, b.hotel, b.name, b.phone, pax(b), b.lang, b.total - b.paid])]);
    bindRows();
  }

  function vBook() {
    const s = db.get(); const l = s.bookings.filter((b) => filter === 'all' || b.status === filter).sort((a, b) => a.date.localeCompare(b.date));
    $('#main').innerHTML = `<h1>Réservations</h1><div class="toolbar"><select class="field" id="f"><option value="all">Tous les statuts</option>${Object.entries(STATUS).map(([k, [x]]) => `<option value="${k}" ${filter === k ? 'selected' : ''}>${x}</option>`).join('')}</select><span class="sp"></span><button class="btn btn-ghost btn-sm" id="csv">Export CSV</button></div>${table(l)}`;
    $('#f').onchange = (e) => { filter = e.target.value; vBook(); };
    $('#csv').onclick = () => csv('reservations-greg-tours.csv', [['Réf', 'Excursion', 'Date', 'Client', 'Téléphone', 'E-mail', 'Pays', 'Adultes', 'Enfants', 'Privée', 'Hôtel', 'Langue', 'Total', 'Payé', 'Statut'], ...l.map((b) => [b.id, tour(b.tour).n, b.date, b.name, b.phone, b.email, b.country, b.adults, b.kids, b.priv ? 'oui' : 'non', b.hotel, b.lang, b.total, b.paid, STATUS[b.status][0]])]);
    bindRows();
  }

  function detail(id) {
    const b = db.get().bookings.find((x) => x.id === id); const t = tour(b.tour);
    const sh = modal(`<h2 style="font-size:1.4rem">${esc(b.name)} ${bdg(b.status)}</h2><dl class="kv"><dt>Référence</dt><dd>${b.id}</dd><dt>Excursion</dt><dd>${esc(t.n)}${b.priv ? ' (privée)' : ''}</dd><dt>Date</dt><dd>${frDate(b.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${t.start}</dd><dt>Personnes</dt><dd>${b.adults} adulte(s)${b.kids ? ` + ${b.kids} enfant(s)` : ''}</dd><dt>Prise en charge</dt><dd>${esc(b.hotel)}</dd><dt>Langue</dt><dd>${esc(b.lang)}</dd><dt>Contact</dt><dd>${esc(b.phone)} ${b.email ? '· ' + esc(b.email) : ''} · ${esc(b.country || '')}</dd><dt>Montant</dt><dd>${mad(b.total)} · payé ${mad(b.paid)}</dd><dt>Note</dt><dd>${esc(b.note || '—')}</dd></dl>
      <div class="toolbar">${b.status === 'new' ? '<button class="btn btn-primary btn-sm" data-to="conf">Confirmer</button>' : ''}${['conf', 'paid'].includes(b.status) ? '<button class="btn btn-primary btn-sm" data-to="done">Marquer effectuée</button>' : ''}${b.paid < b.total && b.status !== 'cancel' ? '<button class="btn btn-ghost btn-sm" id="pay">Solde encaissé</button>' : ''}
      <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://wa.me/${b.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${b.name}, c’est Greg Tours. Rappel : ${t.n} le ${frDate(b.date)}. Prise en charge à ${b.hotel} vers ${t.start}. À demain !`)}">Rappel WhatsApp</a>${['new', 'conf', 'paid'].includes(b.status) ? '<button class="btn btn-ghost btn-sm" data-to="cancel" style="color:#b42318">Annuler</button>' : ''}</div>`);
    $$('[data-to]', sh).forEach((x) => x.onclick = () => { db.update((s) => { const r = s.bookings.find((y) => y.id === id); r.status = x.dataset.to; if (x.dataset.to === 'done') r.paid = r.total; }); toast(STATUS[x.dataset.to][0]); close(); shell(); });
    const p = $('#pay', sh); if (p) p.onclick = () => { db.update((s) => { const r = s.bookings.find((y) => y.id === id); r.paid = r.total; }); toast('Paiement enregistré'); close(); shell(); };
  }

  function vDep() {
    const s = db.get(); const days = Array.from({ length: 10 }, (_, i) => addDays(today(), i));
    $('#main').innerHTML = `<h1>Départs & guides</h1><p class="muted">Remplissage de chaque départ sur 10 jours. Affectez un guide par départ.</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Excursion</th>${days.map((d) => `<th>${frDate(d, { weekday: 'short', day: 'numeric' })}</th>`).join('')}</tr></thead><tbody>
      ${CFG.tours.map((t) => `<tr><td><b>${esc(t.n)}</b><br><span class="muted" style="font-size:.8rem">${t.start} · ${t.cap} pl.</span></td>${days.map((d) => { const n = booked(s, t.id, d); const k = `${t.id}|${d}`; return `<td>${n ? `<div class="fill"><i style="width:${Math.min(100, n / t.cap * 100)}%"></i></div><b style="font-size:.85rem">${n}/${t.cap}</b><br><select class="gsel" data-g="${k}">${GUIDES.map((g) => `<option ${s.guides[k] === g ? 'selected' : ''}>${g}</option>`).join('')}</select>` : '<span class="muted">—</span>'}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
    $$('[data-g]').forEach((x) => x.onchange = () => { db.update((st) => { st.guides[x.dataset.g] = x.value; }); toast('Guide affecté'); });
  }

  function vTours() {
    const s = db.get();
    $('#main').innerHTML = `<h1>Excursions & prix</h1><p class="muted">Le prix adulte modifié ici s’affiche immédiatement sur le site et dans le module.</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Excursion</th><th>Durée</th><th>Départ</th><th>Capacité</th><th>Prix adulte</th></tr></thead><tbody>
      ${CFG.tours.map((t) => `<tr><td><b>${esc(t.n)}</b></td><td>${esc(t.dur)}</td><td>${t.start}</td><td>${t.cap}</td><td><input class="field" style="width:110px;min-height:36px" type="number" min="0" step="10" data-p="${t.id}" value="${s.prices[t.id] ?? t.p}"> MAD</td></tr>`).join('')}</tbody></table></div><p class="muted" style="margin-top:12px">Enfant : ${CFG.childPct} % · privée : +${CFG.privatePct} % · acompte en ligne : ${CFG.deposit} %.</p>`;
    $$('[data-p]').forEach((i) => i.onchange = () => { db.update((x) => { x.prices[i.dataset.p] = Math.max(0, Number(i.value) || 0); }); toast('Prix mis à jour'); });
  }

  function vMoney() {
    const s = db.get(); const ok = s.bookings.filter((b) => b.status !== 'cancel'); const tot = ok.reduce((a, b) => a + b.total, 0); const paid = ok.reduce((a, b) => a + b.paid, 0);
    const byT = CFG.tours.map((t) => ({ t, v: ok.filter((b) => b.tour === t.id).reduce((a, b) => a + b.total, 0), p: ok.filter((b) => b.tour === t.id).reduce((a, b) => a + pax(b), 0) })).sort((a, b) => b.v - a.v); const max = Math.max(1, ...byT.map((x) => x.v));
    const byC = {}; ok.forEach((b) => { byC[b.country || '—'] = (byC[b.country || '—'] || 0) + pax(b); });
    $('#main').innerHTML = `<h1>Revenus</h1><div class="kpis"><div class="card"><b>${mad(tot)}</b><span>réservé</span></div><div class="card"><b>${mad(paid)}</b><span>encaissé</span></div><div class="card"><b>${mad(tot - paid)}</b><span>reste à encaisser</span></div><div class="card"><b>${ok.reduce((a, b) => a + pax(b), 0)}</b><span>voyageurs</span></div></div>
      <div class="grid g2"><div class="card"><h3>Par excursion</h3>${byT.map((x) => `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:.9rem"><span>${esc(x.t.n)} <span class="muted">· ${x.p} pers.</span></span><b>${mad(x.v)}</b></div><div class="bar"><i style="width:${x.v / max * 100}%"></i></div></div>`).join('')}</div>
      <div class="card"><h3>Voyageurs par pays</h3>${Object.entries(byC).sort((a, b) => b[1] - a[1]).map(([c, n]) => `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eee;font-size:.9rem"><span>${esc(c)}</span><b>${n}</b></div>`).join('')}</div></div>`;
  }

  adminGate('greg_admin', 'tours', CFG.pinHash, shell, '/demo/tours');
})();
