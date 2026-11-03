// Atelier dashboard: sessions and rosters, bookings and payments, one inbox for every client message,
// demand by city, host and group requests, shop orders and gift vouchers, reviews moderation,
// announcements and the log of automatic messages, contacts, settings.
(function () {
  const C = window.ATELIER;
  const S = window.Store;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const FLAG = { MA: '🇲🇦', FR: '🇫🇷', ES: '🇪🇸', BE: '🇧🇪', CA: '🇨🇦', CH: '🇨🇭', GB: '🇬🇧', NL: '🇳🇱', DE: '🇩🇪', IT: '🇮🇹', US: '🇺🇸' };
  const STATUS = { pending: 'En attente', confirmed: 'Confirmée', paid: 'Soldée', waitlist: 'Liste d’attente', cancelled: 'Annulée' };
  const d = (x) => new Date(`${x}T12:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  const ago = (t) => new Date(t).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const fname = (id) => S.format(id).fr.name;
  const waLink = (phone, text) => `https://wa.me/${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  const toast = (m) => { const el = $('#toast'); el.textContent = m; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2400); };
  const LEVEL = { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé', all: 'Tous niveaux' };
  const statusOf = (b) => (b.status !== 'waitlist' && b.status !== 'cancelled' && b.total > 0 && b.paid >= b.total ? 'paid' : b.status);
  let tab = 'home'; let openSession = null; let openContact = null; let bFilter = 'all';

  // ---------- Gate: PIN, on/off and expiry live on the MBN DEV platform (Dashboard → Demo sites) ----------
  const API = 'https://mbndev.ma/api/demos/ceramics';
  let unlocked = false; try { unlocked = sessionStorage.getItem('as_admin') === '1'; } catch { /* ignore */ }
  let cfg = { ok: false };
  async function fetchConfig() {
    try { const r = await fetch(`${API}/config`, { cache: 'no-store' }); if (!r.ok) return { ok: false }; const c = await r.json(); return { ok: true, live: c.live !== false, state: c.state || 'live', pinHint: c.pinHint || null }; } catch { return { ok: false }; }
  }
  async function verifyPin(pin) {
    try {
      const r = await fetch(`${API}/unlock`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
      if (r.ok) return 'ok'; if (r.status === 401) return 'bad'; if (r.status === 429) return 'limited'; if (r.status === 403) return 'unavailable'; return 'offline';
    } catch { return 'offline'; }
  }
  function gate() {
    if (cfg.ok && !cfg.live) {
      $('#root').innerHTML = `<div class="gate"><div class="panel"><div style="width:90px;margin:0 auto">${Art.plate(1, 90)}</div><h1 class="serif" style="font-size:30px;margin:16px 0 6px">${cfg.state === 'expired' ? 'Cette démo a expiré' : 'Cette démo est désactivée'}</h1><p class="muted">Contactez MBN DEV pour obtenir un nouvel accès.</p></div></div>`;
      return;
    }
    $('#root').innerHTML = `<div class="gate"><div class="panel"><div style="width:90px;margin:0 auto">${Art.plate(1, 90)}</div>
      <h1 class="serif" style="font-size:32px;margin:16px 0 4px">Espace atelier</h1><p class="muted">${esc(C.brand.name)}</p>
      <form class="form" id="pin"><input class="field" name="p" inputmode="numeric" autocomplete="off" placeholder="Code PIN" style="text-align:center;font-size:22px;letter-spacing:.3em"><button class="btn btn-primary">Entrer</button><p class="muted" id="err" style="font-size:13px"></p></form>
      ${cfg.ok && cfg.pinHint ? `<p class="muted" style="font-size:12px">Démo : PIN ${esc(cfg.pinHint)}</p>` : ''}<p><a href="/demo/ceramics" class="muted" style="font-size:13px">← Voir le site</a></p></div></div>`;
    $('#pin').onsubmit = async (e) => {
      e.preventDefault(); const btn = $('#pin button'); btn.disabled = true;
      const res = await verifyPin(String(new FormData(e.target).get('p') || '').trim()); btn.disabled = false;
      if (res === 'ok') { try { sessionStorage.setItem('as_admin', '1'); } catch { /* ignore */ } unlocked = true; render(); return; }
      if (res === 'unavailable') { cfg = { ok: true, live: false, state: 'disabled' }; gate(); return; }
      $('#err').textContent = res === 'bad' ? 'Code incorrect.' : res === 'limited' ? 'Trop d’essais. Réessayez dans quelques minutes.' : 'Serveur injoignable. Vérifiez votre connexion.';
    };
  }

  // ---------- Shell ----------
  const unread = () => new Set(S.db.messages.filter((m) => !m.read && m.from === 'client').map((m) => m.contact)).size;
  const tabs = () => [['home', 'Tableau de bord'], ['sessions', 'Sessions'], ['bookings', 'Réservations'], ['inbox', 'Messages', unread()], ['demand', 'Demandes', S.db.hosts.filter((h) => h.status === 'new').length + S.db.groups.filter((g) => g.status === 'new').length], ['sales', 'Boutique & cadeaux', S.db.orders.filter((o) => o.status === 'new').length], ['reviews', 'Avis', S.db.reviews.filter((r) => r.status === 'pending').length], ['comms', 'Communication'], ['contacts', 'Participants'], ['payments', 'Paiements'], ['settings', 'Réglages']];
  function render() {
    if (!unlocked) return gate();
    const views = { home, sessions, bookings, inbox, demand, sales, reviews, comms, contacts, payments, settings };
    $('#root').innerHTML = `<div class="dash"><aside class="side-nav"><a class="logo" href="/demo/ceramics" style="padding:6px 8px 20px"><span class="mark" style="width:36px">${Art.plate(3, 36)}</span><span><b>${esc(C.brand.name)}</b><small>Espace atelier</small></span></a>
      ${tabs().map(([k, l, n]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}${n ? `<span class="count">${n}</span>` : ''}</button>`).join('')}
      <div class="bottom"><a href="/demo/ceramics" target="_blank">Voir le site public ↗</a><span>Démo MBN DEV · données dans ce navigateur</span></div></aside>
      <div><nav class="mobile-tabs">${tabs().map(([k, l, n]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}${n ? ` · ${n}` : ''}</button>`).join('')}</nav>
      <main class="main">${views[tab]()}</main></div></div>`;
    document.querySelectorAll('[data-tab]').forEach((b) => { b.onclick = () => { tab = b.dataset.tab; openSession = null; openContact = null; render(); window.scrollTo(0, 0); }; });
    bind();
  }

  // ---------- Views ----------
  function home() {
    const today = S.today();
    const month = today.slice(0, 7);
    const revenue = S.db.payments.filter((p) => new Date(p.at).toISOString().slice(0, 7) === month).reduce((s, p) => s + (p.currency === 'EUR' ? p.amount * C.eurToMad : p.amount), 0);
    const up = S.db.sessions.filter((s) => s.start >= today && s.status === 'open');
    const seats = up.reduce((n, s) => n + s.capacity, 0); const taken = up.reduce((n, s) => n + S.seatsTaken(s), 0);
    const due = S.db.bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'waitlist').reduce((n, b) => n + Math.max(0, b.total - b.paid) * (b.currency === 'EUR' ? C.eurToMad : 1), 0);
    const recent = S.db.bookings.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
    const msgs = S.db.messages.filter((m) => m.from === 'client' && !m.read).slice(0, 4);
    return `<p class="muted" style="margin:0">Bonjour,</p><h1>${esc(C.brand.name)}</h1>
      <div class="kpis"><div class="kpi"><span>Encaissé ce mois</span><b>${S.fmt(revenue, 'MAD')}</b></div><div class="kpi"><span>Taux de remplissage</span><b>${seats ? Math.round((taken / seats) * 100) : 0} %</b></div>
      <div class="kpi"><span>Prochaines sessions</span><b>${up.length}</b></div><div class="kpi"><span>Soldes à encaisser</span><b>${S.fmt(due, 'MAD')}</b></div></div>
      <div class="grid2"><div class="card"><h2>Prochaines sessions</h2>${up.slice(0, 6).map((s) => `<div class="row-flex" style="padding:10px 0;border-bottom:1px solid #f1ebe1;cursor:pointer" data-session="${s.id}">
        <div style="flex:1;min-width:180px"><b>${esc(fname(s.format))}</b><div class="muted" style="font-size:13px">${FLAG[s.country] || ''} ${esc(s.city)} · ${d(s.start)}</div></div>
        <div style="width:140px"><div class="bar"><i style="width:${Math.round((S.seatsTaken(s) / s.capacity) * 100)}%"></i></div><div class="muted" style="font-size:12px;margin-top:4px">${S.seatsTaken(s)} / ${s.capacity} places</div></div></div>`).join('')}</div>
      <div style="display:grid;gap:14px"><div class="card"><h2>Messages non lus</h2>${msgs.length ? msgs.map((m) => `<div style="padding:8px 0;border-bottom:1px solid #f1ebe1;cursor:pointer" data-contact="${esc(m.contact)}"><b>${esc(m.name)}</b><div class="muted" style="font-size:13px">${esc(m.text.slice(0, 90))}</div></div>`).join('') : '<p class="muted">Tout est lu.</p>'}</div>
      <div class="card"><h2>Dernières réservations</h2>${recent.map((b) => `<div class="row-flex" style="padding:6px 0;font-size:14px"><b style="flex:1">${esc(b.name)}</b><span class="muted">${esc(S.session(b.sessionId)?.city || '')}</span><span class="st ${statusOf(b)}">${STATUS[statusOf(b)]}</span></div>`).join('')}</div></div></div>`;
  }

  function sessions() {
    if (openSession) return roster(S.session(openSession));
    const today = S.today();
    return `<div class="row-flex" style="justify-content:space-between"><h1>Sessions</h1><button class="btn btn-primary" id="newSession">+ Nouvelle session</button></div>
      <div class="card table-wrap" style="margin-top:20px"><table><thead><tr><th>Date</th><th>Formation</th><th>Lieu</th><th>Places</th><th>Prix</th><th>Statut</th><th></th></tr></thead><tbody>
      ${S.db.sessions.map((s) => { const p = S.priceOf(s); const past = S.endOf(s) < today; return `<tr style="${past ? 'opacity:.55' : ''}"><td>${d(s.start)}</td><td><b>${esc(fname(s.format))}</b><div class="muted" style="font-size:12px">${S.format(s.format).days} j · ${esc(s.lang)}</div></td>
        <td>${FLAG[s.country] || ''} ${esc(s.city)}<div class="muted" style="font-size:12px">${esc(s.venue)}</div></td><td style="min-width:110px"><div class="bar"><i style="width:${Math.round((S.seatsTaken(s) / s.capacity) * 100)}%"></i></div><span class="muted" style="font-size:12px">${S.seatsTaken(s)} / ${s.capacity}</span></td>
        <td>${S.fmt(p.amount, p.currency)}</td><td>${past ? '<span class="st cancelled">Terminée</span>' : s.status === 'open' ? '<span class="st confirmed">Ouverte</span>' : '<span class="st cancelled">Fermée</span>'}</td>
        <td><button class="btn btn-ghost btn-sm" data-session="${s.id}">Participants</button></td></tr>`; }).join('')}</tbody></table></div>`;
  }

  function roster(s) {
    const list = S.db.bookings.filter((b) => b.sessionId === s.id);
    const ins = list.filter((b) => b.status !== 'waitlist' && b.status !== 'cancelled'); const wait = list.filter((b) => b.status === 'waitlist');
    const allPhones = ins.map((b) => b.phone);
    return `<button class="btn btn-ghost btn-sm" id="backS">← Sessions</button>
      <div class="row-flex" style="justify-content:space-between;margin-top:14px"><div><h1>${esc(fname(s.format))}</h1><p class="muted" style="margin:4px 0 0">${FLAG[s.country] || ''} ${esc(s.city)} · ${esc(s.venue)} · ${d(s.start)} → ${d(S.endOf(s))}</p></div>
      <div class="row-flex"><button class="btn btn-ghost btn-sm" id="editS">Modifier</button><button class="btn btn-ghost btn-sm" id="csv">Exporter CSV</button><button class="btn btn-ghost btn-sm" id="toggleS">${s.status === 'open' ? 'Fermer les inscriptions' : 'Rouvrir'}</button></div></div>
      <div class="kpis"><div class="kpi"><span>Inscrits</span><b>${S.seatsTaken(s)} / ${s.capacity}</b></div><div class="kpi"><span>Liste d’attente</span><b>${wait.reduce((n, b) => n + b.seats, 0)}</b></div>
      <div class="kpi"><span>Encaissé</span><b>${S.fmt(ins.reduce((n, b) => n + b.paid, 0), S.priceOf(s).currency)}</b></div><div class="kpi"><span>Reste à encaisser</span><b>${S.fmt(ins.reduce((n, b) => n + b.total - b.paid, 0), S.priceOf(s).currency)}</b></div></div>
      <div class="card"><div class="row-flex" style="justify-content:space-between"><h2 style="margin:0">Participants</h2><button class="btn btn-wa btn-sm" id="remind">Rappel WhatsApp à tous (${allPhones.length})</button></div>
      <div class="table-wrap"><table style="margin-top:10px"><thead><tr><th>Présent</th><th>Nom</th><th>Pers.</th><th>Niveau</th><th>Payé</th><th>Statut</th><th></th></tr></thead><tbody>
      ${ins.map((b) => `<tr><td><input type="checkbox" data-attend="${b.id}" ${b.attended ? 'checked' : ''}></td><td><b>${esc(b.name)}</b><div class="muted" style="font-size:12px">${FLAG[b.country] || ''} ${esc(b.phone)} · ${esc(b.ref)}</div></td><td>${b.seats}</td><td>${LEVEL[b.level] || esc(b.level)}</td>
        <td>${S.fmt(b.paid, b.currency)} / ${S.fmt(b.total, b.currency)}</td><td><span class="st ${statusOf(b)}">${STATUS[statusOf(b)]}</span></td><td><button class="btn btn-ghost btn-sm" data-booking="${b.id}">Ouvrir</button></td></tr>`).join('') || '<tr><td colspan="7" class="muted">Aucun inscrit pour l’instant.</td></tr>'}</tbody></table></div></div>
      ${wait.length ? `<div class="card" style="margin-top:14px"><h2>Liste d’attente</h2>${wait.map((b) => `<div class="row-flex" style="padding:8px 0"><b style="flex:1">${esc(b.name)} · ${b.seats} pers.</b><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${waLink(b.phone, `Bonjour ${b.name.split(' ')[0]}, une place s’est libérée pour ${fname(s.format)} à ${s.city} (${d(s.start)}). Souhaitez-vous la prendre ?`)}">Proposer la place</a><button class="btn btn-primary btn-sm" data-promote="${b.id}">Inscrire</button></div>`).join('')}</div>` : ''}`;
  }

  function bookings() {
    const rows = S.db.bookings.filter((b) => bFilter === 'all' || statusOf(b) === bFilter).slice().sort((a, b) => b.createdAt - a.createdAt);
    return `<h1>Réservations</h1><div class="toolbar">${[['all', 'Toutes'], ...Object.entries(STATUS)].map(([k, l]) => `<button class="chip ${bFilter === k ? 'on' : ''}" data-bf="${k}">${l}</button>`).join('')}
      <button class="btn btn-primary btn-sm" id="manual" style="margin-left:auto">+ Réservation manuelle</button></div>
      <div class="card table-wrap"><table><thead><tr><th>Réf.</th><th>Participant</th><th>Session</th><th>Source</th><th>Payé / total</th><th>Statut</th><th></th></tr></thead><tbody>
      ${rows.map((b) => { const s = S.session(b.sessionId); return `<tr><td>${esc(b.ref)}</td><td><b>${esc(b.name)}</b><div class="muted" style="font-size:12px">${FLAG[b.country] || ''} ${esc(b.phone)}</div></td>
        <td>${esc(fname(s.format))}<div class="muted" style="font-size:12px">${esc(s.city)} · ${d(s.start)}</div></td><td>${esc(b.source)}</td><td>${S.fmt(b.paid, b.currency)} / ${S.fmt(b.total, b.currency)}</td>
        <td><span class="st ${statusOf(b)}">${STATUS[statusOf(b)]}</span></td><td><button class="btn btn-ghost btn-sm" data-booking="${b.id}">Ouvrir</button></td></tr>`; }).join('')}</tbody></table></div>`;
  }

  function inbox() {
    const by = new Map();
    S.db.messages.slice().sort((a, b) => b.at - a.at).forEach((m) => { if (!by.has(m.contact)) by.set(m.contact, []); by.get(m.contact).push(m); });
    const contacts = [...by.entries()];
    const cur = openContact || contacts[0]?.[0];
    const thread = (by.get(cur) || []).slice().reverse();
    const who = thread.find((m) => m.from === 'client') || thread[0];
    const isPhone = /^\+?\d[\d\s]{6,}$/.test(cur || '');
    const quick = ['Bonjour, merci pour votre message ! Voici les prochaines dates : ', 'Il reste des places, je vous envoie le lien de réservation.', 'Tout le matériel est fourni, il suffit d’une tenue qui ne craint pas la terre.'];
    return `<h1>Messages</h1><p class="muted">Formulaire de contact, espace participant et demandes : tout arrive ici.</p>
      <div class="grid2" style="margin-top:18px"><div class="card" style="padding:8px">${contacts.map(([c, ms]) => { const n = ms.filter((m) => !m.read && m.from === 'client').length; const name = (ms.find((m) => m.from === 'client') || ms[0]).name; return `<div class="row-flex" style="padding:12px;border-radius:14px;cursor:pointer;${c === cur ? 'background:#f4efe6' : ''}" data-contact="${esc(c)}">
        <div style="flex:1;min-width:0"><b>${esc(name)}</b><div class="muted" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(ms[0].text)}</div></div>${n ? `<span class="count" style="background:var(--clay);color:#fff;border-radius:99px;padding:2px 8px;font-size:11px">${n}</span>` : ''}</div>`; }).join('') || '<p class="muted">Aucun message.</p>'}</div>
      <div class="card">${who ? `<div class="row-flex" style="justify-content:space-between"><div><b>${esc(who.name)}</b><div class="muted" style="font-size:12px">${esc(cur)}${who.ref ? ` · ${esc(who.ref)}` : ''}</div></div>
        ${isPhone ? `<a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${waLink(cur, `Bonjour ${who.name.split(' ')[0]}, `)}">WhatsApp</a>` : `<a class="btn btn-ghost btn-sm" href="mailto:${esc(cur)}">Email</a>`}</div>
        <div class="thread" style="margin-top:12px">${thread.map((m) => `<div class="bubble ${m.from === 'atelier' ? 'me' : ''}">${esc(m.text)}<small>${ago(m.at)}</small></div>`).join('')}</div>
        <div class="row-flex" style="margin-top:10px">${quick.map((q, i) => `<button class="chip" data-quick="${i}">${esc(q.slice(0, 28))}…</button>`).join('')}</div>
        <form class="row-flex" id="reply" style="margin-top:10px;flex-wrap:nowrap"><input class="field" name="t" required placeholder="Répondre…"><button class="btn btn-primary">Envoyer</button></form>` : ''}</div></div>`;
  }

  function demand() {
    const counts = {}; S.db.interests.forEach((i) => { const k = `${i.city}|${i.country}`; counts[k] = (counts[k] || 0) + 1; });
    const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]); const max = rows[0]?.[1] || 1;
    return `<h1>Demandes</h1><p class="muted">Où programmer la prochaine session : les personnes qui veulent être prévenues, par ville.</p>
      <div class="grid2" style="margin-top:18px"><div class="card"><h2>Intérêt par ville</h2><div class="cities">${rows.map(([k, n]) => { const [city, country] = k.split('|'); return `<div class="c"><b>${FLAG[country] || ''} ${esc(city)}</b><div class="bar"><i style="width:${Math.round((n / max) * 100)}%;background:var(--cobalt)"></i></div><b>${n}</b>
        <button class="btn btn-ghost btn-sm" data-plan="${esc(city)}|${esc(country)}">Programmer</button></div>`; }).join('')}</div></div>
      <div class="card"><h2>Organisateurs (accueillir un atelier)</h2>${S.db.hosts.map((h) => `<div style="padding:12px 0;border-bottom:1px solid #f1ebe1"><div class="row-flex"><b style="flex:1">${esc(h.org)}</b><span class="st ${h.status}">${{ new: 'Nouveau', contacted: 'Contacté', done: 'Planifié' }[h.status]}</span></div>
        <div class="muted" style="font-size:13px">${FLAG[h.country] || ''} ${esc(h.city)} · ${h.people || '?'} pers. · ${esc(h.period || '')} · ${esc(h.contact)}</div>${h.note ? `<p style="font-size:14px;margin:6px 0">${esc(h.note)}</p>` : ''}
        <div class="row-flex"><button class="btn btn-ghost btn-sm" data-host="${h.id}|contacted">Marquer contacté</button><button class="btn btn-ghost btn-sm" data-host="${h.id}|done">Session planifiée</button></div></div>`).join('') || '<p class="muted">Aucune demande.</p>'}</div></div>
      <div class="card" style="margin-top:14px"><h2>Groupes et entreprises (atelier privé)</h2>${S.db.groups.map((g) => `<div style="padding:12px 0;border-bottom:1px solid #f1ebe1"><div class="row-flex"><b style="flex:1">${esc(g.org)}</b><span class="muted" style="font-size:12px">${esc(GKIND[g.kind] || g.kind || '')}</span><span class="st ${g.status}">${{ new: 'Nouveau', contacted: 'Devis envoyé', done: 'Confirmé' }[g.status]}</span></div>
        <div class="muted" style="font-size:13px">${esc(g.city || '')} · ${g.people || '?'} pers. · ${g.date ? d(g.date) : ''}${g.budget ? ` · budget ${esc(g.budget)}` : ''} · ${esc(g.contact)}</div>${g.note ? `<p style="font-size:14px;margin:6px 0">${esc(g.note)}</p>` : ''}
        <div class="row-flex">${contactBtn(g.contact, `Bonjour, merci pour votre demande d’atelier privé pour ${g.people || ''} personnes. Voici notre proposition : `)}<button class="btn btn-ghost btn-sm" data-group="${g.id}|contacted">Devis envoyé</button><button class="btn btn-ghost btn-sm" data-group="${g.id}|done">Confirmé</button></div></div>`).join('') || '<p class="muted">Aucune demande de groupe.</p>'}</div>`;
  }


  const GKIND = { company: 'Entreprise', school: 'École', friends: 'Amis / fête', association: 'Association', other: 'Autre' };
  const isPhoneish = (c) => /^\+?\d[\d\s]{6,}$/.test(String(c || '').trim());
  const contactBtn = (c, text) => (isPhoneish(c) ? `<a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${waLink(c, text)}">WhatsApp</a>` : `<a class="btn btn-ghost btn-sm" href="mailto:${esc(c)}?body=${encodeURIComponent(text)}">Email</a>`);
  const OSTATUS = { new: 'Nouvelle', paid: 'Payée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' };
  function sales() {
    const vSold = S.db.vouchers.reduce((n, v) => n + v.amount, 0); const vLeft = S.db.vouchers.reduce((n, v) => n + v.balance, 0);
    const oTot = S.db.orders.filter((o) => o.status !== 'cancelled').reduce((n, o) => n + o.total, 0);
    return `<h1>Boutique & bons cadeaux</h1><div class="kpis"><div class="kpi"><span>Bons vendus</span><b>${S.fmt(vSold, 'MAD')}</b></div><div class="kpi"><span>Bons non utilisés</span><b>${S.fmt(vLeft, 'MAD')}</b></div>
      <div class="kpi"><span>Commandes</span><b>${S.db.orders.length}</b></div><div class="kpi"><span>Ventes boutique</span><b>${S.fmt(oTot, 'MAD')}</b></div></div>
      <div class="card table-wrap"><h2>Commandes de la boutique</h2><table><thead><tr><th>Réf.</th><th>Client</th><th>Pièces</th><th>Livraison</th><th>Total</th><th>Statut</th><th></th></tr></thead><tbody>
      ${S.db.orders.map((o) => `<tr><td>${esc(o.ref)}<div class="muted" style="font-size:12px">${ago(o.at)}</div></td><td><b>${esc(o.name)}</b><div class="muted" style="font-size:12px">${esc(o.contact)}</div></td>
        <td>${o.items.map((it) => `${esc(C.pieces.find((p) => p.id === it.id)?.fr || it.id)} × ${it.qty}`).join('<br>')}</td><td>${o.delivery === 'pickup' ? 'Retrait atelier' : o.delivery === 'morocco' ? 'Maroc' : 'International'}<div class="muted" style="font-size:12px">${esc(o.address || '')}</div></td>
        <td><b>${S.fmt(o.total, 'MAD')}</b></td><td><select class="field" data-order="${o.id}" style="padding:6px 10px;font-size:13px">${Object.entries(OSTATUS).map(([k, l]) => `<option value="${k}" ${o.status === k ? 'selected' : ''}>${l}</option>`).join('')}</select></td>
        <td>${contactBtn(o.contact, `Bonjour ${o.name.split(' ')[0]}, merci pour votre commande ${o.ref} (${S.fmt(o.total, 'MAD')}). `)}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">Aucune commande.</td></tr>'}</tbody></table></div>
      <div class="card table-wrap" style="margin-top:14px"><h2>Bons cadeaux</h2><table><thead><tr><th>Code</th><th>De → Pour</th><th>Montant</th><th>Reste</th><th>Acheté le</th><th>Statut</th></tr></thead><tbody>
      ${S.db.vouchers.map((v) => `<tr><td><b>${esc(v.code)}</b></td><td>${esc(v.buyer)} → ${esc(v.to)}<div class="muted" style="font-size:12px">${esc(v.contact || '')}</div></td><td>${S.fmt(v.amount, 'MAD')}</td><td>${S.fmt(v.balance, 'MAD')}</td><td>${ago(v.at)}</td>
        <td><span class="st ${v.balance > 0 ? 'active' : 'used'}">${v.balance <= 0 ? 'Utilisé' : v.balance < v.amount ? 'Partiel' : 'Actif'}</span></td></tr>`).join('') || '<tr><td colspan="6" class="muted">Aucun bon.</td></tr>'}</tbody></table></div>`;
  }
  function reviews() {
    const RS = { pending: 'À valider', approved: 'Publié', hidden: 'Masqué' };
    const list = S.db.reviews.slice().sort((a, b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1) || b.at - a.at);
    return `<h1>Avis</h1><p class="muted">Les participants laissent un avis depuis leur espace après la session. Rien n’apparaît sur le site avant votre validation.</p>
      <div style="display:grid;gap:12px;margin-top:18px">${list.map((r) => `<div class="card"><div class="row-flex"><b style="flex:1">${esc(r.name)} <span class="stars">${'★'.repeat(r.rating)}</span></b><span class="muted" style="font-size:12px">${esc(r.bookingRef)} · ${ago(r.at)}</span><span class="st ${r.status === 'pending' ? 'new' : r.status}">${RS[r.status]}</span></div>
        <p style="margin:10px 0">${esc(r.text)}</p><div class="row-flex">${r.status !== 'approved' ? `<button class="btn btn-primary btn-sm" data-review="${r.id}|approved">Publier sur le site</button>` : ''}${r.status !== 'hidden' ? `<button class="btn btn-ghost btn-sm" data-review="${r.id}|hidden">Masquer</button>` : ''}</div></div>`).join('') || '<p class="muted">Aucun avis pour l’instant.</p>'}</div>`;
  }
  const KIND = { confirmation: 'Confirmation', waitlist: 'Liste d’attente', reminder: 'Rappel', voucher: 'Bon cadeau', order: 'Commande', broadcast: 'Annonce', balance: 'Solde' };
  function comms() {
    const cities = [...new Set(S.db.interests.map((i) => `${i.city}|${i.country}`))];
    const ups = S.db.sessions.filter((s) => s.start >= S.today());
    return `<h1>Communication</h1><p class="muted">Les messages automatiques (confirmation, rappel la veille, liste d’attente, bon cadeau, commande) et vos annonces groupées.</p>
      <div class="grid2" style="margin-top:18px"><div class="card"><h2>Envoyer une annonce</h2><form class="form" id="bc">
        <label class="lbl">Destinataires<select class="field" name="target">${cities.map((c) => { const [city, country] = c.split('|'); const n = S.db.interests.filter((i) => i.city === city).length; return `<option value="city:${esc(c)}">${FLAG[country] || ''} Intéressés à ${esc(city)} (${n})</option>`; }).join('')}
          ${ups.map((s) => `<option value="session:${s.id}">Participants · ${esc(fname(s.format))} · ${esc(s.city)} ${d(s.start)}</option>`).join('')}<option value="all">Tous les participants</option></select></label>
        <textarea class="field" name="text" rows="4" required>Bonne nouvelle : une session est programmée près de chez vous ! Les places sont limitées, réservez ici : mbndev-demos.vercel.app/demo/ceramics</textarea>
        <button class="btn btn-primary">Envoyer (email + WhatsApp)</button><p class="muted" style="font-size:12px;margin:0">Démo : l’envoi est simulé et enregistré dans le journal. En production : emails automatiques et WhatsApp Business.</p></form></div>
      <div class="card"><h2>Journal des envois (${S.db.outbox.length})</h2><div class="outbox">${S.db.outbox.slice(0, 40).map((o) => `<div class="o"><span class="st confirmed">${KIND[o.kind] || esc(o.kind)}</span><div><b>${esc(o.to)}</b><div class="muted">${esc(o.text)}</div></div><span class="muted" style="font-size:11px;white-space:nowrap">${ago(o.at)}</span></div>`).join('') || '<p class="muted">Rien pour l’instant.</p>'}</div></div></div>`;
  }

  function contacts() {
    const map = new Map();
    S.db.bookings.forEach((b) => { const k = b.phone; const c = map.get(k) || { name: b.name, phone: b.phone, email: b.email, country: b.country, n: 0, spent: 0, last: '' }; c.n += 1; c.spent += b.paid * (b.currency === 'EUR' ? C.eurToMad : 1); const s = S.session(b.sessionId); if (s && s.start > c.last) c.last = s.start; map.set(k, c); });
    const list = [...map.values()].sort((a, b) => b.spent - a.spent);
    return `<div class="row-flex" style="justify-content:space-between"><h1>Participants</h1><button class="btn btn-ghost btn-sm" id="csvAll">Exporter CSV</button></div>
      <div class="card table-wrap" style="margin-top:18px"><table><thead><tr><th>Nom</th><th>Pays</th><th>Réservations</th><th>Dépensé</th><th>Dernière session</th><th></th></tr></thead><tbody>
      ${list.map((c) => `<tr><td><b>${esc(c.name)}</b><div class="muted" style="font-size:12px">${esc(c.email)} · ${esc(c.phone)}</div></td><td>${FLAG[c.country] || ''} ${esc(c.country)}</td><td>${c.n}</td><td>${S.fmt(c.spent, 'MAD')}</td><td>${c.last ? d(c.last) : ''}</td>
        <td><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${waLink(c.phone, `Bonjour ${c.name.split(' ')[0]}, `)}">WhatsApp</a></td></tr>`).join('')}</tbody></table></div>`;
  }

  function payments() {
    const tot = (cur) => S.db.payments.filter((p) => p.currency === cur).reduce((s, p) => s + p.amount, 0);
    return `<h1>Paiements</h1><div class="kpis"><div class="kpi"><span>Total encaissé (DH)</span><b>${S.fmt(tot('MAD'), 'MAD')}</b></div><div class="kpi"><span>Total encaissé (€)</span><b>${S.fmt(tot('EUR'), 'EUR')}</b></div>
      <div class="kpi"><span>Paiements</span><b>${S.db.payments.length}</b></div><div class="kpi"><span>Acompte demandé</span><b>${C.depositPct} %</b></div></div>
      <div class="card table-wrap"><table><thead><tr><th>Date</th><th>Réf.</th><th>Participant</th><th>Moyen</th><th>Montant</th></tr></thead><tbody>
      ${S.db.payments.slice().sort((a, b) => b.at - a.at).map((p) => { const b = S.db.bookings.find((x) => x.ref === p.bookingRef); return `<tr><td>${ago(p.at)}</td><td>${esc(p.bookingRef)}</td><td>${esc(b?.name || '')}</td><td>${{ card: 'Carte', transfer: 'Virement', cash: 'Espèces', voucher: 'Bon cadeau', paypal: 'PayPal' }[p.method] || esc(p.method)}</td><td><b>${S.fmt(p.amount, p.currency)}</b></td></tr>`; }).join('')}</tbody></table></div>`;
  }

  function settings() {
    return `<h1>Réglages</h1><div class="grid2" style="margin-top:18px"><div class="card"><h2>Atelier</h2>
      <p class="muted" style="font-size:14px">Dans la version finale, ces informations se modifient ici. Dans la démo, elles viennent du fichier <code>js/config.js</code>.</p>
      <div class="summary"><div><span>Nom</span><b>${esc(C.brand.name)}</b></div><div><span>WhatsApp</span><b>+${esc(C.brand.whatsapp)}</b></div><div><span>Email</span><b>${esc(C.brand.email)}</b></div><div><span>Acompte</span><b>${C.depositPct} %</b></div><div><span>Taux € → DH</span><b>${C.eurToMad}</b></div></div></div>
      <div class="card"><h2>Formations et tarifs</h2>${C.formats.map((f) => `<div class="row-flex" style="padding:8px 0;border-bottom:1px solid #f1ebe1"><b style="flex:1">${esc(f.fr.name)}</b><span class="muted">${f.days} j</span><span>${S.fmt(f.priceMAD, 'MAD')} · ${S.fmt(f.priceEUR, 'EUR')}</span></div>`).join('')}
      <button class="btn btn-ghost btn-sm" id="reset" style="margin-top:16px">Réinitialiser les données de démo</button></div></div>`;
  }

  // ---------- Sheets ----------
  const modal = $('#modal');
  const sheet = (html) => { $('#sheet').innerHTML = `<button class="x" aria-label="Fermer">×</button>${html}`; modal.classList.add('open'); $('#sheet .x').onclick = () => modal.classList.remove('open'); };
  modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };

  function bookingSheet(id) {
    const b = S.db.bookings.find((x) => x.id === id); const s = S.session(b.sessionId); const bal = b.total - b.paid;
    const others = S.db.bookings.length && S.db.sessions.filter((x) => x.format === s.format && x.id !== s.id && x.start >= S.today());
    sheet(`<p class="eyebrow">${esc(b.ref)} · ${esc(b.source)}</p><h2 class="serif" style="font-size:30px;margin:6px 0">${esc(b.name)}</h2>
      <p class="muted" style="margin:0">${FLAG[b.country] || ''} ${esc(b.phone)} · ${esc(b.email)}</p>
      <div class="summary" style="margin-top:16px"><div><span>Session</span><b>${esc(fname(s.format))} · ${esc(s.city)} · ${d(s.start)}</b></div><div><span>Personnes</span><b>${b.seats}</b></div><div><span>Niveau</span><b>${LEVEL[b.level] || esc(b.level)}</b></div>
      <div><span>Total</span><b>${S.fmt(b.total, b.currency)}</b></div><div><span>Payé</span><b>${S.fmt(b.paid, b.currency)}</b></div><div><span>Reste</span><b>${S.fmt(Math.max(0, bal), b.currency)}</b></div></div>
      ${b.notes ? `<p style="background:#fff;border-radius:14px;padding:12px;font-size:14px">${esc(b.notes)}</p>` : ''}
      <p style="margin:16px 0 8px"><span class="st ${statusOf(b)}">${STATUS[statusOf(b)]}</span></p>
      <div style="display:grid;gap:8px">${bal > 0 && b.status !== 'waitlist' ? `<button class="btn btn-primary" id="cash">Encaisser le solde (${S.fmt(bal, b.currency)})</button>` : ''}
      <a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(b.phone, `Bonjour ${b.name.split(' ')[0]}, c’est ${C.brand.name}. Votre réservation ${b.ref} pour ${fname(s.format)} à ${s.city} le ${d(s.start)} est bien confirmée.${bal > 0 ? ` Il reste ${S.fmt(bal, b.currency)} à régler.` : ''}`)}">Envoyer la confirmation WhatsApp</a>
      ${others.length && b.status !== 'cancelled' ? `<select class="field" id="move"><option value="">Déplacer vers une autre date…</option>${others.map((o) => `<option value="${o.id}">${esc(o.city)} · ${d(o.start)} (${S.seatsLeft(o)} places)</option>`).join('')}</select>` : ''}
      ${b.status !== 'cancelled' ? '<button class="btn btn-ghost" id="cancelB">Annuler la réservation</button>' : ''}</div>`);
    if ($('#cash')) $('#cash').onclick = () => { S.pay(b.ref, bal, 'cash'); toast('Paiement enregistré'); bookingSheet(id); render(); };
    if ($('#move')) $('#move').onchange = (e) => { if (!e.target.value) return; const o = S.session(e.target.value); if (S.seatsLeft(o) < b.seats) { toast('Pas assez de places'); return; } b.sessionId = o.id; S.setStatus(b.id, b.status); toast('Réservation déplacée'); bookingSheet(id); render(); };
    if ($('#cancelB')) $('#cancelB').onclick = () => { if (confirm('Annuler cette réservation ?')) { S.setStatus(b.id, 'cancelled'); modal.classList.remove('open'); render(); } };
  }

  function sessionSheet(s = {}) {
    const cities = ['Safi', 'Marrakech', 'Essaouira', 'Casablanca', 'Rabat', 'Paris', 'Lyon', 'Barcelona', 'Madrid', 'Bruxelles', 'Genève', 'Montréal', 'Londres', 'Amsterdam'];
    const cc = { Safi: 'MA', Marrakech: 'MA', Essaouira: 'MA', Casablanca: 'MA', Rabat: 'MA', Paris: 'FR', Lyon: 'FR', Barcelona: 'ES', Madrid: 'ES', Bruxelles: 'BE', 'Genève': 'CH', 'Montréal': 'CA', Londres: 'GB', Amsterdam: 'NL' };
    sheet(`<h2 class="serif" style="font-size:30px;margin:0 0 14px">${s.id ? 'Modifier la session' : 'Nouvelle session'}</h2><form class="form" id="sf">
      <label class="lbl">Formation<select class="field" name="format">${C.formats.map((f) => `<option value="${f.id}" ${s.format === f.id ? 'selected' : ''}>${esc(f.fr.name)}</option>`).join('')}</select></label>
      <div class="two"><label class="lbl">Ville<input class="field" name="city" list="cl" required value="${esc(s.city || '')}"><datalist id="cl">${cities.map((c) => `<option value="${c}">`).join('')}</datalist></label><label class="lbl">Pays (code)<input class="field" name="country" required maxlength="2" value="${esc(s.country || '')}" placeholder="MA, FR, ES…"></label></div>
      <label class="lbl">Lieu<input class="field" name="venue" required value="${esc(s.venue || '')}" placeholder="Atelier, galerie partenaire…"></label>
      <div class="two"><label class="lbl">Début<input class="field" type="date" name="start" required value="${esc(s.start || '')}"></label><label class="lbl">Places<input class="field" type="number" min="1" max="30" name="capacity" required value="${s.capacity || 8}"></label></div>
      <label class="lbl">Langues<input class="field" name="lang" value="${esc(s.lang || 'fr')}"></label><button class="btn btn-primary">Enregistrer</button></form>`);
    $('#sf [name=city]').oninput = (e) => { if (cc[e.target.value]) $('#sf [name=country]').value = cc[e.target.value]; };
    $('#sf').onsubmit = (e) => { e.preventDefault(); const v = Object.fromEntries(new FormData(e.target)); S.saveSession({ ...s, ...v, country: v.country.toUpperCase(), capacity: Number(v.capacity), status: s.status || 'open' }); modal.classList.remove('open'); toast('Session enregistrée'); render(); };
  }

  function manualSheet() {
    const up = S.db.sessions.filter((s) => s.start >= S.today() && s.status === 'open');
    sheet(`<h2 class="serif" style="font-size:30px;margin:0 0 4px">Réservation manuelle</h2><p class="muted">Pour une inscription reçue par WhatsApp, téléphone, Instagram ou à l’atelier.</p><form class="form" id="mf">
      <select class="field" name="sessionId">${up.map((s) => `<option value="${s.id}">${esc(fname(s.format))} · ${esc(s.city)} · ${d(s.start)} (${S.seatsLeft(s)} places)</option>`).join('')}</select>
      <div class="two"><input class="field" name="name" required placeholder="Nom"><input class="field" name="phone" required placeholder="Téléphone"></div>
      <div class="two"><input class="field" name="email" placeholder="Email"><input class="field" name="country" placeholder="Pays (MA, FR…)"></div>
      <div class="two"><input class="field" type="number" name="seats" min="1" value="1"><select class="field" name="source"><option value="whatsapp">WhatsApp</option><option value="phone">Téléphone</option><option value="instagram">Instagram</option><option value="walk-in">À l’atelier</option></select></div>
      <select class="field" name="pay"><option value="later">Pas encore payé</option><option value="deposit">Acompte reçu (${C.depositPct} %)</option><option value="full">Tout payé</option></select><button class="btn btn-primary">Enregistrer</button></form>`);
    $('#mf').onsubmit = (e) => { e.preventDefault(); const v = Object.fromEntries(new FormData(e.target)); const b = S.book({ ...v, seats: Number(v.seats), level: 'beginner', notes: '' }); b.source = v.source; b.country = (v.country || '').toUpperCase(); S.setStatus(b.id, b.status); modal.classList.remove('open'); toast(`Réservation ${b.ref} enregistrée`); render(); };
  }

  const csv = (rows, name) => { const body = rows.map((r) => r.map((x) => `"${String(x ?? '').replace(/"/g, '""')}"`).join(';')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([`﻿${body}`], { type: 'text/csv' })); a.download = name; a.click(); };

  // ---------- Events ----------
  function bind() {
    document.querySelectorAll('[data-session]').forEach((el) => { el.onclick = () => { tab = 'sessions'; openSession = el.dataset.session; render(); }; });
    document.querySelectorAll('[data-contact]').forEach((el) => { el.onclick = () => { tab = 'inbox'; openContact = el.dataset.contact; S.markRead(el.dataset.contact); render(); }; });
    document.querySelectorAll('[data-booking]').forEach((el) => { el.onclick = () => bookingSheet(el.dataset.booking); });
    document.querySelectorAll('[data-bf]').forEach((el) => { el.onclick = () => { bFilter = el.dataset.bf; render(); }; });
    document.querySelectorAll('[data-attend]').forEach((el) => { el.onchange = () => S.toggleAttended(el.dataset.attend); });
    document.querySelectorAll('[data-promote]').forEach((el) => { el.onclick = () => { if (S.promote(el.dataset.promote)) { toast('Inscrit'); render(); } else toast('Pas assez de places'); }; });
    document.querySelectorAll('[data-host]').forEach((el) => { el.onclick = () => { const [id, st] = el.dataset.host.split('|'); S.setHost(id, st); render(); }; });
    document.querySelectorAll('[data-plan]').forEach((el) => { el.onclick = () => { const [city, country] = el.dataset.plan.split('|'); tab = 'sessions'; sessionSheet({ format: 'masterclass', city, country, venue: 'Atelier partenaire', capacity: 10, lang: 'fr' }); }; });
    document.querySelectorAll('[data-quick]').forEach((el) => { el.onclick = () => { const q = ['Bonjour, merci pour votre message ! Voici les prochaines dates : ', 'Il reste des places, je vous envoie le lien de réservation.', 'Tout le matériel est fourni, il suffit d’une tenue qui ne craint pas la terre.'][el.dataset.quick]; $('#reply [name=t]').value = q; $('#reply [name=t]').focus(); }; });
    if ($('#reply')) $('#reply').onsubmit = (e) => { e.preventDefault(); const cur = openContact || S.db.messages[0]?.contact; const last = S.db.messages.find((m) => m.contact === cur && m.from === 'client') || S.db.messages.find((m) => m.contact === cur); S.message({ from: 'atelier', name: last?.name || '', contact: cur, ref: last?.ref, text: new FormData(e.target).get('t') }); S.markRead(cur); openContact = cur; render(); };
    document.querySelectorAll('[data-group]').forEach((el) => { el.onclick = () => { const [id, st] = el.dataset.group.split('|'); S.setGroup(id, st); render(); }; });
    document.querySelectorAll('[data-review]').forEach((el) => { el.onclick = () => { const [id, st] = el.dataset.review.split('|'); S.setReview(id, st); toast(st === 'approved' ? 'Avis publié sur le site' : 'Avis masqué'); render(); }; });
    document.querySelectorAll('[data-order]').forEach((el) => { el.onchange = () => { S.setOrder(el.dataset.order, el.value); toast('Commande mise à jour'); render(); }; });
    if ($('#bc')) $('#bc').onsubmit = (e) => {
      e.preventDefault(); const v = Object.fromEntries(new FormData(e.target)); let targets = [];
      if (v.target.startsWith('city:')) { const [city] = v.target.slice(5).split('|'); targets = S.db.interests.filter((i) => i.city === city).map((i) => i.contact); }
      else if (v.target.startsWith('session:')) targets = S.db.bookings.filter((b) => b.sessionId === v.target.slice(8) && b.status !== 'cancelled').map((b) => `${b.name} · ${b.phone}`);
      else targets = [...new Set(S.db.bookings.map((b) => `${b.name} · ${b.phone}`))];
      const n = S.broadcast([...new Set(targets)], v.text); toast(`Annonce envoyée à ${n} personne(s)`); render();
    };
    if ($('#newSession')) $('#newSession').onclick = () => sessionSheet();
    if ($('#manual')) $('#manual').onclick = manualSheet;
    if ($('#reset')) $('#reset').onclick = () => { if (confirm('Remettre les données de démo à zéro ?')) { S.reset(); toast('Données réinitialisées'); render(); } };
    if ($('#csvAll')) $('#csvAll').onclick = () => csv([['Nom', 'Email', 'Téléphone', 'Pays', 'Réf', 'Session', 'Date'], ...S.db.bookings.map((b) => { const s = S.session(b.sessionId); return [b.name, b.email, b.phone, b.country, b.ref, fname(s.format), s.start]; })], 'participants.csv');
    if (openSession) {
      const s = S.session(openSession);
      $('#backS').onclick = () => { openSession = null; render(); };
      $('#editS').onclick = () => sessionSheet(s);
      $('#toggleS').onclick = () => { S.saveSession({ ...s, status: s.status === 'open' ? 'closed' : 'open' }); render(); };
      $('#csv').onclick = () => csv([['Nom', 'Téléphone', 'Email', 'Personnes', 'Payé', 'Total', 'Statut'], ...S.db.bookings.filter((b) => b.sessionId === s.id).map((b) => [b.name, b.phone, b.email, b.seats, b.paid, b.total, STATUS[statusOf(b)]])], `session-${s.city}-${s.start}.csv`);
      $('#remind').onclick = () => {
        const list = S.db.bookings.filter((b) => b.sessionId === s.id && b.status !== 'waitlist' && b.status !== 'cancelled');
        const text = `Bonjour, petit rappel : ${fname(s.format)} à ${s.city}, ${d(s.start)}, ${s.venue}. Rendez-vous à 9 h 30. À très vite ! ${C.brand.name}`;
        sheet(`<h2 class="serif" style="font-size:28px;margin:0 0 6px">Rappel à ${list.length} participant(s)</h2><p class="muted">Un clic par personne ouvre WhatsApp avec le message prêt.</p>
          <textarea class="field" rows="3" id="rtext">${esc(text)}</textarea><div style="display:grid;gap:8px;margin-top:12px">${list.map((b) => `<a class="btn btn-wa btn-sm" target="_blank" rel="noopener" data-r="${esc(b.phone)}" href="#">${esc(b.name)} · ${esc(b.phone)}</a>`).join('')}</div>`);
        document.querySelectorAll('[data-r]').forEach((a) => { a.onclick = (e) => { e.preventDefault(); window.open(waLink(a.dataset.r, $('#rtext').value), '_blank', 'noopener'); a.style.opacity = '.5'; }; });
      };
    }
  }

  S.on(() => { if (unlocked && !modal.classList.contains('open')) render(); });
  render();
  fetchConfig().then((c) => {
    cfg = c;
    if (c.ok && !c.live) { try { sessionStorage.removeItem('as_admin'); } catch { /* ignore */ } unlocked = false; render(); } else if (!unlocked) render();
  });
})();
