(() => {
  const { $, $$, esc, mad, today, frDate, toast, modal, close, csv, adminGate } = window.K;
  const { CFG, STATUS, FLOW, estimate, db } = window.C;
  const TABS = [['pipe', 'Demandes'], ['agenda', 'Agenda métrés'], ['projects', 'Chantiers'], ['prices', 'Tarifs'], ['stats', 'Statistiques']];
  let tab = 'pipe';
  const bdg = (s) => `<span class="bdg ${STATUS[s][1]}">${STATUS[s][0]}</span>`;
  const shapeN = (id) => CFG.shapes.find((s) => s.id === id).n;

  function shell() {
    const s = db.get(); const n = s.leads.filter((l) => l.status === 'new').length;
    $('#root').innerHTML = `<div class="adm"><aside><a class="brand" href="/demo/cuisine"><span class="mark">EPS</span>EPS Design</a>
      ${TABS.map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}${k === 'pipe' && n ? `<span class="cnt">${n}</span>` : ''}</button>`).join('')}
      <div class="sp">Démo MBN DEV · données locales<br><a href="#" id="reset" style="color:#aaa">Réinitialiser</a></div></aside><main id="main"></main></div>`;
    $$('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; shell(); });
    $('#reset').onclick = (e) => { e.preventDefault(); if (confirm('Remettre les données de démonstration ?')) { db.reset(); shell(); } };
    ({ pipe: vPipe, agenda: vAgenda, projects: vProjects, prices: vPrices, stats: vStats })[tab]();
  }

  function vPipe() {
    const s = db.get(); const cols = ['new', 'visit', 'quote', 'signed'];
    $('#main').innerHTML = `<h1>Demandes</h1><div class="toolbar"><span class="muted">Glissez le projet d’étape en étape avec les boutons de la fiche.</span><span class="sp"></span><button class="btn btn-ghost btn-sm" id="csv">Export CSV</button></div>
      <div class="kanban">${cols.map((c) => { const l = s.leads.filter((x) => x.status === c); return `<div class="col"><div class="colh">${STATUS[c][0]} <span>${l.length}</span></div>${l.map((x) => `<button class="lcard" data-l="${x.id}"><b>${esc(x.name)}</b><span>${esc(x.city)}</span><span>${shapeN(x.shape)} · ${x.m} m · ${x.amount ? mad(x.amount) : mad(x.lo) + '–' + mad(x.hi).replace(' MAD', '')}</span>${x.visit && c === 'visit' ? `<em>Métré ${frDate(x.visit)} · ${x.slot}</em>` : ''}</button>`).join('') || '<p class="muted" style="font-size:.85rem;padding:8px">—</p>'}</div>`; }).join('')}</div>
      <h3 style="margin-top:28px">Perdus</h3><p class="muted">${s.leads.filter((l) => l.status === 'lost').map((l) => `<a href="#" data-l="${l.id}">${esc(l.name)}</a>`).join(' · ') || '—'}</p>`;
    $$('[data-l]').forEach((b) => b.onclick = (e) => { e.preventDefault(); lead(b.dataset.l); });
    $('#csv').onclick = () => csv('demandes-eps.csv', [['Réf', 'Client', 'Téléphone', 'Ville', 'Forme', 'Mètres', 'Façades', 'Plan', 'Estimation basse', 'Estimation haute', 'Devis', 'Payé', 'Métré', 'Statut'], ...s.leads.map((l) => [l.id, l.name, l.phone, l.city, shapeN(l.shape), l.m, l.front, l.top, l.lo, l.hi, l.amount, l.paid, l.visit ? `${l.visit} ${l.slot}` : '', STATUS[l.status][0]])]);
  }

  function lead(id) {
    const s = db.get(); const l = s.leads.find((x) => x.id === id); const i = FLOW.indexOf(l.status); const nxt = i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
    const sh = modal(`<h2 style="font-size:1.4rem">${esc(l.name)} ${bdg(l.status)}</h2>
      <dl class="kv"><dt>Référence</dt><dd>${l.id} · reçue le ${frDate(l.created)}</dd><dt>Téléphone</dt><dd>${esc(l.phone)}</dd><dt>Adresse</dt><dd>${esc(l.city)}</dd>
      <dt>Projet</dt><dd>Cuisine ${esc(shapeN(l.shape).toLowerCase())}, ${l.m} m · ${esc(CFG.fronts.find((f) => f.id === l.front).n)} · ${esc(CFG.tops.find((f) => f.id === l.top).n)}</dd>
      <dt>Options</dt><dd>${l.extras.length ? l.extras.map((x) => esc(CFG.extras.find((e) => e.id === x).n)).join(', ') : '—'}</dd><dt>Estimation site</dt><dd>${mad(l.lo)} – ${mad(l.hi)}</dd>
      <dt>Métré</dt><dd>${l.visit ? `${frDate(l.visit, { weekday: 'long', day: 'numeric', month: 'long' })} à ${l.slot}` : '—'}</dd><dt>Note</dt><dd>${esc(l.note || '—')}</dd>${l.files && l.files.length ? `<dt>Photos</dt><dd>${l.files.map(esc).join(', ')}</dd>` : ''}</dl>
      <form class="form" id="lf"><div class="row2"><label class="f">Montant du devis (MAD)<input class="field" name="amount" type="number" min="0" step="500" value="${l.amount || ''}" placeholder="${Math.round((l.lo + l.hi) / 2)}"></label><label class="f">Déjà encaissé (MAD)<input class="field" name="paid" type="number" min="0" step="500" value="${l.paid || ''}"></label></div>
      <label class="f">Note interne<textarea class="field" name="note">${esc(l.note || '')}</textarea></label>
      <div class="toolbar"><button class="btn btn-ghost btn-sm" type="submit">Enregistrer</button>${nxt ? `<button class="btn btn-primary btn-sm" type="button" data-to="${nxt}">→ ${STATUS[nxt][0]}</button>` : ''}
      ${l.status !== 'lost' && l.status !== 'done' ? '<button class="btn btn-ghost btn-sm" type="button" data-to="lost" style="color:#b42318">Marquer perdu</button>' : ''}
      <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://wa.me/${l.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${l.name}, ici EPS Design Cuisine. ${l.visit ? `Nous confirmons le métré du ${frDate(l.visit)} à ${l.slot}.` : ''}`)}">WhatsApp</a></div></form>`);
    const save = (to) => { const f = $('#lf', sh); db.update((x) => { const r = x.leads.find((y) => y.id === id); r.amount = Number(f.amount.value) || 0; r.paid = Number(f.paid.value) || 0; r.note = f.note.value; if (to) { r.status = to; r.history.push({ at: today(), s: to }); if (to === 'signed' && !r.paid && r.amount) r.paid = Math.round(r.amount / 2); } }); };
    $('#lf', sh).onsubmit = (e) => { e.preventDefault(); save(); toast('Fiche enregistrée'); close(); shell(); };
    $$('[data-to]', sh).forEach((b) => b.onclick = () => { if (b.dataset.to === 'quote' && !$('#lf', sh).amount.value) { toast('Indiquez le montant du devis.'); return; } save(b.dataset.to); toast(`→ ${STATUS[b.dataset.to][0]}`); close(); shell(); });
  }

  function vAgenda() {
    const s = db.get(); const list = s.leads.filter((l) => l.visit && l.visit >= today() && ['new', 'visit'].includes(l.status)).sort((a, b) => (a.visit + a.slot).localeCompare(b.visit + b.slot));
    $('#main').innerHTML = `<h1>Agenda des métrés</h1><p class="muted">Rendez-vous pris depuis le site. Un rappel WhatsApp part la veille.</p>
      ${list.length ? `<div class="grid">${list.map((l) => `<button class="card agenda" data-l="${l.id}"><div class="when"><b>${frDate(l.visit, { day: 'numeric' })}</b><span>${frDate(l.visit, { month: 'short' })}</span></div><div><b>${l.slot} · ${esc(l.name)}</b><br><span class="muted">${esc(l.city)} · ${esc(l.phone)}</span><br><span style="font-size:.85rem">${shapeN(l.shape)} ${l.m} m — estim. ${mad(l.lo)} – ${mad(l.hi)}</span></div></button>`).join('')}</div>` : '<div class="card empty">Aucun métré à venir.</div>'}`;
    $$('[data-l]').forEach((b) => b.onclick = () => lead(b.dataset.l));
  }

  function vProjects() {
    const s = db.get(); const list = s.leads.filter((l) => ['signed', 'build', 'done'].includes(l.status));
    $('#main').innerHTML = `<h1>Chantiers</h1><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Client</th><th>Projet</th><th>Montant</th><th>Encaissé</th><th>Reste</th><th>Étape</th></tr></thead><tbody>
      ${list.map((l) => `<tr class="click" data-l="${l.id}"><td><b>${esc(l.name)}</b><br><span class="muted" style="font-size:.8rem">${esc(l.city)}</span></td><td>${shapeN(l.shape)} · ${l.m} m</td><td>${mad(l.amount)}</td><td>${mad(l.paid)}<div class="bar" style="margin-top:6px;width:110px"><i style="width:${l.amount ? Math.min(100, l.paid / l.amount * 100) : 0}%"></i></div></td><td>${mad(Math.max(0, l.amount - l.paid))}</td><td>${bdg(l.status)}</td></tr>`).join('')}</tbody></table></div>`;
    $$('[data-l]').forEach((b) => b.onclick = () => lead(b.dataset.l));
  }

  function vPrices() {
    const s = db.get(); const P = s.prices; const v = (x) => P[x.id] ?? x.p;
    $('#main').innerHTML = `<h1>Tarifs de l’estimateur</h1><p class="muted">Ces prix au mètre linéaire alimentent l’estimation affichée aux visiteurs.</p>
      <div class="grid g2"><div class="card"><h3>Façades & caissons (MAD / m)</h3>${CFG.fronts.map((f) => `<label class="f" style="margin:10px 0">${esc(f.n)}<input class="field" type="number" min="0" step="100" data-p="${f.id}" value="${v(f)}"></label>`).join('')}</div>
      <div class="card"><h3>Plans de travail (MAD / m)</h3>${CFG.tops.map((f) => `<label class="f" style="margin:10px 0">${esc(f.n)}<input class="field" type="number" min="0" step="50" data-p="${f.id}" value="${v(f)}"></label>`).join('')}
      <p class="muted" style="font-size:.85rem">Exemple : cuisine en L de 4 m, laqué, quartz → <b id="ex"></b></p></div></div>`;
    const ex = () => { const e = estimate({ shape: 'L', m: 4, front: 'lac', top: 'quartz', extras: [] }, db.get().prices); $('#ex').textContent = `${mad(e.lo)} – ${mad(e.hi)}`; };
    ex(); $$('[data-p]').forEach((i) => i.onchange = () => { db.update((x) => { x.prices[i.dataset.p] = Math.max(0, Number(i.value) || 0); }); ex(); toast('Tarif enregistré'); });
  }

  function vStats() {
    const s = db.get(); const L = s.leads; const signed = L.filter((l) => ['signed', 'build', 'done'].includes(l.status));
    const ca = signed.reduce((a, l) => a + l.amount, 0); const rate = L.length ? Math.round(signed.length / L.length * 100) : 0;
    const by = {}; L.forEach((l) => { const c = l.city.split('·')[0].trim(); by[c] = (by[c] || 0) + 1; }); const max = Math.max(1, ...Object.values(by));
    const shapes = CFG.shapes.map((sh) => [sh.n, L.filter((l) => l.shape === sh.id).length]);
    $('#main').innerHTML = `<h1>Statistiques</h1><div class="kpis"><div class="card"><b>${L.length}</b><span>demandes reçues</span></div><div class="card"><b>${rate} %</b><span>taux de signature</span></div><div class="card"><b>${mad(ca)}</b><span>chiffre signé</span></div><div class="card"><b>${signed.length ? mad(ca / signed.length) : '—'}</b><span>panier moyen</span></div></div>
      <div class="grid g2"><div class="card"><h3>Demandes par ville</h3>${Object.entries(by).sort((a, b) => b[1] - a[1]).map(([c, n]) => `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:.9rem"><span>${esc(c)}</span><b>${n}</b></div><div class="bar"><i style="width:${n / max * 100}%"></i></div></div>`).join('')}</div>
      <div class="card"><h3>Formes demandées</h3>${shapes.map(([n, c]) => `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:.9rem"><span>${n}</span><b>${c}</b></div><div class="bar"><i style="width:${L.length ? c / L.length * 100 : 0}%"></i></div></div>`).join('')}</div></div>`;
  }

  adminGate('eps_admin', CFG.pin, shell, '/demo/cuisine');
})();
