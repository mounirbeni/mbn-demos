// Shared helpers for the lighter prospect demos (cuisine, photo, moto). Classic script: exposes window.K.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mad = (n) => `${Math.round(n).toLocaleString('fr-FR')} MAD`;
  const uid = (p = '') => p + Math.random().toString(36).slice(2, 7).toUpperCase();
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => iso(new Date());
  const addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };
  const diffDays = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
  const frDate = (s, o = { weekday: 'short', day: 'numeric', month: 'short' }) => s ? new Date(s + 'T12:00:00').toLocaleDateString('fr-FR', o) : '—';
  const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  function store(key, seed) {
    let mem = null;
    const read = () => {
      if (mem) return mem;
      try { const raw = localStorage.getItem(key); if (raw) mem = JSON.parse(raw); } catch { /* private mode */ }
      if (!mem) { mem = seed(); write(); }
      return mem;
    };
    const write = () => { try { localStorage.setItem(key, JSON.stringify(mem)); } catch { /* ignore */ } };
    return {
      get: read,
      update(fn) { const s = read(); fn(s); write(); return s; },
      reset() { mem = seed(); write(); return mem; },
    };
  }

  let tt;
  function toast(msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2800);
  }

  function modal(html, { wide = false, cls = '' } = {}) {
    const m = $('#modal'), s = $('#sheet');
    m.className = `modal on ${cls}`; s.className = `sheet${wide ? ' wide' : ''}`;
    s.innerHTML = `<button class="x" aria-label="Fermer" data-close>×</button>${html}`;
    document.body.style.overflow = 'hidden';
    return s;
  }
  function close() { const m = $('#modal'); if (m) m.className = 'modal'; document.body.style.overflow = ''; }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target.id === 'modal') close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  function lightbox(src, cap) {
    modal(`<img src="${esc(src)}" alt="${esc(cap || '')}">${cap ? `<div class="cap">${esc(cap)}</div>` : ''}`, { cls: 'lightbox', wide: true });
  }

  function csv(name, rows) {
    const body = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' }));
    a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // Month calendar. state: {month:'YYYY-MM', sel}, dayClass(iso) -> '' | 'busy' | 'few', onPick(iso)
  function calendar(el, st, dayClass, onPick) {
    const draw = () => {
      const [y, m] = st.month.split('-').map(Number);
      const first = new Date(y, m - 1, 1); const days = new Date(y, m, 0).getDate();
      const lead = (first.getDay() + 6) % 7; const t = today();
      let h = `<div class="cal-head"><button type="button" class="btn btn-ghost btn-sm" data-m="-1" aria-label="Mois précédent">‹</button><b>${MONTHS[m - 1]} ${y}</b><button type="button" class="btn btn-ghost btn-sm" data-m="1" aria-label="Mois suivant">›</button></div><div class="cal">`;
      h += ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => `<div class="dow">${d}</div>`).join('');
      for (let i = 0; i < lead; i++) h += '<div></div>';
      for (let d = 1; d <= days; d++) {
        const ds = `${y}-${pad(m)}-${pad(d)}`; const c = ds < t ? 'past' : dayClass(ds);
        h += `<button type="button" data-d="${ds}" class="${c}${st.sel === ds ? ' sel' : ''}" ${c === 'past' || c === 'busy' ? 'disabled' : ''}>${d}</button>`;
      }
      el.innerHTML = h + '</div>';
      $$('[data-m]', el).forEach((b) => b.onclick = () => { const d = new Date(y, m - 1 + Number(b.dataset.m), 1); st.month = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; draw(); });
      $$('[data-d]', el).forEach((b) => b.onclick = () => { st.sel = b.dataset.d; draw(); onPick(st.sel); });
    };
    draw();
    return draw;
  }

  // Local dashboard PIN (demo only; shown on screen).
  function adminGate(key, pin, start, back = '/') {
    let ok = false; try { ok = sessionStorage.getItem(key) === '1'; } catch { /* ignore */ }
    if (ok) return start();
    const root = $('#root');
    root.innerHTML = `<div class="pin"><div class="card"><h2 style="font-size:1.5rem">Espace gérant</h2><p class="muted" style="color:#aaa">Entrez votre code pour accéder au tableau de bord.</p>
      <form class="form" id="pinf"><input class="field" name="p" inputmode="numeric" autocomplete="off" maxlength="6" placeholder="••••" aria-label="Code PIN"><button class="btn btn-primary">Entrer</button><p id="perr" style="color:#ff8a80;font-size:.85rem;min-height:1.2em;margin:0"></p></form>
      <p style="font-size:.8rem;color:#888;margin:8px 0 0">Démo : code ${esc(pin)}</p><p style="margin:10px 0 0"><a href="${esc(back)}" style="color:#bbb;font-size:.85rem">← Voir le site</a></p></div></div>`;
    $('#pinf input').focus();
    $('#pinf').onsubmit = (e) => {
      e.preventDefault();
      if (e.target.p.value.trim() === pin) { try { sessionStorage.setItem(key, '1'); } catch { /* ignore */ } start(); }
      else $('#perr').textContent = 'Code incorrect.';
    };
  }

  const ICON = {
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 17 3l4 4L7 21z"/><path d="m7 13 2 2m1-5 2 2m1-5 2 2"/></svg>',
    cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/></svg>',
    saw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20h16M6 16l3-9h6l3 9"/><path d="M9 7V4h6v3"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9m-3 3 3 3"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    helmet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 15a8 8 0 0 1 16 0v2H4z"/><path d="M12 7v4h8"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>',
    drone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="10" width="6" height="4" rx="1"/><path d="M9 11 5 7m10 4 4-4M9 13l-4 4m10-4 4 4"/><circle cx="5" cy="7" r="2"/><circle cx="19" cy="7" r="2"/><circle cx="5" cy="17" r="2"/><circle cx="19" cy="17" r="2"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  };

  window.K = { $, $$, esc, mad, uid, iso, today, addDays, diffDays, frDate, store, toast, modal, close, lightbox, csv, calendar, adminGate, ICON, MONTHS };
})();
