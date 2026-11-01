import { db, CATS, EXTRAS, LOCATIONS, STATUS, today, addDays, nights, diffDays, fmtDate, fmtDateY, money, quote, esc } from './store.js';
import { carSvg } from './art.js';
const ICON = {
  seat: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.300 2.700-5.500 6-5.500s6 2.200 6 5.500"/><path d="M16 5.500a3 3 0 0 1 0 5.500M17.500 14.800c2 .6 3.500 2.300 3.500 5.200"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M5.600 18.400l2.100-2.100M16.300 7.700l2.100-2.100"/></svg>',
  fuel: '<svg viewBox="0 0 24 24"><path d="M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z"/></svg>',
};
import { fetchConfig } from './gate.js';

const $ = (s, r = document) => r.querySelector(s);
const CUR_KEY = 'mbn-rent-cur';
let cat = 'all';
let sort = 'price';
let sel = { pickup: LOCATIONS[0], from: addDays(today(), 2), to: addDays(today(), 6) };

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 3200); }
function setCur(c) { try { localStorage.setItem(CUR_KEY, c); } catch { /* ignore */ } db.s.settings.currency = c; }
try { const c = localStorage.getItem(CUR_KEY); if (c) db.s.settings.currency = c; } catch { /* ignore */ }

function init() {
  $('#heroCar').innerHTML = carSvg('sedan', '#f1f3f7', 'hero');
  $('#pickup').innerHTML = LOCATIONS.map((l) => `<option>${esc(l)}</option>`).join('');
  $('#cat').innerHTML = `<option value="all">All vehicles</option>` + Object.entries(CATS).map(([k, c]) => `<option value="${k}">${c.name}</option>`).join('');
  $('#from').min = today(); $('#to').min = addDays(today(), 1);
  $('#from').value = sel.from; $('#to').value = sel.to;
  $('#cur').value = db.s.settings.currency;
  $('#placeList').innerHTML = LOCATIONS.map((l, i) => `<li><div><b>${esc(l)}</b><small>${i === 1 ? 'Open 8:00–20:00' : 'Open daily 6:00–23:00'}</small></div></li>`).join('');
  $('#from').addEventListener('change', () => { if ($('#to').value <= $('#from').value) $('#to').value = addDays($('#from').value, 1); $('#to').min = addDays($('#from').value, 1); });
  $('#search').addEventListener('submit', (e) => { e.preventDefault(); sel = { pickup: $('#pickup').value, from: $('#from').value, to: $('#to').value }; cat = $('#cat').value; render(); $('#fleet').scrollIntoView({ behavior: 'smooth' }); });
  $('#cur').addEventListener('change', (e) => { setCur(e.target.value); render(); });
  $('#sort').addEventListener('change', (e) => { sort = e.target.value; render(); });
  $('#ctaBtn').addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); $('#from').focus({ preventScroll: true }); });
  $('#lookupBtn').addEventListener('click', openLookup);
  const dl = $('#dockLookup'); if (dl) dl.addEventListener('click', openLookup);
  $('#mbarLookup').addEventListener('click', openLookup);
  $('#mbarSearch').addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  $('#demobarClose').addEventListener('click', () => { $('#demobar').hidden = true; });
  db.subscribe(() => { if (!$('#modal').hidden) return; render(); });
  render();
}

function render() {
  const d = nights(sel.from, sel.to);
  $('#resTitle').textContent = diffDays(sel.from, sel.to) >= 1 ? 'Available cars' : 'Our fleet';
  $('#resSub').textContent = `${fmtDate(sel.from)} to ${fmtDate(sel.to)} · ${d} ${d === 1 ? 'day' : 'days'} · ${sel.pickup}`;
  // vehicle-type tiles (price = cheapest free car of the type for these dates)
  $('#catGrid').innerHTML = Object.entries(CATS).map(([k, c]) => {
    const free = db.available(sel.from, sel.to, k); const best = free.slice().sort((a, b) => a.price - b.price)[0]; const rep = best || db.s.vehicles.find((v) => v.cat === k);
    return `<button type="button" class="cat" data-cat="${k}"><div class="art" style="${best ? '' : 'opacity:.45'}">${rep ? carSvg(rep.body, rep.color, 'k' + k) : ''}</div><b>${c.name}</b><small>${esc(c.blurb)}</small><em>${best ? `From ${money(quote(best, sel.from, sel.to, []).total / d)} / day` : 'Not available for these dates'}</em></button>`;
  }).join('');
  $('#catGrid').querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => { cat = b.dataset.cat; $('#cat').value = cat; render(); $('#fleet').scrollIntoView({ behavior: 'smooth' }); }));
  $('#chips').innerHTML = [['all', 'All'], ...Object.entries(CATS).map(([k, c]) => [k, c.name])].map(([k, n]) => `<button type="button" class="chip" aria-pressed="${cat === k}" data-cat="${k}">${esc(n)}</button>`).join('');
  $('#chips').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { cat = b.dataset.cat; $('#cat').value = cat; render(); }));
  const list = db.available(sel.from, sel.to, cat);
  list.sort(sort === 'priceDesc' ? (a, b) => b.price - a.price : sort === 'seats' ? (a, b) => b.seats - a.seats || a.price - b.price : (a, b) => a.price - b.price);
  const el = $('#results');
  if (!list.length) { el.innerHTML = `<div class="empty">No car available for these dates in this category.<br />Try other dates or another vehicle type.</div>`; return; }
  el.innerHTML = list.map((v) => {
    const q = quote(v, sel.from, sel.to, []);
    const left = db.available(sel.from, sel.to, v.cat).length;
    return `<article class="car"><div class="art"><span class="tag">${CATS[v.cat].name}</span>${left <= 2 ? `<span class="low">${left} left</span>` : ''}${carSvg(v.body, v.color)}</div>
<div class="bd"><h3>${esc(v.make)} ${esc(v.model)}<small>or similar</small></h3>
<ul class="specs"><li>${ICON.seat}${v.seats} seats</li><li>${ICON.bag}${v.bags} bags</li><li>${ICON.gear}${v.gearbox}</li><li>${ICON.fuel}${v.fuel}</li></ul>
<div class="foot"><div class="pr"><b>${money(Math.round(q.total / q.days))}<em> / day</em></b><small>${money(q.total)} total · ${q.days} ${q.days === 1 ? 'day' : 'days'}</small></div><button type="button" class="btn pri" data-book="${v.id}">Book now</button></div></div></article>`;
  }).join('');
  el.querySelectorAll('[data-book]').forEach((b) => b.addEventListener('click', () => openBooking(b.dataset.book)));
}

function modal(html, wide) { const m = $('#modal'); m.innerHTML = `<div class="sheet" ${wide ? '' : 'style="width:min(520px,100%)"'}>${html}</div>`; m.hidden = false; document.body.style.overflow = 'hidden'; m.onclick = (e) => { if (e.target === m) closeModal(); }; m.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', closeModal)); const f = m.querySelector('input,select'); if (f) f.focus({ preventScroll: true }); }
function closeModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; document.body.style.overflow = ''; render(); }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });

function openBooking(vid) {
  const v = db.vehicle(vid); let ex = [];
  const draw = () => {
    const q = quote(v, sel.from, sel.to, ex);
    modal(`<div class="sheet-h"><h2>Your booking request</h2><button class="x" data-x aria-label="Close">✕</button></div>
<form class="sheet-b" id="bk" novalidate><div class="f">
<div class="two"><label>First and last name<input name="name" required autocomplete="name" /></label><label>Phone (WhatsApp)<input name="phone" required inputmode="tel" autocomplete="tel" placeholder="+212 6…" /></label></div>
<label>Email<input name="email" type="email" required autocomplete="email" /></label>
<div class="two"><label>Driving licence number<input name="licenseNo" required /></label><label>Licence held since<input name="licenseSince" required inputmode="numeric" maxlength="4" placeholder="2016" /></label></div>
<label>Drop-off<select name="dropoff">${LOCATIONS.map((l) => `<option ${l === sel.pickup ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
<strong style="font-size:13px;margin-top:4px">Extras</strong>
${EXTRAS.map((x) => `<label class="extra"><input type="checkbox" value="${x.id}" ${ex.includes(x.id) ? 'checked' : ''} />${esc(x.name)}<span>${money(x.price)} / ${x.per}</span></label>`).join('')}
<label>Flight number or note (optional)<textarea name="notes" rows="2"></textarea></label>
<div class="err" id="err" hidden role="alert"></div></div>
<aside class="sum"><div class="art">${carSvg(v.body, v.color, 'm')}</div><h3>${esc(v.make)} ${esc(v.model)}</h3><small>${CATS[v.cat].name} · ${v.gearbox} · ${v.seats} seats</small>
<dl><dt>Pick-up</dt><dd>${fmtDate(sel.from)}</dd><dt>Return</dt><dd>${fmtDate(sel.to)}</dd><dt>${q.days} ${q.days === 1 ? 'day' : 'days'}</dt><dd>${money(q.base)}</dd>
${q.peakDays ? `<dt>High season</dt><dd>+${db.s.settings.peakPct}% on ${q.peakDays}d</dd>` : ''}${q.discount ? `<dt>${q.discPct}% long rental</dt><dd>−${money(q.discount)}</dd>` : ''}
${q.lines.map((l) => `<dt>${esc(l.name)}</dt><dd>${money(l.amount)}</dd>`).join('')}
<dt class="tot">Total</dt><dd class="tot">${money(q.total)}</dd></dl>
<p class="note">Deposit at pick-up: ${money(CATS[v.cat].deposit)} (held on your card). Pay at the office or by card. Free cancellation up to 48 hours before.</p>
<button class="btn pri" style="width:100%;margin-top:12px" type="submit">Send request</button></aside></form>`, true);
    const f = $('#bk');
    f.querySelectorAll('input[type=checkbox]').forEach((c) => c.addEventListener('change', () => { const keep = new FormData(f); const vals = Object.fromEntries(keep.entries()); ex = [...f.querySelectorAll('input[type=checkbox]:checked')].map((x) => x.value); draw(); Object.entries(vals).forEach(([k, val]) => { const el = $(`#bk [name="${k}"]`); if (el && el.type !== 'checkbox') el.value = val; }); }));
    f.addEventListener('submit', (e) => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(f).entries()); const err = $('#err');
      const bad = (m) => { err.textContent = m; err.hidden = false; };
      if (!d.name.trim() || d.name.trim().length < 3) return bad('Please enter your name.');
      if (d.phone.replace(/\D/g, '').length < 8) return bad('Please enter a valid phone number.');
      if (!/^\S+@\S+\.\S+$/.test(d.email)) return bad('Please enter a valid email.');
      if (!d.licenseNo.trim()) return bad('Please enter your licence number.');
      const since = Number(d.licenseSince); const yr = new Date().getFullYear();
      if (!(since > 1960 && since <= yr)) return bad('Please enter the year you got your licence.');
      if (yr - since < 2) return bad('A licence held for at least two years is required.');
      const res = db.createBooking({ vehicleId: v.id, start: sel.from, end: sel.to, extras: ex, pickup: sel.pickup, dropoff: d.dropoff, notes: d.notes, customer: { name: d.name.trim(), phone: d.phone.trim(), email: d.email.trim(), licenseNo: d.licenseNo.trim(), licenseSince: since } });
      if (!res.ok) return bad(res.error);
      done(res.booking, v);
    });
  };
  draw();
}

function done(b, v) {
  modal(`<div class="sheet-h"><h2>Request sent</h2><button class="x" data-x aria-label="Close">✕</button></div>
<div class="done"><div class="ok">✓</div><h3 style="margin:0">Thank you, we received your request</h3><div class="ref">${b.id}</div>
<p>${esc(v.make)} ${esc(v.model)} · ${fmtDateY(b.start)} to ${fmtDateY(b.end)} · ${money(b.total)}</p>
<p>We will confirm by email and WhatsApp, usually within the hour. Keep your reference and phone number to manage the booking.</p>
<p style="font-size:13px">In this demo, open the <a href="/demo/rent/admin" target="_blank" rel="noopener"><b>owner dashboard</b></a> to see this request arrive and confirm it.</p>
<div class="done-act"><button class="btn ghost" id="icsBtn" type="button">Add to my calendar</button><button class="btn dark" data-x>Close</button></div></div>`);
  $('#icsBtn').addEventListener('click', () => downloadIcs(b, v));
}

// Calendar file: one all-day event from pick-up to return (DTEND is exclusive).
function downloadIcs(b, v) {
  const d = (x) => x.replace(/-/g, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Atlas Drive//Demo//EN', 'BEGIN:VEVENT', `UID:${b.id}@atlas-drive-demo`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`, `DTSTART;VALUE=DATE:${d(b.start)}`, `DTEND;VALUE=DATE:${d(addDays(b.end, 1))}`,
    `SUMMARY:Car rental — ${v.make} ${v.model} (${b.id})`, `LOCATION:${b.pickup}`,
    `DESCRIPTION:Pick-up ${b.pickup}. Return ${b.dropoff}. Bring your licence\\, ID and a bank card for the deposit.`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = `${b.id}.ics`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Calendar file downloaded');
}

function openLookup() {
  modal(`<div class="sheet-h"><h2>My booking</h2><button class="x" data-x aria-label="Close">✕</button></div>
<div class="sheet-b one"><form class="f" id="lk"><label>Booking reference<input name="ref" placeholder="AD-4210" required /></label><label>Phone number used to book<input name="phone" inputmode="tel" required /></label><div class="err" id="lkerr" hidden role="alert"></div><button class="btn pri" type="submit">Find my booking</button></form><div id="lkres"></div></div>`);
  $('#lk').addEventListener('submit', (e) => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(e.target).entries()); const b = db.findBooking(d.ref, d.phone);
    const err = $('#lkerr'); const out = $('#lkres');
    if (!b) { err.textContent = 'No booking found with this reference and phone number.'; err.hidden = false; out.innerHTML = ''; return; }
    err.hidden = true; const v = db.vehicle(b.vehicleId); const st = STATUS[b.status];
    const canCancel = (b.status === 'pending' || b.status === 'confirmed') && diffDays(today(), b.start) >= 2;
    out.innerHTML = `<div class="sum" style="position:static;margin-top:6px"><div class="art">${carSvg(v.body, v.color, 'l')}</div><h3>${esc(v.make)} ${esc(v.model)}</h3><small>${b.id}</small>
<dl><dt>Status</dt><dd><span class="pill" style="background:${st.color}">${st.label}</span></dd><dt>Dates</dt><dd>${fmtDate(b.start)} → ${fmtDate(b.end)}</dd><dt>Pick-up</dt><dd>${esc(b.pickup)}</dd><dt>Total</dt><dd>${money(b.total)}</dd><dt>Paid</dt><dd>${money(b.paid || 0)}</dd></dl>
${canCancel ? `<button class="btn line" id="cx" style="width:100%;margin-top:12px">Cancel this booking</button>` : `<p class="note">${b.status === 'cancelled' ? 'This booking is cancelled.' : 'Cancellation is free up to 48 hours before pick-up. Call us for changes.'}</p>`}</div>`;
    const cx = $('#cx'); if (cx) cx.addEventListener('click', () => { db.setStatus(b.id, 'cancelled'); toast('Booking cancelled'); closeModal(); });
  });
}

init();
fetchConfig().then((cfg) => {
  if (cfg.ok && !cfg.live) {
    document.body.innerHTML = `<main style="min-height:100dvh;display:grid;place-items:center;padding:24px;text-align:center;font-family:Manrope,system-ui,sans-serif;background:#0b1220;color:#fff"><div><h1 style="margin:0 0 8px">This demo is currently unavailable</h1><p style="color:#9fb0cf;margin:0">Please contact MBN DEV to get a new access.</p></div></main>`;
  }
});
