# ASCEND — Incremental Task Plan

**Principle:** No task is allowed to be so large it cannot be completed in one focused session. If a task is "build the whole NPC bible," it gets sliced. If it's "design the whole UI," it gets sliced. We ship in slices that each leave the project in a more usable state than they found it.

This is intentional. The CCO brief was explicit: *avoid a massive task that is interrupted due to missing credits.* So every task here is independently completable, has a clearly defined deliverable, and the project remains coherent even if work pauses immediately after.

---

## How to read this plan

Each task has:
- **ID** — stable handle for cross-referencing
- **Deliverable** — a specific file or set of files
- **Dependencies** — what must exist first
- **"Done" definition** — how we know the task is complete
- **Size** — S (one focused session) / M (a full day's work) / L (split this further before starting)

If a task is L, **stop and slice it** before claiming it.

---

## Phase 0 — Foundation Documents

These are the pre-development assets. Each is its own task. Each is independently shippable. Each is recoverable if interrupted because every task produces a complete document, not a partial one.

### 0.1 Vision & Tone Style Guide
- **Deliverable:** `docs/00_vision_and_tone.md` (3–5pp)
- **Contents:** the Galloway/Godin test, banned phrases ("synergy," "circle back," "pivot"), allowed sentence shapes, tone exemplars, the "if a 28-year-old PM doesn't smirk, rewrite" rule.
- **Dependencies:** `00_CCO_Decision_Memo.md` (done).
- **Size:** S

### 0.2 World Bible — 2024–2034 Timeline
- **Deliverable:** `docs/01_world_bible.md` (15–25pp)
- **Contents:** macro-economic landscape · technology culture · Big Tech in 2034 · London in 2034 · workplace psychology. **No company-specific lore** (that's a separate doc).
- **Dependencies:** 0.1.
- **Size:** M. If it grows past 25pp, slice into `01a_macro` and `01b_culture`.

### 0.3 Company Bible — AUREL
- **Deliverable:** `docs/02_company_bible.md` (12–18pp)
- **Contents:** founder myth · origin · HQ vs London · stated values vs unwritten rules table · 12-level ladder with distinguishing tests · five corporate legends.
- **Dependencies:** 0.2.
- **Size:** M

### 0.4 Attribute Dictionary
- **Deliverable:** `docs/03_attributes.md` + `data/attributes.schema.json`
- **Contents:** all 10 visible stats · 4 long-arc pillars · 4 hidden cognitive axes. Per-stat: range, what it means, mechanical effect, gating thresholds, MBTI/Zehnder mapping.
- **Dependencies:** 0.1.
- **Size:** S

### 0.5 Game State JSON Schema
- **Deliverable:** `data/game-state.schema.json` + `docs/04_state_schema.md`
- **Contents:** every variable, typed, with constraints. Player profile · stats · NPC relationships · consequence queue · question history · compensation history · flags.
- **Dependencies:** 0.4.
- **Size:** S

### 0.6 Character Creation Spec
- **Deliverable:** `docs/05_character_creation.md` + `data/backgrounds.json` + `data/traits.json`
- **Contents:** 7 backgrounds (with attribute deltas) · 12 behavioral traits (each with hidden MBTI mapping) · 5-step onboarding flow · "first-day letter" template.
- **Dependencies:** 0.4.
- **Size:** M

### 0.7 NPC Bible — Tier 1 (the MVP 5)
- **Deliverable:** `docs/06_npc_bible_tier1.md` + `data/npcs/tier1/*.json`
- **Contents:** 5 fully-specified NPCs for MVP Year 1: **Dana Sutcliffe** (line manager), **Zara Okafor** (rival), **Leo Chen** (peer), **Grace Oduya** (support), **Sofia** (Wildcard / Vox AI). Each: public role · private goal · contradiction · voice · arc beats · threshold unlocks.
- **Dependencies:** 0.3.
- **Size:** M

### 0.8 NPC Bible — Tier 2 (the V1 cast, batch A)
- **Deliverable:** `docs/06_npc_bible_tier2a.md` + `data/npcs/tier2a/*.json`
- **Contents:** 10 more NPCs — both Sponsors (Priya Menon, Mara Velez), 2 more Rivals, 2 more Managers, 1 Mentor (Dr. Ruth Abara), 3 Peers.
- **Dependencies:** 0.7.
- **Size:** M

### 0.9 NPC Bible — Tier 2 (batch B)
- **Deliverable:** `docs/06_npc_bible_tier2b.md` + `data/npcs/tier2b/*.json`
- **Contents:** the remaining 10 NPCs — 1 Mentor, 3 Direct Reports, 3 Clients, 1 Wildcard, 1 Support.
- **Dependencies:** 0.8.
- **Size:** M

### 0.10 Question Bank — Year 1, Q1–Q5
- **Deliverable:** `data/questions/year1/q01.json` … `q05.json` + `docs/07_question_bank_y1a.md`
- **Contents:** 5 fully-written questions (setup 100–200w, 4 options 20–40w each, 2–4 attribute deltas per option, hidden tags, locking conditions). Year-1 narrative arc covered: Q1–Q2 orientation, Q3 first test, Q4 first relationship turning point, Q5 escalation.
- **Dependencies:** 0.4, 0.7.
- **Size:** M

### 0.11 Question Bank — Year 1, Q6–Q10
- **Deliverable:** `data/questions/year1/q06.json` … `q10.json` + `docs/07_question_bank_y1b.md`
- **Contents:** 5 more questions. Q6–Q7 escalation/political compression, Q8 pre-review pressure, Q9 relationship strain, Q10 climax that determines the year's promotion outcome.
- **Dependencies:** 0.10.
- **Size:** M

### 0.12 Annual Review System Spec
- **Deliverable:** `docs/08_annual_review.md` + `data/review-rules.json`
- **Contents:** compensation formula (40/30/20/10) · promotion outcome rules · scorecard 4-band logic · three-lane opportunity matrix · sample review scene (Dana Sutcliffe, end-of-Y1).
- **Dependencies:** 0.4, 0.7.
- **Size:** M

### 0.13 Visual Design Tokens
- **Deliverable:** `design/tokens.json` + `design/tokens.css`
- **Contents:** color palette · type scale (Inter / Source Serif 4 / JetBrains Mono) · motion tokens · spacing scale · z-index scale · dark + light mode pairs.
- **Dependencies:** 0.1.
- **Size:** S

### 0.14 UX Wireframes — Decision Screen + Onboarding
- **Deliverable:** `design/wireframes/decision_screen.html` + `design/wireframes/onboarding.html` (interactive HTML mockups; no game logic)
- **Contents:** the two highest-stakes screens. Hover states, focus states, transitions, mobile breakpoints.
- **Dependencies:** 0.13.
- **Size:** M

### 0.15 UX Wireframes — Attribute Panel + People Panel
- **Deliverable:** `design/wireframes/attribute_panel.html` + `design/wireframes/people_panel.html`
- **Contents:** drawer + constellation map. Constellation has a sortable list alternative.
- **Dependencies:** 0.13, 0.14.
- **Size:** M

### 0.16 UX Wireframes — Annual Review + Career Timeline
- **Deliverable:** `design/wireframes/annual_review.html` + `design/wireframes/career_timeline.html`
- **Contents:** the ceremonial review and the post-hoc memoir.
- **Dependencies:** 0.13, 0.14.
- **Size:** M

### 0.17 Tech Architecture Doc
- **Deliverable:** `docs/09_architecture.md` + repo skeleton (folders only, no logic)
- **Contents:** layers (content / state / engine / rendering) · folder structure · build pipeline · CI/CD · the JSON-vs-Ink decision rationale.
- **Dependencies:** 0.5.
- **Size:** S

---

## Phase 1 — MVP Build (after Phase 0 documents are signed off)

Each task here results in a runnable build. We deploy to a staging Pages URL after every task. If the deploy is broken, the task isn't done.

### 1.1 Project Scaffold
- **Deliverable:** Vite + TypeScript project bootstrapped, `pnpm dev` works, GitHub Pages auto-deploy via Actions on `main`.
- **Done when:** a "Hello AUREL" page is live on the Pages URL.
- **Size:** S

### 1.2 Design System Foundation
- **Deliverable:** `tokens.css` imported, base typography styles, dark mode default, light mode toggle.
- **Done when:** a `/design-system` page renders the type scale, palette, and motion tokens correctly.
- **Size:** S

### 1.3 Routing + State Store
- **Deliverable:** lightweight router (URL drives screen), GameState store with reducers and event log, localStorage persistence + JSON export/import.
- **Done when:** state survives reload; export gives a JSON file; import restores it.
- **Size:** M

### 1.4 Content Loader + Schema Validator
- **Deliverable:** at-build-time JSON schema validation for questions, NPCs, backgrounds, traits. Loader produces typed objects.
- **Done when:** invalid content fails the build with a useful error.
- **Size:** S

### 1.5 Onboarding Wizard (5 steps)
- **Deliverable:** name → background → traits → work-style preview → first-day letter. State written to GameState.
- **Done when:** onboarding produces a fully-initialized character ready for Y1Q1.
- **Size:** M

### 1.6 Decision Screen — single question
- **Deliverable:** renders Y1Q1, accepts a choice, writes deltas, opens consequences drawer with one-line internal monologue.
- **Done when:** a single question round-trip works end-to-end.
- **Size:** M

### 1.7 Question Runner — Year 1, all 10 questions
- **Deliverable:** sequencer that runs Y1Q1 → Y1Q10 with locking conditions evaluated. Consequence queue accumulates.
- **Done when:** a full year of 10 questions plays through.
- **Size:** M

### 1.8 Attribute Panel (read-only)
- **Deliverable:** drawer with 10 visible stats as text-led bars + 4 pillar rings. Hover shows numeric value.
- **Done when:** stats update correctly after each choice; bar animations match motion tokens.
- **Size:** S

### 1.9 People Panel (MVP — list view first)
- **Deliverable:** sortable list of the 5 active NPCs with relationship score, last interaction, threshold band. **Constellation map deferred to V1.0.**
- **Done when:** scores update correctly after questions that affect them.
- **Size:** S

### 1.10 Annual Review Screen
- **Deliverable:** ceremonial scene with Dana Sutcliffe. Compensation reveal · promotion outcome (one of three) · three-lane opportunity stub.
- **Done when:** the scene reads cinematically and the comp number matches the formula.
- **Size:** M

### 1.11 Polish Pass + Accessibility Audit
- **Deliverable:** keyboard navigation works on every screen · ARIA roles correct · reduced-motion respected · color contrast WCAG AA · reading-mode toggle live.
- **Done when:** an axe-core run is clean and a keyboard-only playthrough completes.
- **Size:** M

### 1.12 MVP Release
- **Deliverable:** tagged `v0.1.0` on GitHub Pages production URL. README updated. CHANGELOG started.
- **Done when:** a stranger can play it from a link.
- **Size:** S

---

## Phase 2 — V1.0 (after MVP is in players' hands)

Each is its own slice; do not bundle.

- **2.1** Constellation map for People Panel (replaces list view as default; list remains as accessibility alternative)
- **2.2** Year 2 question bank (10 questions)
- **2.3** Year 3 question bank (10 questions)
- **2.4** NPC Tier 2 batch A wired in (10 more NPCs active)
- **2.5** NPC Tier 2 batch B wired in (final 10)
- **2.6** Three-lane opportunity system fully implemented (real cross-year consequences)
- **2.7** Career Timeline UI
- **2.8** Cross-year consequence resolution engine
- **2.9** Journal / story log
- **2.10** World Panel (narrative streams feed)
- **2.11** Save-state diff view
- **2.12** Anonymous opt-in telemetry
- **2.13** V1.0 release

---

## Phase 3 — V2.0 (mid-career expansion)

- **3.1** Year 4 question bank · **3.2** Year 5 · **3.3** Year 6 · **3.4** Year 7
- **3.5** Direct reports mechanic (3 NPCs unlock as reports)
- **3.6** External offer system (Horizon Labs etc.)
- **3.7** NPC arc resolution engine (characters leave, return, change)
- **3.8** Ambient audio layer (optional)
- **3.9** V2.0 release

---

## Phase 4 — V3.0 (full game)

- **4.1–4.5** Year 8–12 question banks (one per task)
- **4.6** Endings engine — 6–8 distinct paths
- **4.7** New Game+ (replay reveals hidden information)
- **4.8** Community question PR pipeline + moderation rules
- **4.9** Localization — Simplified Chinese
- **4.10** Localization — German
- **4.11** Localization — Japanese
- **4.12** V3.0 release

---

## What this plan deliberately does NOT include

- A single "build the entire game" task. That task does not exist here. By design.
- A single "write all 25 NPCs" task. Sliced into Tier 1, Tier 2A, Tier 2B.
- A single "write the year" task. Sliced into Q1–Q5 and Q6–Q10.
- A single "design all screens" task. Sliced into three wireframe pairs.
- A single "build the game logic" task. Sliced into 12 small slices in Phase 1.

If during execution any task feels like it can't be finished in one focused session, **stop and slice it** before continuing.

---

## Recommended next action

Start with **0.1 Vision & Tone Style Guide.** It's small, it unblocks the most other tasks, and it lets the team lock in voice before producing content that has to match it.

After 0.1, the natural sequence is:
1. 0.1 Vision & Tone
2. 0.2 World Bible
3. 0.3 Company Bible
4. 0.4 Attribute Dictionary (parallelizable with 0.2/0.3)
5. 0.5 State Schema (after 0.4)
6. 0.6 Character Creation (after 0.4)
7. 0.7 NPC Bible Tier 1 (after 0.3)
8. 0.10–0.11 Year 1 Questions (after 0.7 + 0.4)
9. 0.12 Annual Review (after 0.10–0.11)
10. 0.13 Design Tokens
11. 0.14–0.16 Wireframes
12. 0.17 Architecture
13. → enter Phase 1.
