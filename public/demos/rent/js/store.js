// ATLAS DRIVE demo — data layer shared by the public site and the owner dashboard.
// Everything lives in the visitor's localStorage; a BroadcastChannel keeps both pages in sync.
const KEY = 'mbn-rent-v1';
const CH = 'mbn-rent-sync';

// ── dates (all "YYYY-MM-DD", compared as UTC days so DST never shifts a rental) ──
export const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => ymd(new Date());
const utc = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
export const addDays = (s, n) => { const t = new Date(utc(s) + n * 864e5); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; };
export const diffDays = (a, b) => Math.round((utc(b) - utc(a)) / 864e5);
export const nights = (s, e) => Math.max(1, diffDays(s, e));
export const fmtDate = (s, o = { day: 'numeric', month: 'short' }) => new Date(utc(s)).toLocaleDateString('en-GB', { ...o, timeZone: 'UTC' });
export const fmtDateY = (s) => fmtDate(s, { day: 'numeric', month: 'short', year: 'numeric' });

// ── static catalogue ──
export const CATS = {
  economy: { name: 'Economy', blurb: 'Small, frugal, easy to park', deposit: 3000 },
  compact: { name: 'Compact', blurb: 'Comfortable for the city and the road', deposit: 4000 },
  sedan: { name: 'Sedan', blurb: 'Room and calm for long trips', deposit: 5000 },
  suv: { name: 'SUV', blurb: 'Higher seating, more space, any road', deposit: 6000 },
  premium: { name: 'Premium', blurb: 'German and British comfort', deposit: 12000 },
  van: { name: 'Van', blurb: 'Seven or more seats for groups', deposit: 7000 },
};
export const EXTRAS = [
  { id: 'gps', name: 'GPS navigation', price: 30, per: 'day' },
  { id: 'seat', name: 'Child seat', price: 40, per: 'day' },
  { id: 'driver', name: 'Additional driver', price: 50, per: 'day' },
  { id: 'cdw', name: 'Full insurance (zero excess)', price: 90, per: 'day' },
  { id: 'airport', name: 'Airport delivery', price: 150, per: 'trip' },
  { id: 'wifi', name: 'Pocket Wi-Fi', price: 35, per: 'day' },
];
export const LOCATIONS = ['Marrakech Menara Airport', 'Marrakech Gueliz office', 'Casablanca Mohammed V Airport', 'Agadir Al Massira Airport', 'Fes Saïss Airport', 'Tangier Ibn Battouta Airport'];
export const STATUS = {
  pending: { label: 'Pending', color: '#f5b83d' },
  confirmed: { label: 'Confirmed', color: '#4c8dff' },
  active: { label: 'On rent', color: '#22c58b' },
  returned: { label: 'Returned', color: '#8795ad' },
  cancelled: { label: 'Cancelled', color: '#ef5b5b' },
};
export const SOURCES = { website: 'Website', phone: 'Phone', walkin: 'Walk-in', agency: 'Travel agency' };

// ── seed ──
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const FLEET = [
  ['Dacia', 'Logan', 'economy', 'sedan', 5, 3, 'Manual', 'Diesel', '#e8e8ea', 250],
  ['Renault', 'Clio 5', 'economy', 'hatch', 5, 2, 'Manual', 'Diesel', '#c0392b', 280],
  ['Peugeot', '208', 'economy', 'hatch', 5, 2, 'Manual', 'Petrol', '#2f6fdd', 300],
  ['Hyundai', 'i10', 'economy', 'hatch', 4, 1, 'Automatic', 'Petrol', '#f2c14e', 270],
  ['Volkswagen', 'Golf 8', 'compact', 'hatch', 5, 3, 'Automatic', 'Diesel', '#2b2f3a', 390],
  ['Seat', 'Leon', 'compact', 'hatch', 5, 3, 'Manual', 'Diesel', '#a3adb8', 360],
  ['Skoda', 'Octavia', 'sedan', 'sedan', 5, 4, 'Automatic', 'Diesel', '#1d6e5f', 460],
  ['Toyota', 'Corolla', 'sedan', 'sedan', 5, 4, 'Automatic', 'Hybrid', '#f3f3f3', 490],
  ['Dacia', 'Duster', 'suv', 'suv', 5, 4, 'Manual', 'Diesel', '#7b5e3b', 430],
  ['Hyundai', 'Tucson', 'suv', 'suv', 5, 4, 'Automatic', 'Diesel', '#3b4a5c', 620],
  ['Kia', 'Sportage', 'suv', 'suv', 5, 4, 'Automatic', 'Diesel', '#c9ccd2', 590],
  ['Toyota', 'RAV4 Hybrid', 'suv', 'suv', 5, 5, 'Automatic', 'Hybrid', '#8a1f2b', 720],
  ['Mercedes-Benz', 'C 220 d', 'premium', 'sedan', 5, 4, 'Automatic', 'Diesel', '#14171f', 1150],
  ['BMW', '320d', 'premium', 'sedan', 5, 4, 'Automatic', 'Diesel', '#e9eef5', 1080],
  ['Range Rover', 'Evoque', 'premium', 'suv', 5, 4, 'Automatic', 'Diesel', '#2c3e36', 1550],
  ['Peugeot', 'Traveller 8 seats', 'van', 'van', 8, 6, 'Manual', 'Diesel', '#dfe3e8', 920],
];
const PEOPLE = [
  ['Youssef Benali', 'MA', 'Casablanca'], ['Salma El Idrissi', 'MA', 'Rabat'], ['Hamza Ouazzani', 'MA', 'Marrakech'], ['Khadija Tazi', 'MA', 'Fes'],
  ['James Whitfield', 'GB', 'London'], ['Emma Laurent', 'FR', 'Lyon'], ['Lukas Meyer', 'DE', 'Munich'], ['Sofia Romano', 'IT', 'Milan'],
  ['Carlos Ibáñez', 'ES', 'Madrid'], ['Anna Kowalska', 'PL', 'Warsaw'], ['Mehdi Chraibi', 'MA', 'Tangier'], ['Noor Haddad', 'AE', 'Dubai'],
  ['Pierre Dumont', 'FR', 'Paris'], ['Sarah Mitchell', 'US', 'Austin'], ['Omar Lahlou', 'MA', 'Agadir'], ['Ines Carvalho', 'PT', 'Porto'],
  ['Tom van Dijk', 'NL', 'Utrecht'], ['Aya Nakamura', 'JP', 'Osaka'], ['Rachid Amrani', 'MA', 'Oujda'], ['Leila Bensouda', 'MA', 'Rabat'],
  ['David Cohen', 'CA', 'Montreal'], ['Marta Nilsson', 'SE', 'Gothenburg'], ['Ayoub Zerouali', 'MA', 'Casablanca'], ['Chloé Bernard', 'BE', 'Brussels'],
];
export const SERVICE_EVERY = 10000;

function seed() {
  const r = rng(20260814);
  const t0 = today();
  const pick = (a) => a[Math.floor(r() * a.length)];
  const customers = PEOPLE.map(([name, country, city], i) => ({
    id: `C${100 + i}`, name, country, city,
    phone: country === 'MA' ? `+212 6${Math.floor(10 + r() * 89)} ${Math.floor(10 + r() * 89)} ${Math.floor(10 + r() * 89)} ${Math.floor(10 + r() * 89)}` : `+${Math.floor(30 + r() * 20)} ${Math.floor(600000000 + r() * 99999999)}`,
    email: `${name.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').replace(/ /g, '.')}@example.com`,
    licenseNo: `${pick(['B', 'D', 'F', 'K'])}${Math.floor(100000 + r() * 899999)}`,
    licenseSince: 2008 + Math.floor(r() * 14), flag: i === 4 || i === 11 ? 'vip' : i === 17 ? 'blocked' : '', notes: i === 17 ? 'Returned the last car late and dirty. Ask for a larger deposit.' : i === 4 ? 'Repeat customer, three rentals this year.' : '',
  }));
  const vehicles = FLEET.map(([make, model, cat, body, seats, bags, gearbox, fuel, color, price], i) => {
    const odo = Math.floor(18000 + r() * 70000);
    return {
      id: `V${i + 1}`, make, model, cat, body, seats, bags, gearbox, fuel, color, price, year: 2021 + Math.floor(r() * 4),
      plate: `${Math.floor(10000 + r() * 89999)}-${pick(['A', 'B', 'D', 'H', 'J'])}-${pick([1, 6, 26, 6, 1])}`,
      odo, nextService: Math.ceil(odo / SERVICE_EVERY) * SERVICE_EVERY + (r() < 0.3 ? 0 : SERVICE_EVERY) - Math.floor(r() * 600),
      insuranceExp: addDays(t0, Math.floor(15 + r() * 330)), outOfService: false,
    };
  });
  vehicles[3].insuranceExp = addDays(t0, 9); // a warning for the demo
  vehicles[5].nextService = vehicles[5].odo + 420;
  const bookings = []; const payments = [];
  let n = 4210; let pendingLeft = 4;
  const mk = (v, s, e, status, extra = {}) => {
    const c = pick(customers.filter((x) => x.flag !== 'blocked'));
    const ex = r() < 0.55 ? [pick(EXTRAS).id] : [];
    if (r() < 0.25) ex.push('cdw');
    const exs = [...new Set(ex)];
    const b = { id: `AD-${n++}`, vehicleId: v.id, customerId: c.id, start: s, end: e, status, extras: exs, source: pick(['website', 'website', 'website', 'phone', 'walkin', 'agency']), pickup: pick(LOCATIONS), dropoff: null, notes: '', createdAt: addDays(s, -Math.floor(2 + r() * 14)), ...extra };
    b.dropoff = b.dropoff || b.pickup;
    b.total = quote(v, s, e, exs, vehicles).total;
    b.paid = 0;
    return b;
  };
  vehicles.forEach((v, vi) => {
    let cur = addDays(t0, -34 + Math.floor(r() * 6));
    while (diffDays(cur, addDays(t0, 40)) > 0) {
      const len = 2 + Math.floor(r() * 7);
      const e = addDays(cur, len);
      if (r() < 0.62) {
        let status;
        if (diffDays(e, t0) > 0) status = 'returned';
        else if (diffDays(cur, t0) >= 0 && diffDays(t0, e) >= 0 && diffDays(cur, t0) >= 0 && cur <= t0) status = 'active';
        else status = pendingLeft > 0 && diffDays(t0, cur) <= 9 && r() < 0.5 ? (pendingLeft--, 'pending') : 'confirmed';
        if (cur <= t0 && e > t0) status = 'active';
        const b = mk(v, cur, e, status);
        if (status === 'returned') { b.paid = b.total; b.odoOut = v.odo - 800 - Math.floor(r() * 300); b.odoIn = b.odoOut + len * (90 + Math.floor(r() * 120)); payments.push({ id: `P${payments.length + 1}`, bookingId: b.id, amount: b.total, date: addDays(e, 0), method: pick(['Card', 'Cash', 'Card']) }); }
        else if (status === 'active') { b.paid = b.total; b.odoOut = v.odo - 40; payments.push({ id: `P${payments.length + 1}`, bookingId: b.id, amount: b.total, date: cur, method: pick(['Card', 'Cash']) }); }
        else if (status === 'confirmed') { b.paid = Math.round(b.total * 0.3); payments.push({ id: `P${payments.length + 1}`, bookingId: b.id, amount: b.paid, date: addDays(cur, -3), method: 'Card' }); }
        bookings.push(b);
      }
      cur = addDays(e, Math.floor(r() * 5) + (vi % 3 === 0 ? 1 : 2));
    }
  });
  // one vehicle has a late return, one is in the workshop
  const lateV = vehicles[9];
  bookings.filter((b) => b.vehicleId === lateV.id && b.status === 'active').forEach((b) => { b.end = addDays(t0, -1); });
  const maintenance = [
    { id: 'M1', vehicleId: 'V7', start: addDays(t0, 1), end: addDays(t0, 3), type: 'Oil change and brakes', cost: 1450 },
    { id: 'M2', vehicleId: 'V12', start: addDays(t0, -2), end: addDays(t0, 0), type: 'Tyres', cost: 3200 },
  ];
  // keep maintenance windows free of bookings
  const clash = (m) => (b) => b.vehicleId === m.vehicleId && b.status !== 'cancelled' && b.start < m.end && m.start < b.end;
  maintenance.forEach((m) => { for (let i = bookings.length - 1; i >= 0; i--) if (clash(m)(bookings[i])) { payments.splice(0, payments.length, ...payments.filter((p) => p.bookingId !== bookings[i].id)); bookings.splice(i, 1); } });
  // today's pickups / returns so the dashboard is lively
  return { v: 1, settings: { company: 'Atlas Drive', currency: 'MAD', weekly: 10, monthly: 20, peakPct: 25, minAge: 21 }, customers, vehicles, bookings, payments, maintenance, seq: n, ts: Date.now() };
}

// ── pricing ──
export const rates = { MAD: 1, USD: 0.1, EUR: 0.092 };
let S = null;
const isPeak = (day) => { const m = Number(day.slice(5, 7)); return m === 7 || m === 8 || m === 12; };
export function quote(v, start, end, extras = [], vehiclesRef = null, settings = null) {
  const set = settings || (S && S.settings) || { weekly: 10, monthly: 20, peakPct: 25 };
  const days = nights(start, end);
  let base = 0, peakDays = 0;
  for (let i = 0; i < days; i++) { const d = addDays(start, i); const mult = isPeak(d) ? 1 + set.peakPct / 100 : 1; if (mult > 1) peakDays++; base += v.price * mult; }
  const disc = days >= 30 ? set.monthly : days >= 7 ? set.weekly : 0;
  const discount = Math.round(base * disc / 100);
  let ex = 0; const lines = [];
  extras.forEach((id) => { const x = EXTRAS.find((e) => e.id === id); if (!x) return; const amt = x.per === 'day' ? x.price * days : x.price; ex += amt; lines.push({ id, name: x.name, amount: amt }); });
  return { days, base: Math.round(base), peakDays, discPct: disc, discount, extras: ex, lines, total: Math.round(base) - discount + ex };
}

// ── store ──
const listeners = new Set();
let bc = null;
try { bc = new BroadcastChannel(CH); bc.onmessage = () => { load(); emit(false); }; } catch { /* no BroadcastChannel */ }
function emit(broadcast = true) { listeners.forEach((f) => { try { f(S); } catch { /* ignore */ } }); if (broadcast && bc) { try { bc.postMessage(1); } catch { /* ignore */ } } }
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) { S = JSON.parse(raw); return; } } catch { /* fall through */ }
  S = seed(); save(false);
}
function save(broadcast = true) { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage blocked: stay in memory */ } if (broadcast) emit(); }
load();
window.addEventListener('storage', (e) => { if (e.key === KEY) { load(); emit(false); } });

export const db = {
  get s() { return S; },
  subscribe(f) { listeners.add(f); return () => listeners.delete(f); },
  reset() { S = seed(); save(); },
  vehicle: (id) => S.vehicles.find((v) => v.id === id),
  customer: (id) => S.customers.find((c) => c.id === id),
  booking: (id) => S.bookings.find((b) => b.id === id),
  findBooking(ref, phone) {
    const b = S.bookings.find((x) => x.id.toLowerCase() === String(ref).trim().toLowerCase());
    if (!b) return null;
    const c = S.customers.find((x) => x.id === b.customerId);
    const d = (s) => String(s).replace(/\D/g, '');
    return c && d(c.phone).slice(-6) === d(phone).slice(-6) && d(phone).length >= 6 ? b : null;
  },
  /** Vehicles free for the whole period (no booking, no workshop slot). */
  isFree(vehicleId, start, end, ignoreId = null) {
    const v = S.vehicles.find((x) => x.id === vehicleId);
    if (!v || v.outOfService) return false;
    if (S.bookings.some((b) => b.id !== ignoreId && b.vehicleId === vehicleId && b.status !== 'cancelled' && b.status !== 'returned' && b.start < end && start < b.end)) return false;
    return !S.maintenance.some((m) => m.vehicleId === vehicleId && m.start < end && start < m.end);
  },
  available(start, end, cat = 'all') { return S.vehicles.filter((v) => (cat === 'all' || v.cat === cat) && this.isFree(v.id, start, end)); },
  customerStats(id) {
    const bs = S.bookings.filter((b) => b.customerId === id && b.status !== 'cancelled');
    return { count: bs.length, spent: bs.reduce((a, b) => a + (b.paid || 0), 0), last: bs.map((b) => b.start).sort().pop() || null };
  },
  upsertCustomer(c) {
    const norm = (s) => String(s || '').replace(/\D/g, '').slice(-8);
    let found = S.customers.find((x) => c.email && x.email.toLowerCase() === c.email.toLowerCase()) || S.customers.find((x) => norm(x.phone) && norm(x.phone) === norm(c.phone));
    if (found) { Object.assign(found, { name: c.name || found.name, phone: c.phone || found.phone, email: c.email || found.email }); return found; }
    found = { id: `C${100 + S.customers.length + 1}`, name: c.name, phone: c.phone, email: c.email, country: c.country || '', city: c.city || '', licenseNo: c.licenseNo || '', licenseSince: c.licenseSince || '', flag: '', notes: '' };
    S.customers.push(found); return found;
  },
  /** Create a booking (website or desk). Returns { ok, booking } or { ok:false, error }. */
  createBooking({ vehicleId, start, end, extras = [], customer, source = 'website', pickup, dropoff, notes = '', status }) {
    if (!vehicleId || !start || !end || diffDays(start, end) < 1) return { ok: false, error: 'Choose valid dates.' };
    if (start < today()) return { ok: false, error: 'The pick-up date is in the past.' };
    if (!this.isFree(vehicleId, start, end)) return { ok: false, error: 'This car was just taken for these dates. Please choose another.' };
    const v = this.vehicle(vehicleId); const c = this.upsertCustomer(customer);
    if (c.flag === 'blocked') return { ok: false, error: 'We cannot accept this booking online. Please call us.' };
    const q = quote(v, start, end, extras);
    const b = { id: `AD-${S.seq++}`, vehicleId, customerId: c.id, start, end, status: status || (source === 'website' ? 'pending' : 'confirmed'), extras, source, pickup: pickup || LOCATIONS[0], dropoff: dropoff || pickup || LOCATIONS[0], notes, createdAt: today(), total: q.total, paid: 0 };
    S.bookings.push(b); save();
    return { ok: true, booking: b };
  },
  setStatus(id, status, extra = {}) {
    const b = this.booking(id); if (!b) return;
    b.status = status; Object.assign(b, extra);
    if (status === 'active') { const v = this.vehicle(b.vehicleId); b.odoOut = extra.odoOut ?? v.odo; }
    if (status === 'returned') { const v = this.vehicle(b.vehicleId); if (extra.odoIn) { v.odo = Math.max(v.odo, extra.odoIn); } b.returnedOn = today(); }
    save();
  },
  updateBooking(id, patch) { const b = this.booking(id); if (!b) return; Object.assign(b, patch); const v = this.vehicle(b.vehicleId); b.total = quote(v, b.start, b.end, b.extras).total; save(); },
  addPayment(bookingId, amount, method) { const b = this.booking(bookingId); if (!b || !(amount > 0)) return; S.payments.push({ id: `P${S.payments.length + 1}`, bookingId, amount, date: today(), method }); b.paid = (b.paid || 0) + amount; save(); },
  saveVehicle(v) { if (v.id) { Object.assign(this.vehicle(v.id), v); } else { v.id = `V${S.vehicles.length + 1}`; S.vehicles.push(v); } save(); },
  addMaintenance(m) { S.maintenance.push({ id: `M${S.maintenance.length + 1}`, ...m }); save(); },
  removeMaintenance(id) { S.maintenance = S.maintenance.filter((m) => m.id !== id); save(); },
  saveCustomer(c) { Object.assign(this.customer(c.id), c); save(); },
  saveSettings(p) { Object.assign(S.settings, p); save(); },
};

// ── money ──
export function money(n, cur) {
  const c = cur || (S && S.settings.currency) || 'MAD';
  const v = Math.round(n * (rates[c] || 1));
  const num = v.toLocaleString('en-US');
  return c === 'MAD' ? `${num} MAD` : c === 'USD' ? `$${num}` : `€${num}`;
}
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
