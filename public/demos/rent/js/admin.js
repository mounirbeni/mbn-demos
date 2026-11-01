import { db, CATS, EXTRAS, LOCATIONS, STATUS, SOURCES, SERVICE_EVERY, today, addDays, diffDays, nights, fmtDate, fmtDateY, money, quote, esc } from './store.js';
import { carSvg } from './art.js';
import { fetchConfig, verifyPin } from './gate.js';

const $ = (s, r = document) => r.querySelector(s);
const SK = 'mbn-rent-admin';
const IC = {
  dash: '<path d="M3 12 12 4l9 8"/><path d="M5 10v10h14V10"/>',
  bookings: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  fleet: '<path d="M5 16l1.5-5a2 2 0 0 1 2-1.4h7a2 2 0 0 1 2 1.4L19 16"/><path d="M3 16h18v3H3z"/><circle cx="7.5" cy="19" r="0.6"/><circle cx="16.5" cy="19" r="0.6"/>',
  customers: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 5.5a3 3 0 0 1 0 5.5M17.5 14.8c2 .6 3.5 2.3 3.5 5.2"/>',
  pricing: '<path d="M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3S7.5 5.8 7.5 7.5 9.500 10 12 10.500s4.5 1.800 4.500 3.500S14.500 17.500 12 17.500s-4.500-1.300-4.500-3"/>',
  reports: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.300l2-1.500-2-3.400-2.300 1a7 7 0 0 0-2.300-1.300L14 3h-4l-.4 2.500A7 7 0 0 0 7.300 6.800l-2.300-1-2 3.400 2 1.500A7 7 0 0 0 5 12c0 .4 0 .9.100 1.300l-2 1.500 2 3.400 2.300-1a7 7 0 0 0 2.300 1.300L10 21h4l.4-2.500a7 7 0 0 0 2.300-1.300l2.300 1 2-3.400-2-1.500c.1-.4.100-.9.100-1.300z"/>',
};
const TABS = [
  ['dash', 'Dashboard', 'Everything that happens today'], ['bookings', 'Bookings', 'Requests, rentals and returns'], ['calendar', 'Calendar', 'Who has which car, day by day'],
  ['fleet', 'Fleet', 'Your cars, service and insurance'], ['customers', 'Customers', 'Drivers and rental history'], ['pricing', 'Pricing', 'Daily rates and rules'],
  ['reports', 'Reports', 'Revenue and utilisation'], ['settings', 'Settings', 'Company and demo data'],
];
let tab = 'dash';
const F = { status: 'all', q: '', cat: 'all', cq: '' };
let calStart = addDays(today(), -3);
let repDays = 30;
let known = new Set();

const pill = (st) => `<span class="pill" style="background:${STATUS[st].color}">${STATUS[st].label}</span>`;
const vName = (v) => `${esc(v.make)} ${esc(v.model)}`;
const bal = (b) => Math.max(0, b.total - (b.paid || 0));

function toast(msg) { const t = $('#atoast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 3200); }
function modal(title, body, foot = '', sm = false) {
  const m = $('#amodal');
  m.innerHTML = `<div class="sheet${sm ? ' sm' : ''}"><div class="sh"><h2>${title}</h2><button class="x" data-x aria-label="Close">✕</button></div><div class="sb">${body}</div>${foot ? `<div class="sf">${foot}</div>` : ''}</div>`;
  m.hidden = false; document.body.style.overflow = 'hidden';
  m.onclick = (e) => { if (e.target === m) closeModal(); };
  m.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', closeModal));
}
function closeModal() { const m = $('#amodal'); m.hidden = true; m.innerHTML = ''; document.body.style.overflow = ''; render(); }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#amodal').hidden) closeModal(); });

// ── derived data ─────────────────────────────────────────────────────────────
function vStatus(v) {
  const t = today();
  if (v.outOfService || db.s.maintenance.some((m) => m.vehicleId === v.id && m.start <= t && t < m.end) || db.s.maintenance.some((m) => m.vehicleId === v.id && m.start <= t && t <= m.end && m.end === t && false)) return 'maintenance';
  if (db.s.bookings.some((b) => b.vehicleId === v.id && b.status === 'active')) return 'rent';
  return 'free';
}
const VST = { free: ['Available', 'g'], rent: ['On rent', 'w'], maintenance: ['Workshop', 'r'] };
function stats() {
  const s = db.s, t = today(), m = t.slice(0, 7);
  const rentable = s.vehicles.filter((v) => vStatus(v) !== 'maintenance').length;
  const active = s.bookings.filter((b) => b.status === 'active');
  return {
    revenueMonth: s.payments.filter((p) => p.date.startsWith(m)).reduce((a, p) => a + p.amount, 0),
    active: active.length, rentable, util: rentable ? Math.round((active.length / rentable) * 100) : 0,
    pending: s.bookings.filter((b) => b.status === 'pending'),
    pickups: s.bookings.filter((b) => b.start === t && (b.status === 'confirmed' || b.status === 'pending')),
    returns: s.bookings.filter((b) => b.status === 'active' && b.end === t),
    overdue: active.filter((b) => b.end < t),
    outstanding: s.bookings.filter((b) => b.status !== 'cancelled' && bal(b) > 0 && b.status !== 'pending').reduce((a, b) => a + bal(b), 0),
  };
}
function alerts() {
  const t = today(), out = [];
  const st = stats();
  st.overdue.forEach((b) => out.push({ c: 'r', m: `Late return: ${esc(db.customer(b.customerId).name)} should have returned the ${vName(db.vehicle(b.vehicleId))} on ${fmtDate(b.end)}.`, b: b.id }));
  if (st.pending.length) out.push({ c: 'b', m: `${st.pending.length} booking request${st.pending.length > 1 ? 's' : ''} waiting for your confirmation.`, tab: 'bookings', f: 'pending' });
  db.s.vehicles.forEach((v) => {
    const d = diffDays(t, v.insuranceExp);
    if (d <= 30) out.push({ c: d < 0 ? 'r' : '', m: `${vName(v)} (${esc(v.plate)}): insurance ${d < 0 ? 'expired' : `expires in ${d} day${d === 1 ? '' : 's'}`}.`, v: v.id });
    if (v.nextService - v.odo <= 1000) out.push({ c: '', m: `${vName(v)} (${esc(v.plate)}): service due in ${Math.max(0, v.nextService - v.odo).toLocaleString()} km.`, v: v.id });
  });
  return out;
}

// ── views ────────────────────────────────────────────────────────────────────
function viewDash() {
  const st = stats(), t = today();
  const days = Array.from({ length: 14 }, (_, i) => addDays(t, i - 13));
  const rev = days.map((d) => db.s.payments.filter((p) => p.date === d).reduce((a, p) => a + p.amount, 0));
  const max = Math.max(1, ...rev);
  const counts = { free: 0, rent: 0, maintenance: 0 }; db.s.vehicles.forEach((v) => counts[vStatus(v)]++);
  const al = alerts();
  const line = (b, extra = '') => { const v = db.vehicle(b.vehicleId), c = db.customer(b.customerId); return `<div class="row click" data-b="${b.id}"><div class="g"><b>${esc(c.name)}</b><small>${vName(v)} · ${fmtDate(b.start)} → ${fmtDate(b.end)}</small></div>${extra}${pill(b.status)}</div>`; };
  return `<div class="kpis">
<div class="kpi"><small>Revenue this month</small><b>${money(st.revenueMonth)}</b><span>${money(st.outstanding)} still to collect</span></div>
<div class="kpi"><small>On rent now</small><b>${st.active} <span style="font-size:15px">/ ${st.rentable}</span></b><span>${st.util}% of available cars</span></div>
<div class="kpi"><small>Pick-ups today</small><b>${st.pickups.length}</b><span>${st.returns.length} return${st.returns.length === 1 ? '' : 's'} today</span></div>
<div class="kpi"><small>Waiting for you</small><b>${st.pending.length}</b><span>${st.overdue.length} late return${st.overdue.length === 1 ? '' : 's'}</span></div></div>
<div class="cols"><div class="card"><h3>Revenue, last 14 days <small>${money(rev.reduce((a, b) => a + b, 0))}</small></h3><div class="bars">${rev.map((r, i) => `<div class="bar ${days[i] === t ? 't' : ''}" title="${fmtDate(days[i])}: ${money(r)}"><i style="height:${Math.max(1, Math.round((r / max) * 100))}%"></i><span>${days[i].slice(8)}</span></div>`).join('')}</div></div>
<div class="card"><h3>Fleet today <small>${db.s.vehicles.length} cars</small></h3>${[['free', 'Available', '#16a870'], ['rent', 'On rent', '#ff7a1a'], ['maintenance', 'In the workshop', '#e5484d']].map(([k, n, c]) => `<div class="hbar"><span>${n}</span><div class="t"><i style="width:${(counts[k] / db.s.vehicles.length) * 100}%;background:${c}"></i></div><b>${counts[k]}</b></div>`).join('')}
<h3 style="margin-top:18px">Needs attention</h3>${al.length ? al.slice(0, 5).map((a, i) => `<div class="alert ${a.c}" data-al="${i}" style="cursor:pointer">${a.m}</div>`).join('') : '<p style="color:var(--mut);margin:0">All good. Nothing needs your attention.</p>'}</div></div>
<div class="cols eq"><div class="card"><h3>Today: pick-ups <small>${fmtDateY(t)}</small></h3><div class="list">${st.pickups.length ? st.pickups.map((b) => line(b)).join('') : '<p style="color:var(--mut);margin:0">No pick-up scheduled today.</p>'}</div>
<h3 style="margin-top:18px">Today: returns</h3><div class="list">${st.returns.length ? st.returns.map((b) => line(b)).join('') : '<p style="color:var(--mut);margin:0">No return expected today.</p>'}</div></div>
<div class="card"><h3>Latest requests</h3><div class="list">${[...db.s.bookings].filter((b) => b.status === 'pending').sort((a, b) => b.id.localeCompare(a.id)).slice(0, 6).map((b) => line(b, `<b>${money(b.total)}</b>`)).join('') || '<p style="color:var(--mut);margin:0">No pending request. New web bookings appear here instantly.</p>'}</div></div></div>`;
}

function viewBookings() {
  const q = F.q.toLowerCase();
  let list = db.s.bookings.filter((b) => (F.status === 'all' || b.status === F.status));
  if (q) list = list.filter((b) => { const c = db.customer(b.customerId), v = db.vehicle(b.vehicleId); return `${b.id} ${c.name} ${c.phone} ${v.make} ${v.model} ${v.plate}`.toLowerCase().includes(q); });
  list.sort((a, b) => b.start.localeCompare(a.start));
  const cnt = (s) => db.s.bookings.filter((b) => s === 'all' || b.status === s).length;
  return `<div class="bar-tools"><input id="bq" type="search" placeholder="Search name, phone, plate or reference" value="${esc(F.q)}" /><div class="seg">${['all', ...Object.keys(STATUS)].map((s) => `<button type="button" data-st="${s}" class="${F.status === s ? 'on' : ''}">${s === 'all' ? 'All' : STATUS[s].label} (${cnt(s)})</button>`).join('')}</div></div>
<div class="card scroll" style="padding:0"><table class="tbl"><thead><tr><th>Ref</th><th>Customer</th><th>Car</th><th>Dates</th><th>Status</th><th class="r">Total</th><th class="r">Balance</th></tr></thead><tbody>
${list.slice(0, 80).map((b) => { const c = db.customer(b.customerId), v = db.vehicle(b.vehicleId); return `<tr class="click" data-b="${b.id}"><td class="mono">${b.id}</td><td><b>${esc(c.name)}</b><br /><small style="color:var(--mut)">${SOURCES[b.source] || ''}</small></td><td>${vName(v)}<br /><small class="mono" style="color:var(--mut)">${esc(v.plate)}</small></td><td>${fmtDate(b.start)} → ${fmtDate(b.end)}<br /><small style="color:var(--mut)">${nights(b.start, b.end)} days</small></td><td>${pill(b.status)}</td><td class="r"><b>${money(b.total)}</b></td><td class="r">${b.status === 'cancelled' ? '—' : bal(b) > 0 ? `<span class="tag w">${money(bal(b))}</span>` : '<span class="tag g">Paid</span>'}</td></tr>`; }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--mut);padding:30px">No booking matches.</td></tr>'}
</tbody></table></div>${list.length > 80 ? `<p style="color:var(--mut)">Showing the 80 most recent of ${list.length}.</p>` : ''}`;
}

const CW = 44;
function viewCalendar() {
  const N = 28, days = Array.from({ length: N }, (_, i) => addDays(calStart, i)), t = today();
  const wd = (d) => new Date(`${d}T00:00:00Z`).getUTCDay();
  const head = `<div class="cal-r cal-h"><div class="cal-n" style="background:#fafbfd"><b>${fmtDate(calStart, { day: 'numeric', month: 'short' })} – ${fmtDate(days[N - 1], { day: 'numeric', month: 'short' })}</b></div>${days.map((d) => `<div class="cal-d ${wd(d) === 0 || wd(d) === 6 ? 'we' : ''} ${d === t ? 'td' : ''}"><span>${'SMTWTFS'[wd(d)]}</span><b>${d.slice(8)}</b></div>`).join('')}</div>`;
  const rows = db.s.vehicles.map((v) => {
    const bars = db.s.bookings.filter((b) => b.vehicleId === v.id && b.status !== 'cancelled' && b.start < addDays(calStart, N) && b.end > calStart).map((b) => {
      const l = Math.max(0, diffDays(calStart, b.start)), r = Math.min(N, diffDays(calStart, b.end)); const c = db.customer(b.customerId);
      return `<div class="cal-b" data-b="${b.id}" style="left:${l * CW + 2}px;width:${(r - l) * CW - 4}px;background:${STATUS[b.status].color}" title="${esc(c.name)} · ${fmtDate(b.start)} → ${fmtDate(b.end)}">${esc(c.name.split(' ')[0])}</div>`;
    }).join('') + db.s.maintenance.filter((m) => m.vehicleId === v.id && m.start < addDays(calStart, N) && m.end > calStart).map((m) => { const l = Math.max(0, diffDays(calStart, m.start)), r = Math.min(N, diffDays(calStart, m.end)); return `<div class="cal-b m" data-m="${m.id}" style="left:${l * CW + 2}px;width:${Math.max(1, r - l) * CW - 4}px" title="${esc(m.type)}">Service</div>`; }).join('');
    return `<div class="cal-r"><div class="cal-n"><b>${vName(v)}</b><small class="mono">${esc(v.plate)}</small></div><div class="cal-c">${days.map((d) => `<div class="cal-d ${wd(d) === 0 || wd(d) === 6 ? 'we' : ''} ${d === t ? 'td' : ''}" data-cell="${v.id}|${d}"></div>`).join('')}${bars}</div></div>`;
  }).join('');
  return `<div class="bar-tools"><button class="btn ln sm" data-cal="-14">← 2 weeks</button><button class="btn ln sm" data-cal="0">Today</button><button class="btn ln sm" data-cal="14">2 weeks →</button></div>
<div class="cal"><div class="cal-in">${head}${rows}</div></div>
<div class="legend">${Object.entries(STATUS).filter(([k]) => k !== 'cancelled').map(([, s]) => `<span><i style="background:${s.color}"></i>${s.label}</span>`).join('')}<span><i style="background:#8795ad"></i>Workshop</span><span>Click an empty day to create a booking.</span></div>`;
}

function viewFleet() {
  const list = db.s.vehicles.filter((v) => F.cat === 'all' || v.cat === F.cat);
  return `<div class="bar-tools"><div class="seg">${[['all', 'All'], ...Object.entries(CATS).map(([k, c]) => [k, c.name])].map(([k, n]) => `<button type="button" data-fc="${k}" class="${F.cat === k ? 'on' : ''}">${n}</button>`).join('')}</div><span style="flex:1"></span><button class="btn ln sm" id="addMaint">+ Workshop slot</button><button class="btn dk sm" id="addVeh">+ Add a car</button></div>
<div class="fleet">${list.map((v) => { const s = vStatus(v), left = v.nextService - v.odo, pct = Math.max(4, Math.min(100, 100 - (left / SERVICE_EVERY) * 100)); return `<div class="v" data-v="${v.id}"><div class="art">${carSvg(v.body, v.color, 'f')}</div><div class="bd"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><h4>${vName(v)}<br /><small class="mono" style="color:var(--mut);font-weight:600">${esc(v.plate)}</small></h4><span class="tag ${VST[s][1]}">${VST[s][0]}</span></div>
<div class="m"><span>${CATS[v.cat].name} · ${v.gearbox}</span><b style="color:var(--tx)">${money(v.price)}/day</b></div><div class="prog" title="Next service"><i style="width:${pct}%;${left <= 1000 ? 'background:var(--bad)' : ''}"></i></div><div class="m"><span>${v.odo.toLocaleString()} km</span><span>Service in ${Math.max(0, left).toLocaleString()} km</span></div></div></div>`; }).join('')}</div>`;
}

function viewCustomers() {
  const q = F.cq.toLowerCase();
  const list = db.s.customers.filter((c) => !q || `${c.name} ${c.phone} ${c.email} ${c.licenseNo}`.toLowerCase().includes(q)).map((c) => ({ c, s: db.customerStats(c.id) })).sort((a, b) => b.s.spent - a.s.spent);
  return `<div class="bar-tools"><input id="cq" type="search" placeholder="Search name, phone, email or licence" value="${esc(F.cq)}" /></div>
<div class="card scroll" style="padding:0"><table class="tbl"><thead><tr><th>Customer</th><th>Contact</th><th>Licence</th><th class="r">Rentals</th><th class="r">Paid</th><th>Last rental</th></tr></thead><tbody>${list.map(({ c, s }) => `<tr class="click" data-c="${c.id}"><td><b>${esc(c.name)}</b> ${c.flag === 'vip' ? '<span class="tag g">VIP</span>' : c.flag === 'blocked' ? '<span class="tag r">Blocked</span>' : ''}<br /><small style="color:var(--mut)">${esc(c.city)}${c.country ? ', ' + esc(c.country) : ''}</small></td><td>${esc(c.phone)}<br /><small style="color:var(--mut)">${esc(c.email)}</small></td><td class="mono">${esc(c.licenseNo)}</td><td class="r">${s.count}</td><td class="r"><b>${money(s.spent)}</b></td><td>${s.last ? fmtDate(s.last) : '—'}</td></tr>`).join('')}</tbody></table></div>`;
}

function viewPricing() {
  const set = db.s.settings;
  return `<div class="cols eq"><div class="card"><h3>Rules</h3><div class="fg">
<label>Weekly discount (7+ days) %<input type="number" min="0" max="50" data-set="weekly" value="${set.weekly}" /></label>
<label>Monthly discount (30+ days) %<input type="number" min="0" max="60" data-set="monthly" value="${set.monthly}" /></label>
<label>High season surcharge % (July, August, December)<input type="number" min="0" max="100" data-set="peakPct" value="${set.peakPct}" /></label></div>
<p style="color:var(--mut);margin:14px 0 0">Rules apply instantly to the public website: change a value, then open the site and search the same dates to see the new price.</p>
<h3 style="margin-top:20px">Extras</h3>${EXTRAS.map((x) => `<div class="row"><div class="g"><b>${esc(x.name)}</b></div><span>${money(x.price)} / ${x.per}</span></div>`).join('')}</div>
<div class="card"><h3>Daily rates <small>base price per car</small></h3>${db.s.vehicles.map((v) => `<div class="row"><div class="g"><b>${vName(v)}</b><small>${CATS[v.cat].name}</small></div><input type="number" min="1" data-rate="${v.id}" value="${v.price}" style="width:96px;border:1px solid #d3d9e6;border-radius:9px;padding:8px;font:700 14px 'Manrope',sans-serif" /> <small>MAD</small></div>`).join('')}</div></div>`;
}

function viewReports() {
  const t = today(), from = addDays(t, -repDays);
  const byCat = {}, bySrc = {};
  db.s.payments.filter((p) => p.date >= from && p.date <= t).forEach((p) => { const b = db.booking(p.bookingId); if (!b) return; const c = db.vehicle(b.vehicleId).cat; byCat[c] = (byCat[c] || 0) + p.amount; });
  db.s.bookings.filter((b) => b.status !== 'cancelled' && b.start >= from).forEach((b) => { bySrc[b.source] = (bySrc[b.source] || 0) + 1; });
  const util = db.s.vehicles.map((v) => {
    let booked = 0; db.s.bookings.filter((b) => b.vehicleId === v.id && (b.status === 'returned' || b.status === 'active')).forEach((b) => { const s = b.start < from ? from : b.start, e = b.end > t ? t : b.end; if (e > s) booked += diffDays(s, e); });
    return { v, pct: Math.min(100, Math.round((booked / repDays) * 100)) };
  }).sort((a, b) => b.pct - a.pct);
  const total = Object.values(byCat).reduce((a, b) => a + b, 0), mx = Math.max(1, ...Object.values(byCat)), sm = Math.max(1, ...Object.values(bySrc));
  const top = db.s.customers.map((c) => ({ c, s: db.customerStats(c.id) })).sort((a, b) => b.s.spent - a.s.spent).slice(0, 5);
  return `<div class="bar-tools"><div class="seg">${[30, 90].map((d) => `<button data-rd="${d}" class="${repDays === d ? 'on' : ''}">Last ${d} days</button>`).join('')}</div></div>
<div class="cols eq"><div class="card"><h3>Revenue by category <small>${money(total)}</small></h3>${Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="hbar"><span>${CATS[k].name}</span><div class="t"><i style="width:${(v / mx) * 100}%"></i></div><b>${money(v)}</b></div>`).join('') || '<p style="color:var(--mut)">No payment in this period.</p>'}
<h3 style="margin-top:20px">Bookings by source</h3>${Object.entries(bySrc).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="hbar"><span>${SOURCES[k]}</span><div class="t"><i style="width:${(v / sm) * 100}%"></i></div><b>${v}</b></div>`).join('')}
<h3 style="margin-top:20px">Best customers</h3>${top.map(({ c, s }) => `<div class="row"><div class="g"><b>${esc(c.name)}</b><small>${s.count} rental${s.count === 1 ? '' : 's'}</small></div><b>${money(s.spent)}</b></div>`).join('')}</div>
<div class="card"><h3>Utilisation per car <small>days rented / ${repDays}</small></h3>${util.map(({ v, pct }) => `<div class="hbar"><span>${vName(v)}</span><div class="t"><i style="width:${pct}%;${pct < 30 ? 'background:#e5484d' : ''}"></i></div><b>${pct}%</b></div>`).join('')}</div></div>`;
}

function viewSettings() {
  const set = db.s.settings;
  return `<div class="cols eq"><div class="card"><h3>Company</h3><div class="fg"><label>Company name<input data-set="company" value="${esc(set.company)}" /></label><label>Display currency<select data-set="currency">${['MAD', 'USD', 'EUR'].map((c) => `<option ${set.currency === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label><label>Minimum driver age<input type="number" data-set="minAge" min="18" max="30" value="${set.minAge}" /></label></div></div>
<div class="card"><h3>Demo data</h3><p style="margin:0 0 14px;color:var(--mut)">Everything you see is stored only in this browser. Reset to start again with fresh sample data (your changes are lost).</p><button class="btn dg" id="resetBtn">Reset demo data</button></div></div>`;
}

const VIEWS = { dash: viewDash, bookings: viewBookings, calendar: viewCalendar, fleet: viewFleet, customers: viewCustomers, pricing: viewPricing, reports: viewReports, settings: viewSettings };

// ── actions ──────────────────────────────────────────────────────────────────
function openBooking(id) {
  const b = db.booking(id); if (!b) return;
  const v = db.vehicle(b.vehicleId), c = db.customer(b.customerId), q = quote(v, b.start, b.end, b.extras);
  const pays = db.s.payments.filter((p) => p.bookingId === b.id);
  const acts = { pending: `<button class="btn gn" data-act="confirmed">Confirm booking</button>`, confirmed: `<button class="btn gn" data-act="out">Check out (hand over keys)</button>`, active: `<button class="btn gn" data-act="in">Check in (return)</button>` }[b.status] || '';
  const canCancel = b.status === 'pending' || b.status === 'confirmed';
  modal(`${esc(c.name)} <span class="mono" style="color:var(--mut);font-size:14px">${b.id}</span>`, `
<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${pill(b.status)}<span class="tag">${SOURCES[b.source] || ''}</span>${c.flag === 'vip' ? '<span class="tag g">VIP</span>' : ''}${c.flag === 'blocked' ? '<span class="tag r">Blocked customer</span>' : ''}${b.status === 'active' && b.end < today() ? '<span class="tag r">Late return</span>' : ''}</div>
<div class="fg c2"><div><dl class="dl"><dt>Car</dt><dd>${vName(v)}</dd><dt>Plate</dt><dd class="mono">${esc(v.plate)}</dd><dt>Pick-up</dt><dd>${fmtDateY(b.start)}</dd><dt>Return</dt><dd>${fmtDateY(b.end)} (${q.days}d)</dd><dt>Pick-up point</dt><dd>${esc(b.pickup)}</dd><dt>Drop-off</dt><dd>${esc(b.dropoff)}</dd></dl></div>
<div><dl class="dl"><dt>Phone</dt><dd>${esc(c.phone)}</dd><dt>Email</dt><dd>${esc(c.email)}</dd><dt>Licence</dt><dd class="mono">${esc(c.licenseNo)}</dd><dt>Deposit</dt><dd>${money(CATS[v.cat].deposit)}</dd>${b.odoOut ? `<dt>Km out</dt><dd class="mono">${b.odoOut.toLocaleString()}</dd>` : ''}${b.odoIn ? `<dt>Km in</dt><dd class="mono">${b.odoIn.toLocaleString()}</dd>` : ''}</dl></div></div>
<div class="card" style="background:#fafbfd"><dl class="dl"><dt>Rental ${q.days} day${q.days > 1 ? 's' : ''}</dt><dd>${money(q.base)}</dd>${q.discount ? `<dt>${q.discPct}% long rental</dt><dd>−${money(q.discount)}</dd>` : ''}${q.lines.map((l) => `<dt>${esc(l.name)}</dt><dd>${money(l.amount)}</dd>`).join('')}${b.lateFee ? `<dt>Late return fee</dt><dd>${money(b.lateFee)}</dd>` : ''}<dt><b>Total</b></dt><dd>${money(b.total)}</dd><dt>Paid</dt><dd>${money(b.paid || 0)}</dd><dt><b>Balance</b></dt><dd style="color:${bal(b) ? 'var(--bad)' : 'var(--ok)'}">${money(bal(b))}</dd></dl>
${pays.length ? `<div style="margin-top:10px;color:var(--mut);font-size:13px">${pays.map((p) => `${fmtDate(p.date)} · ${p.method} · ${money(p.amount)}`).join('<br />')}</div>` : ''}</div>
${b.notes ? `<p style="margin:0"><b>Note:</b> ${esc(b.notes)}</p>` : ''}
<div id="actArea"></div>`,
  `${canCancel ? `<button class="btn dg" data-act="cancel">Cancel booking</button>` : ''}<button class="btn ln" data-act="pay" ${b.status === 'cancelled' ? 'disabled' : ''}>Record payment</button><button class="btn ln" data-act="contract">Contract</button><button class="btn ln" data-act="invoice">Invoice</button>${acts}`);
  $('#amodal').querySelectorAll('[data-act]').forEach((el) => el.addEventListener('click', () => doAct(b.id, el.dataset.act)));
}

function doAct(id, act) {
  const b = db.booking(id), v = db.vehicle(b.vehicleId), area = $('#actArea');
  const form = (html, onOk, label = 'Save') => { area.innerHTML = `<form class="card" id="af" style="border-color:var(--acc)"><div class="fg c2">${html}</div><div id="aerr" class="err" hidden style="margin-top:10px"></div><div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end"><button class="btn ln sm" type="button" id="acx">Back</button><button class="btn pri sm" type="submit">${label}</button></div></form>`; $('#acx').onclick = () => { area.innerHTML = ''; }; $('#af').onsubmit = (e) => { e.preventDefault(); onOk(Object.fromEntries(new FormData(e.target).entries())); }; const f = area.querySelector('input,select'); if (f) f.focus(); area.scrollIntoView({ block: 'nearest' }); };
  if (act === 'confirmed') { db.setStatus(id, 'confirmed'); toast(`Booking ${id} confirmed. The customer is notified.`); return openBooking(id); }
  if (act === 'cancel') { form('<p style="grid-column:1/-1;margin:0"><b>Cancel this booking?</b> The car becomes available again.</p>', () => { db.setStatus(id, 'cancelled'); toast('Booking cancelled'); openBooking(id); }, 'Yes, cancel'); return; }
  if (act === 'out') return form(`<label>Odometer (km)<input name="odo" type="number" required value="${v.odo}" /></label><label>Fuel level<select name="fuel"><option>Full</option><option>3/4</option><option>1/2</option></select></label><label class="ck" style="grid-column:1/-1"><input type="checkbox" name="doc" required /> Licence, ID and deposit card checked</label>`, (d) => { db.setStatus(id, 'active', { odoOut: Number(d.odo), fuelOut: d.fuel }); toast('Car handed over'); openBooking(id); }, 'Hand over');
  if (act === 'in') {
    const late = Math.max(0, diffDays(b.end, today())), fee = late ? Math.round(late * v.price * 1.5) : 0;
    return form(`<label>Odometer (km)<input name="odo" type="number" required value="${(b.odoOut || v.odo) + nights(b.start, today()) * 110}" /></label><label>Fuel level<select name="fuel"><option>Full</option><option>3/4</option><option>1/2</option><option>1/4</option></select></label>${late ? `<p class="err" style="grid-column:1/-1;margin:0">Returned ${late} day${late > 1 ? 's' : ''} late: a fee of ${money(fee)} (150% of the daily rate) is added.</p>` : ''}<label style="grid-column:1/-1">Damage or remark (optional)<input name="remark" /></label>`, (d) => { const odo = Number(d.odo); if (odo < (b.odoOut || 0)) { const e = $('#aerr'); e.textContent = 'The return odometer cannot be lower than the one at pick-up.'; e.hidden = false; return; } db.setStatus(id, 'returned', { odoIn: odo, fuelIn: d.fuel, notes: d.remark ? `${b.notes ? b.notes + ' · ' : ''}Return: ${d.remark}` : b.notes, ...(fee ? { lateFee: fee, total: b.total + fee } : {}) }); toast('Car returned'); openBooking(id); }, 'Complete return');
  }
  if (act === 'pay') return form(`<label>Amount (MAD)<input name="amt" type="number" min="1" required value="${bal(b) || ''}" /></label><label>Method<select name="m"><option>Card</option><option>Cash</option><option>Bank transfer</option></select></label>`, (d) => { db.addPayment(id, Number(d.amt), d.m); toast('Payment recorded'); openBooking(id); }, 'Record payment');
  if (act === 'contract' || act === 'invoice') printDoc(b, act);
}

function printDoc(b, kind) {
  const v = db.vehicle(b.vehicleId), c = db.customer(b.customerId), q = quote(v, b.start, b.end, b.extras), co = esc(db.s.settings.company);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${kind === 'invoice' ? 'Invoice' : 'Rental contract'} ${b.id}</title><style>body{font:14px/1.55 system-ui,sans-serif;color:#111;max-width:760px;margin:30px auto;padding:0 24px}h1{margin:0 0 2px}table{width:100%;border-collapse:collapse;margin:14px 0}td,th{border-bottom:1px solid #ddd;padding:7px 4px;text-align:left}td:last-child,th:last-child{text-align:right}.sig{display:flex;gap:30px;margin-top:60px}.sig div{flex:1;border-top:1px solid #111;padding-top:6px;font-size:12px}small{color:#666}</style></head><body>
<h1>${co}</h1><small>Demo document · fictional company</small><h2>${kind === 'invoice' ? 'Invoice' : 'Car rental contract'} ${b.id}</h2>
<p><b>Customer:</b> ${esc(c.name)} · ${esc(c.phone)} · ${esc(c.email)}<br><b>Licence:</b> ${esc(c.licenseNo)}</p>
<p><b>Vehicle:</b> ${v.make} ${v.model} · plate ${esc(v.plate)}<br><b>Period:</b> ${fmtDateY(b.start)} → ${fmtDateY(b.end)} (${q.days} days)<br><b>Pick-up:</b> ${esc(b.pickup)} · <b>Drop-off:</b> ${esc(b.dropoff)}</p>
<table><tr><th>Description</th><th>Amount (MAD)</th></tr><tr><td>Rental ${q.days} day(s)</td><td>${q.base}</td></tr>${q.discount ? `<tr><td>Long rental discount ${q.discPct}%</td><td>−${q.discount}</td></tr>` : ''}${q.lines.map((l) => `<tr><td>${esc(l.name)}</td><td>${l.amount}</td></tr>`).join('')}${b.lateFee ? `<tr><td>Late return fee</td><td>${b.lateFee}</td></tr>` : ''}<tr><th>Total</th><th>${b.total}</th></tr><tr><td>Paid</td><td>${b.paid || 0}</td></tr><tr><td><b>Balance</b></td><td><b>${Math.max(0, b.total - (b.paid || 0))}</b></td></tr></table>
${kind === 'contract' ? `<p><small>Security deposit: ${CATS[v.cat].deposit} MAD held on the customer's card. 200 km/day included (unlimited from 3 days). Fuel: return with the same level. The customer is responsible for fines and for damage up to the insurance excess. Basic insurance included.</small></p><div class="sig"><div>Customer signature</div><div>${co} representative</div></div>` : `<p><small>Prices in MAD, taxes included.</small></p>`}
<script>onload=()=>setTimeout(()=>print(),250)<\/script></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return toast('Allow pop-ups to print the document.');
  w.document.write(html); w.document.close();
}

function bookingForm(pre = {}) {
  let start = pre.start || today(), end = pre.end || addDays(start, 3), ex = [];
  const draw = (keep = {}) => {
    const free = db.s.vehicles.filter((v) => db.isFree(v.id, start, end));
    const vid = keep.vehicleId && free.some((v) => v.id === keep.vehicleId) ? keep.vehicleId : pre.vehicleId && free.some((v) => v.id === pre.vehicleId) ? pre.vehicleId : free[0]?.id;
    const q = vid ? quote(db.vehicle(vid), start, end, ex) : null;
    modal('New booking', `<form id="nb" class="fg" novalidate>
<div class="fg c3"><label>Pick-up<input type="date" name="start" min="${today()}" value="${start}" /></label><label>Return<input type="date" name="end" min="${addDays(start, 1)}" value="${end}" /></label><label>Source<select name="source">${Object.entries(SOURCES).filter(([k]) => k !== 'website').map(([k, n]) => `<option value="${k}" ${keep.source === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
<label>Car (${free.length} available for these dates)<select name="vehicleId">${free.map((v) => `<option value="${v.id}" ${v.id === vid ? 'selected' : ''}>${esc(v.make)} ${esc(v.model)} · ${esc(v.plate)} · ${money(v.price)}/day</option>`).join('') || '<option value="">No car available</option>'}</select></label>
<label>Customer<select name="cust"><option value="new">New customer</option>${db.s.customers.filter((c) => c.flag !== 'blocked').map((c) => `<option value="${c.id}" ${keep.cust === c.id ? 'selected' : ''}>${esc(c.name)} · ${esc(c.phone)}</option>`).join('')}</select></label>
<div id="newc" class="fg c2" ${keep.cust && keep.cust !== 'new' ? 'hidden' : ''}><label>Name<input name="name" value="${esc(keep.name || '')}" /></label><label>Phone<input name="phone" value="${esc(keep.phone || '')}" /></label><label>Email<input name="email" type="email" value="${esc(keep.email || '')}" /></label><label>Licence number<input name="licenseNo" value="${esc(keep.licenseNo || '')}" /></label></div>
<div class="fg c2"><label>Pick-up point<select name="pickup">${LOCATIONS.map((l) => `<option>${esc(l)}</option>`).join('')}</select></label><label>Extras</label></div>
<div class="fg c2" style="margin-top:-6px">${EXTRAS.map((x) => `<label class="ck"><input type="checkbox" value="${x.id}" ${ex.includes(x.id) ? 'checked' : ''} />${esc(x.name)} (${money(x.price)})</label>`).join('')}</div>
<div class="err" id="nberr" hidden></div>
${q ? `<div class="card" style="background:#fafbfd"><dl class="dl"><dt>${q.days} days</dt><dd>${money(q.base)}</dd>${q.discount ? `<dt>Long rental discount</dt><dd>−${money(q.discount)}</dd>` : ''}${q.extras ? `<dt>Extras</dt><dd>${money(q.extras)}</dd>` : ''}<dt><b>Total</b></dt><dd><b>${money(q.total)}</b></dd></dl></div>` : ''}
</form>`, `<button class="btn ln" data-x>Cancel</button><button class="btn pri" id="nbok" ${vid ? '' : 'disabled'}>Create booking</button>`);
    const f = $('#nb');
    const snap = () => { const d = Object.fromEntries(new FormData(f).entries()); ex = [...f.querySelectorAll('input[type=checkbox]:checked')].map((x) => x.value); return d; };
    ['start', 'end', 'vehicleId'].forEach((n) => f.elements[n].addEventListener('change', () => { const d = snap(); start = d.start || start; end = d.end && d.end > start ? d.end : addDays(start, 1); draw({ ...d, vehicleId: d.vehicleId }); }));
    f.querySelectorAll('input[type=checkbox]').forEach((c) => c.addEventListener('change', () => { const d = snap(); draw(d); }));
    f.elements.cust.addEventListener('change', () => { $('#newc').hidden = f.elements.cust.value !== 'new'; });
    $('#nbok').addEventListener('click', () => {
      const d = snap(); const err = $('#nberr'); const bad = (m) => { err.textContent = m; err.hidden = false; };
      let customer;
      if (d.cust === 'new') { if (d.name.trim().length < 3) return bad('Enter the customer name.'); if (d.phone.replace(/\D/g, '').length < 8) return bad('Enter a valid phone number.'); customer = { name: d.name.trim(), phone: d.phone.trim(), email: d.email.trim(), licenseNo: d.licenseNo.trim() }; } else { const c = db.customer(d.cust); customer = { name: c.name, phone: c.phone, email: c.email }; }
      const res = db.createBooking({ vehicleId: d.vehicleId, start, end, extras: ex, customer, source: d.source, pickup: d.pickup, dropoff: d.pickup, status: 'confirmed' });
      if (!res.ok) return bad(res.error);
      toast(`Booking ${res.booking.id} created`); tab = 'bookings'; closeModal(); openBooking(res.booking.id);
    });
  };
  draw();
}

function openVehicle(id) {
  const v = id ? db.vehicle(id) : { make: '', model: '', cat: 'economy', body: 'hatch', seats: 5, bags: 2, gearbox: 'Manual', fuel: 'Diesel', color: '#2f6fdd', price: 300, year: new Date().getFullYear(), plate: '', odo: 0, nextService: SERVICE_EVERY, insuranceExp: addDays(today(), 365), outOfService: false };
  const maint = id ? db.s.maintenance.filter((m) => m.vehicleId === id) : [];
  const hist = id ? db.s.bookings.filter((b) => b.vehicleId === id && b.status !== 'cancelled').sort((a, b) => b.start.localeCompare(a.start)).slice(0, 5) : [];
  const sel = (n, opts, cur) => `<select name="${n}">${opts.map((o) => `<option value="${o[0]}" ${o[0] === cur ? 'selected' : ''}>${o[1]}</option>`).join('')}</select>`;
  modal(id ? `${vName(v)}` : 'Add a car', `<form id="vf" class="fg">${id ? `<div style="background:linear-gradient(180deg,#eef1f7,#e0e6f1);border-radius:12px;padding:10px 40px 0">${carSvg(v.body, v.color, 'e')}</div>` : ''}
<div class="fg c2"><label>Make<input name="make" required value="${esc(v.make)}" /></label><label>Model<input name="model" required value="${esc(v.model)}" /></label>
<label>Category${sel('cat', Object.entries(CATS).map(([k, c]) => [k, c.name]), v.cat)}</label><label>Body${sel('body', [['hatch', 'Hatchback'], ['sedan', 'Sedan'], ['suv', 'SUV'], ['van', 'Van']], v.body)}</label>
<label>Plate<input name="plate" required value="${esc(v.plate)}" /></label><label>Colour<input name="color" type="color" value="${v.color}" /></label>
<label>Daily price (MAD)<input name="price" type="number" min="1" required value="${v.price}" /></label><label>Seats<input name="seats" type="number" min="2" max="9" value="${v.seats}" /></label>
<label>Gearbox${sel('gearbox', [['Manual', 'Manual'], ['Automatic', 'Automatic']], v.gearbox)}</label><label>Fuel${sel('fuel', [['Diesel', 'Diesel'], ['Petrol', 'Petrol'], ['Hybrid', 'Hybrid'], ['Electric', 'Electric']], v.fuel)}</label>
<label>Odometer (km)<input name="odo" type="number" min="0" value="${v.odo}" /></label><label>Next service at (km)<input name="nextService" type="number" min="0" value="${v.nextService}" /></label>
<label>Insurance valid until<input name="insuranceExp" type="date" value="${v.insuranceExp}" /></label><label class="ck" style="align-self:end"><input type="checkbox" name="outOfService" ${v.outOfService ? 'checked' : ''} /> Out of service (hidden from the website)</label></div>
<div class="err" id="verr" hidden></div></form>
${id ? `<div class="card"><h3>Workshop</h3>${maint.map((m) => `<div class="row"><div class="g"><b>${esc(m.type)}</b><small>${fmtDate(m.start)} → ${fmtDate(m.end)} · ${money(m.cost)}</small></div><button class="btn dg sm" data-rm="${m.id}">Remove</button></div>`).join('') || '<p style="color:var(--mut);margin:0">No workshop slot.</p>'}</div><div class="card"><h3>Recent rentals</h3>${hist.map((b) => `<div class="row click" data-b2="${b.id}"><div class="g"><b>${esc(db.customer(b.customerId).name)}</b><small>${fmtDate(b.start)} → ${fmtDate(b.end)}</small></div>${pill(b.status)}</div>`).join('') || '<p style="color:var(--mut);margin:0">No rental yet.</p>'}</div>` : ''}`,
  `<button class="btn ln" data-x>Cancel</button><button class="btn pri" id="vok">Save</button>`);
  $('#amodal').querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => { db.removeMaintenance(b.dataset.rm); toast('Workshop slot removed'); openVehicle(id); }));
  $('#amodal').querySelectorAll('[data-b2]').forEach((b) => b.addEventListener('click', () => openBooking(b.dataset.b2)));
  $('#vok').addEventListener('click', () => {
    const d = Object.fromEntries(new FormData($('#vf')).entries()); const err = $('#verr');
    if (!d.make.trim() || !d.model.trim() || !d.plate.trim()) { err.textContent = 'Make, model and plate are required.'; err.hidden = false; return; }
    db.saveVehicle({ ...(id ? { id } : {}), make: d.make.trim(), model: d.model.trim(), cat: d.cat, body: d.body, plate: d.plate.trim(), color: d.color, price: Number(d.price), seats: Number(d.seats), bags: v.bags, gearbox: d.gearbox, fuel: d.fuel, odo: Number(d.odo), nextService: Number(d.nextService), insuranceExp: d.insuranceExp, outOfService: !!d.outOfService, year: v.year });
    toast('Car saved'); closeModal();
  });
}

function openMaint(vehicleId) {
  modal('Workshop slot', `<form id="mf" class="fg"><label>Car<select name="v">${db.s.vehicles.map((v) => `<option value="${v.id}" ${v.id === vehicleId ? 'selected' : ''}>${esc(v.make)} ${esc(v.model)} · ${esc(v.plate)}</option>`).join('')}</select></label>
<div class="fg c2"><label>From<input name="s" type="date" value="${addDays(today(), 1)}" /></label><label>Until<input name="e" type="date" value="${addDays(today(), 3)}" /></label></div>
<label>Work<input name="t" value="Oil change and brakes" /></label><label>Cost (MAD)<input name="c" type="number" min="0" value="1200" /></label><div class="err" id="merr" hidden></div></form>`,
  `<button class="btn ln" data-x>Cancel</button><button class="btn pri" id="mok">Save</button>`, true);
  $('#mok').addEventListener('click', () => {
    const d = Object.fromEntries(new FormData($('#mf')).entries()), err = $('#merr');
    if (d.e <= d.s) { err.textContent = 'The end date must be after the start date.'; err.hidden = false; return; }
    const clash = db.s.bookings.find((b) => b.vehicleId === d.v && b.status !== 'cancelled' && b.status !== 'returned' && b.start < d.e && d.s < b.end);
    if (clash) { err.textContent = `This car is booked in these dates (${clash.id}, ${fmtDate(clash.start)} → ${fmtDate(clash.end)}). Move that booking first.`; err.hidden = false; return; }
    db.addMaintenance({ vehicleId: d.v, start: d.s, end: d.e, type: d.t.trim() || 'Service', cost: Number(d.c) || 0 }); toast('Workshop slot added'); closeModal();
  });
}

function openCustomer(id) {
  const c = db.customer(id), s = db.customerStats(id), bs = db.s.bookings.filter((b) => b.customerId === id).sort((a, b) => b.start.localeCompare(a.start));
  modal(esc(c.name), `<div class="fg c2"><div><dl class="dl"><dt>Phone</dt><dd>${esc(c.phone)}</dd><dt>Email</dt><dd>${esc(c.email)}</dd><dt>From</dt><dd>${esc(c.city)}${c.country ? ', ' + esc(c.country) : ''}</dd></dl></div><div><dl class="dl"><dt>Licence</dt><dd class="mono">${esc(c.licenseNo)}</dd><dt>Rentals</dt><dd>${s.count}</dd><dt>Total paid</dt><dd>${money(s.spent)}</dd></dl></div></div>
<form id="cf" class="fg"><label>Status<select name="flag"><option value="" ${!c.flag ? 'selected' : ''}>Standard</option><option value="vip" ${c.flag === 'vip' ? 'selected' : ''}>VIP</option><option value="blocked" ${c.flag === 'blocked' ? 'selected' : ''}>Blocked (cannot book online)</option></select></label><label>Private notes<textarea name="notes" rows="3">${esc(c.notes)}</textarea></label></form>
<div class="card"><h3>Rentals</h3>${bs.map((b) => `<div class="row click" data-b2="${b.id}"><div class="g"><b>${vName(db.vehicle(b.vehicleId))}</b><small>${fmtDate(b.start)} → ${fmtDate(b.end)}</small></div><b>${money(b.total)}</b>${pill(b.status)}</div>`).join('') || '<p style="color:var(--mut);margin:0">No rental.</p>'}</div>`,
  `<button class="btn ln" data-x>Close</button><button class="btn pri" id="cok">Save</button>`);
  $('#amodal').querySelectorAll('[data-b2]').forEach((b) => b.addEventListener('click', () => openBooking(b.dataset.b2)));
  $('#cok').addEventListener('click', () => { const d = Object.fromEntries(new FormData($('#cf')).entries()); db.saveCustomer({ id, flag: d.flag, notes: d.notes }); toast('Customer saved'); closeModal(); });
}

// ── shell ────────────────────────────────────────────────────────────────────
function renderTabs() {
  const pend = db.s.bookings.filter((b) => b.status === 'pending').length;
  $('#tabs').innerHTML = TABS.map(([k, n]) => `<button class="tab ${tab === k ? 'on' : ''}" data-tab="${k}"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${IC[k] || ''}</svg>${n}${k === 'bookings' && pend ? `<span class="n">${pend}</span>` : ''}</button>`).join('');
  $('#tabs').querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; render(); window.scrollTo(0, 0); }));
}
function render() {
  const t = TABS.find((x) => x[0] === tab);
  $('#pageTitle').textContent = t[1]; $('#pageSub').textContent = t[2]; $('#coName').textContent = db.s.settings.company;
  renderTabs();
  const view = $('#view'); view.innerHTML = VIEWS[tab]();
  view.querySelectorAll('[data-b]').forEach((e) => e.addEventListener('click', () => openBooking(e.dataset.b)));
  view.querySelectorAll('[data-st]').forEach((e) => e.addEventListener('click', () => { F.status = e.dataset.st; render(); }));
  view.querySelectorAll('[data-fc]').forEach((e) => e.addEventListener('click', () => { F.cat = e.dataset.fc; render(); }));
  view.querySelectorAll('[data-v]').forEach((e) => e.addEventListener('click', () => openVehicle(e.dataset.v)));
  view.querySelectorAll('[data-c]').forEach((e) => e.addEventListener('click', () => openCustomer(e.dataset.c)));
  view.querySelectorAll('[data-rd]').forEach((e) => e.addEventListener('click', () => { repDays = Number(e.dataset.rd); render(); }));
  view.querySelectorAll('[data-cal]').forEach((e) => e.addEventListener('click', () => { calStart = e.dataset.cal === '0' ? addDays(today(), -3) : addDays(calStart, Number(e.dataset.cal)); render(); }));
  view.querySelectorAll('[data-cell]').forEach((e) => e.addEventListener('click', () => { const [vehicleId, d] = e.dataset.cell.split('|'); if (d < today()) return toast('That day is in the past.'); bookingForm({ vehicleId, start: d, end: addDays(d, 3) }); }));
  view.querySelectorAll('[data-m]').forEach((e) => e.addEventListener('click', () => { const m = db.s.maintenance.find((x) => x.id === e.dataset.m); if (m) openVehicle(m.vehicleId); }));
  view.querySelectorAll('[data-al]').forEach((e) => e.addEventListener('click', () => { const a = alerts()[Number(e.dataset.al)]; if (a.b) openBooking(a.b); else if (a.v) openVehicle(a.v); else if (a.tab) { tab = a.tab; F.status = a.f || 'all'; render(); } }));
  const bq = $('#bq'); if (bq) bq.addEventListener('input', () => { F.q = bq.value; const pos = bq.selectionStart; render(); const n = $('#bq'); n.focus(); n.setSelectionRange(pos, pos); });
  const cq = $('#cq'); if (cq) cq.addEventListener('input', () => { F.cq = cq.value; const pos = cq.selectionStart; render(); const n = $('#cq'); n.focus(); n.setSelectionRange(pos, pos); });
  const av = $('#addVeh'); if (av) av.addEventListener('click', () => openVehicle(null));
  const am = $('#addMaint'); if (am) am.addEventListener('click', () => openMaint());
  view.querySelectorAll('[data-set]').forEach((e) => e.addEventListener('change', () => { const k = e.dataset.set; db.saveSettings({ [k]: e.type === 'number' ? Number(e.value) : e.value }); toast('Saved'); }));
  view.querySelectorAll('[data-rate]').forEach((e) => e.addEventListener('change', () => { const v = db.vehicle(e.dataset.rate); if (v && Number(e.value) > 0) { v.price = Number(e.value); db.saveVehicle({ id: v.id, price: v.price }); toast('Rate saved'); } }));
  const rb = $('#resetBtn'); if (rb) rb.addEventListener('click', () => { if (rb.dataset.sure) { db.reset(); toast('Demo data reset'); render(); } else { rb.dataset.sure = '1'; rb.textContent = 'Click again to confirm'; } });
}

function start() {
  $('#gate').hidden = true; $('#app').hidden = false;
  known = new Set(db.s.bookings.map((b) => b.id));
  $('#newBtn').addEventListener('click', () => bookingForm());
  db.subscribe((s) => {
    const fresh = s.bookings.filter((b) => !known.has(b.id)); known = new Set(s.bookings.map((b) => b.id));
    fresh.filter((b) => b.source === 'website').forEach((b) => toast(`New web booking ${b.id} from ${db.customer(b.customerId).name}`));
    const a = document.activeElement;
    if ((a && a.matches('input, select, textarea') && ($('#view').contains(a) || !$('#amodal').hidden)) || !$('#amodal').hidden) { renderTabs(); return; }
    render();
  });
  setInterval(() => { const a = document.activeElement; if (!(a && a.matches('input, select, textarea')) && $('#amodal').hidden) render(); }, 30000);
  render();
}

let cfg = { ok: false };
function gateText() {
  if (cfg.ok && !cfg.live) { $('#gateForm').hidden = true; $('#gateOff').hidden = false; $('#offTitle').textContent = cfg.state === 'expired' ? 'This demo has expired' : 'This demo is switched off'; $('#offBody').textContent = 'Please contact MBN DEV to get a new access.'; return; }
  const h = $('#pinHint'); if (cfg.ok && cfg.pinHint) { h.textContent = `Demo PIN: ${cfg.pinHint}`; h.hidden = false; } else h.hidden = true;
}
fetchConfig().then((c) => {
  cfg = c; gateText();
  if (c.ok && !c.live) { sessionStorage.removeItem(SK); return; }
  if (c.ok && sessionStorage.getItem(SK) === '1') start();
  else if (!c.ok) $('#pinErr').textContent = 'Cannot reach the server. Check your connection.';
});
$('#gateForm').addEventListener('submit', async (e) => {
  e.preventDefault(); const btn = e.target.querySelector('button'), err = $('#pinErr'); btn.disabled = true; err.textContent = '';
  const res = await verifyPin($('#pin').value.trim()); btn.disabled = false;
  if (res === 'ok') { sessionStorage.setItem(SK, '1'); start(); return; }
  if (res === 'unavailable') { cfg = { ok: true, live: false, state: 'disabled' }; gateText(); return; }
  err.textContent = res === 'bad' ? 'Wrong PIN. Try again.' : res === 'limited' ? 'Too many attempts. Try again in a few minutes.' : 'Cannot reach the server. Check your connection.';
  const f = $('#gateForm'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); $('#pin').select();
});
$('#pin').focus();
