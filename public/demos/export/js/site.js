(() => {
  const { $, $$, esc, uid, today, toast, modal, lightbox, ICON } = window.K;
  const { CFG, prod, db } = window.X;
  const img = (n) => `/demos/export/img/${n}.webp`;
  let L = 'fr'; try { L = localStorage.getItem('avenir_lang') || 'fr'; } catch { /* ignore */ }
  let cat = 'all';
  let cart = {}; try { cart = JSON.parse(localStorage.getItem('avenir_cart') || '{}'); } catch { /* ignore */ }
  const saveCart = () => { try { localStorage.setItem('avenir_cart', JSON.stringify(cart)); } catch { /* ignore */ } };
  const eur = (n) => `${n.toLocaleString(L === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

  const T = {
    fr: {
      nav: ['Catalogue', 'Personnalisation', 'Export', 'La coopérative', 'FAQ'], quote: 'Demande de devis', eyebrow: 'Céramique artisanale marocaine · B2B & export',
      h1: 'Céramique faite main,<br>prête pour l’export.', lead: 'Arts de la table, tajines, vases et zellige fabriqués par nos artisans. Production à la commande, emballage export, expédition par conteneur ou groupage.',
      cta1: 'Voir le catalogue', cta2: 'Demander un devis', facts: [['Fait main', 'par nos artisans'], ['Sur mesure', 'couleurs, logo, emballage'], ['FOB · CIF · DAP', 'Casablanca & Tanger Med'], ['Échantillons', 'avant commande']],
      catEy: 'Catalogue', catH: 'Nos collections', catP: 'Ajoutez les références à votre sélection, indiquez les quantités et recevez un devis export détaillé.',
      moq: 'MOQ', box: 'pcs / carton', from: 'FOB indicatif dès', add: 'Ajouter au devis', added: 'Dans le devis ✓', note: 'Photos et prix d’illustration — remplacés par vos produits et vos tarifs.',
      custEy: 'Personnalisation', custH: 'Votre marque, notre savoir-faire', cust: ['Couleurs d’émail sur nuancier', 'Logo ou estampille au dos des pièces', 'Dimensions et formes sur plan', 'Étiquetage et emballage à votre marque'],
      expEy: 'Export', expH: 'De l’atelier à votre entrepôt', steps: [['Échantillons', 'Nous envoyons les pièces choisies pour validation.'], ['Devis & proforma', 'Prix par référence, incoterm, délai et conditionnement.'], ['Production', 'Fabrication à la main, contrôle qualité pièce par pièce.'], ['Expédition', 'Emballage export, documents (certificat d’origine, EUR.1), transport.']],
      coopEy: 'La coopérative', coopH: 'Des artisans unis pour exporter', coopP: 'Notre coopérative réunit des potiers, émailleurs et décorateurs marocains. Ensemble, nous offrons aux importateurs la régularité d’un fournisseur et l’âme d’un atelier.', coopL: ['Traçabilité : chaque lot est associé à l’artisan qui l’a produit', 'Commerce équitable : les artisans sont membres et associés', 'Capacité de production adaptée à vos volumes'],
      faqH: 'Questions fréquentes', faq: [['Quelle est la quantité minimale ?', 'Chaque référence a son MOQ (indiqué dans le catalogue). Les commandes mixtes en groupage sont possibles.'], ['Quels sont les délais ?', 'En général 4 à 8 semaines de production selon les quantités, plus le transport.'], ['Quelles conditions de paiement ?', 'Acompte à la commande, solde avant expédition ou contre documents (crédit documentaire possible).'], ['Les pièces sont-elles alimentaires ?', 'Les arts de la table utilisent des émaux sans plomb ; les fiches et tests sont fournis sur demande.']],
      foot: 'Céramique artisanale marocaine pour importateurs, boutiques et hôtels.', demo: 'Maquette réalisée par', demo2: 'pour la Coopérative Avenir — photos, références et prix donnés à titre d’exemple.',
      cart: 'Ma sélection', empty: 'Votre sélection est vide. Ajoutez des références depuis le catalogue.', qty: 'Quantité', rm: 'Retirer', send: 'Envoyer la demande de devis',
      f: { company: 'Société', contact: 'Nom du contact', country: 'Pays', email: 'E-mail professionnel', phone: 'Téléphone / WhatsApp', inc: 'Incoterm', port: 'Port / ville de destination', date: 'Livraison souhaitée', custom: 'Personnalisation (couleurs, logo, emballage…)', msg: 'Message', ok: 'J’accepte d’être contacté au sujet de cette demande.' },
      below: (m) => `Quantité inférieure au MOQ (${m})`, total: 'Montant indicatif (FOB)', thanks: 'Demande envoyée ✓', thanksP: (r) => `Merci ! Votre référence : <b>${r}</b>. Nous revenons vers vous sous 48 h avec un devis détaillé.`, okBtn: 'Parfait',
    },
    en: {
      nav: ['Catalogue', 'Private label', 'Export', 'Cooperative', 'FAQ'], quote: 'Request a quote', eyebrow: 'Handmade Moroccan ceramics · B2B & export',
      h1: 'Handmade ceramics,<br>ready for export.', lead: 'Tableware, tagines, vases and zellige made by our artisans. Made to order, export packing, full container or groupage shipping.',
      cta1: 'Browse the catalogue', cta2: 'Request a quote', facts: [['Handmade', 'by our artisans'], ['Custom', 'colours, logo, packaging'], ['FOB · CIF · DAP', 'Casablanca & Tanger Med'], ['Samples', 'before you order']],
      catEy: 'Catalogue', catH: 'Our collections', catP: 'Add items to your selection, set quantities and receive a detailed export quote.',
      moq: 'MOQ', box: 'pcs / carton', from: 'Indicative FOB from', add: 'Add to quote', added: 'In quote ✓', note: 'Sample photos and prices — replaced by your products and prices.',
      custEy: 'Private label', custH: 'Your brand, our craft', cust: ['Glaze colours from our swatch range', 'Logo or stamp under each piece', 'Sizes and shapes from your drawings', 'Labels and packaging with your brand'],
      expEy: 'Export', expH: 'From our workshop to your warehouse', steps: [['Samples', 'We send the chosen pieces for approval.'], ['Quote & proforma', 'Price per item, incoterm, lead time and packing.'], ['Production', 'Handmade, quality-checked piece by piece.'], ['Shipping', 'Export packing, documents (certificate of origin, EUR.1), freight.']],
      coopEy: 'The cooperative', coopH: 'Artisans united to export', coopP: 'Our cooperative brings together Moroccan potters, glazers and decorators. Together we give importers the reliability of a supplier and the soul of a workshop.', coopL: ['Traceability: each batch is linked to the artisan who made it', 'Fair trade: artisans are members and partners', 'Production capacity matched to your volumes'],
      faqH: 'FAQ', faq: [['What is the minimum order?', 'Each item has its own MOQ (shown in the catalogue). Mixed groupage orders are possible.'], ['What are the lead times?', 'Usually 4 to 8 weeks of production depending on quantities, plus freight.'], ['Payment terms?', 'Deposit with the order, balance before shipping or against documents (letter of credit possible).'], ['Is the tableware food safe?', 'Tableware uses lead-free glazes; data sheets and tests on request.']],
      foot: 'Handmade Moroccan ceramics for importers, shops and hotels.', demo: 'Mock-up made by', demo2: 'for Coopérative Avenir — photos, items and prices are examples.',
      cart: 'My selection', empty: 'Your selection is empty. Add items from the catalogue.', qty: 'Quantity', rm: 'Remove', send: 'Send quote request',
      f: { company: 'Company', contact: 'Contact name', country: 'Country', email: 'Business e-mail', phone: 'Phone / WhatsApp', inc: 'Incoterm', port: 'Destination port / city', date: 'Requested delivery', custom: 'Customisation (colours, logo, packaging…)', msg: 'Message', ok: 'I agree to be contacted about this request.' },
      below: (m) => `Below MOQ (${m})`, total: 'Indicative amount (FOB)', thanks: 'Request sent ✓', thanksP: (r) => `Thank you! Your reference: <b>${r}</b>. We will reply within 48 h with a detailed quote.`, okBtn: 'Great',
    },
  };
  const name = (p) => (L === 'fr' ? p.fr : p.en);
  const price = (p) => db.get().prices[p.ref] ?? p.eur;
  const count = () => Object.keys(cart).length;

  function render() {
    const t = T[L]; document.documentElement.lang = L;
    $('#top').innerHTML = `<div class="wrap"><a class="brand" href="#"><span class="mark">A</span><span>Avenir<small>Céramique · Export</small></span></a>
      <nav class="nav">${['catalogue', 'perso', 'export', 'coop', 'faq'].map((id, i) => `<a href="#${id}">${t.nav[i]}</a>`).join('')}</nav>
      <div class="lang"><button data-l="fr" class="${L === 'fr' ? 'on' : ''}">FR</button><button data-l="en" class="${L === 'en' ? 'on' : ''}">EN</button></div>
      <button class="btn btn-primary btn-sm" id="cartBtn" aria-label="${t.quote}"><span class="lbl">${t.quote}</span><span class="cc">${count()}</span></button></div>`;
    $('#app').innerHTML = `
    <section class="hero"><img src="${img('hero')}" alt="" width="1800" height="1200" fetchpriority="high"><div class="wrap"><span class="eyebrow">${t.eyebrow}</span><h1>${t.h1}</h1><p class="lead">${t.lead}</p>
      <div class="cta"><a class="btn btn-primary" href="#catalogue">${t.cta1}</a><button class="btn btn-light" data-cart>${t.cta2}</button></div>
      <div class="facts">${t.facts.map(([a, b]) => `<div><b>${a}</b>${b}</div>`).join('')}</div></div></section>
    <section class="sec" id="catalogue"><div class="wrap"><div class="sec-head"><span class="eyebrow">${t.catEy}</span><h2>${t.catH}</h2><p class="muted">${t.catP}</p></div>
      <div class="chips" id="cats">${CFG.cats.map(([k, fr, en]) => `<button class="chip${cat === k ? ' on' : ''}" data-c="${k}">${L === 'fr' ? fr : en}</button>`).join('')}</div>
      <div class="prods" id="prods"></div><p class="muted" style="font-size:.82rem;margin-top:14px">${t.note}</p></div></section>
    <section class="sec sec-alt" id="perso"><div class="wrap split"><img src="${img('plates')}" alt="" loading="lazy" width="1000" height="667"><div><span class="eyebrow">${t.custEy}</span><h2>${t.custH}</h2><ul class="ticks">${t.cust.map((x) => `<li>${x}</li>`).join('')}</ul><button class="btn btn-primary" data-cart>${t.cta2}</button></div></div></section>
    <section class="sec" id="export"><div class="wrap"><div class="sec-head"><span class="eyebrow">${t.expEy}</span><h2>${t.expH}</h2></div>
      <div class="grid g4">${t.steps.map(([a, b], i) => `<div class="card"><div class="num">0${i + 1}</div><h3>${a}</h3><p class="muted">${b}</p></div>`).join('')}</div>
      <div class="port"><img src="${img('port')}" alt="" loading="lazy" width="1000" height="667"><div><b>EXW · FOB · CIF · DAP</b><span>Casablanca · Tanger Med · Agadir</span></div></div></div></section>
    <section class="sec sec-alt" id="coop"><div class="wrap split"><div><span class="eyebrow">${t.coopEy}</span><h2>${t.coopH}</h2><p class="muted">${t.coopP}</p><ul class="ticks">${t.coopL.map((x) => `<li>${x}</li>`).join('')}</ul></div><img src="${img('vases')}" alt="" loading="lazy" width="1000" height="667"></div></section>
    <section class="sec" id="faq"><div class="wrap" style="max-width:820px"><div class="sec-head center"><h2>${t.faqH}</h2></div>${t.faq.map(([q, a]) => `<details class="q"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>`;
    $('#footer').innerHTML = `<div class="foot"><div class="wrap"><div><a class="brand" href="#" style="color:#fff"><span class="mark">A</span>${esc(CFG.full)}</a><p style="margin-top:12px">${t.foot}</p></div>
      <div><h4>Contact</h4><p>${CFG.phone} (WhatsApp)<br>export@ — à confirmer<br>Maroc</p></div><div><h4>Liens</h4><p><a href="#catalogue">${t.nav[0]}</a><br><a href="#export">${t.nav[2]}</a><br><a href="/demo/export/admin">Espace coopérative</a></p></div>
      <div class="legal">${t.demo} <a href="https://mbndev.ma" target="_blank" rel="noopener">MBN DEV</a> ${t.demo2}</div></div></div>`;
    $('#mbarBtn').innerHTML = `${t.quote} (${count()})`; $('#mbarBtn').onclick = openCart;
    prods();
    $$('[data-l]').forEach((b) => b.onclick = () => { L = b.dataset.l; try { localStorage.setItem('avenir_lang', L); } catch { /* ignore */ } render(); });
    $$('#cats .chip').forEach((c) => c.onclick = () => { cat = c.dataset.c; $$('#cats .chip').forEach((x) => x.classList.toggle('on', x === c)); prods(); });
    $('#cartBtn').onclick = openCart; $$('[data-cart]').forEach((b) => b.onclick = openCart);
  }

  function prods() {
    const t = T[L]; const off = db.get().off;
    $('#prods').innerHTML = CFG.products.filter((p) => !off.includes(p.ref) && (cat === 'all' || p.cat === cat)).map((p) => `<article class="prod"><button class="pimg" data-z="${p.img}" data-n="${esc(name(p))}"><img src="${img(p.img)}" alt="${esc(name(p))}" loading="lazy" width="1000" height="667"></button>
      <div class="pb"><span class="ref">${p.ref}</span><h3>${esc(name(p))}</h3><p class="muted">${p.dim} · ${t.moq} ${p.moq} · ${p.box} ${t.box}</p>
      <div class="pf"><div><span class="muted" style="font-size:.78rem">${t.from}</span><b>${eur(price(p))}</b></div><button class="btn ${cart[p.ref] ? 'btn-ghost' : 'btn-primary'} btn-sm" data-add="${p.ref}">${cart[p.ref] ? t.added : t.add}</button></div></div></article>`).join('');
    $$('[data-add]').forEach((b) => b.onclick = () => { const r = b.dataset.add; if (cart[r]) delete cart[r]; else cart[r] = prod(r).moq; saveCart(); render(); toast(cart[r] ? `${r} ✓` : `${r} −`); document.getElementById('catalogue').scrollIntoView({ block: 'start' }); });
    $$('[data-z]').forEach((b) => b.onclick = () => lightbox(img(b.dataset.z), b.dataset.n));
  }

  function openCart() {
    const t = T[L]; const f = t.f;
    const lines = () => Object.entries(cart).map(([ref, qty]) => { const p = prod(ref); return `<div class="cl"><img src="${img(p.img)}" alt=""><div><b>${esc(name(p))}</b><span class="muted">${ref} · ${eur(price(p))}</span>${qty < p.moq ? `<em>${t.below(p.moq)}</em>` : ''}</div><input class="field" type="number" min="1" step="${p.box}" value="${qty}" data-q="${ref}" aria-label="${t.qty}"><button type="button" class="x2" data-rm="${ref}" aria-label="${t.rm}">×</button></div>`; }).join('');
    const total = () => Object.entries(cart).reduce((s, [r, q]) => s + price(prod(r)) * q, 0);
    const sh = modal(`<h2 style="font-size:1.6rem">${t.cart}</h2>${count() ? `<div id="lines">${lines()}</div><div class="tot"><span>${t.total}</span><b id="tot">${eur(total())}</b></div>
      <form class="form" id="qf" style="margin-top:18px"><div class="row2"><label class="f">${f.company}<input class="field" name="company" required></label><label class="f">${f.contact}<input class="field" name="contact" required></label></div>
      <div class="row2"><label class="f">${f.country}<input class="field" name="country" required></label><label class="f">${f.email}<input class="field" type="email" name="email" required></label></div>
      <div class="row2"><label class="f">${f.phone}<input class="field" name="phone" type="tel"></label><label class="f">${f.inc}<select class="field" name="inc">${CFG.incoterms.map((i) => `<option${i === 'FOB' ? ' selected' : ''}>${i}</option>`).join('')}</select></label></div>
      <div class="row2"><label class="f">${f.port}<input class="field" name="port"></label><label class="f">${f.date}<input class="field" type="date" name="date" min="${today()}"></label></div>
      <label class="f">${f.custom}<textarea class="field" name="custom"></textarea></label><label class="check"><input type="checkbox" required> ${f.ok}</label><button class="btn btn-primary">${t.send}</button></form>` : `<p class="muted">${t.empty}</p>`}`, { wide: false });
    const bind = () => {
      $$('[data-q]', sh).forEach((i) => i.onchange = () => { cart[i.dataset.q] = Math.max(1, Number(i.value) || 1); saveCart(); $('#lines', sh).innerHTML = lines(); $('#tot', sh).textContent = eur(total()); bind(); });
      $$('[data-rm]', sh).forEach((b) => b.onclick = () => { delete cart[b.dataset.rm]; saveCart(); render(); openCart(); });
    };
    bind();
    const qf = $('#qf', sh); if (!qf) return;
    qf.onsubmit = (e) => {
      e.preventDefault(); const v = e.target; const id = 'RQ-' + uid().slice(0, 4);
      db.update((s) => s.requests.unshift({ id, created: today(), company: v.company.value.trim(), contact: v.contact.value.trim(), country: v.country.value.trim(), email: v.email.value.trim(), phone: v.phone.value.trim(), incoterm: v.inc.value, port: v.port.value.trim(), date: v.date.value, custom: v.custom.value.trim(), note: '', lang: L, status: 'new', lines: Object.entries(cart).map(([ref, qty]) => ({ ref, qty, price: null })) }));
      cart = {}; saveCart(); render();
      modal(`<h2 style="font-size:1.6rem">${t.thanks}</h2><p>${t.thanksP(id)}</p><button class="btn btn-primary" data-close>${t.okBtn}</button>`);
    };
  }

  render();
})();
