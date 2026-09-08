# Carnet

Un carnet de visionnage personnel : films et séries, statut, note, progression épisode par épisode.
Application web installable sur l'écran d'accueil du téléphone (PWA).

## Démarrer

Il faut Node.js 18 ou plus récent (`node -v` pour vérifier, sinon nodejs.org).

```bash
npm install
cp .env.example .env      # puis collez votre clé TMDb dans .env
npm run dev
```

Vite affiche deux adresses : `localhost` pour l'ordinateur, et une adresse en `192.168.x.x`
pour le téléphone. Les deux appareils doivent être sur le même wifi.

## Récupérer une clé TMDb

1. Créez un compte sur themoviedb.org
2. Paramètres → API → demander une clé (usage personnel, gratuit, immédiat)
3. Copiez la clé « API Key (v3 auth) » dans `.env` :

```
VITE_TMDB_KEY=votre_cle_ici
```

## Structure

```
src/
  lib/tmdb.js        appels à l'API TMDb (recherche, fiches, saisons)
  lib/library.js     bibliothèque perso, stockée sur l'appareil
  components/
    Vignette.jsx     une affiche + statut + progression
    Recherche.jsx    écran de recherche
    Bibliotheque.jsx écran « mon carnet » avec filtres
    Fiche.jsx        détail d'une œuvre, saisons et épisodes
  App.jsx            navigation par onglets
public/
  manifest.webmanifest  configuration PWA (nom, icônes, plein écran)
```

## Où sont mes données

Dans le navigateur, sous la clé `carnet.library.v1`. Elles restent sur l'appareil et ne
partent nulle part. Deux conséquences : rien à héberger, mais pas de synchronisation entre
téléphone et ordinateur pour l'instant, et vider les données du navigateur efface le carnet.

`exportJson()` et `importJson()` dans `lib/library.js` permettent déjà de faire une
sauvegarde manuelle — il reste à leur brancher un bouton.

## Ce qui n'est pas encore fait

- Installation PWA testée sur iOS et Android
- Bouton de sauvegarde / restauration
- Synchronisation multi-appareils (Supabase)
- Déploiement sur Vercel
- Statistiques : temps passé, genres les plus vus
