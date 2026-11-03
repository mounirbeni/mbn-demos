// Hand-drawn-looking Safi plates and vases in SVG: the site needs no photo to look finished.
// Real photos of the artisan's work can replace them later (see PHOTOS in site.js).
(function () {
  const PALETTES = [
    ['#f4ecdd', '#1f4e8c', '#2e6b4e', '#c8892f'],
    ['#f6efe2', '#2e6b4e', '#1f4e8c', '#b4532f'],
    ['#efe4d0', '#b4532f', '#1f4e8c', '#2e6b4e'],
    ['#f4ecdd', '#1b3a63', '#c8892f', '#7a9a5b'],
  ];
  const rnd = (seed) => { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };

  /** A round glazed plate with a radial Safi-style motif. */
  function plate(seed = 1, size = 240) {
    const r = rnd(seed); const [bg, a, b, c] = PALETTES[seed % PALETTES.length];
    const petals = 6 + Math.floor(r() * 3) * 2; const cx = 100;
    let g = '';
    for (let i = 0; i < petals; i++) {
      const rot = (360 / petals) * i;
      g += `<path transform="rotate(${rot} ${cx} ${cx})" d="M100 100 C ${100 + 14} ${62}, ${100 + 8} ${40}, 100 30 C ${100 - 8} ${40}, ${100 - 14} ${62}, 100 100Z" fill="${a}" opacity=".92"/>`;
      g += `<circle transform="rotate(${rot + 180 / petals} ${cx} ${cx})" cx="100" cy="36" r="4.5" fill="${c}"/>`;
      g += `<path transform="rotate(${rot + 180 / petals} ${cx} ${cx})" d="M100 70 L106 82 L100 94 L94 82Z" fill="${b}"/>`;
    }
    const dots = Array.from({ length: 36 }, (_, i) => `<circle transform="rotate(${i * 10} 100 100)" cx="100" cy="12" r="2.2" fill="${b}"/>`).join('');
    return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="Assiette en céramique de Safi">
      <defs><radialGradient id="g${seed}" cx="40%" cy="35%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      <circle cx="100" cy="100" r="98" fill="${bg}"/><circle cx="100" cy="100" r="96" fill="none" stroke="${a}" stroke-width="3"/>
      <circle cx="100" cy="100" r="88" fill="none" stroke="${c}" stroke-width="1.5" stroke-dasharray="3 4"/>${dots}${g}
      <circle cx="100" cy="100" r="16" fill="${c}"/><circle cx="100" cy="100" r="9" fill="${bg}"/><circle cx="100" cy="100" r="4" fill="${a}"/>
      <circle cx="100" cy="100" r="98" fill="url(#g${seed})"/></svg>`;
  }

  /** A tall vase silhouette with glaze bands. */
  function vase(seed = 1, size = 220) {
    const [bg, a, b, c] = PALETTES[seed % PALETTES.length];
    const zig = Array.from({ length: 10 }, (_, i) => `${40 + i * 12},${i % 2 ? 128 : 118}`).join(' ');
    return `<svg viewBox="0 0 200 260" width="${size}" height="${size * 1.3}" role="img" aria-label="Vase en céramique de Safi">
      <defs><clipPath id="v${seed}"><path d="M78 20 h44 v18 c0 10 30 30 34 70 c6 64 -18 120 -56 134 c-38 -14 -62 -70 -56 -134 c4 -40 34 -60 34 -70z"/></clipPath>
      <linearGradient id="vl${seed}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".35" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>
      <g clip-path="url(#v${seed})"><rect width="200" height="260" fill="${bg}"/><rect y="20" width="200" height="22" fill="${a}"/>
      <rect y="92" width="200" height="8" fill="${c}"/><polyline points="${zig}" fill="none" stroke="${a}" stroke-width="5"/>
      <rect y="140" width="200" height="40" fill="${b}"/><rect y="186" width="200" height="6" fill="${c}"/><rect y="228" width="200" height="40" fill="${a}"/>
      <rect width="200" height="260" fill="url(#vl${seed})"/></g></svg>`;
  }

  window.Art = { plate, vase };
})();
