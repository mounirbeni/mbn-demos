# MBN DEV — démos commerciales

Sites de démonstration statiques utilisés par MBN DEV pour vendre ses services, séparés de la plateforme `mounirbeni/mbndev` :

| Démo | Site | Tableau de bord |
|---|---|---|
| NOUR Coffee Atelier | `/demo/coffee` | `/demo/coffee/admin` |
| TARZ Barber Club | `/demo/barber` | `/demo/barber/admin` |
| LALLA Beauty House | `/demo/beauty` | `/demo/beauty/admin` |
| Cabinet Alaoui (avocat) | `/demo/law` | `/demo/law/admin` · secrétariat `/demo/law/secretary` |
| ATLAS DRIVE (location de voitures) | `/demo/rent` | `/demo/rent/admin` |

- Fichiers : `public/demos/<slug>/` (HTML/CSS/JS sans build). `public/demos/_shared/wa-chat.js` = bulle WhatsApp commune.
- Les données de démonstration restent dans le navigateur de chaque visiteur (localStorage).
- **Code d’accès, activation, date d’expiration** : toujours gérés depuis la plateforme MBN DEV (`/dashboard/admin/demos`).
  Chaque démo appelle `https://mbndev.ma/api/demos/<slug>/config` et `/unlock` (`js/gate.js`) ; la plateforme autorise cette origine en CORS.
- Déploiement : Vercel (statique, `public/`), réécritures et en-têtes de sécurité dans `vercel.json`.
