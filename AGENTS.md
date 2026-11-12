# VisionLab — Project Instructions for AI Coding Agents

> Read this file before planning, editing, or generating any project code or content.
> This file is the source of truth for project conventions. When instructions conflict, follow this file unless the owner explicitly approves a change.

## 1. Project Identity

**Name:** VisionLab — AI & Computer Vision Learning Hub  
**Tagline:** See It. Try It. Understand It.  
**Purpose:** Help people with little or no AI background understand artificial intelligence through a guided learning roadmap, a searchable knowledge library, clear visual explanations, and meaningful interactive demonstrations.

### Audience and teaching philosophy
- Write for beginners. Assume readers may not know mathematical or programming prerequisites.
- Teach intuition before formal terminology, equations, or implementation details.
- Use concrete analogies and small examples, then connect them to the technical concept.
- Define every important technical term on first use.
- Avoid unexplained acronyms, unnecessary jargon, and claims that a visualization proves more than it actually does.
- All public-facing website content, navigation, UI labels, lesson text, and project documentation must be in English. Discussions with the owner may be in Vietnamese.

## 2. Product Experience

VisionLab is a **hybrid learning platform** with two complementary experiences:
1. **Guided Learning:** a staged roadmap that suggests a sensible learning sequence.
2. **Explore Freely:** searchable and filterable lessons that can be read independently.

The first release covers five tracks:
- AI Fundamentals
- Machine Learning
- Deep Learning
- Computer Vision
- Generative AI & Large Language Models

A track is a category, not a promise that every topic in that field is already implemented. Clearly distinguish implemented lessons from planned topics.

## 3. Approved Technology Stack

Use the following stack unless a change is proposed with a concrete reason and approved by the project owner:
- Astro for routing, static site generation, layouts, and content-driven pages.
- Astro Content Collections with schema validation for lesson metadata.
- MDX for authoring lessons and embedding approved learning components.
- React + TypeScript for genuinely interactive client-side demonstrations.
- Astro components for mostly static UI.
- SVG and CSS for diagrams, annotations, and lightweight visualizations.
- Plain TypeScript utilities for shared behavior such as search and learning progress.
- npm as the package manager.
- GitHub Actions and GitHub Pages for public deployment.

### Architecture constraints
- Prefer static generation. Do not add a server, database, authentication, or paid external API for the MVP.
- Do not turn the entire site into a client-rendered React application.
- Hydrate React components only when interaction is required.
- Avoid adding dependencies when native browser APIs, Astro, SVG, CSS, or existing components are sufficient.
- Do not use remote image URLs as a runtime dependency for essential lesson content. Prefer committed, appropriately licensed assets or original SVG diagrams.
- Keep TypeScript strict and avoid the TypeScript any type; explain and isolate any unavoidable exception.

## 4. Repository Structure

Keep responsibilities separated and follow this structure. Small, justified additions are allowed; do not create parallel systems that duplicate an existing responsibility.

```text
.
├── AGENTS.md
├── README.md
├── package.json
├── astro.config.mjs
├── tsconfig.json
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docs/
│   └── templates/
│       └── lesson-template.mdx
├── public/
│   ├── favicon.svg
│   └── images/
└── src/
    ├── content.config.ts
    ├── content/
    │   └── lessons/
    │       ├── ai-fundamentals/
    │       ├── machine-learning/
    │       ├── deep-learning/
    │       ├── computer-vision/
    │       └── generative-ai/
    ├── components/
    │   ├── layout/                 # SiteHeader.astro, SiteFooter.astro
    │   ├── learning/               # Callout, DiagramCaption, StepWalkthrough, LessonCard, KnowledgeCheck, LessonExplorer, MyLearningDashboard, LessonCompletionButton, RoadmapTrackCard
    │   ├── visualization/          # SVMPlayground.tsx, NeuralNetworkExplorer.tsx
    │   └── ui/
    ├── layouts/                    # MainLayout.astro, LessonLayout.astro
    ├── pages/                      # index, roadmap, explore, my-learning, tracks/[track], lessons/[...slug]
    ├── styles/                     # tokens.css, global.css, interactive.css
    └── utils/                      # url.ts, tracks.ts, lessons.ts, search.ts, progress.ts
```

### File naming
- Astro components: PascalCase, e.g. LessonCard.astro, MainLayout.astro.
- React components: PascalCase, e.g. SVMPlayground.tsx, NeuralNetworkExplorer.tsx.
- Utility modules: kebab-case, e.g. progress.ts, search.ts.
- Lesson slugs and filenames: lowercase kebab-case, e.g. what-is-artificial-intelligence.mdx.
- One reusable component per file unless a small, tightly coupled private helper is clearer inline.
- Keep assets near their feature when imported by code; use public/images/ for files referenced by stable public paths.

## 5. Design System

### Visual direction
Use **Clean Light × Friendly Learning**:
- White or very light neutral surfaces, blue as the primary accent, and restrained supportive colors.
- Friendly, clear, modern, professional, and welcoming; never childish or visually noisy.
- Spacious layouts, consistent alignment, readable typography, clear hierarchy, and moderate corner radii.
- Use cards to organize meaningful content, not to wrap every paragraph.
- Provide a coherent dark theme if implemented; both themes must preserve contrast and visual hierarchy.

### Responsive behavior
- Design mobile-first and verify phone, tablet, and desktop layouts.
- No horizontal page overflow at narrow widths.
- Navigation, diagrams, controls, tables, and quizzes must remain usable on touch screens.
- Avoid hover-only interactions; provide keyboard and touch alternatives.

### Accessibility
- Use semantic HTML and meaningful heading order.
- Every interactive control must have an accessible name and visible focus state.
- Provide text alternatives or explanatory captions for meaningful diagrams.
- Do not rely on color alone to communicate categories or correctness.
- Respect reduced-motion preferences.
- Maintain sufficient text/background contrast.

## 6. Lesson Content Contract

Every published lesson must use the shared content schema and lesson template. Do not invent a different structure for individual lessons.

Required lesson sections:
1. **Introduction:** explain the topic in plain English and why it matters.
2. **Learning Objectives:** 2–4 concrete outcomes.
3. **Intuitive Explanation:** analogy or everyday example before formal details.
4. **Visual Explanation:** original or properly licensed diagram, with labels and a caption.
5. **Step-by-Step Walkthrough:** explain the process in logical stages.
6. **Interactive Demonstration:** include when the concept benefits from manipulation or exploration; otherwise explain why a static visual is more appropriate.
7. **Real-World Example:** a grounded practical application.
8. **Common Misconceptions:** correct likely beginner misunderstandings.
9. **Knowledge Check:** 3–5 questions with explanations for answers.
10. **Key Takeaways:** concise summary.
11. **Related Lessons:** links to existing lessons only; never invent routes.

### Writing rules
- Use plain, concise English and short paragraphs.
- Explain symbols and variables before using equations.
- Introduce formulas only after intuition and explain what each term means.
- Use consistent terminology across lessons.
- Distinguish simplified analogies from exact mathematical or engineering behavior.
- Do not fabricate citations, experiments, measurements, or performance claims.
- Add references for factual material when appropriate; prefer primary sources, official documentation, and foundational papers.
- Do not copy long passages from sources. Paraphrase and cite.
- Keep lesson depth proportional to the topic; do not pad lessons to satisfy headings.

### Lesson metadata
Each lesson must provide, at minimum:
- title
- description
- track
- difficulty (beginner, intermediate, advanced)
- estimatedMinutes
- order
- tags
- draft/published status if the content system supports it

A lesson must not appear as published if it is incomplete or its route is broken.

## 7. Visual and Interactive Learning Rules

### Visual explanations
- Prefer original SVG diagrams for conceptual explanations when practical.
- Every diagram must answer a teaching question, not merely decorate the page.
- Add a descriptive caption and label important elements.
- Use consistent colors for semantic roles across a lesson (for example, class A and class B).
- Keep diagrams responsive and legible on small screens.
- Use assets only when their origin and usage rights are appropriate; record attribution where required.

### Interactive demonstrations
Every interactive component must:
- Have an explicit learning objective and a short instruction.
- Make controls visibly affect the visualization or explanation.
- Include a reset action when the state can be changed.
- Explain what the learner should observe.
- Work with keyboard and touch input where relevant.
- Provide useful empty, initial, and boundary states.
- Avoid claiming to train or optimize a real model unless it actually does so.
- Clearly label conceptual simulations as conceptual simulations.
- Keep computation local and bounded; do not freeze the browser with large loops.
- Separate visualization logic from lesson prose so it can be reused.

Preferred reusable component patterns include:
- `SVMPlayground` (`src/components/visualization/SVMPlayground.tsx` — implemented as an explicit no-training conceptual linear-boundary and kernel-intuition simulation)
- `NeuralNetworkExplorer` (`src/components/visualization/NeuralNetworkExplorer.tsx` — implemented as a fixed-weight 2→3→2 ReLU + Softmax forward-pass simulator)
- `ConvolutionDemo` (planned for a future package; not yet implemented)
- shared `DiagramCaption.astro`, `Callout.astro`, `StepWalkthrough.astro`, `LessonCard.astro`, `KnowledgeCheck.tsx`, `LessonCompletionButton.tsx`, `LessonExplorer.tsx`, `MyLearningDashboard.tsx`, and `RoadmapTrackCard.astro`.

Keep `ConvolutionDemo` (and any future interactive modules) scoped cleanly until lessons require them.

## 8. Navigation, Search, Learning Progress, and Authoring Workflow

### Implemented routes and data flow
- **Homepage (`/`):** Overview, learning paths preview derived dynamically from published lessons, and navigation cards.
- **Learning Roadmap (`/roadmap/`):** Full 5-track curriculum sequence linking to `/tracks/<track>/` and published lessons.
- **Track Pages (`/tracks/[track]/`):** Dynamic track overview showing published lessons in roadmap order plus clearly marked planned topics.
- **Lesson Pages (`/lessons/[...slug]/`):** Generated strictly from `getPublishedLessons()` (`status === 'published'`), rendered inside `LessonLayout.astro` with breadcrumbs, sticky section outline (`h2`), prev/next links, and `LessonCompletionButton`.
- **Explore Lessons (`/explore/`):** Client-hydrated `LessonExplorer` powered by `filterLessons()` (`src/utils/search.ts`) supporting case-insensitive search across title, description, tags, and track title, plus track/difficulty filters and empty/reset states.
- **My Learning (`/my-learning/`):** Client-hydrated `MyLearningDashboard` showing overall progress, per-track completion, recorded quiz scores, local-storage notice, and safe reset.

### Local progress schema (`src/utils/progress.ts`)
- Stored optionally under `localStorage` key `visionlab-progress-v1` with `version: 1`, `completedLessons: string[]`, and `quizScores: Record<string, { score: number; total: number; updatedAt: string }>`.
- Must remain SSR-safe and fall back gracefully if `localStorage` is unavailable or contains malformed JSON.
- Progress stays strictly local to the current browser/device and is never synced or tied to user accounts.

### Lesson authoring workflow
1. Create an `.mdx` file under `src/content/lessons/<track>/<kebab-case-slug>.mdx` following `docs/templates/lesson-template.mdx`.
2. Ensure all required metadata (`title`, `description`, `track`, `difficulty`, `estimatedMinutes`, `order`, `tags`, `status`) passes `src/content.config.ts`.
3. Use `getLessonHref('<track>/<slug>')`, `getTrackHref('<track>')`, or `withBase()` for internal links.
4. Keep manually labeled `Previous:` / `Next:` links in Section 11 consistent with the globally sorted published lesson order (track stage ascending, then `order` ascending), and verify adjacent lessons when inserting or appending a lesson.
5. Keep SVG diagrams accessible (`role="img"`, `<title>`, `<desc>`, `aria-labelledby`, camelCase JSX attributes):
   - Use `<DiagramCaption label="Figure 1" caption="...">` as the single outer wrapper around `<svg>` (via its slot). Do **not** wrap `<DiagramCaption>` in another `<figure>`, and do **not** add a second caption outside it.
   - **MDX inline SVG text rule:** Literal text inside SVG elements such as `<title>`, `<desc>`, `<text>`, or `<tspan>` can be parsed as Markdown paragraph content by MDX, injecting invalid `<p>` elements inside `<svg>` in the generated HTML and causing HTML parsers to close `<svg>` early. Always use JSX string expressions for literal text children where required, for example:
     ```mdx
     <title>{"Diagram title"}</title>
     <desc>{"A clear diagram description."}</desc>
     <text x="20" y="30">{"Visible SVG label"}</text>
     ```
   - Do **not** assume that a successful source-level check (`astro check` or `tsc --noEmit`) guarantees valid generated SVG HTML. After `npm run build`, always inspect the built HTML under `dist/lessons/` to confirm zero `<p>` tags exist inside `<svg>` elements.
6. Set `status: "published"` only after all 11 sections, `KnowledgeCheck`, built-HTML SVG checks, and build/preview checks pass.

### Rules for navigation, search, and storage
- Roadmap stages must link only to implemented tracks or clearly marked planned sections.
- Explore/search results must link to valid published lesson routes.
- Search should work without a backend and should handle case-insensitive title, description, and tag matches.
- Learning progress and quiz results may be stored locally in the browser for the MVP.
- Treat local storage as optional and fall back safely if unavailable.
- Explain that progress is stored on the current browser/device and is not synchronized across devices.
- Do not collect personal information.

## 9. GitHub Pages Deployment

The target repository is Mincow271104/visionlab-ai-learning-hub, with the default branch main.

- Public URL target: https://mincow271104.github.io/visionlab-ai-learning-hub/.
- Configure Astro site as https://mincow271104.github.io and base as /visionlab-ai-learning-hub.
- Use GitHub Actions as the Pages build/deployment source.
- Ensure internal links and asset paths respect Astro's configured base path. Prefer Astro's BASE_URL or import.meta.env.BASE_URL where appropriate.
- Do not use root-absolute paths such as /images/example.svg when they would bypass the repository base path.
- Include the lockfile generated by npm.
- Never claim deployment succeeded until the GitHub Actions run and live URL have been checked.

## 10. Quality Gates

Before reporting a task complete:
1. Review the requested scope and identify affected routes/components/content.
2. Read this file and existing code before changing anything.
3. Implement the smallest coherent change; avoid unrelated refactors.
4. Run available checks: npm run check, npm run build, and any relevant tests.
5. Inspect build output for missing routes/assets and warnings.
6. Verify changed pages at mobile and desktop sizes when browser preview is available.
7. Check keyboard usability and accessible labels for new interactions.
8. Verify GitHub Pages base-path behavior for links and assets.
9. Review git diff for accidental changes, debug code, secrets, and generated files.
10. Report exact commands run and their actual outcomes. Never invent test results.

If a check cannot be run, state that clearly and explain the remaining risk.

## 11. Agent Workflow and Change Discipline

For every non-trivial task:
1. **Inspect:** read relevant files and current project state.
2. **Plan:** list the files to add/change and explain the approach briefly.
3. **Implement:** follow existing abstractions and this document.
4. **Verify:** run quality gates and inspect the diff.
5. **Report:** summarize changes, tests, limitations, and any owner action required.

Additional rules:
- Do not overwrite user work or reset branches without explicit approval.
- Do not commit, push, merge, or change repository settings unless the owner explicitly requests that action.
- Do not add features outside the requested scope.
- Ask the owner only when a decision materially affects product direction, data, cost, security, or destructive changes.
- If a requirement is ambiguous but low-risk, choose the simplest consistent interpretation and document the assumption.
- Keep documentation synchronized with actual implementation. Do not describe planned functionality as completed.

## 12. Definition of Done

A feature is complete only when:
- It follows the architecture and design/content contracts above.
- Its visible behavior works as described.
- It is responsive and accessible to a reasonable standard.
- Relevant checks have passed, or unrun checks are explicitly disclosed.
- Links, metadata, and navigation are valid.
- Documentation reflects the actual state.
- The final report identifies changed files and verification evidence.

**Core principle:** Every new lesson or feature should feel like a natural part of the same learning platform. Prefer reusable patterns, clear teaching, truthful explanations, and verified behavior over visual novelty or feature quantity.