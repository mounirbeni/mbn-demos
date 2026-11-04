(() => {
  const { $, $$, esc, frDate, toast, modal, close, csv, adminGate } = window.K;
  const { CFG, STATUS, FLOW, prod, db } = window.X;
  const TABS = [['req', 'Demandes de devis'], ['cat', 'Catalogue & prix'], ['stats', 'Pays & chiffres']];
  let tab = 'req', filter = 'all';
  const eur = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;
  const bdg = (s) => `<span class="bdg ${STATUS[s][1]}">${STATUS[s][0]}</span>`;
  const amount = (r) => r.lines.reduce((s, l) => s + (l.price ?? (db.get().prices[l.ref] ?? prod(l.ref).eur)) * l.qty, 0);

  function shell() {
    const n = db.get().requests.filter((r) => r.status === 'new').length;
    $('#root').innerHTML = `<div class="adm"><aside><a class="brand" href="/demo/export"><span class="mark">A</span>Avenir</a>
      ${TABS.map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}${k === 'req' && n ? `<span class="cnt">${n}</span>` : ''}</button>`).join('')}
      <div class="sp">Démo MBN DEV · données locales<br><a href="#" id="reset" style="color:#aaa">Réinitialiser</a></div></aside><main id="main"></main></div>`;
    $$('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; shell(); });
    $('#reset').onclick = (e) => { e.preventDefault(); if (confirm('Remettre les données de démonstration ?')) { db.reset(); shell(); } };
    ({ req: vReq, cat: vCat, stats: vStats })[tab]();
  }

  function vReq() {
    const s = db.get(); const list = s.requests.filter((r) => filter === 'all' || r.status === filter);
    $('#main').innerHTML = `<h1>Demandes de devis</h1><div class="kpis"><div class="card"><b>${s.requests.filter((r) => r.status === 'new').length}</b><span>à traiter</span></div><div class="card"><b>${s.requests.filter((r) => ['quoted', 'samples'].includes(r.status)).length}</b><span>en négociation</span></div><div class="card"><b>${eur(s.requests.filter((r) => ['order', 'shipped'].includes(r.status)).reduce((a, r) => a + amount(r), 0))}</b><span>commandes confirmées</span></div><div class="card"><b>${new Set(s.requests.map((r) => r.country)).size}</b><span>pays clients</span></div></div>
      <div class="toolbar"><select class="field" id="f"><option value="all">Tous les statuts</option>${Object.entries(STATUS).map(([k, [l]]) => `<option value="${k}" ${filter === k ? 'selected' : ''}>${l}</option>`).join('')}</select><span class="sp"></span><button class="btn btn-ghost btn-sm" id="csv">Export CSV</button></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Réf.</th><th>Client</th><th>Pays</th><th>Articles</th><th>Incoterm</th><th>Montant</th><th>Statut</th></tr></thead><tbody>
      ${list.map((r) => `<tr class="click" data-r="${r.id}"><td><b>${r.id}</b><br><span class="muted" style="font-size:.8rem">${frDate(r.created)}</span></td><td>${esc(r.company)}<br><span class="muted" style="font-size:.8rem">${esc(r.contact)}</span></td><td>${esc(r.country)}</td><td>${r.lines.length} réf. · ${r.lines.reduce((a, l) => a + l.qty, 0).toLocaleString('fr-FR')} pcs</td><td>${r.incoterm} ${esc(r.port || '')}</td><td><b>${eur(amount(r))}</b></td><td>${bdg(r.status)}</td></tr>`).join('')}</tbody></table></div>`;
    $('#f').onchange = (e) => { filter = e.target.value; vReq(); };
    $$('[data-r]').forEach((r) => r.onclick = () => detail(r.dataset.r));
    $('#csv').onclick = () => csv('demandes-export.csv', [['Réf', 'Date', 'Société', 'Contact', 'Pays', 'E-mail', 'Incoterm', 'Port', 'Articles', 'Montant EUR', 'Statut'], ...list.map((r) => [r.id, r.created, r.company, r.contact, r.country, r.email, r.incoterm, r.port, r.lines.map((l) => `${l.ref}×${l.qty}`).join(' '), Math.round(amount(r)), STATUS[r.status][0]])]);
  }

  function detail(id) {
    const r = db.get().requests.find((x) => x.id === id); const i = FLOW.indexOf(r.status); const nxt = i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
    const sh = modal(`<h2 style="font-size:1.4rem">${esc(r.company)} ${bdg(r.status)}</h2>
      <dl class="kv"><dt>Référence</dt><dd>${r.id} · ${frDate(r.created)}</dd><dt>Contact</dt><dd>${esc(r.contact)} · ${esc(r.email)} ${r.phone ? '· ' + esc(r.phone) : ''}</dd><dt>Pays</dt><dd>${esc(r.country)}</dd><dt>Livraison</dt><dd>${r.incoterm} ${esc(r.port || '')}${r.date ? ' · avant le ' + frDate(r.date) : ''}</dd><dt>Personnalisation</dt><dd>${esc(r.custom || '—')}</dd><dt>Note</dt><dd>${esc(r.note || '—')}</dd></dl>
      <form id="pf"><div class="tbl-wrap"><table class="tbl" style="min-width:520px"><thead><tr><th>Article</th><th>Qté</th><th>Prix unitaire €</th><th>Total</th></tr></thead><tbody>
      ${r.lines.map((l, k) => { const p = prod(l.ref); const pr = l.price ?? (db.get().prices[l.ref] ?? p.eur); return `<tr><td><b>${l.ref}</b><br><span class="muted" style="font-size:.8rem">${esc(p.fr)}</span></td><td>${l.qty.toLocaleString('fr-FR')}${l.qty < p.moq ? `<br><span class="bdg warn">MOQ ${p.moq}</span>` : ''}</td><td><input class="field" style="width:100px;min-height:36px" type="number" step="0.1" min="0" data-k="${k}" value="${pr}"></td><td>${eur(pr * l.qty)}</td></tr>`; }).join('')}
      </tbody></table></div><p style="text-align:right;margin:10px 0"><b>Total ${r.incoterm} : <span id="tt">${eur(amount(r))}</span></b></p>
      <div class="toolbar"><button class="btn btn-ghost btn-sm" type="submit">Enregistrer les prix</button>${nxt ? `<button class="btn btn-primary btn-sm" type="button" data-to="${nxt}">→ ${STATUS[nxt][0]}</button>` : ''}
      <button class="btn btn-ghost btn-sm" type="button" id="pro">Proforma (CSV)</button>
      <a class="btn btn-ghost btn-sm" href="mailto:${esc(r.email)}?subject=${encodeURIComponent(`Quote ${r.id} — Coopérative Avenir`)}">E-mail</a>
      ${!['lost', 'shipped'].includes(r.status) ? '<button class="btn btn-ghost btn-sm" type="button" data-to="lost" style="color:#b42318">Perdue</button>' : ''}</div></form>`, { wide: true });
    const save = () => db.update((s) => { const x = s.requests.find((y) => y.id === id); $$('[data-k]', sh).forEach((inp) => { x.lines[Number(inp.dataset.k)].price = Number(inp.value) || 0; }); });
    $('#pf', sh).onsubmit = (e) => { e.preventDefault(); save(); toast('Prix enregistrés'); detail(id); };
    $$('[data-to]', sh).forEach((b) => b.onclick = () => { save(); db.update((s) => { s.requests.find((y) => y.id === id).status = b.dataset.to; }); toast(`→ ${STATUS[b.dataset.to][0]}`); close(); shell(); });
    $('#pro', sh).onclick = () => { save(); const x = db.get().requests.find((y) => y.id === id); csv(`proforma-${x.id}.csv`, [['Proforma', x.id], ['Client', x.company], ['Incoterm', `${x.incoterm} ${x.port}`], [], ['Réf', 'Désignation', 'Qté', 'PU EUR', 'Total EUR'], ...x.lines.map((l) => [l.ref, prod(l.ref).en, l.qty, l.price, (l.price * l.qty).toFixed(2)]), [], ['', '', '', 'Total', amount(x).toFixed(2)]]); };
  }

  function vCat() {
    const s = db.get();
    $('#main').innerHTML = `<h1>Catalogue & prix</h1><p class="muted">Les prix indicatifs et la visibilité des références s’appliquent immédiatement au site.</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Référence</th><th>Article</th><th>MOQ</th><th>Prix FOB €</th><th>Visible</th></tr></thead><tbody>
      ${CFG.products.map((p) => `<tr><td><b>${p.ref}</b></td><td>${esc(p.fr)}<br><span class="muted" style="font-size:.8rem">${p.dim} · ${p.box} pcs/carton</span></td><td>${p.moq}</td><td><input class="field" style="width:100px;min-height:36px" type="number" step="0.1" min="0" data-p="${p.ref}" value="${s.prices[p.ref] ?? p.eur}"></td><td><input type="checkbox" data-v="${p.ref}" ${s.off.includes(p.ref) ? '' : 'checked'} style="accent-color:var(--accent);width:18px;height:18px"></td></tr>`).join('')}</tbody></table></div>`;
    $$('[data-p]').forEach((i) => i.onchange = () => { db.update((x) => { x.prices[i.dataset.p] = Number(i.value) || 0; }); toast('Prix mis à jour'); });
    $$('[data-v]').forEach((i) => i.onchange = () => { db.update((x) => { x.off = x.off.filter((r) => r !== i.dataset.v); if (!i.checked) x.off.push(i.dataset.v); }); toast(i.checked ? 'Référence visible' : 'Référence masquée'); });
  }

  function vStats() {
    const s = db.get(); const by = {}; s.requests.forEach((r) => { by[r.country] = by[r.country] || { n: 0, v: 0 }; by[r.country].n++; by[r.country].v += amount(r); });
    const max = Math.max(1, ...Object.values(by).map((x) => x.v));
    const refs = {}; s.requests.forEach((r) => r.lines.forEach((l) => { refs[l.ref] = (refs[l.ref] || 0) + l.qty; })); const mr = Math.max(1, ...Object.values(refs));
    $('#main').innerHTML = `<h1>Pays & chiffres</h1><div class="grid g2"><div class="card"><h3>Demandes par pays (montant)</h3>${Object.entries(by).sort((a, b) => b[1].v - a[1].v).map(([c, x]) => `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:.9rem"><span>${esc(c)} <span class="muted">· ${x.n} demande(s)</span></span><b>${eur(x.v)}</b></div><div class="bar"><i style="width:${x.v / max * 100}%"></i></div></div>`).join('')}</div>
      <div class="card"><h3>Références les plus demandées (pcs)</h3>${Object.entries(refs).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([r, q]) => `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:.9rem"><span>${r} <span class="muted">· ${esc(prod(r).fr)}</span></span><b>${q.toLocaleString('fr-FR')}</b></div><div class="bar"><i style="width:${q / mr * 100}%"></i></div></div>`).join('')}</div></div>`;
  }

  adminGate('avenir_admin', CFG.pin, shell, '/demo/export');
})();
