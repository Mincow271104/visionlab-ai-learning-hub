# VisionLab — AI & Computer Vision Learning Hub

**See It. Try It. Understand It.**

VisionLab is a static, beginner-friendly learning hub designed to help people with little or no mathematical or programming background understand artificial intelligence and computer vision through clear intuition, labeled diagrams, and focused interactive demonstrations.

Live deployment target: <https://mincow271104.github.io/visionlab-ai-learning-hub/>

---

## Project Goals

- Teach **intuition before formal terminology or equations** using everyday analogies and concrete examples.
- Combine **Guided Learning** (a staged 5-track curriculum roadmap) with **Explore Freely** (self-contained, searchable lessons).
- Keep explanations honest about what conceptual diagrams and interactive demos show—and where they simplify real systems.
- Operate as a fast, accessible static site with optional local browser progress and zero required accounts or backend servers.

## Target Audience

- Curious beginners approaching AI, Machine Learning, Deep Learning, Computer Vision, and Generative AI for the first time.
- Students and visual learners who want to see how concepts behave before studying formal math or code.

---

## Implemented vs. Planned Functionality

### Implemented in Package 1 (Project Foundation)

- **Astro static site foundation** configured with strict TypeScript, React integration, MDX integration, and CSS design tokens.
- **GitHub Pages subpath configuration** (`site: "https://mincow271104.github.io"`, `base: "/visionlab-ai-learning-hub"`) and a `withBase()` URL helper so internal links and assets resolve properly under `/visionlab-ai-learning-hub/`.
- **Content Collection schema** (`src/content.config.ts`) validating lesson metadata (`title`, `description`, `track`, `difficulty`, `estimatedMinutes`, `order`, `tags`, `status`).
- **Standard 11-section lesson authoring template** (`docs/templates/lesson-template.mdx`).
- **Responsive light & dark UI shell and homepage** (`src/layouts/MainLayout.astro`, `src/pages/index.astro`) featuring VisionLab branding, the 5-track roadmap preview, featured learning principles, and transparent rollout status without broken navigation links.
- **GitHub Actions deployment workflow** (`.github/workflows/deploy.yml`) targeting GitHub Pages.

### Planned for Upcoming Packages

- **Core curriculum lessons** across the five tracks (`AI Fundamentals`, `Machine Learning`, `Deep Learning`, `Computer Vision`, `Generative AI & Large Language Models`).
- **Interactive React demonstrations** (such as `SVMPlayground`, `NeuralNetworkExplorer`, and `ConvolutionDemo`) hydrated only where interactive exploration is needed.
- **Client-side search and filtering** across published lessons by title, description, track, difficulty, and tags.
- **Knowledge Check components** with answer explanations and **local-only browser progress tracking** (`localStorage` with safe fallback).

---

## Technology Stack

- **Framework:** [Astro](https://astro.build/) (static site generation, Content Collections)
- **Authoring:** [MDX](https://mdxjs.com/) (`@astrojs/mdx`)
- **Interactive UI (when required):** [React](https://react.dev/) (`@astrojs/react`) + strict TypeScript
- **Styling:** Plain CSS with design-token custom properties (light-first + coherent dark theme)
- **Package Manager:** npm (with committed `package-lock.json`)
- **Deployment:** GitHub Actions (`withastro/action` + `actions/deploy-pages`) to GitHub Pages

---

## Repository Structure

```text
visionlab-ai-learning-hub/
├── AGENTS.md                       # Primary project instructions & contracts
├── README.md                       # Project documentation
├── package.json
├── package-lock.json
├── astro.config.mjs                # Site, base path, static output, integrations
├── tsconfig.json                   # Strict TypeScript config
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages build & deploy workflow
├── docs/
│   └── templates/
│       └── lesson-template.mdx     # 11-section lesson authoring contract
├── public/
│   ├── favicon.svg
│   └── images/
└── src/
    ├── content.config.ts           # Content Collection schema for lessons
    ├── content/
    │   └── lessons/                # Track subdirectories for future MDX lessons
    ├── components/
    │   ├── layout/                 # Header and footer shell components
    │   ├── learning/               # Roadmap and learning-specific components
    │   ├── visualization/          # Future interactive visualizers (Package 2+)
    │   └── ui/                     # Reusable UI primitives
    ├── layouts/
    │   └── MainLayout.astro        # Shared document shell & theme bootstrap
    ├── pages/
    │   └── index.astro             # Initial homepage
    ├── styles/
    │   ├── tokens.css              # Color, spacing, typography, dark mode tokens
    │   └── global.css              # Base reset, layout, accessibility styles
    └── utils/
        ├── tracks.ts               # Canonical 5-track definitions & metadata enums
        └── url.ts                  # Base-path URL helper (`withBase`)
```

---

## Local Development

Prerequisites: **Node.js `>=22.22.0`** and **npm `>=10`**.

```bash
# Install dependencies from package-lock.json
npm install

# Start the local development server
npm run dev
```

When running locally with Astro's configured `base`, open the URL printed in the terminal (typically `http://localhost:4321/visionlab-ai-learning-hub/`).

---

## Build & Verification

Run the official Astro type/template check and static production build:

```bash
npm run check
npm run build
```

You can preview the generated static `dist/` output locally with:

```bash
npm run preview
```

---

## GitHub Pages Deployment

The workflow at `.github/workflows/deploy.yml` builds the static Astro site and deploys it to GitHub Pages on pushes to `main` or via manual `workflow_dispatch`.

> **Repository owner setup required:** In GitHub repository **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions** before expecting automatic live deployments.
