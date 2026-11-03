// Public site (FR / EN / AR): workshops in Morocco and abroad with programmes, booking with deposit and
// gift vouchers, waiting list, demand by city, hosts and groups requests, gift vouchers, a small shop,
// reviews, legal pages, and the participant space (booking, balance, messages, review, certificate).
(function () {
  const C = window.ATELIER;
  const S = window.Store;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let lang = (() => { try { const l = localStorage.getItem('as_lang'); return ['fr', 'en', 'ar'].includes(l) ? l : 'fr'; } catch { return 'fr'; } })();
  let filter = { where: 'all', format: 'all' };
  const cart = {};

  const FLAG = { MA: '🇲🇦', FR: '🇫🇷', ES: '🇪🇸', BE: '🇧🇪', CA: '🇨🇦', CH: '🇨🇭', GB: '🇬🇧', NL: '🇳🇱', DE: '🇩🇪', IT: '🇮🇹', US: '🇺🇸' };
  const LOCALE = { fr: 'fr-FR', en: 'en-GB', ar: 'ar-MA' };
  const T = {
    fr: {
      nav: ['Ateliers', 'Formations', 'Offrir', 'Boutique', 'À l’étranger', 'Contact'], space: 'Mon espace', book: 'Réserver', seeDates: 'Voir les prochaines dates', details: 'Programme',
      heroTitle: 'La céramique de Safi, <em>entre vos mains.</em>', heroLead: 'Ateliers et formations avec un maître céramiste de Safi : au Maroc, dans notre atelier, et dans votre ville, à l’étranger. Petits groupes, terre et émaux de Safi, cuisson incluse.',
      stats: [['Safi', 'capitale marocaine de la céramique'], ['8', 'participants maximum'], ['Maroc + Europe', 'ateliers toute l’année']],
      badge: 'Prochain atelier', strip: ['Terre et émaux de Safi', 'Cuisson incluse', 'Petits groupes', 'Au Maroc et à l’étranger', 'Certificat de formation', 'Bons cadeaux', 'Réservation en ligne'],
      formatsEyebrow: 'Formations', formatsTitle: 'Du premier contact avec la terre au métier.', formatsLead: 'Choisissez le format qui vous ressemble. Chaque session est encadrée personnellement par le maître céramiste.',
      days: (n) => (n === 1 ? '1 jour' : `${n} jours`), from: 'dès', levels: { all: 'Tous niveaux', beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' },
      sessionsEyebrow: 'Calendrier', sessionsTitle: 'Prochains ateliers', sessionsLead: 'Places limitées. Quand une session est complète, inscrivez-vous sur la liste d’attente : nous vous prévenons dès qu’une place se libère.',
      fAll: 'Tout', fMa: 'Au Maroc', fAbroad: 'À l’étranger', seatsLeft: (n) => (n === 0 ? 'Complet' : n === 1 ? '1 place restante' : `${n} places restantes`), waitlist: 'Liste d’attente', perPerson: '/ personne', lang: 'Langue',
      programme: 'Programme', included: 'Toujours inclus', where: 'Lieu', when: 'Dates', policy: 'Annulation',
      artisanEyebrow: 'L’artisan', artisanQuote: '« À Safi, la terre se transmet de main en main. Mon métier, c’est de vous la faire sentir. »',
      artisanText: 'Né dans la tradition des potiers de Safi, le maître céramiste partage son savoir-faire : tournage, décor au pinceau, émaux et cuisson. Ses ateliers se tiennent à Safi et voyagent au Maroc et à l’étranger.', photo: 'Photo de l’artisan à fournir',
      giftEyebrow: 'Offrir', giftTitle: 'Offrez un atelier.', giftLead: 'Un bon cadeau valable 12 mois, utilisable sur toutes les sessions au Maroc et à l’étranger. Reçu immédiatement, à imprimer ou à envoyer par WhatsApp.',
      giftAmount: 'Montant', giftFrom: 'De la part de', giftTo: 'Pour', giftMsg: 'Petit mot (facultatif)', giftBuy: 'Acheter le bon cadeau', giftDone: 'Votre bon cadeau', giftCode: 'Code à saisir au moment de la réservation', giftPrint: 'Imprimer', giftSend: 'Envoyer par WhatsApp',
      groupsEyebrow: 'Groupes', groupsTitle: 'Entreprises, écoles, groupes d’amis', groupsLead: 'Team building, sortie scolaire, enterrement de vie, séminaire : un atelier privé, chez nous ou chez vous.', kind: 'Type de groupe',
      kinds: { company: 'Entreprise / séminaire', school: 'École / université', friends: 'Groupe d’amis / fête', association: 'Association' }, budget: 'Budget indicatif', date: 'Date souhaitée', groupOk: 'Demande reçue. Vous recevez une proposition sous 48 h.',
      shopEyebrow: 'Boutique', shopTitle: 'Pièces de l’atelier', shopLead: 'Des pièces uniques tournées et décorées à Safi. Retrait à l’atelier ou envoi au Maroc et à l’étranger.', add: 'Ajouter', inCart: 'Dans votre panier', order: 'Commander', stock: (n) => (n === 1 ? 'Pièce unique' : `${n} en stock`),
      delivery: 'Livraison', deliv: { morocco: 'Au Maroc', abroad: 'À l’étranger' }, address: 'Ville et adresse', orderOk: (r) => `Commande ${r} reçue. Nous vous écrivons pour le paiement et l’envoi.`, shipping: 'Envoi',
      abroadEyebrow: 'À l’étranger', abroadTitle: 'L’atelier vient à vous.', abroadLead: 'Nous organisons des masterclasses en Europe et au-delà. Dites-nous où vous êtes : quand une ville réunit assez de personnes, une session y est programmée.',
      interestTitle: 'Prévenez-moi des dates dans ma ville', interestText: 'Laissez votre ville et votre contact. Vous serez prévenu en premier.', city: 'Ville', country: 'Pays', contact: 'Email ou WhatsApp', name: 'Nom', notify: 'Me prévenir',
      interestOk: (c) => `Merci ! Vous serez prévenu dès qu’une session sera programmée à ${c}.`,
      hostTitle: 'Organiser un atelier chez vous', hostText: 'Association, école d’art, galerie : accueillez une masterclass dans votre ville.', org: 'Organisation ou nom', people: 'Nombre de participants', period: 'Période souhaitée', message: 'Message', send: 'Envoyer la demande',
      hostOk: 'Demande reçue. Nous vous répondons sous 48 h avec une proposition.',
      reviewsEyebrow: 'Avis', reviewsTitle: 'Ce qu’en disent les participants', reviewsEmpty: 'Les avis des participants apparaîtront ici après leur session.',
      galleryEyebrow: 'Créations', galleryTitle: 'Les motifs de Safi', galleryLead: 'Des rosaces et des bleus de cobalt hérités des ateliers de la colline des potiers.',
      faqTitle: 'Questions fréquentes',
      faq: [['Faut-il savoir dessiner ou avoir déjà touché la terre ?', 'Non. L’initiation et le stage découverte sont pensés pour les débutants complets.'], ['Que faut-il apporter ?', 'Une tenue qui ne craint pas la terre. Terre, outils, tablier et émaux sont fournis.'], ['Puis-je repartir avec mes pièces ?', 'Oui. Après séchage et cuisson, vos pièces sont à récupérer à l’atelier ou expédiées (frais d’envoi en plus).'], ['Comment fonctionne le paiement ?', `Un acompte de ${C.depositPct} % confirme votre place, le solde se règle avant la session, en ligne ou sur place. Un bon cadeau peut payer tout ou partie.`], ['Et si je dois annuler ?', `Annulation gratuite jusqu’à ${C.freeCancelDays} jours avant la session, ou report sur une autre date.`], ['Les formations donnent-elles un certificat ?', 'Oui, la formation professionnelle se termine par un certificat signé par le maître céramiste.']],
      contactTitle: 'Une question ? Écrivez-nous.', contactText: 'Réponse sous 24 h, en français, en anglais ou en arabe.', yourMsg: 'Votre message', msgOk: 'Message envoyé. Vous recevez la réponse par email ou WhatsApp.',
      footerText: 'Ateliers et formations de céramique d’art, Safi · Maroc et international.', demo: 'Démo réalisée par MBN DEV — exemple du système proposé. Les données restent dans votre navigateur.',
      legal: ['Conditions et annulation', 'Confidentialité', 'Mentions légales'], draft: 'Texte provisoire, à valider avec l’atelier.', atelierSpace: 'Espace atelier',
      consent: 'J’accepte que mes données servent à gérer ma demande', consentNews: 'Je souhaite être prévenu des prochaines dates', readPrivacy: 'confidentialité',
      step1: 'Votre atelier', seats: 'Nombre de participants', step2: 'Vos coordonnées', email: 'Email', phone: 'Téléphone (WhatsApp)', level: 'Votre niveau', notes: 'Une remarque ? (allergie, langue, hébergement…)', next: 'Continuer', back: 'Retour',
      step3: 'Paiement', payDeposit: (p) => `Payer l’acompte maintenant (${p} %)`, payFull: 'Payer la totalité maintenant', payLater: 'Réserver et payer plus tard (virement ou sur place)', total: 'Total', dueNow: 'À payer maintenant', confirm: 'Confirmer la réservation',
      voucher: 'Code bon cadeau', apply: 'Appliquer', voucherOk: (a) => `Bon cadeau appliqué : ${a}`, voucherBad: 'Code invalide ou déjà utilisé.', fromVoucher: 'Payé par bon cadeau',
      card: 'Carte bancaire (démo, aucun paiement réel)', doneTitle: 'C’est réservé !', doneWait: 'Vous êtes sur la liste d’attente', doneText: 'Votre référence', doneHint: 'Gardez-la : avec votre téléphone, elle ouvre votre espace participant.',
      waConfirm: 'Recevoir la confirmation sur WhatsApp', ics: 'Ajouter au calendrier', openSpace: 'Ouvrir mon espace', waitText: 'La session est complète. Nous vous écrivons dès qu’une place se libère, sans engagement.',
      spaceTitle: 'Mon espace participant', ref: 'Référence (ex. AS-1234)', open: 'Ouvrir', notFound: 'Aucune réservation trouvée avec cette référence et ce téléphone.',
      paid: 'Payé', balance: 'Reste à payer', payBalance: 'Payer le solde', practical: 'Infos pratiques', practicalText: (s) => `Rendez-vous ${s.venue}, ${s.city}, à 9 h 30 le premier jour. Apportez une tenue qui ne craint pas la terre.`,
      messages: 'Messages avec l’atelier', write: 'Écrire un message…', sendMsg: 'Envoyer', cert: 'Télécharger mon certificat', status: { pending: 'En attente de paiement', confirmed: 'Confirmée', paid: 'Soldée', waitlist: 'Liste d’attente', cancelled: 'Annulée' },
      leaveReview: 'Laisser un avis', reviewText: 'Votre expérience en quelques mots', reviewSend: 'Publier mon avis', reviewOk: 'Merci ! Votre avis sera publié après relecture.', reviewLater: 'Vous pourrez laisser un avis après la session.',
    },
    en: {
      nav: ['Workshops', 'Courses', 'Gift', 'Shop', 'Abroad', 'Contact'], space: 'My space', book: 'Book', seeDates: 'See upcoming dates', details: 'Programme',
      heroTitle: 'Safi ceramics, <em>in your hands.</em>', heroLead: 'Workshops and courses with a master ceramist from Safi: in Morocco, in our studio, and in your city abroad. Small groups, Safi clay and glazes, firing included.',
      stats: [['Safi', 'Morocco’s ceramics capital'], ['8', 'participants at most'], ['Morocco + Europe', 'workshops all year']],
      badge: 'Next workshop', strip: ['Safi clay and glazes', 'Firing included', 'Small groups', 'In Morocco and abroad', 'Course certificate', 'Gift vouchers', 'Online booking'],
      formatsEyebrow: 'Courses', formatsTitle: 'From your first touch of clay to the craft.', formatsLead: 'Choose the format that suits you. Every session is personally led by the master ceramist.',
      days: (n) => (n === 1 ? '1 day' : `${n} days`), from: 'from', levels: { all: 'All levels', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
      sessionsEyebrow: 'Calendar', sessionsTitle: 'Upcoming workshops', sessionsLead: 'Places are limited. When a session is full, join the waiting list: we tell you as soon as a place opens.',
      fAll: 'All', fMa: 'In Morocco', fAbroad: 'Abroad', seatsLeft: (n) => (n === 0 ? 'Full' : n === 1 ? '1 place left' : `${n} places left`), waitlist: 'Waiting list', perPerson: '/ person', lang: 'Language',
      programme: 'Programme', included: 'Always included', where: 'Venue', when: 'Dates', policy: 'Cancellation',
      artisanEyebrow: 'The artisan', artisanQuote: '“In Safi, clay is passed from hand to hand. My job is to let you feel it.”',
      artisanText: 'Raised in the tradition of Safi’s potters, the master ceramist shares his craft: throwing, brush decoration, glazes and firing. His workshops are held in Safi and travel across Morocco and abroad.', photo: 'Artisan photo to be provided',
      giftEyebrow: 'Gift', giftTitle: 'Give a workshop.', giftLead: 'A gift voucher valid 12 months, for any session in Morocco or abroad. Received instantly, to print or send on WhatsApp.',
      giftAmount: 'Amount', giftFrom: 'From', giftTo: 'For', giftMsg: 'A short note (optional)', giftBuy: 'Buy the gift voucher', giftDone: 'Your gift voucher', giftCode: 'Code to enter when booking', giftPrint: 'Print', giftSend: 'Send on WhatsApp',
      groupsEyebrow: 'Groups', groupsTitle: 'Companies, schools, groups of friends', groupsLead: 'Team building, school trip, hen party, seminar: a private workshop, at our studio or yours.', kind: 'Type of group',
      kinds: { company: 'Company / seminar', school: 'School / university', friends: 'Friends / party', association: 'Association' }, budget: 'Indicative budget', date: 'Preferred date', groupOk: 'Request received. You get a proposal within 48 h.',
      shopEyebrow: 'Shop', shopTitle: 'Pieces from the studio', shopLead: 'One-of-a-kind pieces thrown and decorated in Safi. Pick-up at the studio or shipping in Morocco and abroad.', add: 'Add', inCart: 'In your basket', order: 'Order', stock: (n) => (n === 1 ? 'One of a kind' : `${n} in stock`),
      delivery: 'Delivery', deliv: { morocco: 'In Morocco', abroad: 'Abroad' }, address: 'City and address', orderOk: (r) => `Order ${r} received. We will write to you about payment and shipping.`, shipping: 'Shipping',
      abroadEyebrow: 'Abroad', abroadTitle: 'The studio comes to you.', abroadLead: 'We run masterclasses in Europe and beyond. Tell us where you are: when a city gathers enough people, a session is scheduled there.',
      interestTitle: 'Tell me when it comes to my city', interestText: 'Leave your city and a contact. You will be the first to know.', city: 'City', country: 'Country', contact: 'Email or WhatsApp', name: 'Name', notify: 'Notify me',
      interestOk: (c) => `Thank you! You will hear from us as soon as a session is scheduled in ${c}.`,
      hostTitle: 'Host a workshop', hostText: 'Association, art school, gallery: host a masterclass in your city.', org: 'Organisation or name', people: 'Number of participants', period: 'Preferred period', message: 'Message', send: 'Send request',
      hostOk: 'Request received. We reply within 48 h with a proposal.',
      reviewsEyebrow: 'Reviews', reviewsTitle: 'What participants say', reviewsEmpty: 'Participants’ reviews will appear here after their session.',
      galleryEyebrow: 'Work', galleryTitle: 'The patterns of Safi', galleryLead: 'Rosettes and cobalt blues inherited from the workshops of the potters’ hill.',
      faqTitle: 'Frequently asked questions',
      faq: [['Do I need any experience?', 'No. The taster class and the discovery course are designed for complete beginners.'], ['What should I bring?', 'Clothes you don’t mind getting dirty. Clay, tools, apron and glazes are provided.'], ['Can I take my pieces home?', 'Yes. After drying and firing, collect them at the studio or have them shipped (shipping extra).'], ['How does payment work?', `A ${C.depositPct}% deposit secures your place; the balance is paid before the session, online or on site. A gift voucher can pay all or part of it.`], ['What if I need to cancel?', `Free cancellation up to ${C.freeCancelDays} days before, or move to another date.`], ['Do courses come with a certificate?', 'Yes, the professional training ends with a certificate signed by the master ceramist.']],
      contactTitle: 'A question? Write to us.', contactText: 'Reply within 24 h, in French, English or Arabic.', yourMsg: 'Your message', msgOk: 'Message sent. You get the reply by email or WhatsApp.',
      footerText: 'Fine ceramics workshops and courses, Safi · Morocco and abroad.', demo: 'Demo by MBN DEV — an example of the proposed system. Data stays in your browser.',
      legal: ['Terms and cancellation', 'Privacy', 'Legal notice'], draft: 'Draft text, to be approved with the studio.', atelierSpace: 'Studio space',
      consent: 'I agree that my data is used to handle my request', consentNews: 'I want to hear about upcoming dates', readPrivacy: 'privacy',
      step1: 'Your workshop', seats: 'Participants', step2: 'Your details', email: 'Email', phone: 'Phone (WhatsApp)', level: 'Your level', notes: 'Anything to add? (allergy, language, accommodation…)', next: 'Continue', back: 'Back',
      step3: 'Payment', payDeposit: (p) => `Pay the deposit now (${p}%)`, payFull: 'Pay in full now', payLater: 'Book now, pay later (transfer or on site)', total: 'Total', dueNow: 'Due now', confirm: 'Confirm booking',
      voucher: 'Gift voucher code', apply: 'Apply', voucherOk: (a) => `Gift voucher applied: ${a}`, voucherBad: 'Invalid or already used code.', fromVoucher: 'Paid by gift voucher',
      card: 'Card (demo, no real payment)', doneTitle: 'You’re booked!', doneWait: 'You’re on the waiting list', doneText: 'Your reference', doneHint: 'Keep it: with your phone number it opens your participant space.',
      waConfirm: 'Get the confirmation on WhatsApp', ics: 'Add to calendar', openSpace: 'Open my space', waitText: 'This session is full. We will write to you as soon as a place opens, no commitment.',
      spaceTitle: 'My participant space', ref: 'Reference (e.g. AS-1234)', open: 'Open', notFound: 'No booking found with this reference and phone.',
      paid: 'Paid', balance: 'Balance due', payBalance: 'Pay the balance', practical: 'Practical info', practicalText: (s) => `Meet at ${s.venue}, ${s.city}, at 9:30 on the first day. Wear clothes you don’t mind getting dirty.`,
      messages: 'Messages with the studio', write: 'Write a message…', sendMsg: 'Send', cert: 'Download my certificate', status: { pending: 'Awaiting payment', confirmed: 'Confirmed', paid: 'Paid in full', waitlist: 'Waiting list', cancelled: 'Cancelled' },
      leaveReview: 'Leave a review', reviewText: 'Your experience in a few words', reviewSend: 'Publish my review', reviewOk: 'Thank you! Your review will be published after moderation.', reviewLater: 'You can leave a review after the session.',
    },
    ar: {
      nav: ['الورشات', 'التكوينات', 'هدية', 'المتجر', 'في الخارج', 'اتصل بنا'], space: 'فضائي', book: 'احجز', seeDates: 'المواعيد القادمة', details: 'البرنامج',
      heroTitle: 'خزف آسفي، <em>بين يديك.</em>', heroLead: 'ورشات وتكوينات مع معلم خزّاف من آسفي: في المغرب داخل ورشتنا، وفي مدينتك خارج المغرب. مجموعات صغيرة، طين ومينا آسفي، والطهي في الفرن مشمول.',
      stats: [['آسفي', 'عاصمة الخزف في المغرب'], ['8', 'مشاركين كحد أقصى'], ['المغرب + أوروبا', 'ورشات طوال السنة']],
      badge: 'الورشة القادمة', strip: ['طين ومينا آسفي', 'الطهي مشمول', 'مجموعات صغيرة', 'في المغرب وفي الخارج', 'شهادة تكوين', 'بطاقات هدية', 'حجز عبر الإنترنت'],
      formatsEyebrow: 'التكوينات', formatsTitle: 'من أول لمسة للطين إلى إتقان الحرفة.', formatsLead: 'اختر الصيغة التي تناسبك. كل دورة يؤطرها المعلم الخزّاف شخصيًا.',
      days: (n) => (n === 1 ? 'يوم واحد' : `${n} أيام`), from: 'ابتداءً من', levels: { all: 'كل المستويات', beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' },
      sessionsEyebrow: 'الرزنامة', sessionsTitle: 'الورشات القادمة', sessionsLead: 'المقاعد محدودة. إن امتلأت الدورة، سجّل في لائحة الانتظار وسنخبرك فور توفر مقعد.',
      fAll: 'الكل', fMa: 'في المغرب', fAbroad: 'في الخارج', seatsLeft: (n) => (n === 0 ? 'مكتملة' : n === 1 ? 'بقي مقعد واحد' : `بقي ${n} مقاعد`), waitlist: 'لائحة الانتظار', perPerson: '/ للشخص', lang: 'اللغة',
      programme: 'البرنامج', included: 'مشمول دائمًا', where: 'المكان', when: 'التاريخ', policy: 'الإلغاء',
      artisanEyebrow: 'الحرفي', artisanQuote: '«في آسفي، الطين يُتوارث من يد إلى يد. وحرفتي أن أجعلك تحسّ به.»',
      artisanText: 'نشأ المعلم الخزّاف على تقاليد فخّارِي آسفي، ويشارك حرفته: التشكيل على الدولاب، والزخرفة بالريشة، والمينا، والطهي. تُقام ورشاته في آسفي وتسافر داخل المغرب وخارجه.', photo: 'صورة الحرفي تُضاف لاحقًا',
      giftEyebrow: 'هدية', giftTitle: 'أهدِ ورشة.', giftLead: 'بطاقة هدية صالحة 12 شهرًا، تُستعمل في كل الدورات داخل المغرب وخارجه. تصلك فورًا، للطباعة أو للإرسال عبر واتساب.',
      giftAmount: 'المبلغ', giftFrom: 'من طرف', giftTo: 'إلى', giftMsg: 'كلمة قصيرة (اختياري)', giftBuy: 'اشترِ بطاقة الهدية', giftDone: 'بطاقة هديتك', giftCode: 'رمز يُدخل عند الحجز', giftPrint: 'طباعة', giftSend: 'إرسال عبر واتساب',
      groupsEyebrow: 'المجموعات', groupsTitle: 'شركات، مدارس، مجموعات أصدقاء', groupsLead: 'بناء الفريق، خرجة مدرسية، احتفال، ندوة: ورشة خاصة عندنا أو عندكم.', kind: 'نوع المجموعة',
      kinds: { company: 'شركة / ندوة', school: 'مدرسة / جامعة', friends: 'أصدقاء / احتفال', association: 'جمعية' }, budget: 'الميزانية التقريبية', date: 'التاريخ المرغوب', groupOk: 'وصل طلبك. سيصلك عرض خلال 48 ساعة.',
      shopEyebrow: 'المتجر', shopTitle: 'قطع من الورشة', shopLead: 'قطع فريدة مشكّلة ومزخرفة في آسفي. استلام من الورشة أو إرسال داخل المغرب وخارجه.', add: 'أضف', inCart: 'في سلتك', order: 'اطلب', stock: (n) => (n === 1 ? 'قطعة فريدة' : `${n} متوفرة`),
      delivery: 'التوصيل', deliv: { morocco: 'داخل المغرب', abroad: 'خارج المغرب' }, address: 'المدينة والعنوان', orderOk: (r) => `وصل طلبك ${r}. سنكتب لك بخصوص الأداء والإرسال.`, shipping: 'الإرسال',
      abroadEyebrow: 'في الخارج', abroadTitle: 'الورشة تأتي إليك.', abroadLead: 'ننظم ماستركلاس في أوروبا وغيرها. أخبرنا أين أنت: حين يجتمع عدد كافٍ في مدينة، نبرمج فيها دورة.',
      interestTitle: 'أخبرني بالمواعيد في مدينتي', interestText: 'اترك مدينتك ووسيلة اتصال، وستكون أول من يعلم.', city: 'المدينة', country: 'البلد', contact: 'البريد أو واتساب', name: 'الاسم', notify: 'أخبرني',
      interestOk: (c) => `شكرًا! سنخبرك فور برمجة دورة في ${c}.`,
      hostTitle: 'نظّم ورشة عندكم', hostText: 'جمعية، مدرسة فنون، رواق: استضيفوا ماستركلاس في مدينتكم.', org: 'الهيئة أو الاسم', people: 'عدد المشاركين', period: 'الفترة المرغوبة', message: 'الرسالة', send: 'أرسل الطلب',
      hostOk: 'وصل طلبك. سنرد عليك خلال 48 ساعة بعرض.',
      reviewsEyebrow: 'الآراء', reviewsTitle: 'ماذا يقول المشاركون', reviewsEmpty: 'ستظهر آراء المشاركين هنا بعد دوراتهم.',
      galleryEyebrow: 'الإبداعات', galleryTitle: 'نقوش آسفي', galleryLead: 'وُريدات وأزرق كوبالتي ورثناه عن ورشات تلّ الخزّافين.',
      faqTitle: 'أسئلة شائعة',
      faq: [['هل يلزم أن أعرف الرسم أو سبق لي لمس الطين؟', 'لا. التعريف وتكوين الاكتشاف مصممان للمبتدئين تمامًا.'], ['ماذا أحمل معي؟', 'لباسًا لا تخشى عليه من الطين. الطين والأدوات والمئزر والمينا متوفرة.'], ['هل أعود بقطعي؟', 'نعم. بعد التجفيف والطهي تستلمها من الورشة أو تُرسل إليك (مصاريف الإرسال إضافية).'], ['كيف يتم الأداء؟', `عربون ${C.depositPct}% يؤكد مقعدك، والباقي قبل الدورة عبر الإنترنت أو في عين المكان. ويمكن لبطاقة هدية أن تؤدي الكل أو الجزء.`], ['وإن اضطررت للإلغاء؟', `الإلغاء مجاني حتى ${C.freeCancelDays} يومًا قبل الدورة، أو النقل لتاريخ آخر.`], ['هل تمنح التكوينات شهادة؟', 'نعم، ينتهي التكوين الاحترافي بشهادة موقعة من المعلم الخزّاف.']],
      contactTitle: 'سؤال؟ اكتب لنا.', contactText: 'نرد خلال 24 ساعة، بالعربية أو الفرنسية أو الإنجليزية.', yourMsg: 'رسالتك', msgOk: 'أُرسلت رسالتك. يصلك الرد عبر البريد أو واتساب.',
      footerText: 'ورشات وتكوينات في الخزف الفني، آسفي · المغرب والخارج.', demo: 'عرض تجريبي من إنجاز MBN DEV — مثال للنظام المقترح. تبقى المعطيات في متصفحك.',
      legal: ['شروط البيع والإلغاء', 'الخصوصية', 'الإشعار القانوني'], draft: 'نص مؤقت، يُعتمد مع الورشة.', atelierSpace: 'فضاء الورشة',
      consent: 'أوافق على استعمال معطياتي لتدبير طلبي', consentNews: 'أريد أن أعرف المواعيد القادمة', readPrivacy: 'الخصوصية',
      step1: 'ورشتك', seats: 'عدد المشاركين', step2: 'معطياتك', email: 'البريد الإلكتروني', phone: 'الهاتف (واتساب)', level: 'مستواك', notes: 'ملاحظة؟ (حساسية، لغة، إقامة…)', next: 'متابعة', back: 'رجوع',
      step3: 'الأداء', payDeposit: (p) => `أدِّ العربون الآن (${p}%)`, payFull: 'أدِّ المبلغ كاملًا الآن', payLater: 'احجز وأدِّ لاحقًا (تحويل أو في عين المكان)', total: 'المجموع', dueNow: 'للأداء الآن', confirm: 'تأكيد الحجز',
      voucher: 'رمز بطاقة الهدية', apply: 'تطبيق', voucherOk: (a) => `طُبّقت بطاقة الهدية: ${a}`, voucherBad: 'رمز غير صالح أو مستعمل.', fromVoucher: 'مؤدّى ببطاقة هدية',
      card: 'بطاقة بنكية (تجريبي، لا أداء حقيقي)', doneTitle: 'تم الحجز!', doneWait: 'أنت في لائحة الانتظار', doneText: 'رقم حجزك', doneHint: 'احتفظ به: مع هاتفك يفتح فضاء المشارك.',
      waConfirm: 'تلقَّ التأكيد عبر واتساب', ics: 'أضف إلى التقويم', openSpace: 'افتح فضائي', waitText: 'الدورة مكتملة. سنكتب لك فور توفر مقعد، دون أي التزام.',
      spaceTitle: 'فضاء المشارك', ref: 'رقم الحجز (مثال AS-1234)', open: 'فتح', notFound: 'لا يوجد حجز بهذا الرقم وهذا الهاتف.',
      paid: 'المؤدّى', balance: 'الباقي', payBalance: 'أدِّ الباقي', practical: 'معلومات عملية', practicalText: (s) => `الموعد في ${s.venue}، ${s.city}، على الساعة 9:30 في اليوم الأول. البس لباسًا لا تخشى عليه من الطين.`,
      messages: 'الرسائل مع الورشة', write: 'اكتب رسالة…', sendMsg: 'إرسال', cert: 'حمّل شهادتي', status: { pending: 'في انتظار الأداء', confirmed: 'مؤكَّد', paid: 'مؤدّى بالكامل', waitlist: 'لائحة الانتظار', cancelled: 'ملغى' },
      leaveReview: 'اترك رأيك', reviewText: 'تجربتك في بضع كلمات', reviewSend: 'انشر رأيي', reviewOk: 'شكرًا! سيُنشر رأيك بعد المراجعة.', reviewLater: 'يمكنك ترك رأيك بعد الدورة.',
    },
  };
  const t = () => T[lang];
  const fname = (f) => f[lang].name;
  const loc = () => LOCALE[lang];
  const dateLong = (d) => new Date(`${d}T12:00`).toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric' });
  const range = (s) => { const e = S.endOf(s); return s.start === e ? dateLong(s.start) : `${new Date(`${s.start}T12:00`).toLocaleDateString(loc(), { day: 'numeric', month: 'short' })} → ${dateLong(e)}`; };
  const wa = (text, to = C.brand.whatsapp) => `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
  const toast = (msg) => { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600); };
  const upcoming = () => S.db.sessions.filter((s) => s.start >= S.today() && s.status === 'open');
  const consentBox = (news = false) => `<label class="consent"><input type="checkbox" name="consent" required> <span>${t().consent} (<a href="#" data-legal="privacy">${t().readPrivacy}</a>)</span></label>${news ? `<label class="consent"><input type="checkbox" name="news"> <span>${t().consentNews}</span></label>` : ''}`;
  const pieceArt = (p, size) => (p.img ? `<img src="/demos/ceramics/img/${p.img}.webp" alt="${esc(p[lang])}" width="600" height="600" loading="lazy">` : p.art[0] === 'vase' ? Art.vase(p.art[1], size * 0.7) : Art.plate(p.art[1], size));

  function header() {
    $('#top').innerHTML = `<div class="wrap">
      <a class="logo" href="#"><span class="mark">${Art.plate(3, 38)}</span><span><b>${esc(C.brand.name)}</b><small>${esc(C.brand.tagline[lang])}</small></span></a>
      <nav class="nav">${['#ateliers', '#formations', '#cadeau', '#boutique', '#etranger', '#contact'].map((h, i) => `<a href="${h}">${t().nav[i]}</a>`).join('')}</nav>
      <div class="right"><div class="langs">${['fr', 'en', 'ar'].map((l) => `<button class="lang ${l === lang ? 'on' : ''}" data-lang="${l}">${l === 'ar' ? 'ع' : l.toUpperCase()}</button>`).join('')}</div>
        <button class="btn btn-ghost btn-sm" id="spaceBtn">${t().space}</button><a class="btn btn-primary btn-sm" href="#ateliers">${t().book}</a></div></div>`;
    document.querySelectorAll('[data-lang]').forEach((b) => { b.onclick = () => { lang = b.dataset.lang; try { localStorage.setItem('as_lang', lang); } catch { /* ignore */ } applyLang(); render(); }; });
    $('#spaceBtn').onclick = () => openSpace();
  }
  function applyLang() { document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; }

  function sessionCard(s) {
    const f = S.format(s.format); const left = S.seatsLeft(s); const { amount, currency } = S.priceOf(s);
    const d = new Date(`${s.start}T12:00`);
    return `<article class="session reveal">
      <div class="date"><b>${d.getDate()}</b><span>${d.toLocaleDateString(loc(), { month: 'short' })}</span></div>
      <div><h3><a href="#" data-detail="${s.id}" class="title-link">${esc(fname(f))}</a></h3><div class="where">${FLAG[s.country] || ''} ${esc(s.city)} · ${esc(s.venue)} · ${range(s)}</div>
        <div class="tags"><span class="chip">${t().days(f.days)}</span><span class="chip">${t().levels[f.level]}</span><span class="chip">${t().lang} : ${esc(s.lang)}</span><button class="chip" data-detail="${s.id}">${t().details} →</button></div>
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
    const reviews = S.db.reviews.filter((r) => r.status === 'approved');
    const cartItems = Object.entries(cart).filter(([, q]) => q > 0);
    $('#app').innerHTML = `
    <section class="hero"><div class="wrap">
      <div><p class="eyebrow reveal">${esc(C.brand.tagline[lang])} · ${esc(C.brand.city)}</p><h1 class="serif reveal">${L.heroTitle}</h1><p class="lead reveal">${L.heroLead}</p>
        <div class="cta reveal"><a class="btn btn-primary" href="#ateliers">${L.seeDates}</a><a class="btn btn-ghost" href="#cadeau">${L.nav[2]}</a></div>
        <div class="stats reveal">${L.stats.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div></div>
      <div class="hero-art photo"><img class="hero-img" src="/demos/ceramics/img/safi.webp" srcset="/demos/ceramics/img/safi-sm.webp 800w, /demos/ceramics/img/safi.webp 1600w" sizes="(max-width: 860px) 100vw, 560px" alt="${esc(C.brand.name)}" width="1600" height="900" fetchpriority="high"><img class="inset" src="/demos/ceramics/img/painting-sm.webp" alt="" width="800" height="450">
        ${next ? `<div class="badge"><span class="muted">${L.badge}</span><b>${esc(fname(S.format(next.format)))}</b>${dateLong(next.start)} · ${esc(next.city)}</div>` : ''}</div></div></section>
    <div class="strip"><div class="row">${[...L.strip, ...L.strip, ...L.strip].map((x) => `<span>${x}</span>`).join('')}</div></div>

    <section class="block" id="ateliers"><div class="wrap">
      <div class="head"><div><p class="eyebrow">${L.sessionsEyebrow}</p><h2 class="serif">${L.sessionsTitle}</h2></div><p class="muted">${L.sessionsLead}</p></div>
      <div class="filters">${[['all', L.fAll], ['ma', L.fMa], ['abroad', L.fAbroad]].map(([k, l]) => `<button class="chip ${filter.where === k ? 'on' : ''}" data-where="${k}">${l}</button>`).join('')}
        <span style="width:12px"></span>${[['all', L.fAll], ...C.formats.map((f) => [f.id, fname(f)])].map(([k, l]) => `<button class="chip ${filter.format === k ? 'on' : ''}" data-format="${k}">${esc(l)}</button>`).join('')}</div>
      <div class="sessions">${list.map(sessionCard).join('') || '<p class="muted">—</p>'}</div></div></section>

    <section class="block" id="formations" style="padding-top:0"><div class="wrap">
      <div class="head"><div><p class="eyebrow">${L.formatsEyebrow}</p><h2 class="serif">${L.formatsTitle}</h2></div><p class="muted">${L.formatsLead}</p></div>
      <div class="formats">${C.formats.map((f, i) => `<article class="format reveal"><div class="art">${Art.plate(i + 2, 74)}</div><h3>${esc(fname(f))}</h3>
        <div class="meta">${L.days(f.days)} · ${esc(f.hours)} · ${L.levels[f.level]}</div><p class="muted" style="margin:0">${esc(f[lang].desc)}</p>
        <ol class="prog">${f[lang].programme.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
        <div class="price">${L.from} ${S.fmt(f.priceMAD, 'MAD')} · ${S.fmt(f.priceEUR, 'EUR')}</div>
        <button class="btn btn-ghost btn-sm" data-format-go="${f.id}">${L.seeDates}</button></article>`).join('')}</div></div></section>

    <section class="block artisan" id="artisan"><div class="wrap">
      <div class="photo-slot has-img reveal"><img src="/demos/ceramics/img/artisan.webp" srcset="/demos/ceramics/img/artisan-sm.webp 800w, /demos/ceramics/img/artisan.webp 1600w" sizes="(max-width: 860px) 100vw, 480px" alt="${esc(C.brand.artisan)}" width="1600" height="900" loading="lazy"></div>
      <div class="reveal"><p class="eyebrow">${L.artisanEyebrow}</p><p class="quote">${L.artisanQuote}</p><p class="muted" style="font-size:17px">${L.artisanText}</p>
        <p style="font-weight:600;margin:28px 0 0">${L.included}</p><ul class="checks">${C.included[lang].map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div></section>

    <section class="block" id="cadeau"><div class="wrap gift">
      <div class="reveal"><p class="eyebrow">${L.giftEyebrow}</p><h2 class="serif" style="font-size:clamp(36px,5vw,60px);line-height:1;margin:12px 0 0">${L.giftTitle}</h2><p class="muted" style="font-size:17px">${L.giftLead}</p>
        <div class="gift-card"><div style="width:90px">${Art.plate(4, 90)}</div><div><b>${esc(C.brand.name)}</b><span>CADEAU-XXXX</span></div></div></div>
      <form class="panel form reveal" id="giftForm"><p class="lbl">${L.giftAmount}</p><div class="amounts">${C.voucherAmounts.map((a, i) => `<label class="amt"><input type="radio" name="amount" value="${a}" ${i === 1 ? 'checked' : ''}><span>${S.fmt(a, 'MAD')}</span></label>`).join('')}</div>
        <div class="two"><input class="field" name="buyer" required placeholder="${L.giftFrom}"><input class="field" name="to" required placeholder="${L.giftTo}"></div>
        <input class="field" name="contact" required placeholder="${L.contact}"><textarea class="field" name="message" rows="2" placeholder="${L.giftMsg}"></textarea>${consentBox()}<button class="btn btn-primary">${L.giftBuy}</button></form></div></section>

    <section class="block" id="groupes" style="padding-top:0"><div class="wrap">
      <div class="head"><div><p class="eyebrow">${L.groupsEyebrow}</p><h2 class="serif">${L.groupsTitle}</h2></div><p class="muted">${L.groupsLead}</p></div>
      <form class="panel form reveal" id="groupForm"><div class="two"><select class="field" name="kind">${Object.entries(L.kinds).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select><input class="field" name="org" required placeholder="${L.org}"></div>
        <div class="two"><input class="field" name="people" type="number" min="4" required placeholder="${L.people}"><input class="field" name="city" placeholder="${L.city}"></div>
        <div class="two"><input class="field" name="date" type="date" aria-label="${L.date}"><input class="field" name="budget" placeholder="${L.budget}"></div>
        <input class="field" name="contact" required placeholder="${L.contact}"><textarea class="field" name="note" rows="2" placeholder="${L.message}"></textarea>${consentBox()}<button class="btn btn-primary">${L.send}</button></form></div></section>

    <section class="block" id="boutique" style="padding-top:0"><div class="wrap">
      <div class="head"><div><p class="eyebrow">${L.shopEyebrow}</p><h2 class="serif">${L.shopTitle}</h2></div><p class="muted">${L.shopLead}</p></div>
      <div class="shop">${C.pieces.map((p) => `<article class="piece reveal"><div class="pic">${pieceArt(p, 170)}</div><b>${esc(p[lang])}</b><span class="muted" style="font-size:13px">${L.stock(p.stock)}</span>
        <div class="row-flex" style="justify-content:space-between"><b>${S.fmt(p.priceMAD, 'MAD')}</b><button class="btn ${cart[p.id] ? 'btn-primary' : 'btn-ghost'} btn-sm" data-add="${p.id}">${cart[p.id] ? `${L.add} · ${cart[p.id]}` : L.add}</button></div></article>`).join('')}</div>
      ${cartItems.length ? `<div class="panel cartbar"><b>${L.inCart} : ${cartItems.reduce((n, [, q]) => n + q, 0)}</b><span>${S.fmt(cartItems.reduce((n, [id, q]) => n + C.pieces.find((p) => p.id === id).priceMAD * q, 0), 'MAD')}</span><button class="btn btn-primary btn-sm" id="orderBtn">${L.order}</button></div>` : ''}</div></section>

    <section class="block abroad" id="etranger" style="padding-top:0"><div class="wrap">
      <div class="head"><div><p class="eyebrow">${L.abroadEyebrow}</p><h2 class="serif">${L.abroadTitle}</h2></div><p class="muted">${L.abroadLead}</p></div>
      <div class="grid">
        <div class="panel reveal"><h3>${L.interestTitle}</h3><p class="muted">${L.interestText}</p>
          <form class="form" id="interestForm"><div class="two"><input class="field" name="city" required placeholder="${L.city}"><input class="field" name="country" required placeholder="${L.country}"></div>
          <input class="field" name="name" placeholder="${L.name}"><input class="field" name="contact" required placeholder="${L.contact}">${consentBox()}<button class="btn btn-primary">${L.notify}</button></form></div>
        <div class="panel reveal"><h3>${L.hostTitle}</h3><p class="muted">${L.hostText}</p>
          <form class="form" id="hostForm"><input class="field" name="org" required placeholder="${L.org}"><div class="two"><input class="field" name="city" required placeholder="${L.city}"><input class="field" name="country" required placeholder="${L.country}"></div>
          <div class="two"><input class="field" name="people" type="number" min="1" placeholder="${L.people}"><input class="field" name="period" placeholder="${L.period}"></div>
          <input class="field" name="contact" required placeholder="${L.contact}"><textarea class="field" name="note" rows="2" placeholder="${L.message}"></textarea>${consentBox()}<button class="btn btn-primary">${L.send}</button></form></div>
      </div></div></section>

    <section class="block artisan" id="avis"><div class="wrap" style="display:block">
      <div class="head"><div><p class="eyebrow">${L.reviewsEyebrow}</p><h2 class="serif">${L.reviewsTitle}</h2></div></div>
      ${reviews.length ? `<div class="reviews">${reviews.map((r) => `<figure class="panel"><div class="stars">${'★'.repeat(r.rating)}</div><blockquote>${esc(r.text)}</blockquote><figcaption class="muted">${esc(r.name)}</figcaption></figure>`).join('')}</div>` : `<p class="muted">${L.reviewsEmpty}</p>`}</div></section>

    <section class="block"><div class="wrap">
      <div class="head"><div><p class="eyebrow">${L.galleryEyebrow}</p><h2 class="serif">${L.galleryTitle}</h2></div><p class="muted">${L.galleryLead}</p></div>
      <div class="gallery">${['painting-sm', 'p-plate-big', 'tajines-sm', 'p-vase', 'pieces-sm', 'p-tajine-blue', 'plates-sm', 'p-bowl'].map((n) => `<div class="tile photo reveal"><img src="/demos/ceramics/img/${n}.webp" alt="" loading="lazy"></div>`).join('')}</div></div></section>

    <section class="block faq" style="padding-top:0"><div class="wrap" style="max-width:820px">
      <h2 class="serif" style="font-size:clamp(34px,5vw,54px);text-align:center;margin:0 0 30px">${L.faqTitle}</h2>
      ${L.faq.map(([q, a], i) => `<details ${i === 0 ? 'open' : ''}><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>

    <section class="block artisan" id="contact"><div class="wrap">
      <div><h2 class="serif" style="font-size:clamp(36px,5vw,58px);line-height:1;margin:0">${L.contactTitle}</h2><p class="muted" style="font-size:17px">${L.contactText}</p>
        <p><a class="btn btn-wa" href="${wa(lang === 'fr' ? 'Bonjour, j’ai une question sur vos ateliers.' : lang === 'ar' ? 'مرحبًا، لدي سؤال عن ورشاتكم.' : 'Hello, I have a question about your workshops.')}" target="_blank" rel="noopener">WhatsApp</a></p></div>
      <form class="panel form" id="contactForm"><div class="two"><input class="field" name="name" required placeholder="${L.name}"><input class="field" name="contact" required placeholder="${L.contact}"></div>
        <textarea class="field" name="text" rows="4" required placeholder="${L.yourMsg}"></textarea>${consentBox(true)}<button class="btn btn-primary">${L.sendMsg}</button></form></div></section>`;

    $('#footer').innerHTML = `<div class="wrap"><div><b>${esc(C.brand.name)}</b><p>${L.footerText}</p><p class="demo-note">${L.demo}</p></div>
      <div style="display:grid;gap:6px"><a href="${wa('Bonjour')}" target="_blank" rel="noopener">WhatsApp</a><a href="mailto:${esc(C.brand.email)}">${esc(C.brand.email)}</a><span>Instagram @${esc(C.brand.instagram)}</span><a href="/demo/ceramics/admin">${L.atelierSpace}</a></div>
      <div style="display:grid;gap:6px">${['terms', 'privacy', 'legal'].map((k, i) => `<a href="#" data-legal="${k}">${L.legal[i]}</a>`).join('')}</div></div>`;
    $('#mbarBtn').textContent = L.seeDates; $('#mbarBtn').onclick = () => $('#ateliers').scrollIntoView({ behavior: 'smooth' });
    bindPage();
    reveal();
  }

  function bindPage() {
    const L = t();
    document.querySelectorAll('[data-where]').forEach((b) => { b.onclick = () => { filter.where = b.dataset.where; render(); $('#ateliers').scrollIntoView(); }; });
    document.querySelectorAll('[data-format]').forEach((b) => { b.onclick = () => { filter.format = b.dataset.format; render(); $('#ateliers').scrollIntoView(); }; });
    document.querySelectorAll('[data-format-go]').forEach((b) => { b.onclick = () => { filter = { where: 'all', format: b.dataset.formatGo }; render(); $('#ateliers').scrollIntoView({ behavior: 'smooth' }); }; });
    document.querySelectorAll('[data-book]').forEach((b) => { b.onclick = () => openBooking(b.dataset.book); });
    document.querySelectorAll('[data-detail]').forEach((b) => { b.onclick = (e) => { e.preventDefault(); openDetail(b.dataset.detail); }; });
    document.querySelectorAll('[data-legal]').forEach((a) => { a.onclick = (e) => { e.preventDefault(); openLegal(a.dataset.legal); }; });
    document.querySelectorAll('[data-add]').forEach((b) => { b.onclick = () => { const p = C.pieces.find((x) => x.id === b.dataset.add); cart[p.id] = Math.min(p.stock, (cart[p.id] || 0) + 1); render(); $('#boutique').scrollIntoView(); }; });
    if ($('#orderBtn')) $('#orderBtn').onclick = openOrder;
    $('#interestForm').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); S.interest(d); e.target.outerHTML = `<p class="ok">${esc(L.interestOk(d.city))}</p>`; };
    $('#hostForm').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); S.host({ ...d, people: Number(d.people) || null }); e.target.outerHTML = `<p class="ok">${L.hostOk}</p>`; };
    $('#groupForm').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); S.group({ ...d, people: Number(d.people) || null }); e.target.outerHTML = `<p class="ok">${L.groupOk}</p>`; };
    $('#contactForm').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); S.message({ from: 'client', name: d.name, contact: d.contact, text: d.text }); if (d.news) S.interest({ city: '—', country: '', contact: d.contact, name: d.name }); e.target.innerHTML = `<p class="ok">${L.msgOk}</p>`; };
    $('#giftForm').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); const v = S.buyVoucher({ ...d, amount: Number(d.amount) }); showVoucher(v); };
  }

  function reveal() {
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.1 }) : null;
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));
  }

  // ---------- Modal helpers ----------
  const modal = $('#modal');
  const openSheet = (html) => { $('#sheet').innerHTML = `<button class="x" aria-label="close">×</button>${html}`; modal.classList.add('open'); $('#sheet .x').onclick = close; $('#sheet').querySelectorAll('[data-legal]').forEach((a) => { a.onclick = (e) => { e.preventDefault(); openLegal(a.dataset.legal, true); }; }); };
  const close = () => { modal.classList.remove('open'); render(); };
  modal.onclick = (e) => { if (e.target === modal) close(); };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

  function openLegal(k, inline = false) {
    const L = t(); const title = L.legal[['terms', 'privacy', 'legal'].indexOf(k)];
    const html = `<h2 class="serif" style="font-size:30px;margin:0 0 12px">${title}</h2><p>${esc(C.legal[k][lang])}</p><p class="muted" style="font-size:12px">${L.draft}</p>`;
    if (inline) { const box = document.createElement('div'); box.className = 'legal-pop'; box.innerHTML = `${html}<button class="btn btn-ghost btn-sm">OK</button>`; $('#sheet').appendChild(box); box.querySelector('button').onclick = () => box.remove(); box.scrollIntoView({ behavior: 'smooth' }); return; }
    openSheet(html);
  }

  function openDetail(id) {
    const s = S.session(id); const f = S.format(s.format); const L = t(); const left = S.seatsLeft(s); const { amount, currency } = S.priceOf(s);
    openSheet(`<p class="eyebrow">${esc(fname(f))}</p><h2 class="serif" style="font-size:34px;margin:6px 0 4px">${FLAG[s.country] || ''} ${esc(s.city)}</h2><p class="muted" style="margin:0">${esc(f[lang].desc)}</p>
      <div class="summary" style="margin-top:16px"><div><span>${L.when}</span><b>${range(s)}</b></div><div><span>${L.where}</span><b>${esc(s.venue)}</b></div><div><span>${L.lang}</span><b>${esc(s.lang)}</b></div>
      <div><span>${L.levels[f.level]}</span><b>${L.days(f.days)} · ${esc(f.hours)}</b></div><div><span>${L.total}</span><b>${S.fmt(amount, currency)} ${L.perPerson}</b></div></div>
      <h3 style="margin:20px 0 6px">${L.programme}</h3><ol class="prog">${f[lang].programme.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
      <h3 style="margin:16px 0 6px">${L.included}</h3><ul class="checks">${C.included[lang].map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="muted" style="font-size:13px;margin-top:16px">${L.policy} : <a href="#" data-legal="terms">${L.legal[0]}</a></p>
      <button class="btn btn-primary" id="dBook" style="width:100%;margin-top:10px">${left ? L.book : L.waitlist} · ${L.seatsLeft(left)}</button>`);
    $('#dBook').onclick = () => openBooking(id);
  }

  // ---------- Booking ----------
  function openBooking(id) {
    const s = S.session(id); const f = S.format(s.format); const L = t();
    const st = { seats: 1, name: '', email: '', phone: '', country: '', level: f.level === 'all' ? 'beginner' : f.level, notes: '', pay: 'deposit', voucher: '' };
    const full = () => S.seatsLeft(s) < st.seats;
    const head = (n) => `<p class="eyebrow">${esc(fname(f))}</p><h2 class="serif" style="font-size:32px;margin:6px 0 2px">${FLAG[s.country] || ''} ${esc(s.city)}</h2><p class="muted" style="margin:0">${range(s)} · ${esc(s.venue)}</p><div class="steps">${[1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</div>`;
    const { amount, currency } = S.priceOf(s);
    const step1 = () => {
      openSheet(`${head(1)}<h3>${L.step1}</h3><ol class="prog">${f[lang].programme.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
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
        <textarea class="field" name="notes" rows="2" placeholder="${L.notes}">${esc(st.notes)}</textarea>${consentBox(true)}
        <p class="muted" style="font-size:12px;margin:0">${L.policy} : <a href="#" data-legal="terms">${L.legal[0]}</a></p>
        <div class="row-flex" style="margin-top:6px"><button type="button" class="btn btn-ghost" id="b1">${L.back}</button><button class="btn btn-primary" style="flex:1">${L.next}</button></div></form>`);
      $('#b1').onclick = step1;
      $('#f2').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); st.news = !!d.news; delete d.consent; delete d.news; Object.assign(st, d); full() ? finish() : step3(); };
    };
    const step3 = () => {
      const total = amount * st.seats;
      openSheet(`${head(3)}<h3>${L.step3}</h3>
        <div class="row-flex" style="flex-wrap:nowrap;margin-bottom:12px"><input class="field" id="vcode" placeholder="${L.voucher}" value="${esc(st.voucher)}"><button class="btn btn-ghost btn-sm" id="vapply">${L.apply}</button></div><p class="muted" id="vmsg" style="font-size:13px;margin:-4px 0 12px"></p>
        <div class="pay"><label><input type="radio" name="pay" value="deposit" ${st.pay === 'deposit' ? 'checked' : ''}> <span><b>${L.payDeposit(C.depositPct)}</b><br><span class="muted" id="depAmt"></span></span></label>
        <label><input type="radio" name="pay" value="full" ${st.pay === 'full' ? 'checked' : ''}> <span><b>${L.payFull}</b><br><span class="muted" id="fullAmt"></span></span></label>
        <label><input type="radio" name="pay" value="later" ${st.pay === 'later' ? 'checked' : ''}> <span><b>${L.payLater}</b></span></label></div>
        <div id="cardBox" style="margin-top:12px"><p class="muted" style="font-size:13px">${L.card}</p><div class="two form" style="margin-top:0"><input class="field" value="4242 4242 4242 4242" aria-label="card"><input class="field" value="12/29 · 123" aria-label="expiry"></div></div>
        <div class="summary" style="margin-top:16px"><div><span>${L.total}</span><b>${S.fmt(total, currency)}</b></div><div id="vline" style="display:none"><span>${L.fromVoucher}</span><b id="vamt"></b></div><div><span>${L.dueNow}</span><b id="due"></b></div></div>
        <div class="row-flex" style="margin-top:18px"><button class="btn btn-ghost" id="b2">${L.back}</button><button class="btn btn-primary" id="ok" style="flex:1">${L.confirm}</button></div>`);
      const voucherValue = () => { const v = st.voucher && S.voucher(st.voucher); return v ? Math.min(total, v.balance / (currency === 'EUR' ? C.eurToMad : 1)) : 0; };
      const upd = () => {
        st.pay = document.querySelector('input[name=pay]:checked').value;
        const fromV = voucherValue(); const rest = total - fromV; const dep = Math.round((rest * C.depositPct) / 100);
        $('#depAmt').textContent = S.fmt(dep, currency); $('#fullAmt').textContent = S.fmt(rest, currency);
        $('#vline').style.display = fromV ? '' : 'none'; $('#vamt').textContent = `− ${S.fmt(fromV, currency)}`;
        $('#due').textContent = S.fmt(st.pay === 'deposit' ? dep : st.pay === 'full' ? rest : 0, currency); $('#cardBox').style.display = st.pay === 'later' || (st.pay === 'full' && rest <= 0) ? 'none' : '';
      };
      document.querySelectorAll('input[name=pay]').forEach((r) => { r.onchange = upd; }); upd();
      $('#vapply').onclick = () => { st.voucher = $('#vcode').value.trim(); const v = S.voucher(st.voucher); $('#vmsg').textContent = v ? L.voucherOk(S.fmt(v.balance, 'MAD')) : L.voucherBad; if (!v) st.voucher = ''; upd(); };
      $('#b2').onclick = step2; $('#ok').onclick = finish;
    };
    const finish = () => {
      const b = S.book({ sessionId: s.id, seats: Number(st.seats), name: st.name, email: st.email, phone: st.phone, country: st.country, level: st.level, notes: st.notes, pay: st.pay, voucher: st.voucher });
      if (st.news) S.interest({ city: s.city, country: s.country, contact: st.phone || st.email, name: st.name });
      const waitlisted = b.status === 'waitlist';
      const txt = lang === 'fr' ? `Bonjour, je confirme ma réservation ${b.ref} : ${fname(f)}, ${s.city}, ${range(s)}, ${b.seats} personne(s).` : lang === 'ar' ? `مرحبًا، أؤكد حجزي ${b.ref}: ${fname(f)}، ${s.city}، ${range(s)}، ${b.seats} شخص.` : `Hello, I confirm my booking ${b.ref}: ${fname(f)}, ${s.city}, ${range(s)}, ${b.seats} person(s).`;
      openSheet(`<div style="text-align:center;padding:10px 0"><div style="width:120px;margin:0 auto">${Art.plate(4, 120)}</div>
        <h2 class="serif" style="font-size:38px;margin:16px 0 4px">${waitlisted ? L.doneWait : L.doneTitle}</h2>
        <p class="muted">${waitlisted ? L.waitText : `${esc(fname(f))} · ${esc(s.city)} · ${range(s)}`}</p>
        <p style="margin:18px 0 4px">${L.doneText}</p><p class="serif" style="font-size:40px;margin:0;color:var(--cobalt)">${b.ref}</p><p class="muted" style="font-size:13px">${L.doneHint}</p>
        <div style="display:grid;gap:8px;margin-top:20px"><a class="btn btn-wa" target="_blank" rel="noopener" href="${wa(txt)}">${L.waConfirm}</a>
        ${waitlisted ? '' : `<button class="btn btn-ghost" id="ics">${L.ics}</button>`}<button class="btn btn-ghost" id="sp">${L.openSpace}</button></div></div>`);
      if ($('#ics')) $('#ics').onclick = () => ics(s, f);
      $('#sp').onclick = () => showSpace(b);
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

  // ---------- Gift voucher, shop ----------
  function showVoucher(v) {
    const L = t();
    const txt = lang === 'ar' ? `${v.to}، هذه بطاقة هدية ${S.fmt(v.amount, 'MAD')} لورشة في ${C.brand.name}. الرمز: ${v.code}` : lang === 'en' ? `${v.to}, here is a ${S.fmt(v.amount, 'MAD')} gift voucher for a workshop at ${C.brand.name}. Code: ${v.code}` : `${v.to}, voici un bon cadeau de ${S.fmt(v.amount, 'MAD')} pour un atelier chez ${C.brand.name}. Code : ${v.code}`;
    openSheet(`<p class="eyebrow">${L.giftDone}</p><div class="voucher" id="vprint"><div style="width:110px">${Art.plate(4, 110)}</div><div><span class="muted">${esc(C.brand.name)}</span><h2 class="serif" style="font-size:38px;margin:4px 0">${S.fmt(v.amount, 'MAD')}</h2>
      <p style="margin:0">${L.giftTo} <b>${esc(v.to)}</b> · ${L.giftFrom} <b>${esc(v.buyer)}</b></p>${v.message ? `<p class="muted" style="margin:6px 0 0">« ${esc(v.message)} »</p>` : ''}<p style="margin:12px 0 0">${L.giftCode} : <b style="color:var(--cobalt);font-size:20px">${v.code}</b></p></div></div>
      <div style="display:grid;gap:8px;margin-top:16px"><a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(txt)}">${L.giftSend}</a><button class="btn btn-ghost" id="vp">${L.giftPrint}</button></div>`);
    $('#vp').onclick = () => { const w = window.open('', '_blank'); if (!w) return; w.document.write(`<!doctype html><title>${esc(v.code)}</title><body style="font-family:Georgia,serif;padding:40px">${$('#vprint').outerHTML}<script>print()<\/script>`); };
  }

  function openOrder() {
    const L = t(); const items = Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, qty }));
    const sub = items.reduce((n, it) => n + C.pieces.find((p) => p.id === it.id).priceMAD * it.qty, 0);
    openSheet(`<p class="eyebrow">${L.shopEyebrow}</p><h2 class="serif" style="font-size:32px;margin:6px 0 12px">${L.order}</h2>
      <div class="summary">${items.map((it) => { const p = C.pieces.find((x) => x.id === it.id); return `<div><span>${esc(p[lang])} × ${it.qty}</span><b>${S.fmt(p.priceMAD * it.qty, 'MAD')}</b></div>`; }).join('')}<div><span>${L.shipping}</span><b id="ship"></b></div><div><span>${L.total}</span><b id="otot"></b></div></div>
      <form class="form" id="of"><select class="field" name="delivery">${Object.entries(L.deliv).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
        <div class="two"><input class="field" name="name" required placeholder="${L.name}"><input class="field" name="contact" required placeholder="${L.contact}"></div><input class="field" name="address" required placeholder="${L.address}">${consentBox()}<button class="btn btn-primary">${L.order}</button></form>`);
    const upd = () => { const sh = C.shippingMAD[$('#of [name=delivery]').value]; $('#ship').textContent = S.fmt(sh, 'MAD'); $('#otot').textContent = S.fmt(sub + sh, 'MAD'); };
    $('#of [name=delivery]').onchange = upd; upd();
    $('#of').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); const o = S.order({ items, ...d }); Object.keys(cart).forEach((k) => delete cart[k]); $('#of').outerHTML = `<p class="ok">${esc(L.orderOk(o.ref))}</p>`; };
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
    const started = s.start <= S.today();
    const reviewed = S.db.reviews.some((r) => r.bookingRef === b.ref);
    openSheet(`<p class="eyebrow">${L.spaceTitle} · ${esc(b.ref)}</p><h2 class="serif" style="font-size:30px;margin:6px 0 2px">${esc(fname(f))}</h2>
      <p class="muted" style="margin:0">${FLAG[s.country] || ''} ${esc(s.city)} · ${range(s)} · ${b.seats}</p>
      <p style="margin:12px 0"><span class="st ${st}">${L.status[st] || st}</span></p>
      ${b.status === 'waitlist' ? `<p class="muted">${L.waitText}</p>` : `<div class="summary"><div><span>${L.total}</span><b>${S.fmt(b.total, b.currency)}</b></div><div><span>${L.paid}</span><b>${S.fmt(b.paid, b.currency)}</b></div><div><span>${L.balance}</span><b>${S.fmt(Math.max(0, bal), b.currency)}</b></div></div>
      ${bal > 0 ? `<button class="btn btn-primary" id="payBal" style="width:100%;margin-top:10px">${L.payBalance} · ${S.fmt(bal, b.currency)}</button>` : ''}`}
      <h3 style="margin:22px 0 6px">${L.practical}</h3><p class="muted" style="margin:0">${esc(L.practicalText(s))}</p>
      <h3 style="margin:22px 0 6px">${L.programme}</h3><ol class="prog">${f[lang].programme.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
      ${f.id === 'pro' && b.attended ? `<button class="btn btn-ghost" id="cert" style="margin-top:12px">${L.cert}</button>` : ''}
      <h3 style="margin:22px 0 8px">${L.leaveReview}</h3>${reviewed ? `<p class="ok">${L.reviewOk}</p>` : started && b.status !== 'waitlist' ? `<form class="form" id="rf"><div class="rating">${[5, 4, 3, 2, 1].map((n) => `<input type="radio" name="rating" value="${n}" id="r${n}" ${n === 5 ? 'checked' : ''}><label for="r${n}">★</label>`).join('')}</div><textarea class="field" name="text" rows="3" required placeholder="${L.reviewText}"></textarea><button class="btn btn-primary">${L.reviewSend}</button></form>` : `<p class="muted">${L.reviewLater}</p>`}
      <h3 style="margin:22px 0 8px">${L.messages}</h3><div class="thread">${thread.map((m) => `<div class="bubble ${m.from === 'client' ? 'me' : ''}">${esc(m.text)}<small>${new Date(m.at).toLocaleString(loc(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></div>`).join('')}</div>
      <form class="row-flex" id="msgF" style="margin-top:10px;flex-wrap:nowrap"><input class="field" name="t" required placeholder="${L.write}"><button class="btn btn-primary">${L.sendMsg}</button></form>`);
    if ($('#payBal')) $('#payBal').onclick = () => { S.pay(b.ref, bal); toast('✓'); showSpace(b); };
    if ($('#cert')) $('#cert').onclick = () => cert(b, s, f);
    if ($('#rf')) $('#rf').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); S.review({ bookingRef: b.ref, name: b.name.split(' ')[0], rating: Number(d.rating), text: d.text }); showSpace(b); };
    $('#msgF').onsubmit = (e) => { e.preventDefault(); S.message({ from: 'client', name: b.name, contact: b.phone, ref: b.ref, text: new FormData(e.target).get('t') }); showSpace(b); };
  }

  function cert(b, s, f) {
    const w = window.open('', '_blank'); if (!w) return;
    w.document.write(`<!doctype html><title>Certificat</title><body style="font-family:Georgia,serif;text-align:center;padding:60px;border:14px double #1f4e8c;margin:20px">
      <p style="letter-spacing:.3em;color:#b4532f">CERTIFICAT DE FORMATION</p><h1 style="font-size:46px;margin:10px 0">${esc(b.name)}</h1>
      <p>a suivi avec succès la <b>${esc(f.fr.name)}</b> en céramique d’art de Safi</p><p>${esc(s.city)} · ${range(s)}</p><p style="margin-top:60px">${esc(C.brand.artisan)} — ${esc(C.brand.name)}</p><script>print()<\/script>`);
  }

  // On/off and expiry are managed from the MBN DEV dashboard (Demo sites).
  fetch('https://mbndev.ma/api/demos/ceramics/config', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((c) => {
    if (c && c.live === false) document.body.innerHTML = '<main style="min-height:100dvh;display:grid;place-items:center;padding:24px;text-align:center;font-family:Inter,system-ui,sans-serif;background:#1c1a17;color:#fff"><div><h1 style="margin:0 0 8px">Cette démo n’est pas disponible pour le moment</h1><p style="color:#cfc6b8;margin:0">Contactez MBN DEV pour obtenir un nouvel accès.</p></div></main>';
  }).catch(() => {});

  S.on(() => { if (!modal.classList.contains('open')) render(); });
  window.addEventListener('scroll', () => $('#top').classList.toggle('solid', window.scrollY > 10), { passive: true });
  applyLang();
  render();
})();
