# Déploiement Bestcrea (Hostinger Node.js / Passenger)

## Prérequis
- Node.js 18+ (20 LTS recommandé)
- PostgreSQL accessible (`DATABASE_URL`)
- Compte Hostinger avec application Node.js / Passenger

## Variables d'environnement (panel Hostinger)

```bash
NODE_ENV=production
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?schema=public
NEXTAUTH_URL=https://votredomaine.com
NEXTAUTH_SECRET=générer-une-chaine-longue-aléatoire
OPENAI_API_KEY=sk-...
# optionnel
GEMINI_API_KEY=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=contact@bestcrea.com
CONTACT_NOTIFY_EMAIL=contact@bestcrea.com
NEXT_PUBLIC_SITE_URL=https://votredomaine.com
```

Ne committez jamais `.env` (déjà dans `.gitignore`).

## Build & démarrage

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run seed   # optionnel (données démo)
npm run build
NODE_ENV=production node server.js
```

Scripts npm :
- `npm run build` — build Next.js
- `npm start` — lance `node server.js` (Passenger-compatible)
- `npm run dev` — développement local

## Hostinger / Passenger
1. Uploadez le code (sans `node_modules`, sans `.env` local).
2. Application startup file : `server.js`
3. Document root : racine du projet (là où se trouve `server.js` et `.next`).
4. Installez les deps et buildez via SSH ou pipeline :
   `npm ci && npx prisma generate && npm run build`
5. Pointez le domaine vers l’app Node, ajoutez les variables d’env, redémarrez Passenger.

## SEO
- `https://votredomaine.com/sitemap.xml`
- `https://votredomaine.com/robots.txt`
- Métas globales : Admin → Paramètres → SEO (`site.settings`)
- Métas pages : Admin → Contenu (`PageContent.seoDescription`)

## Vérification locale production

```bash
npm run build
NODE_ENV=production PORT=3000 node server.js
# puis curl http://localhost:3000/fr
```
