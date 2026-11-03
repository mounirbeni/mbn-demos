// Everything a client would change lives here: name, contacts, prices, formats, texts.
// Values marked TODO are examples to confirm with the artisan before going live.
window.ATELIER = {
  brand: {
    name: 'Atelier Safi',                       // TODO: the artisan's own atelier name
    tagline: { fr: 'Céramique d’art de Safi', en: 'Fine ceramics from Safi' },
    artisan: 'Maître céramiste',                // TODO: the artisan's name
    city: 'Safi, Maroc',
    whatsapp: '212601439975',                   // TODO: the artisan's WhatsApp number (MBN DEV's for the demo), digits only
    email: 'contact@atelier-safi.ma',           // TODO
    instagram: 'atelier.safi',                  // TODO
  },
  depositPct: 30,                               // TODO: deposit asked at booking
  eurToMad: 10.8,                               // TODO: rate used to show both currencies
  // Formats offered. Prices are examples (TODO): MAD for sessions in Morocco, EUR abroad.
  formats: [
    { id: 'initiation', days: 1, hours: '3 h', level: 'all', priceMAD: 450, priceEUR: 60,
      fr: { name: 'Initiation au tour', desc: 'Trois heures pour toucher la terre de Safi, centrer, monter et décorer votre première pièce.' },
      en: { name: 'Wheel taster', desc: 'Three hours to feel Safi clay, centre it, throw and decorate your first piece.' } },
    { id: 'decouverte', days: 2, hours: '2 × 6 h', level: 'beginner', priceMAD: 1600, priceEUR: 190,
      fr: { name: 'Stage découverte', desc: 'Tournage, tournassage et décor au pinceau selon les motifs traditionnels de Safi.' },
      en: { name: 'Discovery course', desc: 'Throwing, trimming and brush decoration in the traditional Safi patterns.' } },
    { id: 'intensif', days: 5, hours: '5 × 6 h', level: 'intermediate', priceMAD: 4200, priceEUR: 480,
      fr: { name: 'Stage intensif', desc: 'Cinq jours de la terre au four : tournage, décor, émaillage et cuisson de vos pièces.' },
      en: { name: 'Intensive course', desc: 'Five days from clay to kiln: throwing, decoration, glazing and firing your pieces.' } },
    { id: 'pro', days: 15, hours: '3 semaines', level: 'advanced', priceMAD: 11500, priceEUR: 1250,
      fr: { name: 'Formation professionnelle', desc: 'Trois semaines pour maîtriser le métier : techniques, émaux de Safi, cuisson, et un certificat de fin de formation.' },
      en: { name: 'Professional training', desc: 'Three weeks to master the craft: techniques, Safi glazes, firing, and a certificate of completion.' } },
    { id: 'masterclass', days: 2, hours: '2 × 5 h', level: 'all', priceMAD: 1900, priceEUR: 220,
      fr: { name: 'Masterclass à l’étranger', desc: 'Le savoir-faire de Safi présenté dans votre ville, avec de la terre et des émaux apportés du Maroc.' },
      en: { name: 'Masterclass abroad', desc: 'Safi know-how brought to your city, with clay and glazes from Morocco.' } },
  ],
  included: {
    fr: ['Terre et émaux de Safi', 'Outils et tablier', 'Cuisson de vos pièces', 'Thé à la menthe et pause gourmande', 'Petits groupes (8 max.)'],
    en: ['Safi clay and glazes', 'Tools and apron', 'Firing of your pieces', 'Mint tea and a snack break', 'Small groups (8 max.)'],
  },
};
