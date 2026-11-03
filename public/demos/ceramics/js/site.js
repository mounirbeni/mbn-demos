// Public site: workshops in Morocco and abroad, booking with deposit, waiting list, demand by city,
// requests from hosts abroad, participant space (booking, balance, messages, certificate).
(function () {
  const C = window.ATELIER;
  const S = window.Store;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let lang = (() => { try { return localStorage.getItem('as_lang') || 'fr'; } catch { return 'fr'; } })();
  let filter = { where: 'all', format: 'all' };

  const FLAG = { MA: '🇲🇦', FR: '🇫🇷', ES: '🇪🇸', BE: '🇧🇪', CA: '🇨🇦', CH: '🇨🇭', GB: '🇬🇧', NL: '🇳🇱', DE: '🇩🇪', IT: '🇮🇹', US: '🇺🇸' };
  const T = {
    fr: {
      nav: ['Ateliers', 'Formations', 'L’artisan', 'À l’étranger', 'Contact'], space: 'Mon espace', book: 'Réserver', seeDates: 'Voir les prochaines dates',
      heroTitle: 'La céramique de Safi, <em>entre vos mains.</em>', heroLead: 'Ateliers et formations avec un maître céramiste de Safi : au Maroc, dans notre atelier, et dans votre ville, à l’étranger. Petits groupes, terre et émaux de Safi, cuisson incluse.',
      stats: [['Safi', 'capitale marocaine de la céramique'], ['8', 'participants maximum'], ['Maroc + Europe', 'ateliers toute l’année']],
      badge: ['Prochain atelier', 'à Safi'], strip: ['Terre et émaux de Safi', 'Cuisson incluse', 'Petits groupes', 'Au Maroc et à l’étranger', 'Certificat de formation', 'Réservation en ligne'],
      formatsEyebrow: 'Formations', formatsTitle: 'Du premier contact avec la terre au métier.', formatsLead: 'Choisissez le format qui vous ressemble. Chaque session est encadrée personnellement par le maître céramiste.',
      days: (n) => (n === 1 ? '1 jour' : `${n} jours`), from: 'dès', levels: { all: 'Tous niveaux', beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' },
      sessionsEyebrow: 'Calendrier', sessionsTitle: 'Prochains ateliers', sessionsLead: 'Places limitées. Quand une session est complète, inscrivez-vous sur la liste d’attente : nous vous prévenons dès qu’une place se libère.',
      fAll: 'Tout', fMa: 'Au Maroc', fAbroad: 'À l’étranger', seatsLeft: (n) => (n === 0 ? 'Complet' : n === 1 ? '1 place restante' : `${n} places restantes`), waitlist: 'Liste d’attente', perPerson: '/ personne', lang: 'Langue',
      artisanEyebrow: 'L’artisan', artisanQuote: '« À Safi, la terre se transmet de main en main. Mon métier, c’est de vous la faire sentir. »',
      artisanText: 'Né dans la tradition des potiers de Safi, le maître céramiste partage son savoir-faire : tournage, décor au pinceau, émaux et cuisson. Ses ateliers se tiennent à Safi et voyagent au Maroc et à l’étranger.', included: 'Toujours inclus',
      photo: 'Photo de l’artisan à fournir',
      abroadEyebrow: 'À l’étranger', abroadTitle: 'L’atelier vient à vous.', abroadLead: 'Nous organisons des masterclasses en Europe et au-delà. Dites-nous où vous êtes : quand une ville réunit assez de personnes, une session y est programmée.',
      interestTitle: 'Prévenez-moi des dates dans ma ville', interestText: 'Laissez votre ville et votre contact. Vous serez prévenu en premier.', city: 'Ville', country: 'Pays', contact: 'Email ou WhatsApp', name: 'Nom', notify: 'Me prévenir',
      interestOk: (c) => `Merci ! Vous serez prévenu dès qu’une session sera programmée à ${c}.`,
      hostTitle: 'Organiser un atelier chez vous', hostText: 'Association, école d’art, galerie, entreprise ou groupe d’amis : accueillez un atelier ou une formation.', org: 'Organisation ou nom', people: 'Nombre de participants', period: 'Période souhaitée', message: 'Message', send: 'Envoyer la demande',
      hostOk: 'Demande reçue. Nous vous répondons sous 48 h avec une proposition.',
      galleryEyebrow: 'Créations', galleryTitle: 'Les motifs de Safi', galleryLead: 'Des rosaces et des bleus de cobalt hérités des ateliers de la colline des potiers.',
      faqTitle: 'Questions fréquentes',
      faq: [['Faut-il savoir dessiner ou avoir déjà touché la terre ?', 'Non. L’initiation et le stage découverte sont pensés pour les débutants complets.'], ['Que faut-il apporter ?', 'Une tenue qui ne craint pas la terre. Terre, outils, tablier et émaux sont fournis.'], ['Puis-je repartir avec mes pièces ?', 'Oui. Après séchage et cuisson, vos pièces sont à récupérer à l’atelier ou expédiées (frais d’envoi en plus).'], ['Comment fonctionne le paiement ?', `Un acompte de ${C.depositPct} % confirme votre place, le solde se règle avant la session, en ligne ou sur place.`], ['Et si je dois annuler ?', 'Annulation gratuite jusqu’à 14 jours avant la session, ou report sur une autre date.'], ['Les formations donnent-elles un certificat ?', 'Oui, la formation professionnelle se termine par un certificat signé par le maître céramiste.']],
      contactTitle: 'Une question ? Écrivez-nous.', contactText: 'Réponse sous 24 h, en français, en anglais ou en arabe.', yourMsg: 'Votre message', msgOk: 'Message envoyé. Vous recevez la réponse par email ou WhatsApp.',
      footerText: 'Ateliers et formations de céramique d’art, Safi · Maroc et international.', demo: 'Démo réalisée par MBN DEV — exemple du système proposé. Les données restent dans votre navigateur.',
      // booking
      step1: 'Votre atelier', seats: 'Nombre de participants', step2: 'Vos coordonnées', email: 'Email', phone: 'Téléphone (WhatsApp)', level: 'Votre niveau', notes: 'Une remarque ? (allergie, langue, hébergement…)', next: 'Continuer', back: 'Retour',
      step3: 'Paiement', payDeposit: (p) => `Payer l’acompte maintenant (${p} %)`, payFull: 'Payer la totalité maintenant', payLater: 'Réserver et payer plus tard (virement ou sur place)', total: 'Total', dueNow: 'À payer maintenant', confirm: 'Confirmer la réservation',
      card: 'Carte bancaire (démo, aucun paiement réel)', doneTitle: 'C’est réservé !', doneWait: 'Vous êtes sur la liste d’attente', doneText: 'Votre référence', doneHint: 'Gardez-la : avec votre téléphone, elle ouvre votre espace participant.',
      waConfirm: 'Recevoir la confirmation sur WhatsApp', ics: 'Ajouter au calendrier', openSpace: 'Ouvrir mon espace', waitText: 'La session est complète. Nous vous écrivons dès qu’une place se libère, sans engagement.',
      // space
      spaceTitle: 'Mon espace participant', ref: 'Référence (ex. AS-1234)', open: 'Ouvrir', notFound: 'Aucune réservation trouvée avec cette référence et ce téléphone.',
      paid: 'Payé', balance: 'Reste à payer', payBalance: 'Payer le solde', practical: 'Infos pratiques', practicalText: (s) => `Rendez-vous ${s.venue}, ${s.city}, à 9 h 30 le premier jour. Apportez une tenue qui ne craint pas la terre.`,
      messages: 'Messages avec l’atelier', write: 'Écrire un message…', sendMsg: 'Envoyer', cert: 'Télécharger mon certificat', status: { pending: 'En attente de paiement', confirmed: 'Confirmée', paid: 'Soldée', waitlist: 'Liste d’attente', cancelled: 'Annulée' },
    },
    en: {
      nav: ['Workshops', 'Courses', 'The artisan', 'Abroad', 'Contact'], space: 'My space', book: 'Book', seeDates: 'See upcoming dates',
      heroTitle: 'Safi ceramics, <em>in your hands.</em>', heroLead: 'Workshops and courses with a master ceramist from Safi: in Morocco, in our studio, and in your city abroad. Small groups, Safi clay and glazes, firing included.',
      stats: [['Safi', 'Morocco’s ceramics capital'], ['8', 'participants at most'], ['Morocco + Europe', 'workshops all year']],
      badge: ['Next workshop', 'in Safi'], strip: ['Safi clay and glazes', 'Firing included', 'Small groups', 'In Morocco and abroad', 'Course certificate', 'Online booking'],
      formatsEyebrow: 'Courses', formatsTitle: 'From your first touch of clay to the craft.', formatsLead: 'Choose the format that suits you. Every session is personally led by the master ceramist.',
      days: (n) => (n === 1 ? '1 day' : `${n} days`), from: 'from', levels: { all: 'All levels', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
      sessionsEyebrow: 'Calendar', sessionsTitle: 'Upcoming workshops', sessionsLead: 'Places are limited. When a session is full, join the waiting list: we tell you as soon as a place opens.',
      fAll: 'All', fMa: 'In Morocco', fAbroad: 'Abroad', seatsLeft: (n) => (n === 0 ? 'Full' : n === 1 ? '1 place left' : `${n} places left`), waitlist: 'Waiting list', perPerson: '/ person', lang: 'Language',
      artisanEyebrow: 'The artisan', artisanQuote: '“In Safi, clay is passed from hand to hand. My job is to let you feel it.”',
      artisanText: 'Raised in the tradition of Safi’s potters, the master ceramist shares his craft: throwing, brush decoration, glazes and firing. His workshops are held in Safi and travel across Morocco and abroad.', included: 'Always included',
      photo: 'Artisan photo to be provided',
      abroadEyebrow: 'Abroad', abroadTitle: 'The studio comes to you.', abroadLead: 'We run masterclasses in Europe and beyond. Tell us where you are: when a city gathers enough people, a session is scheduled there.',
      interestTitle: 'Tell me when it comes to my city', interestText: 'Leave your city and a contact. You will be the first to know.', city: 'City', country: 'Country', contact: 'Email or WhatsApp', name: 'Name', notify: 'Notify me',
      interestOk: (c) => `Thank you! You will hear from us as soon as a session is scheduled in ${c}.`,
      hostTitle: 'Host a workshop', hostText: 'Association, art school, gallery, company or group of friends: host a workshop or a course.', org: 'Organisation or name', people: 'Number of participants', period: 'Preferred period', message: 'Message', send: 'Send request',
      hostOk: 'Request received. We reply within 48 h with a proposal.',
      galleryEyebrow: 'Work', galleryTitle: 'The patterns of Safi', galleryLead: 'Rosettes and cobalt blues inherited from the workshops of the potters’ hill.',
      faqTitle: 'Frequently asked questions',
      faq: [['Do I need any experience?', 'No. The taster class and the discovery course are designed for complete beginners.'], ['What should I bring?', 'Clothes you don’t mind getting dirty. Clay, tools, apron and glazes are provided.'], ['Can I take my pieces home?', 'Yes. After drying and firing, collect them at the studio or have them shipped (shipping extra).'], ['How does payment work?', `A ${C.depositPct}% deposit secures your place; the balance is paid before the session, online or on site.`], ['What if I need to cancel?', 'Free cancellation up to 14 days before, or move to another date.'], ['Do courses come with a certificate?', 'Yes, the professional training ends with a certificate signed by the master ceramist.']],
      contactTitle: 'A question? Write to us.', contactText: 'Reply within 24 h, in French, English or Arabic.', yourMsg: 'Your message', msgOk: 'Message sent. You get the reply by email or WhatsApp.',
      footerText: 'Fine ceramics workshops and courses, Safi · Morocco and abroad.', demo: 'Demo by MBN DEV — an example of the proposed system. Data stays in your browser.',
      step1: 'Your workshop', seats: 'Participants', step2: 'Your details', email: 'Email', phone: 'Phone (WhatsApp)', level: 'Your level', notes: 'Anything to add? (allergy, language, accommodation…)', next: 'Continue', back: 'Back',
      step3: 'Payment', payDeposit: (p) => `Pay the deposit now (${p}%)`, payFull: 'Pay in full now', payLater: 'Book now, pay later (transfer or on site)', total: 'Total', dueNow: 'Due now', confirm: 'Confirm booking',
      card: 'Card (demo, no real payment)', doneTitle: 'You’re booked!', doneWait: 'You’re on the waiting list', doneText: 'Your reference', doneHint: 'Keep it: with your phone number it opens your participant space.',
      waConfirm: 'Get the confirmation on WhatsApp', ics: 'Add to calendar', openSpace: 'Open my space', waitText: 'This session is full. We will write to you as soon as a place opens, no commitment.',
      spaceTitle: 'My participant space', ref: 'Reference (e.g. AS-1234)', open: 'Open', notFound: 'No booking found with this reference and phone.',
      paid: 'Paid', balance: 'Balance due', payBalance: 'Pay the balance', practical: 'Practical info', practicalText: (s) => `Meet at ${s.venue}, ${s.city}, at 9:30 on the first day. Wear clothes you don’t mind getting dirty.`,
      messages: 'Messages with the studio', write: 'Write a message…', sendMsg: 'Send', cert: 'Download my certificate', status: { pending: 'Awaiting payment', confirmed: 'Confirmed', paid: 'Paid in full', waitlist: 'Waiting list', cancelled: 'Cancelled' },
    },
  };
  const t = () => T[lang];
  const fname = (f) => f[lang].name;
  const dateLong = (d) => new Date(`${d}T12:00`).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const range = (s) => { const e = S.endOf(s); return s.start === e ? dateLong(s.start) : `${new Date(`${s.start}T12:00`).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short' })} → ${dateLong(e)}`; };
  const wa = (text) => `https://wa.me/${C.brand.whatsapp}?text=${encodeURIComponent(text)}`;
  const toast = (msg) => { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600); };
  const upcoming = () => S.db.sessions.filter((s) => s.start >= S.today() && s.status === 'open');

  function header() {
    $('#top').innerHTML = `<div class="wrap">
      <a class="logo" href="#"><span class="mark">${Art.plate(3, 38)}</span><span><b>${esc(C.brand.name)}</b><small>${esc(C.brand.tagline[lang])}</small></span></a>
      <nav class="nav">${['#ateliers', '#formations', '#artisan', '#etranger', '#contact'].map((h, i) => `<a href="${h}">${t().nav[i]}</a>`).join('')}</nav>
      <div class="right"><button class="lang" id="langBtn">${lang === 'fr' ? 'EN' : 'FR'}</button><button class="btn btn-ghost btn-sm" id="spaceBtn">${t().space}</button><a class="btn btn-primary btn-sm" href="#ateliers">${t().book}</a></div></div>`;
    $('#langBtn').onclick = () => { lang = lang === 'fr' ? 'en' : 'fr'; try { localStorage.setItem('as_lang', lang); } catch { /* ignore */ } document.documentElement.lang = lang; render(); };
    $('#spaceBtn').onclick = () => openSpace();
  }

  function sessionCard(s) {
    const f = S.format(s.format); const left = S.seatsLeft(s); const { amount, currency } = S.priceOf(s);
    const d = new Date(`${s.start}T12:00`);
    return `<article class="session reveal">
      <div class="date"><b>${d.getDate()}</b><span>${d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { month: 'short' })}</span></div>
      <div><h3>${esc(fname(f))}</h3><div class="where">${FLAG[s.country] || ''} ${esc(s.city)} · ${esc(s.venue)} · ${range(s)}</div>
        <div class="tags"><span class="chip">${t().days(f.days)}</span><span class="chip">${t().levels[f.level]}</span><span class="chip">${t().lang} : ${esc(s.lang)}</span></div>
        <div class="seats ${left <= 2 ? 'low' : ''}"><i style="width:${Math.round(((s.capacity - left) / s.capacity) * 100)}%"></i></div>
        <div class="muted" style="font-size:13px;margin-top:6px">${t().seatsLeft(left)}</div></div>
      <div class="side"><b>${S.fmt(amount, currency)} <span class="muted" style="font-size:13px;font-weight:400">${t().perPerson}</span></b>
        <button class="btn ${left ? 'btn-primary' : 'btn-ghost'} btn-sm" data-book="${s.id}">${left ? t().book : t().waitlist}</button></div></article>`;
  }

  function render() {
    header();
    const L = t();
    const list = upcoming().filter((s) => (filter.where === 'all' || (filter.where === 'ma' ? s.country === 'MA' : s.country !== 'MA')) && (filter.format === 'all' || s.format === filter.format));
    const next = upcoming()[0];
    $('#app').innerHTML = `
    <section class="hero"><div class="wrap">
      <div><p class="eyebrow reveal">${esc(C.brand.tagline[lang])} · ${esc(C.brand.city)}</p><h1 class="serif reveal">${L.heroTitle}</h1><p class="lead reveal">${L.heroLead}</p>
        <div class="cta reveal"><a class="btn btn-primary" href="#ateliers">${L.seeDates}</a><a class="btn btn-ghost" href="${wa(lang === 'fr' ? 'Bonjour, je souhaite des informations sur vos ateliers de céramique.' : 'Hello, I would like information about your ceramics workshops.')}" target="_blank" rel="noopener">WhatsApp</a></div>
        <div class="stats reveal">${L.stats.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div></div>
      <div class="hero-art"><div class="p1">${Art.plate(1, 400)}</div><div class="v1">${Art.vase(2, 150)}</div><div class="p2">${Art.plate(6, 230)}</div>
        ${next ? `<div class="badge"><span class="muted">${L.badge[0]}</span><b>${esc(fname(S.format(next.format)))}</b>${dateLong(next.start)} · ${esc(next.city)}</div>` : ''}</div></div></section>
    <div class="strip"><div class="row">${[...L.strip, ...L.strip, ...L.strip].map((x) => `<span>${x}</span>`).join('')}</div></div>

    <section class="block" id="ateliers"><div class="wrap">
      <div class="head"><div><p class="eyebrow">${L.sessionsEyebrow}</p><h2 class="serif">${L.sessionsTitle}</h2></div><p class="muted">${L.sessionsLead}</p></div>
      <div class="filters">${[['all', L.fAll], ['ma', L.fMa], ['abroad', L.fAbroad]].map(([k, l]) => `<button class="chip ${filter.where === k ? 'on' : ''}" data-where="${k}">${l}</button>`).join('')}
        <span style="width:12px"></span>${[['all', L.fAll], ...C.formats.map((f) => [f.id, fname(f)])].map(([k, l]) => `<button class="chip ${filter.format === k ? 'on' : ''}" data-format="${k}">${esc(l)}</button>`).join('')}</div>
      <div class="sessions">${list.map(sessionCard).join('') || `<p class="muted">—</p>`}</div></div></section>

    <section class="block" id="formations" style="padding-top:0"><div class="wrap">
      <div class="head"><div><p class="eyebrow">${L.formatsEyebrow}</p><h2 class="serif">${L.formatsTitle}</h2></div><p class="muted">${L.formatsLead}</p></div>
      <div class="formats">${C.formats.map((f, i) => `<article class="format reveal"><div class="art">${Art.plate(i + 2, 74)}</div><h3>${esc(fname(f))}</h3>
        <div class="meta">${t().days(f.days)} · ${esc(f.hours)} · ${L.levels[f.level]}</div><p class="muted" style="margin:0">${esc(f[lang].desc)}</p>
        <div class="price">${L.from} ${S.fmt(f.priceMAD, 'MAD')} · ${S.fmt(f.priceEUR, 'EUR')}</div>
        <button class="btn btn-ghost btn-sm" data-format-go="${f.id}">${L.seeDates}</button></article>`).join('')}</div></div></section>

    <section class="block artisan" id="artisan"><div class="wrap">
      <div class="photo-slot reveal">${Art.vase(5, 200)}<small>${L.photo}</small></div>
      <div class="reveal"><p class="eyebrow">${L.artisanEyebrow}</p><p class="quote">${L.artisanQuote}</p><p class="muted" style="font-size:17px">${L.artisanText}</p>
        <p style="font-weight:600;margin:28px 0 0">${L.included}</p><ul class="checks">${C.included[lang].map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div></section>

    <section class="block abroad" id="etranger"><div class="wrap">
      <div class="head"><div><p class="eyebrow">${L.abroadEyebrow}</p><h2 class="serif">${L.abroadTitle}</h2></div><p class="muted">${L.abroadLead}</p></div>
      <div class="grid">
        <div class="panel reveal"><h3>${L.interestTitle}</h3><p class="muted">${L.interestText}</p>
          <form class="form" id="interestForm"><div class="two"><input class="field" name="city" required placeholder="${L.city}"><input class="field" name="country" required placeholder="${L.country}"></div>
          <input class="field" name="name" placeholder="${L.name}"><input class="field" name="contact" required placeholder="${L.contact}"><button class="btn btn-primary">${L.notify}</button></form></div>
        <div class="panel reveal"><h3>${L.hostTitle}</h3><p class="muted">${L.hostText}</p>
          <form class="form" id="hostForm"><input class="field" name="org" required placeholder="${L.org}"><div class="two"><input class="field" name="city" required placeholder="${L.city}"><input class="field" name="country" required placeholder="${L.country}"></div>
          <div class="two"><input class="field" name="people" type="number" min="1" placeholder="${L.people}"><input class="field" name="period" placeholder="${L.period}"></div>
          <input class="field" name="contact" required placeholder="${L.contact}"><textarea class="field" name="note" rows="2" placeholder="${L.message}"></textarea><button class="btn btn-primary">${L.send}</button></form></div>
      </div></div></section>

    <section class="block" style="padding-top:0"><div class="wrap">
      <div class="head"><div><p class="eyebrow">${L.galleryEyebrow}</p><h2 class="serif">${L.galleryTitle}</h2></div><p class="muted">${L.galleryLead}</p></div>
      <div class="gallery">${[7, 8, 9, 10, 11, 12, 13, 14].map((n, i) => `<div class="tile reveal">${i % 3 === 1 ? Art.vase(n, 120) : Art.plate(n, 180)}</div>`).join('')}</div></div></section>

    <section class="block faq" style="padding-top:0"><div class="wrap" style="max-width:820px">
      <h2 class="serif" style="font-size:clamp(34px,5vw,54px);text-align:center;margin:0 0 30px">${L.faqTitle}</h2>
      ${L.faq.map(([q, a], i) => `<details ${i === 0 ? 'open' : ''}><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>

    <section class="block artisan" id="contact"><div class="wrap">
      <div><h2 class="serif" style="font-size:clamp(36px,5vw,58px);line-height:1;margin:0">${L.contactTitle}</h2><p class="muted" style="font-size:17px">${L.contactText}</p>
        <p><a class="btn btn-wa" href="${wa(lang === 'fr' ? 'Bonjour, j’ai une question sur vos ateliers.' : 'Hello, I have a question about your workshops.')}" target="_blank" rel="noopener">WhatsApp</a></p></div>
      <form class="panel form" id="contactForm"><div class="two"><input class="field" name="name" required placeholder="${L.name}"><input class="field" name="contact" required placeholder="${L.contact}"></div>
        <textarea class="field" name="text" rows="4" required placeholder="${L.yourMsg}"></textarea><button class="btn btn-primary">${L.sendMsg}</button></form></div></section>`;

    $('#footer').innerHTML = `<div class="wrap"><div><b>${esc(C.brand.name)}</b><p>${L.footerText}</p><p class="demo-note">${L.demo}</p></div>
      <div style="display:grid;gap:6px"><a href="${wa('Bonjour')}" target="_blank" rel="noopener">WhatsApp</a><a href="mailto:${esc(C.brand.email)}">${esc(C.brand.email)}</a><span>Instagram @${esc(C.brand.instagram)}</span><a href="/demo/ceramics/admin">Espace atelier</a></div></div>`;
    $('#mbarBtn').textContent = L.seeDates; $('#mbarBtn').onclick = () => $('#ateliers').scrollIntoView({ behavior: 'smooth' });

    document.querySelectorAll('[data-where]').forEach((b) => { b.onclick = () => { filter.where = b.dataset.where; render(); $('#ateliers').scrollIntoView(); }; });
    document.querySelectorAll('[data-format]').forEach((b) => { b.onclick = () => { filter.format = b.dataset.format; render(); $('#ateliers').scrollIntoView(); }; });
    document.querySelectorAll('[data-format-go]').forEach((b) => { b.onclick = () => { filter = { where: 'all', format: b.dataset.formatGo }; render(); $('#ateliers').scrollIntoView({ behavior: 'smooth' }); }; });
    document.querySelectorAll('[data-book]').forEach((b) => { b.onclick = () => openBooking(b.dataset.book); });
    $('#interestForm').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); S.interest(d); e.target.outerHTML = `<p class="ok">${esc(L.interestOk(d.city))}</p>`; };
    $('#hostForm').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); S.host({ ...d, people: Number(d.people) || null }); e.target.outerHTML = `<p class="ok">${L.hostOk}</p>`; };
    $('#contactForm').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); S.message({ from: 'client', name: d.name, contact: d.contact, text: d.text }); e.target.innerHTML = `<p class="ok">${L.msgOk}</p>`; };
    reveal();
  }

  function reveal() {
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.1 }) : null;
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));
  }

  // ---------- Modal helpers ----------
  const modal = $('#modal');
  const openSheet = (html) => { $('#sheet').innerHTML = `<button class="x" aria-label="close">×</button>${html}`; modal.classList.add('open'); $('#sheet .x').onclick = close; };
  const close = () => modal.classList.remove('open');
  modal.onclick = (e) => { if (e.target === modal) close(); };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // ---------- Booking ----------
  function openBooking(id) {
    const s = S.session(id); const f = S.format(s.format); const L = t();
    const st = { seats: 1, name: '', email: '', phone: '', country: '', level: f.level === 'all' ? 'beginner' : f.level, notes: '', pay: 'deposit' };
    const full = () => S.seatsLeft(s) < st.seats;
    const head = (n) => `<p class="eyebrow">${esc(fname(f))}</p><h2 class="serif" style="font-size:32px;margin:6px 0 2px">${FLAG[s.country] || ''} ${esc(s.city)}</h2><p class="muted" style="margin:0">${range(s)} · ${esc(s.venue)}</p><div class="steps">${[1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</div>`;
    const { amount, currency } = S.priceOf(s);
    const step1 = () => {
      openSheet(`${head(1)}<h3>${L.step1}</h3>
        <ul class="checks">${C.included[lang].map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <p style="font-weight:600;margin-top:22px">${L.seats}</p><div class="qty"><button id="minus">−</button><b id="q" style="font-size:22px">${st.seats}</b><button id="plus">+</button><span class="muted" id="seatHint"></span></div>
        <div class="summary" style="margin-top:18px"><div><span>${S.fmt(amount, currency)} × <span id="q2">${st.seats}</span></span><b id="tot"></b></div></div>
        <p style="margin-top:20px"><button class="btn btn-primary" id="go" style="width:100%">${L.next}</button></p>`);
      const upd = () => { $('#q').textContent = st.seats; $('#q2').textContent = st.seats; $('#tot').textContent = S.fmt(amount * st.seats, currency); $('#seatHint').textContent = full() ? L.waitlist : L.seatsLeft(S.seatsLeft(s)); };
      $('#minus').onclick = () => { st.seats = Math.max(1, st.seats - 1); upd(); }; $('#plus').onclick = () => { st.seats = Math.min(8, st.seats + 1); upd(); }; upd();
      $('#go').onclick = step2;
    };
    const step2 = () => {
      openSheet(`${head(2)}<h3>${L.step2}</h3><form class="form" id="f2">
        <input class="field" name="name" required placeholder="${L.name}" value="${esc(st.name)}"><div class="two"><input class="field" name="email" type="email" required placeholder="${L.email}" value="${esc(st.email)}"><input class="field" name="phone" required inputmode="tel" placeholder="${L.phone}" value="${esc(st.phone)}"></div>
        <div class="two"><input class="field" name="country" placeholder="${L.country}" value="${esc(st.country)}"><select class="field" name="level">${['beginner', 'intermediate', 'advanced'].map((k) => `<option value="${k}" ${st.level === k ? 'selected' : ''}>${L.levels[k]}</option>`).join('')}</select></div>
        <textarea class="field" name="notes" rows="2" placeholder="${L.notes}">${esc(st.notes)}</textarea>
        <div class="row-flex" style="margin-top:6px"><button type="button" class="btn btn-ghost" id="b1">${L.back}</button><button class="btn btn-primary" style="flex:1">${L.next}</button></div></form>`);
      $('#b1').onclick = step1;
      $('#f2').onsubmit = (e) => { e.preventDefault(); Object.assign(st, Object.fromEntries(new FormData(e.target))); full() ? finish() : step3(); };
    };
    const step3 = () => {
      const total = amount * st.seats; const dep = Math.round((total * C.depositPct) / 100);
      openSheet(`${head(3)}<h3>${L.step3}</h3><div class="pay">
        <label><input type="radio" name="pay" value="deposit" ${st.pay === 'deposit' ? 'checked' : ''}> <span><b>${L.payDeposit(C.depositPct)}</b><br><span class="muted">${S.fmt(dep, currency)}</span></span></label>
        <label><input type="radio" name="pay" value="full" ${st.pay === 'full' ? 'checked' : ''}> <span><b>${L.payFull}</b><br><span class="muted">${S.fmt(total, currency)}</span></span></label>
        <label><input type="radio" name="pay" value="later" ${st.pay === 'later' ? 'checked' : ''}> <span><b>${L.payLater}</b></span></label></div>
        <div id="cardBox" style="margin-top:12px"><p class="muted" style="font-size:13px">${L.card}</p><div class="two form" style="margin-top:0"><input class="field" value="4242 4242 4242 4242" aria-label="card"><input class="field" value="12/29 · 123" aria-label="expiry"></div></div>
        <div class="summary" style="margin-top:16px"><div><span>${L.total}</span><b>${S.fmt(total, currency)}</b></div><div><span>${L.dueNow}</span><b id="due"></b></div></div>
        <div class="row-flex" style="margin-top:18px"><button class="btn btn-ghost" id="b2">${L.back}</button><button class="btn btn-primary" id="ok" style="flex:1">${L.confirm}</button></div>`);
      const upd = () => { st.pay = document.querySelector('input[name=pay]:checked').value; $('#due').textContent = S.fmt(st.pay === 'deposit' ? dep : st.pay === 'full' ? total : 0, currency); $('#cardBox').style.display = st.pay === 'later' ? 'none' : ''; };
      document.querySelectorAll('input[name=pay]').forEach((r) => { r.onchange = upd; }); upd();
      $('#b2').onclick = step2; $('#ok').onclick = finish;
    };
    const finish = () => {
      const b = S.book({ sessionId: s.id, seats: Number(st.seats), name: st.name, email: st.email, phone: st.phone, country: st.country, level: st.level, notes: st.notes, pay: st.pay });
      const waitlisted = b.status === 'waitlist';
      const txt = lang === 'fr' ? `Bonjour, je confirme ma réservation ${b.ref} : ${fname(f)}, ${s.city}, ${range(s)}, ${b.seats} personne(s).` : `Hello, I confirm my booking ${b.ref}: ${fname(f)}, ${s.city}, ${range(s)}, ${b.seats} person(s).`;
      openSheet(`<div style="text-align:center;padding:10px 0"><div style="width:120px;margin:0 auto">${Art.plate(4, 120)}</div>
        <h2 class="serif" style="font-size:38px;margin:16px 0 4px">${waitlisted ? L.doneWait : L.doneTitle}</h2>
        <p class="muted">${waitlisted ? L.waitText : `${esc(fname(f))} · ${esc(s.city)} · ${range(s)}`}</p>
        <p style="margin:18px 0 4px">${L.doneText}</p><p class="serif" style="font-size:40px;margin:0;color:var(--cobalt)">${b.ref}</p><p class="muted" style="font-size:13px">${L.doneHint}</p>
        <div style="display:grid;gap:8px;margin-top:20px"><a class="btn btn-wa" target="_blank" rel="noopener" href="${wa(txt)}">${L.waConfirm}</a>
        ${waitlisted ? '' : `<button class="btn btn-ghost" id="ics">${L.ics}</button>`}<button class="btn btn-ghost" id="sp">${L.openSpace}</button></div></div>`);
      if ($('#ics')) $('#ics').onclick = () => ics(s, f);
      $('#sp').onclick = () => showSpace(b);
      render();
    };
    step1();
  }

  function ics(s, f) {
    const d = (x) => x.replace(/-/g, '');
    const end = new Date(`${S.endOf(s)}T12:00`); end.setDate(end.getDate() + 1);
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Atelier Safi//Demo//FR', 'BEGIN:VEVENT', `UID:${s.id}@atelier-safi`, `DTSTART;VALUE=DATE:${d(s.start)}`, `DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replace(/-/g, '')}`,
      `SUMMARY:${fname(f)} — ${C.brand.name}`, `LOCATION:${s.venue}\\, ${s.city}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = 'atelier.ics'; a.click();
  }

  // ---------- Participant space ----------
  function openSpace() {
    const L = t();
    openSheet(`<p class="eyebrow">${esc(C.brand.name)}</p><h2 class="serif" style="font-size:34px;margin:6px 0 14px">${L.spaceTitle}</h2>
      <form class="form" id="lk"><input class="field" name="ref" required placeholder="${L.ref}"><input class="field" name="phone" required inputmode="tel" placeholder="${L.phone}"><button class="btn btn-primary">${L.open}</button><p class="muted" id="lkErr" style="font-size:13px"></p></form>
      <p class="muted" style="font-size:12px">Démo : ${esc(S.db.bookings[0].ref)} · ${esc(S.db.bookings[0].phone)}</p>`);
    $('#lk').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); const b = S.findBooking(d.ref, d.phone); if (b) showSpace(b); else $('#lkErr').textContent = L.notFound; };
  }

  function showSpace(b0) {
    const L = t(); const b = S.db.bookings.find((x) => x.id === b0.id) || b0; const s = S.session(b.sessionId); const f = S.format(s.format);
    const thread = S.db.messages.filter((m) => m.ref === b.ref).slice().reverse();
    const bal = b.total - b.paid;
    const st = bal <= 0 && b.total > 0 ? 'paid' : b.status;
    openSheet(`<p class="eyebrow">${L.spaceTitle} · ${esc(b.ref)}</p><h2 class="serif" style="font-size:30px;margin:6px 0 2px">${esc(fname(f))}</h2>
      <p class="muted" style="margin:0">${FLAG[s.country] || ''} ${esc(s.city)} · ${range(s)} · ${b.seats} pers.</p>
      <p style="margin:12px 0"><span class="st ${st}">${L.status[st] || st}</span></p>
      ${b.status === 'waitlist' ? `<p class="muted">${L.waitText}</p>` : `<div class="summary"><div><span>${L.total}</span><b>${S.fmt(b.total, b.currency)}</b></div><div><span>${L.paid}</span><b>${S.fmt(b.paid, b.currency)}</b></div><div><span>${L.balance}</span><b>${S.fmt(Math.max(0, bal), b.currency)}</b></div></div>
      ${bal > 0 ? `<button class="btn btn-primary" id="payBal" style="width:100%;margin-top:10px">${L.payBalance} · ${S.fmt(bal, b.currency)}</button>` : ''}`}
      <h3 style="margin:22px 0 6px">${L.practical}</h3><p class="muted" style="margin:0">${esc(L.practicalText(s))}</p>
      ${f.id === 'pro' && b.attended ? `<button class="btn btn-ghost" id="cert" style="margin-top:12px">${L.cert}</button>` : ''}
      <h3 style="margin:22px 0 8px">${L.messages}</h3><div class="thread">${thread.map((m) => `<div class="bubble ${m.from === 'client' ? 'me' : ''}">${esc(m.text)}<small>${new Date(m.at).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></div>`).join('')}</div>
      <form class="row-flex" id="msgF" style="margin-top:10px;flex-wrap:nowrap"><input class="field" name="t" required placeholder="${L.write}"><button class="btn btn-primary">${L.sendMsg}</button></form>`);
    if ($('#payBal')) $('#payBal').onclick = () => { S.pay(b.ref, bal); toast('✓'); showSpace(b); };
    if ($('#cert')) $('#cert').onclick = () => cert(b, s, f);
    $('#msgF').onsubmit = (e) => { e.preventDefault(); S.message({ from: 'client', name: b.name, contact: b.phone, ref: b.ref, text: new FormData(e.target).get('t') }); showSpace(b); };
  }

  function cert(b, s, f) {
    const w = window.open('', '_blank'); if (!w) return;
    w.document.write(`<!doctype html><title>Certificat</title><body style="font-family:Georgia,serif;text-align:center;padding:60px;border:14px double #1f4e8c;margin:20px">
      <p style="letter-spacing:.3em;color:#b4532f">CERTIFICAT DE FORMATION</p><h1 style="font-size:46px;margin:10px 0">${esc(b.name)}</h1>
      <p>a suivi avec succès la <b>${esc(fname(f))}</b> en céramique d’art de Safi</p><p>${esc(s.city)} · ${range(s)}</p><p style="margin-top:60px">${esc(C.brand.artisan)} — ${esc(C.brand.name)}</p><script>print()<\/script>`);
  }

  // On/off and expiry are managed from the MBN DEV dashboard (Demo sites).
  fetch('https://mbndev.ma/api/demos/ceramics/config', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((c) => {
    if (c && c.live === false) document.body.innerHTML = '<main style="min-height:100dvh;display:grid;place-items:center;padding:24px;text-align:center;font-family:Inter,system-ui,sans-serif;background:#1c1a17;color:#fff"><div><h1 style="margin:0 0 8px">Cette démo n’est pas disponible pour le moment</h1><p style="color:#cfc6b8;margin:0">Contactez MBN DEV pour obtenir un nouvel accès.</p></div></main>';
  }).catch(() => {});

  S.on(() => { if (!modal.classList.contains('open')) render(); });
  window.addEventListener('scroll', () => $('#top').classList.toggle('solid', window.scrollY > 10), { passive: true });
  document.documentElement.lang = lang;
  render();
})();
