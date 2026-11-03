// Everything a client would change lives here: name, contacts, prices, formats, programmes, pieces, texts.
// Values marked TODO are examples to confirm with the artisan before going live.
window.ATELIER = {
  brand: {
    name: 'Atelier Safi',                       // TODO: the artisan's own atelier name
    tagline: { fr: 'Céramique d’art de Safi', en: 'Fine ceramics from Safi', ar: 'خزف آسفي الفني' },
    artisan: 'Maître céramiste',                // TODO: the artisan's name
    city: 'Safi, Maroc',
    whatsapp: '212601439975',                   // TODO: the artisan's WhatsApp number (MBN DEV's for the demo), digits only
    email: 'contact@atelier-safi.ma',           // TODO
    instagram: 'atelier.safi',                  // TODO
  },
  depositPct: 30,                               // TODO: deposit asked at booking
  freeCancelDays: 14,                           // TODO: free cancellation up to N days before
  eurToMad: 10.8,                               // TODO: rate used to show both currencies
  // Formats offered. Prices are examples (TODO): MAD for sessions in Morocco, EUR abroad.
  formats: [
    { id: 'initiation', days: 1, hours: '3 h', level: 'all', priceMAD: 450, priceEUR: 60,
      fr: { name: 'Initiation au tour', desc: 'Trois heures pour toucher la terre de Safi, centrer, monter et décorer votre première pièce.', programme: ['Accueil, thé et histoire de la céramique de Safi', 'Centrage et tournage d’un bol', 'Décor au pinceau avec les motifs de Safi'] },
      en: { name: 'Wheel taster', desc: 'Three hours to feel Safi clay, centre it, throw and decorate your first piece.', programme: ['Welcome, tea and the story of Safi ceramics', 'Centring and throwing a bowl', 'Brush decoration with Safi patterns'] },
      ar: { name: 'تعريف بالدولاب', desc: 'ثلاث ساعات لتلمس طين آسفي، وتتعلم التوسيط والتشكيل وتزخرف قطعتك الأولى.', programme: ['استقبال وشاي وتاريخ خزف آسفي', 'التوسيط وتشكيل زلافة على الدولاب', 'الزخرفة بالريشة بنقوش آسفي'] } },
    { id: 'decouverte', days: 2, hours: '2 × 6 h', level: 'beginner', priceMAD: 1600, priceEUR: 190,
      fr: { name: 'Stage découverte', desc: 'Tournage, tournassage et décor au pinceau selon les motifs traditionnels de Safi.', programme: ['Jour 1 : préparation de la terre, centrage, tournage de bols et d’assiettes', 'Jour 2 : tournassage, anses, décor au pinceau, préparation à la cuisson'] },
      en: { name: 'Discovery course', desc: 'Throwing, trimming and brush decoration in the traditional Safi patterns.', programme: ['Day 1: wedging, centring, throwing bowls and plates', 'Day 2: trimming, handles, brush decoration, getting ready to fire'] },
      ar: { name: 'تكوين اكتشاف', desc: 'التشكيل على الدولاب والتشذيب والزخرفة بالريشة على طريقة آسفي التقليدية.', programme: ['اليوم 1: تحضير الطين والتوسيط وتشكيل الزلايف والصحون', 'اليوم 2: التشذيب والمقابض والزخرفة والتحضير للطهي'] } },
    { id: 'intensif', days: 5, hours: '5 × 6 h', level: 'intermediate', priceMAD: 4200, priceEUR: 480,
      fr: { name: 'Stage intensif', desc: 'Cinq jours de la terre au four : tournage, décor, émaillage et cuisson de vos pièces.', programme: ['Jour 1 : les terres de Safi, centrage et formes ouvertes', 'Jour 2 : formes fermées, vases et cols', 'Jour 3 : tournassage, assemblage, anses et becs', 'Jour 4 : décor traditionnel et émaux de Safi', 'Jour 5 : émaillage, enfournement et bilan'] },
      en: { name: 'Intensive course', desc: 'Five days from clay to kiln: throwing, decoration, glazing and firing your pieces.', programme: ['Day 1: Safi clays, centring and open forms', 'Day 2: closed forms, vases and necks', 'Day 3: trimming, joining, handles and spouts', 'Day 4: traditional decoration and Safi glazes', 'Day 5: glazing, loading the kiln and review'] },
      ar: { name: 'تكوين مكثّف', desc: 'خمسة أيام من الطين إلى الفرن: التشكيل والزخرفة والتزجيج وطهي قطعك.', programme: ['اليوم 1: أطيان آسفي والتوسيط والأشكال المفتوحة', 'اليوم 2: الأشكال المغلقة والجرار والأعناق', 'اليوم 3: التشذيب والتجميع والمقابض', 'اليوم 4: الزخرفة التقليدية ومينا آسفي', 'اليوم 5: التزجيج وإدخال الفرن والتقييم'] } },
    { id: 'pro', days: 15, hours: '3 semaines', level: 'advanced', priceMAD: 11500, priceEUR: 1250,
      fr: { name: 'Formation professionnelle', desc: 'Trois semaines pour maîtriser le métier : techniques, émaux de Safi, cuisson, et un certificat de fin de formation.', programme: ['Semaine 1 : tournage avancé, séries et régularité', 'Semaine 2 : émaux de Safi, préparation, essais et décor', 'Semaine 3 : cuisson, projet personnel, présentation et certificat'] },
      en: { name: 'Professional training', desc: 'Three weeks to master the craft: techniques, Safi glazes, firing, and a certificate of completion.', programme: ['Week 1: advanced throwing, series and consistency', 'Week 2: Safi glazes, mixing, tests and decoration', 'Week 3: firing, personal project, presentation and certificate'] },
      ar: { name: 'تكوين احترافي', desc: 'ثلاثة أسابيع لإتقان الحرفة: التقنيات ومينا آسفي والطهي، مع شهادة في نهاية التكوين.', programme: ['الأسبوع 1: تشكيل متقدم وإنتاج متسلسل منتظم', 'الأسبوع 2: مينا آسفي، تحضيرها وتجاربها والزخرفة', 'الأسبوع 3: الطهي ومشروع شخصي وتقديم وشهادة'] } },
    { id: 'masterclass', days: 2, hours: '2 × 5 h', level: 'all', priceMAD: 1900, priceEUR: 220,
      fr: { name: 'Masterclass à l’étranger', desc: 'Le savoir-faire de Safi présenté dans votre ville, avec de la terre et des émaux apportés du Maroc.', programme: ['Jour 1 : démonstration du maître, tournage guidé', 'Jour 2 : décor de Safi, émaillage et cuisson sur place ou expédition'] },
      en: { name: 'Masterclass abroad', desc: 'Safi know-how brought to your city, with clay and glazes from Morocco.', programme: ['Day 1: master’s demonstration, guided throwing', 'Day 2: Safi decoration, glazing, firing on site or shipping'] },
      ar: { name: 'ماستركلاس في الخارج', desc: 'حرفة آسفي تأتي إلى مدينتك، بطين ومينا تُحمل من المغرب.', programme: ['اليوم 1: عرض المعلم وتشكيل موجَّه', 'اليوم 2: زخرفة آسفي والتزجيج والطهي أو الإرسال'] } },
  ],
  included: {
    fr: ['Terre et émaux de Safi', 'Outils et tablier', 'Cuisson de vos pièces', 'Thé à la menthe et pause gourmande', 'Petits groupes (8 max.)'],
    en: ['Safi clay and glazes', 'Tools and apron', 'Firing of your pieces', 'Mint tea and a snack break', 'Small groups (8 max.)'],
    ar: ['طين ومينا آسفي', 'الأدوات والمئزر', 'طهي قطعك في الفرن', 'شاي بالنعناع واستراحة', 'مجموعات صغيرة (8 كحد أقصى)'],
  },
  // Pieces for sale (TODO: real pieces, photos and prices). `art` picks the drawn plate/vase.
  pieces: [
    { id: 'p1', art: ['plate', 1], priceMAD: 350, stock: 4, fr: 'Assiette rosace bleue', en: 'Blue rosette plate', ar: 'صحن الوردة الزرقاء' },
    { id: 'p2', art: ['vase', 2], priceMAD: 680, stock: 2, fr: 'Vase à bandes', en: 'Banded vase', ar: 'جرة بالأشرطة' },
    { id: 'p3', art: ['plate', 6], priceMAD: 290, stock: 6, fr: 'Assiette terre cuite', en: 'Terracotta plate', ar: 'صحن الطين الأحمر' },
    { id: 'p4', art: ['vase', 5], priceMAD: 720, stock: 1, fr: 'Jarre de Safi', en: 'Safi jar', ar: 'خابية آسفي' },
    { id: 'p5', art: ['plate', 9], priceMAD: 420, stock: 3, fr: 'Grand plat de service', en: 'Large serving dish', ar: 'طبق تقديم كبير' },
    { id: 'p6', art: ['plate', 12], priceMAD: 260, stock: 8, fr: 'Coupelle émaillée', en: 'Glazed small bowl', ar: 'زلافة صغيرة مزججة' },
  ],
  voucherAmounts: [450, 1000, 1600, 4200],      // gift vouchers in MAD (TODO)
  shippingMAD: { morocco: 60, abroad: 250 },    // TODO
  // Legal texts (TODO: to be written with the artisan; shown as drafts in the demo)
  legal: {
    terms: { fr: 'Réservation confirmée par un acompte. Annulation gratuite jusqu’à 14 jours avant la session, ensuite l’acompte est conservé ou reporté sur une autre date. Le solde est dû avant le début de la session. Les pièces sont remises après cuisson (retrait à l’atelier ou envoi à la charge du participant).', en: 'A booking is confirmed by a deposit. Free cancellation up to 14 days before the session; after that the deposit is kept or moved to another date. The balance is due before the session starts. Pieces are handed over after firing (pick-up at the studio or shipping at the participant’s cost).', ar: 'يُؤكَّد الحجز بعربون. الإلغاء مجاني حتى 14 يومًا قبل الدورة، وبعدها يُحتفظ بالعربون أو يُنقل لتاريخ آخر. يُؤدّى الباقي قبل بداية الدورة. تُسلَّم القطع بعد الطهي (من الورشة أو بالإرسال على حساب المشارك).' },
    privacy: { fr: 'Vos données (nom, contact, réservation) servent uniquement à gérer votre inscription et, si vous l’acceptez, à vous prévenir des prochaines dates. Elles ne sont jamais revendues. Vous pouvez demander leur suppression à tout moment par email ou WhatsApp.', en: 'Your data (name, contact, booking) is used only to manage your booking and, if you agree, to tell you about upcoming dates. It is never sold. You can ask for it to be deleted at any time by email or WhatsApp.', ar: 'تُستعمل معطياتك (الاسم، وسيلة الاتصال، الحجز) فقط لتدبير تسجيلك، وإن وافقت، لإخبارك بالمواعيد القادمة. لا تُباع أبدًا. يمكنك طلب حذفها في أي وقت عبر البريد أو واتساب.' },
    legal: { fr: 'Atelier Safi — [raison sociale, ICE, adresse] — à compléter. Site réalisé par MBN DEV.', en: 'Atelier Safi — [company name, ICE, address] — to be completed. Website by MBN DEV.', ar: 'ورشة آسفي — [الاسم التجاري، ICE، العنوان] — يُكمَّل لاحقًا. أنجز الموقع MBN DEV.' },
  },
};
