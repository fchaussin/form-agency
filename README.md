# FormAgency

A full-stack WIP Monorepo application (Symfony + React) orchestrated by DDEV.

**Regain control over your data collection.**

Designed for web agencies to manage forms across their clients' static websites.

FormAgency is a self-hosted microservice designed to replace third-party SaaS form builders. It provides a complete infrastructure to build, host, and process forms while keeping full sovereignty over your data.

It features a comprehensive **Admin Panel** for management and a lightweight **JS Client** to embed forms seamlessly into any project (Static sites, JAMstack, SPA).

**Key Features:**
* **Visual Admin Panel:** Intuitive drag-and-drop builder & submission dashboard.
* **Universal Embed:** Drop-in HTML/JS snippet to integrate forms anywhere.
* **Multi-Tenancy:** Manage multiple sites and users from a single instance.
* **Data Hub:** Secure storage with automated dispatch (Webhooks, Emails).
* **Docker Ready:** Easy deployment on your own infrastructure.

## 🏗 Architecture Overview

This project uses a **Monorepo structure** running inside a ready to use **single DDEV container**.

* **Root:** Contains the DDEV configuration orchestrating the environment.
* **Backend (`/back`):** Symfony 7.3 API (API Platform) running on Nginx/PHP-FPM.
* **Frontend (`/front`):** React 18 application served by Vite.

### Network Strategy
Both the Backend and Frontend run inside the same `ddev-web` container.
* **Internal Communication:** The Frontend (Vite Proxy) communicates with the Backend via `localhost` (loopback), eliminating DNS latency and CORS issues during development.
* **External Access:** DDEV Router exposes specific ports to access the API or the Vite Development Server from your host browser.

## 🛠 Technology Stack

**Infrastructure**
* **DDEV:** Container orchestration.
* **OS:** Debian (via DDEV web container).
* **Database:** PostgreSQL 16.

**Backend (`/back`)**
* **Framework:** Symfony 7.3.
* **Language:** PHP 8.3.
* **API:** API Platform 4.
* **ORM:** Doctrine ORM.

**Frontend (`/front`)**
* **Library:** React 18.
* **Build Tool:** Vite (running on Node.js 20).
* **Styling:** TailwindCSS.
* **Language:** TypeScript.

## 🚀 Getting Started

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) or equivalent.
* [DDEV](https://ddev.com/get-started/) (latest version).

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository_url> form-agency
    cd form-agency
    ```

2.  **Start the Environment**
    Run the following command to build containers and start services.
    *Note: DDEV hooks will automatically run `composer install` (back) and `npm install` (front).*
    ```bash
    ddev start
    ```

3.  **Initialize Database**
    For the first installation, create the database and schema, then load fixtures.
    ```bash
    ddev sym doctrine:database:create
    ddev sym doctrine:migrations:migrate
    ddev sym doctrine:fixtures:load --no-interaction
    ```

## 💻 Development Workflow

### Access URLs

| Service | Internal URL (Container) | Host URL (Browser) |
| :--- | :--- | :--- |
| **Backend API** | `http://localhost:80` | `https://formagency.ddev.site` |
| **Frontend (Dev)** | `http://localhost:3000` | `https://formagency.ddev.site:9999` |
| **Mailpit** | `http://localhost:8025` | `https://formagency.ddev.site:8026` |
| **PostgreSQL** | `db:5432` | (Managed via `ddev sequelize` or IDE) |

### Custom Commands (CLI)

To simplify the Monorepo management, custom DDEV commands are mapped to the specific subdirectories.

| Command | Description | Target Scope |
| :--- | :--- | :--- |
| **`ddev sym [cmd]`** | Runs Symfony `php bin/console` commands. <br> *Example: `ddev sym cache:clear`* | `/back` |
| **`ddev run-dev`** | Starts the Vite development server (HMR enabled). | `/front` |
| **`ddev sync-openapi`** | Generates TypeScript types from the Symfony ApiPlatform. | `/front` |
| **`ddev ssh`** | Opens a shell inside the web container. | Root |

### Running the Frontend
To start working on the React application with Hot Module Replacement (HMR):

1.  Ensure DDEV is started.
2.  Run the dev command:
    ```bash
    ddev run-dev
    ```
3.  Open `https://formagency.ddev.site:9999` in your browser.

*Note: The terminal will remain active to show build logs. Press `Ctrl+C` to stop.*

## ⚙️ Configuration & Environment Variables

### Strategy
* **`.env`**: Committed to Git. Contains default values compatible with the DDEV environment.
* **`.env.local`**: Ignored by Git. Use this for local overrides (secrets, specific keys).

### Frontend Configuration (`front/.env`)
The setup relies on the fact that Front and Back share the same container.

```dotenv
# Public URL accessed by the browser
VITE_PROJECT_HOST=formagency.ddev.site

# Backend URL for server-side calls or direct access
VITE_BACKEND_HOST=formagency.ddev.site
VITE_BACKEND_BASE_URL=https://${VITE_BACKEND_HOST}

# INTERNAL Networking (Vite Proxy -> Symfony)
# MUST remain "localhost" as they are in the same container
VITE_BACKEND_CONTAINER_HOST=localhost
VITE_BACKEND_CONTAINER_BASE_URL=http://${VITE_BACKEND_CONTAINER_HOST}
```

### Backend Configuration (`back/.env`)
DDEV automatically injects the `DATABASE_URL`. If you need to override it manually:

```dotenv
DATABASE_URL="postgresql://db:db@db:5432/db?serverVersion=16&charset=utf8"
```

## 📂 Project Structure

```text
form-agency/
├── .ddev/                 # DDEV Infrastructure config & commands
│   ├── config.yaml        # Main config (ports, node version, etc.)
│   └── commands/          # Custom scripts (sym, run-dev, openapi)
├── back/                  # Backend Application (Symfony)
│   ├── bin/
│   ├── config/
│   ├── migrations/
│   ├── public/            # Web server root for API
│   └── src/
├── front/                 # Frontend Application (React)
│   ├── src/
│   │   ├── types/         # Generated API types
│   │   └── ...
│   ├── vite.config.ts     # Vite config (Proxy setup)
│   └── package.json
└── .gitignore             # Root gitignore
```

## 🐛 Troubleshooting

**1. "Undefined table" error during migration**
If the database is out of sync with migrations:
```bash
ddev sym doctrine:database:drop --force
ddev sym doctrine:database:create
ddev sym doctrine:migrations:migrate
```

**2. Node_modules missing**
Dependencies are installed automatically on `ddev start`. To force reinstall:
```bash
ddev exec "cd front && npm install"
```

**3. Port 9999 not reachable**
Ensure the `ddev run-dev` command is currently running in a terminal window. The Vite server is not a background daemon by default.