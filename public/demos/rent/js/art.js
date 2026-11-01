// Car illustrations drawn as SVG (no photos): glossy side views per body type, tinted with the car's colour.
const BODY = {
  hatch: 'M12 82C10 72 12 66 22 64L46 60C58 57 66 48 78 41C86 36 96 34 108 34L150 34C166 34 178 38 190 46C200 52 210 56 224 58L258 63C272 65 280 72 280 82L280 88L12 88Z',
  sedan: 'M8 82C6 72 9 66 20 64L44 61C56 59 64 56 78 47C88 41 98 38 112 37L156 37C172 37 186 42 198 50C206 55 216 58 230 60L262 64C274 66 282 72 282 82L282 88L8 88Z',
  suv: 'M10 82C8 70 10 62 22 60L38 58C46 56 52 48 60 40C66 33 74 30 84 30L168 30C180 30 190 34 198 42L214 56C220 58 228 59 238 60L262 64C274 66 282 72 282 82L282 88L10 88Z',
  van: 'M8 82C6 70 8 62 18 60L30 58L34 34C35 29 40 26 46 26L198 26C208 26 214 30 218 38L232 56L262 62C274 65 282 72 282 82L282 88L8 88Z',
};
const WIN = {
  hatch: 'M74 56C80 47 88 40 98 38L142 38L142 56Z M150 38C164 39 176 43 186 50L198 56L150 56Z',
  sedan: 'M80 57C88 49 96 43 108 41L144 41L144 57Z M152 41C168 41 180 46 192 53L200 57L152 57Z',
  suv: 'M64 54C68 44 74 36 84 34L128 34L128 54Z M136 34L168 34C176 34 182 38 188 44L200 54L136 54Z',
  van: 'M40 52L42 32L100 32L100 52Z M108 32L160 32L160 52L108 52Z M168 32L200 32C206 32 208 35 210 38L220 52L168 52Z',
};
const WHEELS = { hatch: [64, 218], sedan: [64, 222], suv: [66, 226], van: [66, 234] };
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16); const f = (c) => Math.max(0, Math.min(255, Math.round(c + (k > 0 ? (255 - c) * k : c * k))));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
export function carSvg(body, color, sfx = '') {
  const id = `c${String(color).slice(1)}${body}${sfx}`; const b = BODY[body] || BODY.hatch; const [w1, w2] = WHEELS[body] || WHEELS.hatch;
  const wheel = (cx) => `<g class="wh"><circle cx="${cx}" cy="88" r="18" fill="#05070c"/><circle cx="${cx}" cy="88" r="13" fill="#1a2030"/><circle cx="${cx}" cy="88" r="9.5" fill="url(#${id}r)"/><g stroke="#0b0f18" stroke-width="2.2" stroke-linecap="round">${[0, 72, 144, 216, 288].map((a) => `<path d="M${cx} 88l${(9 * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(9 * Math.sin((a * Math.PI) / 180)).toFixed(1)}"/>`).join('')}</g><circle cx="${cx}" cy="88" r="2.6" fill="#0b0f18"/></g>`;
  return `<svg viewBox="0 0 290 116" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs>
<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(color, 0.3)}"/><stop offset=".42" stop-color="${color}"/><stop offset="1" stop-color="${shade(color, -0.45)}"/></linearGradient>
<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a3a57"/><stop offset=".5" stop-color="#0d1524"/><stop offset="1" stop-color="#1b2a44"/></linearGradient>
<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="${id}r"><stop offset="0" stop-color="#e8edf7"/><stop offset="1" stop-color="#8b97ad"/></radialGradient>
<radialGradient id="${id}h"><stop offset="0" stop-color="#fff7d6"/><stop offset="1" stop-color="#ffcf6a" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="146" cy="104" rx="118" ry="6" fill="rgba(0,0,0,.45)"/>
<path d="${b}" fill="url(#${id})"/>
<path d="${WIN[body] || WIN.hatch}" fill="url(#${id}g)"/>
<path d="${WIN[body] || WIN.hatch}" fill="url(#${id}s)" opacity=".5" transform="translate(-6 0) skewX(-14)"/>
<path d="M20 72h250" stroke="rgba(255,255,255,.22)" stroke-width="1.4"/><path d="M128 40v36M196 42v34" stroke="rgba(0,0,0,.28)" stroke-width="1.2"/>
<path d="M24 80h242v7H24z" fill="rgba(0,0,0,.38)"/>
<rect x="271" y="63" width="14" height="7" rx="3.5" fill="#fff4cf"/><circle cx="283" cy="66" r="9" fill="url(#${id}h)" opacity=".6"/><rect x="8" y="64" width="9" height="6" rx="3" fill="#ff4d55"/>
<circle cx="${w1}" cy="88" r="22" fill="#05070c" opacity=".9"/><circle cx="${w2}" cy="88" r="22" fill="#05070c" opacity=".9"/>
${wheel(w1)}${wheel(w2)}</svg>`;
}
