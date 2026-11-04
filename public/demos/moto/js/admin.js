(() => {
  const { $, $$, esc, mad, uid, today, addDays, diffDays, frDate, toast, modal, close, csv, adminGate } = window.K;
  const { CFG, STATUS, quote, freeUnits, db } = window.M;
  const TABS = [['today', 'Aujourd’hui'], ['bookings', 'Réservations'], ['plan', 'Planning'], ['fleet', 'Flotte & prix'], ['money', 'Revenus'], ['msgs', 'Messages']];
  let tab = 'today', filter = 'all', q = '';
  const veh = (id) => CFG.fleet.find((v) => v.id === id);
  const bdg = (st) => `<span class="bdg ${STATUS[st][1]}">${STATUS[st][0]}</span>`;

  function shell() {
    const s = db.get(); const nNew = s.bookings.filter((b) => b.status === 'new').length;
    $('#root').innerHTML = `<div class="adm"><aside><a class="brand" href="/demo/moto"><span class="mark">TM</span>Tamouda</a>
      ${TABS.map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}${k === 'bookings' && nNew ? `<span class="cnt">${nNew}</span>` : ''}</button>`).join('')}
      <div class="sp">Démo MBN DEV · données locales<br><a href="#" id="reset" style="color:#aaa">Réinitialiser</a></div></aside><main id="main"></main></div>`;
    $$('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; shell(); });
    $('#reset').onclick = (e) => { e.preventDefault(); if (confirm('Remettre les données de démonstration ?')) { db.reset(); shell(); } };
    ({ today: vToday, bookings: vBookings, plan: vPlan, fleet: vFleet, money: vMoney, msgs: vMsgs })[tab]();
  }

  const row = (b) => { const v = veh(b.vid); return `<tr class="click" data-b="${b.id}"><td><b>${b.id}</b><br><span class="muted" style="font-size:.8rem">${frDate(b.created)}</span></td><td>${esc(b.name)}<br><span class="muted" style="font-size:.8rem">${esc(b.phone)} · ${esc(b.country || '—')}</span></td><td>${esc(v.name)}</td><td>${frDate(b.from)} → ${frDate(b.to)}<br><span class="muted" style="font-size:.8rem">${diffDays(b.from, b.to)} j · ${b.time}</span></td><td>${b.delivery ? esc(CFG.zones[b.zone].n) : 'Agence'}</td><td><b>${mad(b.total)}</b>${b.paid >= b.total ? '<br><span class="bdg ok">Payé</span>' : ''}</td><td>${bdg(b.status)}</td></tr>`; };
  const table = (list) => list.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Réf.</th><th>Client</th><th>Véhicule</th><th>Dates</th><th>Remise</th><th>Total</th><th>Statut</th></tr></thead><tbody>${list.map(row).join('')}</tbody></table></div>` : '<div class="card empty">Rien à afficher.</div>';
  const bindRows = () => $$('[data-b]').forEach((r) => r.onclick = () => detail(r.dataset.b));

  function vToday() {
    const s = db.get(); const t = today(); const act = s.bookings.filter((b) => b.status !== 'cancelled');
    const outs = act.filter((b) => b.from === t && ['new', 'confirmed'].includes(b.status));
    const back = act.filter((b) => b.to === t && b.status === 'out');
    const onRoad = act.filter((b) => b.status === 'out').length;
    const units = s.fleet.filter((v) => !v.off).reduce((n, v) => n + v.units, 0);
    const month = t.slice(0, 7); const rev = act.filter((b) => b.from.slice(0, 7) === month && b.status !== 'new').reduce((n, b) => n + b.total, 0);
    $('#main').innerHTML = `<h1>Bonjour 👋</h1><p class="muted">${frDate(t, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      <div class="kpis"><div class="card"><b>${onRoad} / ${units}</b><span>véhicules en location</span></div><div class="card"><b>${s.bookings.filter((b) => b.status === 'new').length}</b><span>demandes à confirmer</span></div><div class="card"><b>${outs.length + back.length}</b><span>remises & retours aujourd’hui</span></div><div class="card"><b>${mad(rev)}</b><span>chiffre du mois</span></div></div>
      <h3>Départs du jour</h3>${table(outs)}<h3 style="margin-top:26px">Retours du jour</h3>${table(back)}
      <h3 style="margin-top:26px">Nouvelles demandes</h3>${table(s.bookings.filter((b) => b.status === 'new'))}`;
    bindRows();
  }

  function vBookings() {
    const s = db.get();
    let list = s.bookings.filter((b) => filter === 'all' || b.status === filter);
    if (q) list = list.filter((b) => `${b.id} ${b.name} ${b.phone} ${b.hotel}`.toLowerCase().includes(q.toLowerCase()));
    list.sort((a, b) => a.from.localeCompare(b.from));
    $('#main').innerHTML = `<h1>Réservations</h1><div class="toolbar"><input class="field" id="q" placeholder="Nom, réf., téléphone…" value="${esc(q)}">
      <select class="field" id="f"><option value="all">Tous les statuts</option>${Object.entries(STATUS).map(([k, [l]]) => `<option value="${k}" ${filter === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <span class="sp"></span><button class="btn btn-ghost btn-sm" id="csv">Export CSV</button><button class="btn btn-primary btn-sm" id="add">+ Réservation au comptoir</button></div>${table(list)}`;
    $('#q').oninput = (e) => { q = e.target.value; vBookings(); const i = $('#q'); i.focus(); i.setSelectionRange(q.length, q.length); };
    $('#f').onchange = (e) => { filter = e.target.value; vBookings(); };
    $('#csv').onclick = () => csv('reservations-tamouda.csv', [['Réf', 'Client', 'Téléphone', 'Pays', 'Véhicule', 'Départ', 'Retour', 'Remise', 'Hôtel', 'Total MAD', 'Payé MAD', 'Statut'], ...list.map((b) => [b.id, b.name, b.phone, b.country, veh(b.vid).name, b.from, b.to, b.delivery ? CFG.zones[b.zone].n : 'Agence', b.hotel, b.total, b.paid, STATUS[b.status][0]])]);
    $('#add').onclick = counter;
    bindRows();
  }

  function detail(id) {
    const s = db.get(); const b = s.bookings.find((x) => x.id === id); const v = veh(b.vid);
    const next = { new: [['confirmed', 'Confirmer']], confirmed: [['out', 'Remettre les clés']], out: [['done', 'Retour effectué']], done: [], cancelled: [['new', 'Réactiver']] }[b.status];
    const sh = modal(`<h2 style="font-size:1.4rem">${b.id} ${bdg(b.status)}</h2>
      <dl class="kv"><dt>Client</dt><dd>${esc(b.name)} · ${esc(b.country || '')}</dd><dt>WhatsApp</dt><dd>${esc(b.phone)}</dd><dt>Véhicule</dt><dd>${esc(v.name)}</dd><dt>Dates</dt><dd>${frDate(b.from)} → ${frDate(b.to)} à ${b.time} (${diffDays(b.from, b.to)} j)</dd>
      <dt>Remise</dt><dd>${b.delivery ? esc(CFG.zones[b.zone].n + (b.hotel ? ' — ' + b.hotel : '')) : 'À l’agence'}</dd><dt>Options</dt><dd>${b.extras.length ? b.extras.map((x) => esc(CFG.extras.find((e) => e.id === x).n)).join(', ') : '—'}</dd>
      <dt>Permis</dt><dd>${esc(b.lic || '—')}</dd><dt>Note</dt><dd>${esc(b.note || '—')}</dd><dt>Total</dt><dd><b>${mad(b.total)}</b> · payé ${mad(b.paid)}</dd><dt>Caution</dt><dd>${mad(CFG.deposit[v.cat])}</dd></dl>
      <div class="toolbar">${next.map(([st, l]) => `<button class="btn btn-primary btn-sm" data-st="${st}">${l}</button>`).join('')}
      ${b.paid < b.total && b.status !== 'cancelled' ? '<button class="btn btn-ghost btn-sm" id="pay">Encaisser le solde</button>' : ''}
      <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://wa.me/${b.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${b.name}, c’est Tamouda Mobility. Votre réservation ${b.id} (${v.name}) du ${frDate(b.from)} est confirmée. Remise à ${b.time}.`)}">WhatsApp</a>
      ${['new', 'confirmed'].includes(b.status) ? '<button class="btn btn-ghost btn-sm" data-st="cancelled" style="color:#b42318">Annuler</button>' : ''}</div>`);
    $$('[data-st]', sh).forEach((btn) => btn.onclick = () => {
      const st = btn.dataset.st;
      if (st === 'confirmed' && freeUnits(db.get(), b.vid, b.from, b.to, b.id) < 1) { toast('Plus d’unité libre sur ces dates.'); return; }
      db.update((x) => { const r = x.bookings.find((y) => y.id === id); r.status = st; if (st === 'done') r.paid = r.total; x.log.unshift({ at: new Date().toISOString(), to: r.phone, msg: { confirmed: `Bonjour ${r.name}, votre réservation ${r.id} est confirmée : ${v.name}, ${frDate(r.from)} à ${r.time}. À bientôt ! Tamouda Mobility`, out: `Bon voyage ${r.name} ! Retour prévu le ${frDate(r.to)}. Assistance WhatsApp : ${CFG.phone}`, done: `Merci ${r.name} pour votre location ! Votre caution est restituée. Un avis Google nous aiderait beaucoup 🙏`, cancelled: `Bonjour ${r.name}, votre réservation ${r.id} est annulée.`, new: `Réservation ${r.id} réactivée.` }[st] }); });
      toast('Statut mis à jour · message WhatsApp préparé'); close(); shell();
    });
    const pay = $('#pay', sh); if (pay) pay.onclick = () => { db.update((x) => { const r = x.bookings.find((y) => y.id === id); r.paid = r.total; }); toast('Paiement enregistré'); close(); shell(); };
  }

  function counter() {
    const sh = modal(`<h2 style="font-size:1.4rem">Réservation au comptoir</h2><form class="form" id="cf">
      <label class="f">Véhicule<select class="field" name="vid">${CFG.fleet.map((v) => `<option value="${v.id}">${esc(v.name)}</option>`).join('')}</select></label>
      <div class="row2"><label class="f">Départ<input class="field" type="date" name="from" value="${today()}" required></label><label class="f">Retour<input class="field" type="date" name="to" value="${addDays(today(), 2)}" required></label></div>
      <div class="row2"><label class="f">Client<input class="field" name="name" required></label><label class="f">Téléphone<input class="field" name="phone" required></label></div>
      <p class="muted" id="cq"></p><button class="btn btn-primary">Enregistrer (confirmée)</button></form>`);
    const f = $('#cf', sh);
    const calc = () => { if (f.to.value <= f.from.value) { $('#cq', sh).textContent = 'Dates invalides'; return null; } const v = { ...veh(f.vid.value), price: db.get().fleet.find((x) => x.id === f.vid.value).price }; const qq = quote(v, f.from.value, f.to.value); const fr = freeUnits(db.get(), f.vid.value, f.from.value, f.to.value); $('#cq', sh).textContent = `${qq.days} j · ${mad(qq.total)} · ${fr ? fr + ' unité(s) libre(s)' : 'COMPLET'}`; return fr ? qq : null; };
    f.oninput = calc; calc();
    f.onsubmit = (e) => { e.preventDefault(); const qq = calc(); if (!qq) return; db.update((s) => s.bookings.unshift({ id: 'TM-' + uid(), vid: f.vid.value, from: f.from.value, to: f.to.value, time: '10:00', name: f.name.value, phone: f.phone.value, country: 'Maroc', status: 'confirmed', delivery: false, zone: 0, hotel: '', extras: [], total: qq.total, paid: 0, created: today(), note: 'Comptoir' })); toast('Réservation ajoutée'); close(); shell(); };
  }

  function vPlan() {
    const s = db.get(); const days = Array.from({ length: 14 }, (_, i) => addDays(today(), i));
    let h = `<div class="plan" style="grid-template-columns:170px repeat(14,1fr)"><div class="c h v">Véhicule</div>${days.map((d) => `<div class="c h">${frDate(d, { weekday: 'narrow', day: 'numeric' })}</div>`).join('')}`;
    CFG.fleet.forEach((v) => {
      const live = s.fleet.find((x) => x.id === v.id);
      for (let u = 0; u < v.units; u++) {
        h += `<div class="c v">${esc(v.name)}${v.units > 1 ? ` #${u + 1}` : ''}</div>`;
        const bs = s.bookings.filter((b) => b.vid === v.id && !['cancelled', 'done'].includes(b.status)).sort((a, b) => a.from.localeCompare(b.from));
        const lanes = [], lane = new Map(); bs.forEach((b) => { let l = lanes.findIndex((end) => end <= b.from); if (l < 0) { lanes.push(b.to); l = lanes.length - 1; } else lanes[l] = b.to; lane.set(b.id, l); });
        days.forEach((d) => {
          const b = bs.find((x) => lane.get(x.id) === u && x.from <= d && d < x.to);
          if (live.off) h += '<div class="c off" title="Maintenance"></div>';
          else h += b ? `<div class="c b ${b.status}" data-b="${b.id}" title="${esc(b.name)}">${d === b.from || d === days[0] ? esc(b.name.split(' ')[0]) : ''}</div>` : '<div class="c"></div>';
        });
      }
    });
    $('#main').innerHTML = `<h1>Planning — 14 jours</h1><p class="muted">Jaune : confirmée · orange : en cours · bleu : à confirmer · hachuré : maintenance. Cliquez une case pour ouvrir la réservation.</p><div class="tbl-wrap" style="padding:2px;background:#eee">${h}</div></div>`;
    $$('[data-b]').forEach((c) => c.onclick = () => detail(c.dataset.b));
  }

  function vFleet() {
    const s = db.get();
    $('#main').innerHTML = `<h1>Flotte & prix</h1><p class="muted">Les prix modifiés ici s’affichent immédiatement sur le site.</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Véhicule</th><th>Catégorie</th><th>Unités</th><th>Prix / jour</th><th>Disponible</th></tr></thead><tbody>
      ${CFG.fleet.map((v) => { const l = s.fleet.find((x) => x.id === v.id); return `<tr><td><b>${esc(v.name)}</b><br><span class="muted" style="font-size:.8rem">${v.cc} cc</span></td><td>${v.cat === 'scooter' ? 'Scooter' : 'Moto'}</td><td>${v.units}</td><td><input class="field" style="width:120px;min-height:38px" type="number" min="50" step="10" value="${l.price}" data-price="${v.id}"> MAD</td><td><label class="check"><input type="checkbox" data-off="${v.id}" ${l.off ? '' : 'checked'}> ${l.off ? 'En maintenance' : 'En service'}</label></td></tr>`; }).join('')}
      </tbody></table></div><p class="muted" style="margin-top:14px">Remises automatiques : ${CFG.discounts.map((d) => `-${d.pct}% dès ${d.from} jours`).join(' · ')}.</p>`;
    $$('[data-price]').forEach((i) => i.onchange = () => { db.update((x) => { x.fleet.find((y) => y.id === i.dataset.price).price = Math.max(50, Number(i.value) || 0); }); toast('Prix mis à jour'); });
    $$('[data-off]').forEach((i) => i.onchange = () => { db.update((x) => { x.fleet.find((y) => y.id === i.dataset.off).off = !i.checked; }); toast(i.checked ? 'Remis en service' : 'Mis en maintenance'); vFleet(); });
  }

  function vMoney() {
    const s = db.get(); const ok = s.bookings.filter((b) => ['confirmed', 'out', 'done'].includes(b.status));
    const byV = CFG.fleet.map((v) => ({ v, n: ok.filter((b) => b.vid === v.id).reduce((a, b) => a + b.total, 0), d: ok.filter((b) => b.vid === v.id).reduce((a, b) => a + diffDays(b.from, b.to), 0) })).sort((a, b) => b.n - a.n);
    const max = Math.max(1, ...byV.map((x) => x.n)); const tot = byV.reduce((a, x) => a + x.n, 0); const cash = ok.reduce((a, b) => a + b.paid, 0);
    $('#main').innerHTML = `<h1>Revenus</h1><div class="kpis"><div class="card"><b>${mad(tot)}</b><span>réservé (confirmé + en cours + terminé)</span></div><div class="card"><b>${mad(cash)}</b><span>encaissé</span></div><div class="card"><b>${mad(tot - cash)}</b><span>reste à encaisser</span></div><div class="card"><b>${ok.length ? mad(tot / ok.length) : '—'}</b><span>panier moyen</span></div></div>
      <div class="card"><h3>Par véhicule</h3>${byV.map((x) => `<div style="margin:12px 0"><div style="display:flex;justify-content:space-between;font-size:.9rem"><span>${esc(x.v.name)} <span class="muted">· ${x.d} j loués</span></span><b>${mad(x.n)}</b></div><div class="bar"><i style="width:${x.n / max * 100}%"></i></div></div>`).join('')}</div>`;
  }

  function vMsgs() {
    const s = db.get();
    $('#main').innerHTML = `<h1>Messages WhatsApp préparés</h1><p class="muted">Chaque étape (demande, confirmation, remise, retour) prépare automatiquement le message au client.</p>
      ${s.log.length ? `<div class="grid">${s.log.slice(0, 30).map((m) => `<div class="card" style="padding:16px"><div class="muted" style="font-size:.8rem">${new Date(m.at).toLocaleString('fr-FR')} · ${esc(m.to)}</div><p style="margin:6px 0 0">${esc(m.msg)}</p></div>`).join('')}</div>` : '<div class="card empty">Aucun message pour l’instant. Confirmez une réservation pour en voir un.</div>'}`;
  }

  adminGate('tamouda_admin', 'moto', CFG.pinHash, shell, '/demo/moto');
})();
