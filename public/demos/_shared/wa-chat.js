// WhatsApp chat button shared by the public demo sites.
// <script src="/demos/_shared/wa-chat.js" data-demo="barber" data-biz="TARZ" data-accent="#c9a24b" defer></script>
// The visitor writes a message as a customer would; the demo shows what the business would receive,
// then offers to talk to MBN DEV. Language follows <html lang>, position avoids the mobile tab bar.
(() => {
  const me = document.currentScript;
  const cfg = me.dataset;
  const MBN = '212601439975';
  const T = {
    en: {
      open: 'Chat on WhatsApp', online: 'Usually replies in a few minutes', hello: 'Hello! How can we help you today?',
      ph: 'Type a message…', send: 'Send', close: 'Close',
      sent: 'Sent to the business WhatsApp', note: 'Demo: on your own website, this message opens a chat with your WhatsApp number, already written for the customer.',
      want: 'I want this on my website', again: 'Write another message',
      mbn: (b) => `Hello MBN DEV, I tried the ${b} demo and I want a website like it for my business.`,
    },
    fr: {
      open: 'Discuter sur WhatsApp', online: 'Répond en général en quelques minutes', hello: 'Bonjour ! Comment pouvons-nous vous aider ?',
      ph: 'Écrivez un message…', send: 'Envoyer', close: 'Fermer',
      sent: 'Envoyé sur le WhatsApp de l’établissement', note: 'Démo : sur votre propre site, ce message ouvre une discussion avec votre numéro WhatsApp, déjà rédigé pour le client.',
      want: 'Je veux ça sur mon site', again: 'Écrire un autre message',
      mbn: (b) => `Bonjour MBN DEV, j’ai essayé la démo ${b} et je veux un site comme celui-ci pour mon activité.`,
    },
    ar: {
      open: 'تواصل عبر واتساب', online: 'نرد عادةً خلال دقائق', hello: 'مرحبًا! كيف يمكننا مساعدتك اليوم؟',
      ph: 'اكتب رسالة…', send: 'إرسال', close: 'إغلاق',
      sent: 'أُرسلت إلى واتساب النشاط', note: 'عرض تجريبي: في موقعك أنت، تفتح هذه الرسالة محادثة مع رقم واتساب الخاص بك، مكتوبة مسبقًا للزبون.',
      want: 'أريد هذا في موقعي', again: 'اكتب رسالة أخرى',
      mbn: (b) => `مرحبًا MBN DEV، جرّبت عرض ${b} وأريد موقعًا مثله لنشاطي.`,
    },
  };
  const CHIPS = {
    coffee: { en: ['Can I order ahead for pick-up?', 'Do you have oat milk?', 'Can I book a table for 6?'], fr: ['Puis-je commander à emporter ?', 'Avez-vous du lait d’avoine ?', 'Une table pour 6 est possible ?'], ar: ['هل يمكنني الطلب مسبقًا للاستلام؟', 'هل لديكم حليب الشوفان؟', 'هل يمكن حجز طاولة لـ6 أشخاص؟'] },
    barber: { en: ['Is there a free chair now?', 'How much is a fade + beard?', 'Do you cut kids’ hair?'], fr: ['Un fauteuil est libre maintenant ?', 'Combien pour un dégradé + barbe ?', 'Vous coupez les enfants ?'], ar: ['هل يوجد كرسي فارغ الآن؟', 'كم سعر التدرج مع اللحية؟', 'هل تحلقون للأطفال؟'] },
    beauty: { en: ['Is there a slot this Saturday?', 'Price for bridal make-up?', 'Do you have hammam today?'], fr: ['Un créneau ce samedi ?', 'Prix du maquillage mariée ?', 'Le hammam est disponible aujourd’hui ?'], ar: ['هل يوجد موعد هذا السبت؟', 'كم سعر مكياج العروس؟', 'هل الحمّام متاح اليوم؟'] },
    law: { en: ['I need advice on a divorce', 'How much is a first consultation?', 'Can we meet this week?'], fr: ['J’ai besoin d’un conseil pour un divorce', 'Combien coûte la première consultation ?', 'Un rendez-vous cette semaine ?'], ar: ['أحتاج استشارة في الطلاق', 'كم ثمن الاستشارة الأولى؟', 'هل يمكن موعد هذا الأسبوع؟'] },
    rent: { en: ['Is a car free this weekend?', 'Can you deliver to my hotel?', 'Price for 7 days?'], fr: ['Une voiture libre ce week-end ?', 'Livraison à mon hôtel possible ?', 'Prix pour 7 jours ?'], ar: ['هل توجد سيارة متاحة هذا الأسبوع؟', 'هل توصلون السيارة إلى فندقي؟', 'كم السعر لـ7 أيام؟'] },
    ceramics: { en: ['Is there a workshop for beginners?', 'Can you come to teach in my city?', 'Can I buy a gift voucher?'], fr: ['Un atelier pour débutants est prévu ?', 'Pouvez-vous venir enseigner dans ma ville ?', 'Puis-je offrir un bon cadeau ?'], ar: ['هل توجد ورشة للمبتدئين؟', 'هل يمكنكم القدوم للتدريس في مدينتي؟', 'هل يمكنني شراء بطاقة هدية؟'] },
    moto: { en: ['Is a scooter free tomorrow?', 'Can you deliver to my hotel in Taghazout?', 'Price for 7 days?'], fr: ['Un scooter est libre demain ?', 'Livraison à mon hôtel à Taghazout ?', 'Quel prix pour 7 jours ?'], ar: ['هل يوجد سكوتر متاح غدًا؟', 'هل توصلون إلى فندقي في تغازوت؟', 'كم السعر لـ7 أيام؟'] },
    cuisine: { en: ['Can you come to measure my kitchen?', 'How long does it take?', 'Do you do quartz worktops?'], fr: ['Pouvez-vous venir faire le métré ?', 'Quel délai pour une cuisine ?', 'Vous faites les plans en quartz ?'], ar: ['هل يمكنكم القدوم لأخذ القياسات؟', 'كم يستغرق إنجاز المطبخ؟', 'هل لديكم أسطح الكوارتز؟'] },
    photo: { en: ['Are you free on 20 June?', 'Price for photo + video?', 'Do you travel outside Nador?'], fr: ['Vous êtes libres le 20 juin ?', 'Quel prix photo + vidéo ?', 'Vous vous déplacez hors de Nador ?'], ar: ['هل أنتم متاحون يوم 20 يونيو؟', 'كم سعر التصوير والفيديو؟', 'هل تتنقلون خارج الناظور؟'] },
    export: { en: ['Can you send samples?', 'What is your MOQ for plates?', 'Do you ship FOB Casablanca?'], fr: ['Pouvez-vous envoyer des échantillons ?', 'Quel MOQ pour les assiettes ?', 'Vous expédiez en FOB Casablanca ?'], ar: ['هل يمكنكم إرسال عينات؟', 'ما هي الكمية الدنيا للأطباق؟', 'هل تشحنون FOB الدار البيضاء؟'] },
    _default: { en: ['Are you open today?', 'What are your prices?', 'Can I book an appointment?'], fr: ['Vous êtes ouverts aujourd’hui ?', 'Quels sont vos tarifs ?', 'Puis-je prendre rendez-vous ?'], ar: ['هل أنتم مفتوحون اليوم؟', 'ما هي أسعاركم؟', 'هل يمكنني حجز موعد؟'] },
  };
  const biz = cfg.biz || 'Demo';
  const accent = cfg.accent || '#25d366';
  const lang = () => { const l = (document.documentElement.lang || 'en').slice(0, 2); return T[l] ? l : 'en'; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.2Z"/></svg>';

  const css = `
.wac{--wa:#25d366;--acc:${accent};position:fixed;z-index:80;inset-inline-end:18px;bottom:calc(var(--wab,22px) + env(safe-area-inset-bottom));font:500 14px/1.45 system-ui,-apple-system,'Segoe UI',sans-serif;color:#111b21}
.wac *{box-sizing:border-box}
.wac-fab{position:relative;width:58px;height:58px;border-radius:50%;border:0;background:var(--wa);color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 10px 28px -6px rgba(0,0,0,.45);transition:transform .2s}
.wac-fab:hover{transform:scale(1.06)}.wac-fab svg{width:30px;height:30px}
.wac-fab:focus-visible,.wac button:focus-visible,.wac a:focus-visible,.wac input:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
.wac-fab .pulse{position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 0 rgba(37,211,102,.55);animation:wacp 2.4s infinite}
@keyframes wacp{70%{box-shadow:0 0 0 16px rgba(37,211,102,0)}100%{box-shadow:0 0 0 0 rgba(37,211,102,0)}}
.wac-tip{position:absolute;inset-inline-end:68px;bottom:12px;white-space:nowrap;background:#fff;padding:8px 12px;border-radius:10px;box-shadow:0 6px 20px -6px rgba(0,0,0,.35);font-weight:600;pointer-events:none;opacity:0;translate:6px 0;transition:.2s}
.wac-fab:hover+.wac-tip{opacity:1;translate:0}
.wac-pan{position:absolute;inset-inline-end:0;bottom:72px;width:min(360px,calc(100vw - 28px));background:#efeae2;border-radius:18px;overflow:hidden;box-shadow:0 24px 60px -12px rgba(0,0,0,.5);display:flex;flex-direction:column;max-height:min(560px,calc(100vh - 140px));transform-origin:100% 100%;animation:waci .18s ease-out}
[dir=rtl] .wac-pan{transform-origin:0 100%}
@keyframes waci{from{opacity:0;transform:scale(.92)}}
.wac-hd{display:flex;align-items:center;gap:10px;padding:14px 14px 14px 16px;background:#075e54;color:#fff}
.wac-av{width:40px;height:40px;border-radius:50%;background:var(--acc);color:#fff;display:grid;place-items:center;font-weight:800;flex:none}
.wac-hd b{display:block;font-size:15px}.wac-hd small{opacity:.85;font-size:12px;display:flex;align-items:center;gap:5px}
.wac-hd small i{width:7px;height:7px;border-radius:50%;background:#7cf2a6}
.wac-x{margin-inline-start:auto;background:none;border:0;color:#fff;font-size:22px;width:36px;height:36px;border-radius:50%;cursor:pointer}
.wac-x:hover{background:rgba(255,255,255,.12)}
.wac-bd{padding:14px;display:flex;flex-direction:column;gap:8px;overflow:auto}
.wac-msg{max-width:85%;padding:8px 11px;border-radius:10px;background:#fff;box-shadow:0 1px 1px rgba(0,0,0,.08);align-self:flex-start;word-wrap:break-word}
.wac-msg.me{align-self:flex-end;background:#d9fdd3}
.wac-msg .tm{display:block;text-align:end;font-size:11px;color:#667781;margin-top:2px}
.wac-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.wac-chips button{border:1px solid #c8d1cc;background:#fff;color:#075e54;border-radius:999px;padding:7px 12px;font:600 13px/1.2 inherit;cursor:pointer;text-align:start}
.wac-chips button:hover{border-color:#075e54}
.wac-note{background:#fff7d6;border:1px solid #f0dfa0;color:#5b4a12;border-radius:10px;padding:10px 12px;font-size:13px}
.wac-note b{display:block;margin-bottom:2px;color:#3d3209}
.wac-cta{display:flex;flex-direction:column;gap:6px}
.wac-cta a,.wac-cta button{display:flex;align-items:center;justify-content:center;gap:8px;border-radius:10px;padding:11px 12px;font:700 14px/1.2 inherit;cursor:pointer;text-decoration:none;border:0}
.wac-cta a{background:var(--wa);color:#073b20}.wac-cta a svg{width:18px;height:18px}
.wac-cta button{background:transparent;color:#075e54;border:1px solid #c8d1cc}
.wac-ft{display:flex;gap:8px;padding:10px;background:#f0f2f5}
.wac-ft input{flex:1;min-width:0;border:0;border-radius:999px;padding:11px 14px;font:500 14px inherit;background:#fff;color:#111b21}
.wac-ft button{width:44px;height:44px;flex:none;border-radius:50%;border:0;background:#00a884;color:#fff;cursor:pointer;display:grid;place-items:center}
.wac-ft button svg{width:20px;height:20px}[dir=rtl] .wac-ft button svg{transform:scaleX(-1)}
@media (prefers-reduced-motion:reduce){.wac-fab .pulse{animation:none}.wac-pan{animation:none}}
@media print{.wac{display:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const root = document.createElement('div'); root.className = 'wac'; document.body.appendChild(root);
  let open = false; let thread = []; // {me, text}
  const now = () => new Date().toTimeString().slice(0, 5);

  function draw() {
    const t = T[lang()];
    const chips = (CHIPS[cfg.demo] || CHIPS._default)[lang()];
    let pan = '';
    if (open) {
      const sent = thread.some((m) => m.me);
      pan = `<div class="wac-pan" role="dialog" aria-label="${esc(t.open)}">
<div class="wac-hd"><span class="wac-av">${esc(biz.slice(0, 1))}</span><div><b>${esc(biz)}</b><small><i></i>${esc(t.online)}</small></div><button class="wac-x" data-a="close" aria-label="${esc(t.close)}">×</button></div>
<div class="wac-bd" aria-live="polite"><div class="wac-msg">${esc(t.hello)}<span class="tm">${now()}</span></div>
${thread.map((m) => `<div class="wac-msg${m.me ? ' me' : ''}">${esc(m.text)}<span class="tm">${now()} ✓✓</span></div>`).join('')}
${sent ? `<div class="wac-note"><b>${esc(t.sent)}</b>${esc(t.note)}</div>
<div class="wac-cta"><a href="https://wa.me/${MBN}?text=${encodeURIComponent(t.mbn(biz))}" target="_blank" rel="noopener">${WA}${esc(t.want)}</a><button data-a="again">${esc(t.again)}</button></div>`
    : `<div class="wac-chips">${chips.map((c, i) => `<button data-a="chip" data-i="${i}">${esc(c)}</button>`).join('')}</div>`}
</div>
${sent ? '' : `<form class="wac-ft"><input name="m" placeholder="${esc(t.ph)}" aria-label="${esc(t.ph)}" maxlength="300" autocomplete="off" /><button type="submit" aria-label="${esc(t.send)}"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 20.5V14l9-2-9-2V3.5L22 12z"/></svg></button></form>`}
</div>`;
    }
    root.innerHTML = `${pan}<button class="wac-fab" data-a="toggle" aria-expanded="${open}" aria-label="${esc(t.open)}"><span class="pulse"></span>${WA}</button><span class="wac-tip">${esc(t.open)}</span>`;
    if (!open) root.querySelector('.pulse').hidden = sessionStorage.getItem('wac-seen') === '1';
    const bd = root.querySelector('.wac-bd'); if (bd) bd.scrollTop = bd.scrollHeight;
  }
  function say(text) { text = String(text || '').trim(); if (!text) return; thread.push({ me: true, text }); draw(); }

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a;
    if (a === 'toggle' || a === 'close') {
      open = a === 'toggle' ? !open : false;
      try { sessionStorage.setItem('wac-seen', '1'); } catch { /* private mode */ }
      draw(); if (open) root.querySelector('.wac-ft input')?.focus(); else root.querySelector('.wac-fab').focus();
    } else if (a === 'chip') say((CHIPS[cfg.demo] || CHIPS._default)[lang()][+b.dataset.i]);
    else if (a === 'again') { thread = []; draw(); root.querySelector('.wac-ft input')?.focus(); }
  });
  root.addEventListener('submit', (e) => { e.preventDefault(); say(new FormData(e.target).get('m')); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { open = false; draw(); } });

  // Sit above the mobile tab bar when one is showing.
  function place() {
    const bar = [...document.querySelectorAll('.tabbar')].find((el) => { const cs = getComputedStyle(el); return cs.position === 'fixed' && cs.display !== 'none' && cs.visibility !== 'hidden' && el.getClientRects().length; });
    root.style.setProperty('--wab', bar ? `${Math.round(window.innerHeight - bar.getBoundingClientRect().top + 12)}px` : '22px');
  }
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('resize', place);
  let raf = 0; window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; place(); }); }, { passive: true });
  draw(); place(); setTimeout(place, 800);
})();
