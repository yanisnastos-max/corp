# ASCEND — System Architecture
**Version:** 0.17 (Phase 0 Final) · **Status:** Pre-build · **Target:** v0.1.0 MVP

---

## 1. Overview

ASCEND is a browser-based narrative career RPG. The MVP runs entirely client-side: no backend, no database, no authentication. Game state persists in `localStorage`. Deployment is a static build pushed to GitHub Pages.

The architecture is deliberately minimal for Phase 1. No framework, no reactive layer, no virtual DOM. The game is a state machine that maps a `GameState` object to a rendered scene. Complexity lives in the data and narrative logic, not the rendering pipeline.

---

## 2. Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Language | TypeScript 5.x | Type safety for the attribute/delta system; autocomplete on JSON schemas |
| Build | Vite 5.x | Fast HMR for development; single-command `gh-pages` deploy |
| CSS | PostCSS + custom properties | Design tokens already established in `design/tokens.css`; no utility framework needed |
| Persistence | `localStorage` | No backend for MVP; game state serialises to ~4–8KB JSON |
| Testing | Vitest | Same Vite pipeline; no Jest config overhead |
| Hosting | GitHub Pages | Static, zero-cost, matches the TypeScript → Vite → dist workflow |
| Fonts | Google Fonts CDN | Inter, Source Serif 4, JetBrains Mono — already locked in design system |

**Not used (and why):**

- **React / Vue / Svelte** — The game renders one scene at a time. A reactive component tree would add indirection with no benefit. Scene transitions are CSS-driven, not data-binding-driven.
- **Twine / Ink** — ASCEND's branching is mechanical (stat deltas + consequence tags), not pure prose. The data layer needs to be queryable, not a compiled story script.
- **Electron** — Phase 1 is browser-first. Desktop packaging is a Phase 4 consideration if retention data warrants it.

---

## 3. Repository Structure

```
ascend/
├── index.html                    # Entry point; Vite injects bundle
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .gitignore
│
├── src/                          # All TypeScript source
│   ├── main.ts                   # Bootstrap: load state, mount Engine
│   │
│   ├── core/                     # Game engine — no DOM awareness
│   │   ├── engine.ts             # SceneManager orchestration + game loop
│   │   ├── state.ts              # GameState type + read/write/migrate
│   │   ├── events.ts             # Lightweight pub/sub EventBus
│   │   └── constants.ts          # Stat keys, band thresholds, year config
│   │
│   ├── scenes/                   # One file per screen; mount/unmount pattern
│   │   ├── onboarding.ts         # Name, pronouns, background, traits, intro letter
│   │   ├── decision.ts           # Question display, option selection, consequence drawer
│   │   ├── attribute_panel.ts    # Stat panel drawer (triggered from decision scene)
│   │   ├── people_panel.ts       # NPC list/constellation drawer
│   │   ├── annual_review.ts      # Year-end scorecard, formula reveal, outcome
│   │   └── career_timeline.ts    # Historical timeline with decision detail
│   │
│   ├── data/                     # Data access layer
│   │   ├── loader.ts             # fetch() wrappers for JSON; typed return values
│   │   ├── validator.ts          # Runtime schema checks (Zod-lite, hand-rolled)
│   │   └── index.ts              # Re-exports
│   │
│   ├── logic/                    # Pure functions — no side effects, fully testable
│   │   ├── deltas.ts             # Apply statDeltas + npcDeltas to GameState
│   │   ├── review.ts             # Annual review formula; scorecard band calculator
│   │   ├── npc.ts                # NPC relationship band resolution; delta application
│   │   └── consequence.ts        # Consequence tag accumulation and query
│   │
│   └── utils/                    # DOM helpers and generic utilities
│       ├── dom.ts                # el(), qs(), animateBar(), fadeIn(), etc.
│       ├── math.ts               # clamp(), lerp(), weightedAverage()
│       └── storage.ts            # localStorage read/write with versioning
│
├── data/                         # Static JSON — loaded at runtime via fetch()
│   ├── backgrounds.json
│   ├── traits.json
│   ├── review-rules.json
│   ├── npcs/
│   │   └── tier1/                # dana_sutcliffe.json … sofia.json
│   └── questions/
│       └── year1/                # y01q01.json … y01q10.json
│
├── design/                       # Design assets — not bundled, referenced by docs
│   ├── tokens.json
│   ├── tokens.css                # Imported by index.html; shared with src/
│   └── wireframes/               # Interactive HTML wireframes
│
├── docs/                         # Project documentation
│   └── 00–09_*.md
│
├── public/                       # Copied verbatim to dist/ by Vite
│   └── assets/                   # Any future static images / audio
│
├── tests/                        # Vitest test files
│   ├── logic/                    # Unit tests for pure logic functions
│   └── data/                     # Schema validation tests for JSON data files
│
└── .github/
    └── workflows/
        └── deploy.yml            # Build → GitHub Pages on push to main
```

---

## 4. Core Modules

### 4.1 GameState (`src/core/state.ts`)

The canonical data structure for a single playthrough. All game logic reads from and writes to this object. Serialises to localStorage on every scene transition.

```typescript
interface GameState {
  version: number;                     // Schema version; used for migration
  player: {
    name: string;
    pronouns: string;
    backgroundId: string;
    traitIds: string[];
  };
  year: number;                        // 1–12
  week: number;                        // 1–52
  questionIndex: number;               // Which question is current
  stats: Record<StatKey, number>;      // 10 visible stats, 0–100
  pillars: Record<PillarKey, number>;  // 4 hidden pillars, 1–40
  axes: Record<AxisKey, number>;       // 4 cognitive axes, -5 to +5
  npcRelationships: Record<NpcId, number>; // -100 to 100
  consequenceTags: string[];           // Accumulated across all decisions
  decisions: DecisionRecord[];         // Full history of choices made
  reviewHistory: ReviewRecord[];       // Year-end review results
  flags: Record<string, boolean>;      // Arbitrary narrative flags
}
```

**Persistence:** On every scene transition, `state.ts` calls `storage.ts` which serialises the full object and writes to `localStorage['ascend_save']`. On load, it checks for a saved game and prompts continue vs. new game. A schema `version` field allows forward-compatible migration when the data model changes between releases.

### 4.2 Engine (`src/core/engine.ts`)

Orchestrates scene transitions. Holds a reference to the active scene and delegates mount/unmount. Does not touch the DOM directly.

```typescript
class Engine {
  private currentScene: Scene | null = null;
  private state: GameState;

  async transition(to: SceneKey, payload?: unknown): Promise<void>
  // 1. Unmount currentScene (triggers exit animation)
  // 2. Persist state to localStorage
  // 3. Load + mount new scene with payload
}
```

**Scene keys:** `onboarding | decision | attribute_panel | people_panel | annual_review | career_timeline`

Scene transitions are event-driven: scenes dispatch events via `EventBus` (e.g. `decision:option_selected`), the Engine listens and calls `transition()`.

### 4.3 Scene Contract (`src/scenes/`)

Every scene implements the same interface:

```typescript
interface Scene {
  mount(container: HTMLElement, state: GameState, payload?: unknown): Promise<void>;
  unmount(): Promise<void>;   // Returns after exit animation completes
}
```

Scenes are responsible for their own DOM creation and cleanup. They must not retain global state. The container is a single `<div id="scene-root">` in `index.html` that scenes write into and clear on unmount.

### 4.4 Data Loader (`src/data/loader.ts`)

All JSON data is fetched at runtime, not bundled. This keeps the initial JS bundle small and allows hot-swapping data during development.

```typescript
async function loadQuestion(year: number, n: number): Promise<Question>
async function loadNpc(id: NpcId): Promise<NpcDefinition>
async function loadReviewRules(): Promise<ReviewRules>
```

In production (GitHub Pages), JSON files are served as static assets from `data/`. In development, Vite's dev server handles the fetch. No caching layer is needed for Phase 1 — files are small and game sessions are long relative to load time.

### 4.5 EventBus (`src/core/events.ts`)

A lightweight pub/sub for cross-module communication. Scenes emit events; the Engine and other listeners respond. No direct function calls between scenes.

```typescript
// Emitted events (Phase 1)
'decision:option_selected'   // payload: { questionId, optionId }
'panel:open'                 // payload: { panel: 'attributes' | 'people' }
'panel:close'
'review:acknowledged'        // Player has read the annual review
'onboarding:complete'        // payload: { player: PlayerConfig }
```

---

## 5. Logic Layer (`src/logic/`)

All game rules live in pure functions with no side effects. These are the most testable units in the codebase.

### 5.1 Delta Application (`logic/deltas.ts`)

```typescript
function applyStatDeltas(state: GameState, deltas: StatDelta[]): GameState
// Clamps each stat to [0, 100] after applying delta.
// Returns a new GameState object (immutable update).

function applyNpcDeltas(state: GameState, deltas: NpcDelta[]): GameState
// Clamps npcRelationship to [-100, 100].
```

### 5.2 Annual Review (`logic/review.ts`)

Implements the formula from `docs/08_annual_review.md` and `data/review-rules.json`.

```typescript
function computeReviewScore(state: GameState, rules: ReviewRules): number
// 40% attribute aggregate + 30% performance + 20% sponsor + 10% political

function computeScorecard(state: GameState, rules: ReviewRules): Scorecard
// Returns { delivery, visibility, trust, readiness } each as BandKey

function computeOutcome(scorecard: Scorecard): ReviewOutcome
// promoted | hold_stretch | hold_standard | below_line
```

### 5.3 Consequence Query (`logic/consequence.ts`)

```typescript
function hasTag(state: GameState, tag: string): boolean
function countTag(state: GameState, tag: string): number
function hasTagFromQuestion(state: GameState, tag: string, questionId: string): boolean
```

These are the primary branching primitives. Scene renderers call them to determine which narrative variant to display.

---

## 6. Rendering Pipeline

```
GameState
    │
    ▼
Engine.transition(sceneKey)
    │
    ▼
Scene.mount(container, state, payload)
    │
    ├── DataLoader.load*()      → typed JSON
    ├── logic/*()               → derived values
    ├── dom.ts helpers          → createElement, animateBar, fadeIn
    └── tokens.css vars         → CSS custom properties on :root
    │
    ▼
DOM mutations on #scene-root
    │
    ▼
User interaction → EventBus.emit()
    │
    ▼
Engine handles event → state update → transition()
```

There is no reconciliation step. Scenes write HTML strings or create DOM nodes directly. When a scene unmounts it removes its own subtree. This is appropriate for a single-scene-at-a-time app with long user dwell times between transitions.

---

## 7. CSS Architecture

`design/tokens.css` is imported once in `index.html`. It defines all custom properties on `:root` (dark mode default) and `[data-theme="light"]`. Scenes use only these properties — no hardcoded colour values in scene-level CSS.

Scene-level styles are injected as `<style>` tags during `mount()` and removed during `unmount()`. This avoids a global CSS file that requires coordination across scenes.

**Motion rules (from CCO spec):**
- All transitions: 160–220ms `ease-in-out`
- No bounce, no spring, no scale-and-bounce
- Text reveals: opacity only (no translate)
- `@media (prefers-reduced-motion: reduce)` collapses all durations to 0ms

---

## 8. Build & Deploy

### Development
```bash
npm install
npm run dev          # Vite dev server at localhost:5173, HMR enabled
```

### Production build
```bash
npm run build        # Emits to dist/
npm run preview      # Serve dist/ locally before deploy
```

### GitHub Pages deploy
`.github/workflows/deploy.yml` triggers on push to `main`:
1. `npm ci`
2. `npm run build`
3. Push `dist/` to `gh-pages` branch via `actions/deploy-pages`

Vite's `base` config is set to the repo name (`/ascend/`) for correct asset paths on GitHub Pages.

---

## 9. Data Integrity

JSON data files are the source of truth for all game content. They are validated at two points:

**Build time:** A `validate-data.ts` script (invoked as a Vite plugin hook) runs the same schema checks as `src/data/validator.ts` against all files in `data/`. Build fails if any file is malformed.

**Runtime (dev only):** When `import.meta.env.DEV` is true, `loader.ts` runs validation on every fetch result and logs warnings to the console. Production builds skip this to avoid the cost.

**Iron rule enforcement** (from `docs/07_question_bank_y1a.md`): the build-time validator rejects any option in a question file that does not have at least one positive and one negative `statDelta`. This is checked as a schema constraint, not a convention.

---

## 10. Phase 1 Build Sequence (12 Tasks → v0.1.0)

| ID | Task | Depends on |
|----|------|-----------|
| 1.1 | Project scaffold: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html` | 0.17 |
| 1.2 | `src/core/state.ts` + `src/utils/storage.ts` — GameState type + localStorage | 1.1 |
| 1.3 | `src/core/events.ts` — EventBus | 1.1 |
| 1.4 | `src/core/engine.ts` + scene routing | 1.2, 1.3 |
| 1.5 | `src/data/loader.ts` + `validator.ts` | 1.1 |
| 1.6 | `src/logic/deltas.ts` + `src/logic/consequence.ts` + unit tests | 1.2 |
| 1.7 | `src/logic/review.ts` + unit tests | 1.2, 1.6 |
| 1.8 | `src/scenes/onboarding.ts` — playable character creation | 1.4, 1.5 |
| 1.9 | `src/scenes/decision.ts` — Y1 Q1 playable, consequence drawer | 1.4, 1.5, 1.6 |
| 1.10 | All Y1 questions wired (Q2–Q10) + panel scenes | 1.9 |
| 1.11 | `src/scenes/annual_review.ts` — formula reveal + outcome | 1.7, 1.10 |
| 1.12 | Build validation, deploy pipeline, v0.1.0 tag | all |

---

## 11. Constraints & Decisions Log

| Decision | Rationale | Revisit at |
|---|---|---|
| No router library | Single-scene app; Engine handles all transitions | Phase 3 if non-linear navigation needed |
| No state management library | GameState is one flat-ish object; Zustand/Redux would add abstraction with no benefit | Phase 2 if state graph becomes complex |
| JSON over SQLite (WASM) | 4–8KB JSON vs. 500KB SQLite WASM binary for MVP | Phase 3 if save size exceeds 50KB or cross-device sync required |
| No service worker | GitHub Pages caching is sufficient for MVP; adds complexity | Phase 2 if offline play is a requirement |
| No audio | Scope control; narrative weight is carried by writing + typography | Phase 2 |
| Inline scene styles | Avoids coordination cost of a global stylesheet across 6+ scenes | Phase 3 if CSS bundle size becomes a concern |
