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

### Implemented Features (Package 1 & Package 2)

- **Astro static site foundation & GitHub Pages deployment** configured with strict TypeScript, React integration, MDX integration, `.github/workflows/deploy.yml`, `site: "https://mincow271104.github.io"`, `base: "/visionlab-ai-learning-hub"`, and `withBase()` base-aware URL helpers.
- **5-track curriculum & 8 published beginner lessons** validated by `src/content.config.ts` and `LessonLayout.astro`:
  - **AI Fundamentals (`/tracks/ai-fundamentals/`):** *What Is Artificial Intelligence?*
  - **Machine Learning (`/tracks/machine-learning/`):** *How Machine Learning Works*, *Understanding Support Vector Machines (SVMs) & the Kernel Trick*, *Understanding K-Nearest Neighbors (KNN)*
  - **Deep Learning (`/tracks/deep-learning/`):** *Understanding Neural Networks*
  - **Computer Vision (`/tracks/computer-vision/`):** *How Computers See Images*, *Introduction to Depth Estimation*
  - **Generative AI & Large Language Models (`/tracks/generative-ai/`):** *Understanding Large Language Models*
- **Interactive educational simulations (React, hydrated selectively):**
  - `SVMPlayground` (`client:visible` in the SVM lesson): interactive 2D point plotting, boundary angle/offset/margin controls, Linear vs. XOR-style presets, conceptual kernel intuition view, and perpendicular distance readouts (explicitly labeled as a conceptual no-training simulation).
  - `NeuralNetworkExplorer` (`client:visible` in the Neural Networks lesson): interactive 2→3→2 ReLU + Softmax forward-pass walkthrough with adjustable inputs `x1`/`x2` and step controls (explicitly labeled as using fixed educational weights).
- **Knowledge Check quizzes (`KnowledgeCheck.tsx`)** on every published lesson with instant feedback, detailed answer explanations, and local score saving.
- **Learning navigation, client-side search & local progress:**
  - Dedicated **Roadmap** (`/roadmap/`), **Explore Lessons** (`/explore/` with `filterLessons()` search by title/description/tags + track & difficulty filters), **Track overview** (`/tracks/[track]/`), and **My Learning** (`/my-learning/`) pages.
  - SSR-safe browser `localStorage` persistence (`visionlab-progress-v1` in `src/utils/progress.ts`) for completed lessons and quiz scores, with clear device-only storage notices and reset controls.
- **Accessible light & dark UI** with responsive desktop/tablet/mobile layouts, labeled SVG diagrams, keyboard-accessible controls, and reduced-motion support.

### Planned for Future Packages

- **Additional interactive visualizations** such as `ConvolutionDemo` for live pixel-grid filtering.
- **Expanded curriculum lessons** across intermediate Computer Vision, Object Detection, Multimodal AI, and Generative AI topics (currently listed cleanly as planned topics on each track page).

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
    │   └── lessons/                # Published MDX lessons grouped by track
    ├── components/
    │   ├── layout/                 # SiteHeader and SiteFooter shell components
    │   ├── learning/               # LessonCard, KnowledgeCheck, LessonExplorer, MyLearningDashboard, etc.
    │   ├── visualization/          # SVMPlayground and NeuralNetworkExplorer React simulations
    │   └── ui/                     # Reusable UI primitives
    ├── layouts/
    │   ├── MainLayout.astro        # Shared document shell & theme bootstrap
    │   └── LessonLayout.astro      # Shared 11-section lesson layout, TOC & completion toggle
    ├── pages/
    │   ├── index.astro             # Homepage
    │   ├── roadmap.astro           # 5-track guided roadmap
    │   ├── explore.astro           # Search & filter directory
    │   ├── my-learning.astro       # Local progress & quiz dashboard
    │   ├── tracks/[track].astro    # Track detail pages
    │   └── lessons/[...slug].astro # Dynamic lesson routes
    ├── styles/
    │   ├── tokens.css              # Color, spacing, typography, dark mode tokens
    │   ├── global.css              # Base reset, layout, accessibility styles
    │   └── interactive.css         # Lessons, visualizations, quizzes, and dashboard styles
    └── utils/
        ├── tracks.ts               # Canonical 5-track definitions & metadata helpers
        ├── lessons.ts              # Published lesson queries, sorting & route helpers
        ├── search.ts               # Client-side filtering across title/description/tags
        ├── progress.ts             # SSR-safe localStorage progress & quiz manager
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
