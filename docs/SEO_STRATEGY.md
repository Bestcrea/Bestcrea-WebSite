# Stratégie SEO Bestcrea

Objectif : être visible sur les recherches liées à la création de sites web, au SEO, aux applications mobiles et aux SaaS, au Maroc (FR et AR) puis à l'international (EN, ES, DE).

Un classement n'est jamais garanti : Google décide, et les premiers résultats prennent en général 3 à 6 mois. Cette stratégie met en place tout ce que vous contrôlez.

## 1. Ce qui est déjà en place dans le site

- Un titre et une description uniques par page et par langue, ciblés sur les mots-clés ci-dessous (`lib/seo-pages.ts`).
- Balises canoniques et hreflang (fr, en, ar, es, de, x-default) sur chaque page publique.
- Sitemap complet avec les versions linguistiques (`/sitemap.xml`) et `robots.txt` qui bloque l'admin, l'espace client, le checkout et l'API.
- Pages privées (admin, espace client, checkout) en `noindex`.
- Données structurées : Organization, WebSite, ProfessionalService (adresse Khemisset, zone Maroc), offres de la page Tarifs (ItemList + Offer en MAD).
- Format d'image AVIF désactivé (sécurité), WebP conservé.

## 2. Grappes de mots-clés

### Maroc, français (priorité 1)
| Intention | Mots-clés | Page cible |
|---|---|---|
| Transactionnelle | création site web maroc, agence digitale maroc, développement application mobile maroc, devis site web maroc | Accueil, Services, Devis |
| Prix | prix création site web maroc, tarif site web maroc, site web pas cher maroc | Tarifs |
| SEO | seo maroc, référencement naturel maroc, seo local maroc, agence seo maroc | Service SEO local |
| Publicité | google ads maroc, publicité en ligne maroc | Service Google Ads |
| Locale | création site web khemisset, agence web khemisset, agence web casablanca, rabat, marrakech, tanger, fès | Pages locales (voir plan) |
| Techno | développeur laravel maroc, développeur next.js maroc, développeur flutter maroc | Technologie |
| SaaS | développement saas maroc, logiciel sur mesure maroc | Produits SaaS |

### Maroc, arabe (priorité 2)
تصميم مواقع المغرب، وكالة رقمية المغرب، سعر تصميم موقع المغرب، تطوير تطبيقات جوال المغرب، سيو المغرب، إعلانات جوجل المغرب.

### International (priorité 3)
web agency morocco, website design morocco, mobile app development morocco, saas development morocco, nearshore development agency.

## 3. Pages à ajouter (la méthode de Hostinger : une page par intention)

Hostinger se classe parce qu'il a une page très précise pour chaque recherche. À reproduire avec le modèle de page Service existant :

1. Pages services dédiées : création de site vitrine, site e-commerce, application mobile, SaaS sur mesure, SEO local, Google Ads, refonte de site, maintenance.
2. Pages locales (une par ville, contenu réellement adapté) : Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir, Kénitra, Meknès, Khemisset.
3. Pages secteurs : site web pour restaurant, médecin, avocat, école, hôtel, immobilier, boutique en ligne.
4. Pages comparatives et guides : « WordPress ou Laravel », « combien coûte un site web au Maroc », « domaine .ma ou .com ».

Chaque page : un seul H1 avec le mot-clé principal, 600 mots minimum de contenu utile et non copié, 3 à 5 questions fréquentes, un appel à l'action vers `/tarifs` ou `/ressources/devis`, des liens internes vers les pages liées.

## 4. Calendrier de blog (2 articles par mois, en FR puis traduits)

1. Combien coûte un site web au Maroc en 2026 ?
2. Comment choisir son agence web au Maroc : 10 questions à poser
3. SEO local : apparaître sur Google Maps à Khemisset et au Maroc
4. WordPress ou Laravel pour votre site : que choisir ?
5. Comment choisir et acheter un nom de domaine .ma
6. Google Ads au Maroc : budget minimum et résultats attendus
7. Créer une application mobile : étapes, délais et coûts
8. Les erreurs SEO les plus courantes sur les sites marocains
9. Site vitrine ou e-commerce : lequel choisir pour votre activité ?
10. Qu'est-ce que le Core Web Vitals et comment l'améliorer ?

## 5. Hors du site (indispensable)

1. **Google Search Console** : propriété `bestcrea.com` validée, puis envoyer `https://bestcrea.com/sitemap.xml`.
2. **Google Business Profile** : créer la fiche (adresse Khemisset, téléphone, horaires, photos, catégorie « Agence web »), répondre aux avis.
3. **Avis clients** : demander un avis Google après chaque projet livré. C'est le facteur local le plus fort.
4. **Backlinks de qualité** : annuaires marocains sérieux, partenaires, clients (lien dans le pied de page de leur site), articles invités, presse locale.
5. **Réseaux sociaux** : profils cohérents (même nom, même logo, lien vers le site) sur LinkedIn, Facebook, Instagram, YouTube.
6. **Bing Webmaster Tools** : importer la propriété depuis Search Console.

## 6. Technique à surveiller chaque mois

- Core Web Vitals (PageSpeed Insights) sur l'accueil, Tarifs et un article : LCP < 2,5 s, CLS < 0,1.
- Pages indexées et erreurs dans Search Console.
- Liens cassés et pages sans titre ou sans description.
- Mises à jour de sécurité : passer de Next.js 14 à Next.js 15 (voir le rapport de vulnérabilités Hostinger).

## 7. Mesure

Suivre dans Search Console : impressions, clics, position moyenne, par requête et par pays. Objectif réaliste sur 6 mois : apparaître sur les requêtes locales (« création site web khemisset », « seo maroc ») puis monter progressivement sur les requêtes plus concurrentielles (« création site web maroc »).
