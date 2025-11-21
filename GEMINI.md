# CONTEXTE PROJET : FormAgency

## 1. Architecture & Infrastructure
* **Type :** Monorepo Strict (Backend et Frontend isolés dans des sous-dossiers).
* **Orchestration :** DDEV (Single Container Architecture).
* **Conteneur `web` :** Hybride. Héberge simultanément :
    * Nginx/PHP-FPM (Port 80 interne -> 80/443 externe).
    * Node.js/Vite Server (Port 3000 interne -> 9999 externe).
* **Base de données :** PostgreSQL 16 (Conteneur `db`).

## 2. Stack Technique
### Backend (`/back`)
* **Framework :** Symfony 7.3
* **API :** API Platform 4 (Exposition automatique `/api`)
* **Langage :** PHP 8.3
* **ORM :** Doctrine (PostgreSQL)
* **Dépendances :** Gérées via Composer dans `/back`.

### Frontend (`/front`)
* **Lib :** React 18
* **Build :** Vite
* **Langage :** TypeScript
* **Style :** TailwindCSS
* **Dépendances :** Gérées via NPM/Corepack dans `/front` (Node 20).

## 3. Commandes DDEV (Obligatoires)
L'exécution directe de commandes à la racine échouera. Utiliser les wrappers DDEV configurés :

| Action | Commande DDEV | Équivalent Exécuté |
| :--- | :--- | :--- |
| **Symfony Console** | `ddev sym [args]` | `cd back && php bin/console [args]` |
| **Start Dev Server** | `ddev run-dev` | `cd front && npm run dev --host` |
| **Gen API Types** | `ddev sync-openapi` | `cd front && npx openapi-typescript ...` |
| **Composer** | `ddev composer [args]` | (Auto-ciblé sur `/back` via config) |
| **NPM** | `ddev exec "cd front && npm ..."` | (Pas de wrapper global, ciblage manuel) |

## 4. Stratégie Réseau & Environnement
### Frontend (`front/.env`)
* **Host Externe :** `VITE_PROJECT_HOST=formagency.ddev.site` (Pour le navigateur).
* **Host Interne :** `VITE_BACKEND_CONTAINER_HOST=localhost` (Pour le SSR/Proxy Vite).
    * *Note :* Front et Back étant dans le même conteneur, `localhost` est la route la plus rapide (pas de DNS).

### Backend (`back/.env`)
* **DB :** `DATABASE_URL` injectée automatiquement par DDEV.
