# MoviesXMovies Frontend

A Vue 3 SPA frontend for the MoviesXMovies platform — a social movie tracking application where users can discover movies, write reviews, rate films, manage watchlists, and follow other users.

## Features

- 🎬 **Movie catalog** with multilingual UI (EN, ES, FR, DE) and detailed movie pages
- ⭐ **Ratings & Reviews** with comments, replies, and emoji reactions
- 👥 **Social features** — follow users, view friends' ratings, search for people
- 📋 **Movie lists** for organizing and sharing collections
- 🔐 **Authentication** via JWT and Google OAuth
- 📧 **Email verification** flow and password recovery
- 🎭 **Celebrity profiles** for directors and actors with full filmographies
- 🔍 **Search** across movies, users, celebrities, and lists
- 🌙 **Dark / light theme** toggle
- ⌨️ **Keyboard shortcuts** for power users
- 🌍 **i18n** support with locale files per language

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API) |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 + PrimeFlex |
| UI Library | PrimeVue 4 |
| State Management | Pinia |
| Routing | Vue Router 4 |
| HTTP Client | Axios |
| Form Validation | Zod |
| i18n | vue-i18n |
| Unit Testing | Vitest + Vue Test Utils |
| E2E Testing | Cypress |
| Containerization | Docker |
| Package Manager | npm |
| Node | 20.19+ / 22.12+ |

## Project Structure

```
.
├── src/
│   ├── components/      # Reusable UI components (cards, dialogs, forms, etc.)
│   ├── views/           # Page-level components mapped to routes
│   ├── stores/          # Pinia stores (auth, theme, language, notifications)
│   ├── repositories/    # API communication layer (one file per resource)
│   ├── composables/     # Reusable Vue composables (pagination, scroll, API, OAuth)
│   ├── router/          # Vue Router config with auth guards
│   ├── schemas/         # Zod validation schemas for forms
│   ├── locales/         # i18n translation files (en, es, fr, de)
│   ├── utils/           # Utility functions (debounce, navigation, error handling)
│   ├── exceptions/      # Custom error classes
│   └── types.ts         # Shared TypeScript types
├── cypress/             # End-to-end tests
├── public/              # Static assets and PWA manifest
└── .github/workflows/   # CI/CD pipelines
```

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- A running instance of the [MoviesXMovies Backend](https://github.com/moviesxmovies/MoviesXMoviesBackend)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/moviesxmovies/MoviesXMoviesFrontend.git
   cd MoviesXMoviesFrontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example env file and fill in your values:

   ```bash
   cp example.env .env
   ```

   | Variable | Description |
   |---|---|
   | `VITE_API_URL` | Base URL of the backend API (e.g. `http://localhost:8000/api`) |
   | `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
   | `VITE_CALLBACK_URI` | OAuth redirect URI (e.g. `http://localhost:5173`) |

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint and auto-fix with ESLint |
| `npm run format` | Format source files with Prettier |

### Docker

Build and run with Docker:

```bash
docker build -t moviesxmovies-frontend .
docker run -p 80:80 --env-file .env moviesxmovies-frontend
```

The official image is published to Docker Hub:

```bash
docker pull moviesxmovies/frontend:latest
```

> **Note:** The Docker image uses a multi-stage build. The first stage compiles the app with Node 22; the second stage serves the static output via a minimal Alpine image using a custom `entrypoint.sh`.

## Views & Routing

Routes are split into two groups managed by navigation guards:

**Authenticated routes** (redirect to `/login` if not logged in)

| Path | View | Description |
|---|---|---|
| `/home` | `HomeView` | Movie feed and recommendations |
| `/movies/:slug` | `MovieDetailView` | Movie details, ratings, and reviews |
| `/profiles/:slug` | `CelebrityView` | Director / actor profile and filmography |
| `/users/:slug` | `UserProfileView` | Another user's profile |
| `/users` | `UserProfileView` | The current user's own profile |
| `/movie-list/:user/:slug` | `MovieListDetailView` | A specific movie list |
| `/search` | `SearchView` | Global search (movies, users, celebrities, lists) |
| `/onboarding` | `OnBoardingView` | First-time user onboarding flow |
| `/verify-email` | `VerifyEmailView` | Email verification step |

**Guest-only routes** (redirect to `/home` if already authenticated)

| Path | View | Description |
|---|---|---|
| `/` | `WelcomeView` | Landing page |
| `/login` | `LoginView` | Login form |
| `/signup` | `SignupView` | Two-step registration form |
| `/accounts/google/login/callback/` | `OauthCallbackView` | Google OAuth callback handler |

## State Management

Pinia stores manage global application state:

| Store | Responsibility |
|---|---|
| `authStore` | JWT tokens, user session, login/logout |
| `themeStore` | Dark/light theme preference |
| `langStore` | Active language and locale switching |
| `notificationStore` | Toast notification queue |
| `profileStore` | Cached current user profile data |

## Running Tests

### Unit tests

```bash
npm run test:unit
```

To run with coverage:

```bash
npm run test:coverage
```

The unit test suite uses **Vitest** and **Vue Test Utils**. Tests live alongside source code under `src/__tests__/`, organized by type: `components/`, `composables/`, and `repositories/`.

### End-to-end tests

```bash
npm run test:e2e
```

To open the Cypress interactive runner during development:

```bash
npm run test:e2e:dev
```

E2E tests are located in `cypress/e2e/`.

## CI/CD

GitHub Actions workflows handle the full pipeline:

| Workflow | Trigger | Action |
|---|---|---|
| `Checks` | Push / PR | Runs tests with coverage and SonarQube analysis |
| `Build Docker Image` | After Checks pass on `main` | Builds and pushes to Docker Hub |
| `Deploy` | After Docker build on `main` | SSH deploy via `docker compose up` |
| `GitHub Changelog` | Push to `main` with `package.json` changes | Creates a GitHub Release with auto-generated notes |
| `Notify Docs Update` | After Changelog completes | Dispatches a `frontend_updated` event to the docs repo |

## Internationalization

The UI is fully translated into **English**, **Spanish (es)**, **French (fr)**, and **German (de)**. Locale files live in `src/locales/` and are loaded dynamically via **vue-i18n**. The active language is persisted through the `langStore` and can be changed at any time from the navbar.
