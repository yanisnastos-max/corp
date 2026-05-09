# ASCEND — Game State Schema

**Document:** `docs/04_state_schema.md`
**Version:** 1.0
**Status:** Canonical. Changes require Tech Lead sign-off.
**Schema file:** `data/game-state.schema.json`
**Depends on:** `data/attributes.schema.json` (doc 0.4)
**Unblocks:** 0.17 (Architecture Doc), Phase 1.3 (Routing + State Store)

---

## Purpose

This document explains the game state design: what is stored, why it's structured that way, and how the parts interact. The schema file is the machine-readable spec; this document is the human-readable rationale. A developer should be able to implement the state store from these two documents alone, without asking anyone anything.

---

## 1. Design Principles

**1. The save fires after every choice. There is no undo.**
Every `questionHistory` entry is written the moment a choice is committed. The schema enforces this by making `questionHistory` append-only and stamping `answeredAt` at write time.

**2. The queue is the game's memory.**
The `consequenceQueue` is how the game keeps promises. When a choice pushes a tag (`seen_by_sponsor`, `burned_peer`), the consequence is written to the queue immediately. It fires later — sometimes much later. The queue survives save/load cycles unchanged. If the queue is empty after Year 3, the game has no texture.

**3. Store facts, derive labels.**
Relationship bands (`cold`/`warm`/`trusted`) are computed from `score` at read time — they are not stored. Ending eligibility is computed from attribute history and flags at Annual Review time — it is not stored (except as the computed result in `progress.endingPath`). This keeps the schema narrow and prevents stale derived state.

**4. Hidden is structural, not presentational.**
Pillar and cognitive axis values are hidden from the player by design. This is not a UI decision — it is a content decision. The schema encodes it: `hidden: true` on any `statDelta` involving these keys signals to the engine that the Consequences Drawer should not surface it. Pillar values are never in the visible stats block.

**5. The schema version gates migration.**
`meta.schemaVersion` uses semver. When the schema changes, the loader checks the version and runs migration scripts before hydrating the store. A save written at `1.0.0` must be loadable at `1.2.0` without data loss.

---

## 2. Top-Level Structure

```
GameState
├── meta              — save metadata, versioning, telemetry consent
├── player            — immutable profile (name, pronouns, background, traits)
├── progress          — current game position (phase, year, level, track)
├── attributes        — live attribute state (visibleStats, pillars, cognitiveAxes)
├── attributeHistory  — year-end snapshots for Career Timeline + diff view
├── npcRelationships  — per-NPC relationship score, arc beats, flags
├── consequenceQueue  — pending consequences waiting to fire
├── questionHistory   — append-only record of every choice made
├── annualReviews     — append-only record of every completed review
└── flags             — global key-value game state flags
```

The full state is one JSON object. It is stored as a single `localStorage` key (`ascend_save_v1`) and exported as a single `.json` file. There is no relational structure, no normalized tables, no foreign key resolution at runtime — the game is small enough that flat JSON is the right call.

---

## 3. Section Reference

### 3.1 `meta`

Housekeeping only. The fields the engine cares about:

- `schemaVersion` — checked on load. If major version mismatch, halt and prompt the player to contact support. Minor version mismatch → run migration silently.
- `lastSavedAt` — updated every time `questionHistory` is written to. The UI can surface "last saved X minutes ago" from this.
- `totalPlaytimeSeconds` — incremented by a background timer while the game tab is active and unpaused. Used for opt-in telemetry completion-rate analysis.
- `telemetryConsent` — defaults `false`. Only set to `true` after the player explicitly opts in during onboarding.

### 3.2 `player`

Set once during onboarding. **Never mutated.** If the engine ever writes to `player` after onboarding completes, that is a bug.

- `traitIds` — exactly 3, from a pool of 12. These initialize cognitive axis values at game start. See `data/traits.json` (doc 0.6).
- `pronouns` — free text. The narrative engine uses these for substitutions in question text and NPC dialogue. Engine must handle arbitrary inputs gracefully — do not enumerate pronouns.

### 3.3 `progress`

The routing layer reads `progress.phase` to determine which screen to render. Valid transitions:

```
onboarding → question
question → question          (next Q in same year)
question → annual_review     (after Q10 is answered)
annual_review → year_end_opportunity
year_end_opportunity → question  (next year, Q1)
year_end_opportunity → ended     (if Year 12 is complete)
```

`progress.conditionalPromotion` stays `true` until the next Annual Review fires any promotion outcome (including a second conditional). It affects:
- Annual Review scene dialogue (Dana references the prove-it year)
- Determination pillar accumulation (+3 if the conditional resolves to full Promoted)
- Scorecard band calculation (Readiness band is automatically one step lower when conditional is active)

### 3.4 `attributes`

Inlined from `attributes.schema.json` rather than `$ref`-linked, because the game state must be self-contained for save/load. The schema file is the canonical type definition; the game state file is the live value.

**Write order for attribute updates:**
1. Retrieve base delta from question choice
2. Apply Resilience mitigation (if consequence tag is `minor_setback` or `reputation_hit_minor` and Resilience ≥ 50)
3. Apply Collaborative Pull modifier (if `npcDelta` involves a peer NPC and Collaborative Pull ≥ 50)
4. Clamp: floor at 0, ceil at 100 (visible stats); floor at 1, ceil at 40 (pillars); floor at -5, ceil at 5 (axes)
5. Write to `attributes`
6. Write to `questionHistory`
7. Trigger consequence queue evaluation

### 3.5 `attributeHistory`

Snapshot taken once per Annual Review, immediately after compensation is computed (so the snapshot reflects the year's play, not post-review adjustments). Used by:

- **Career Timeline** — renders year-by-year stat changes as a horizontal ribbon
- **Save-state diff view** — "what changed in the last decision" compares current `attributes` against the most recent `attributeHistory` entry

Do not snapshot mid-year. One entry per completed year.

### 3.6 `npcRelationships`

Keyed by `npcId`. NPCs are added to this map at first encounter — prior to introduction, an NPC has no entry. The engine must handle missing entries gracefully (return `null`, not throw).

**Relationship score write order:**
1. Retrieve base `npcDelta`
2. Apply Collaborative Pull modifier: if Collaborative Pull ≥ 75, multiply positive deltas by 1.5 (cap at 30 per interaction)
3. Apply Social Energy axis modifier: ±15% to growth rate for compatible/incompatible NPC types
4. Clamp: floor at 0, ceil at 100
5. Write score
6. Update `lastInteractionYear`
7. Evaluate `activeConsequenceTags` against new score (trigger any `npc_threshold` consequences that are now met)

**`arcBeatsCompleted`** — arc beats are defined in the NPC Bible (docs 0.7–0.9). Each beat is a string ID (e.g. `dana.y1.first_review_trust`, `sofia.y3.question_asked`). When a beat fires, append its ID here. Used by the narrative engine to gate later NPC-specific content.

**`npcRelationships` unrecoverable states:** When `integrity` drops below 40, certain NPC flags are set permanently. The engine checks this on every integrity write:
- If `integrity < 40` AND any mentor or trusted-ally NPC has score ≥ 70: set `{permanent_faith_lost: true}` on those NPCs. Score cannot exceed 55 for these NPCs from this point.

### 3.7 `consequenceQueue`

The most important part of the state. Mishandling this is how the game becomes flat.

**Queue discipline:**
- Tags are pushed at question-answer time. The payload is fully resolved at push time (not deferred).
- The consequence engine evaluates the queue at three points:
  1. **After every question** — checks for `immediate` triggers and `stat_threshold` triggers (uses current `attributes`)
  2. **At Annual Review start** — checks for `year_offset` triggers (current year matches `sourceYear + yearsFromNow`)
  3. **After every NPC relationship write** — checks for `npc_threshold` triggers against the updated NPC score
- `fired` is set to `true` and `firedYear` is recorded when a consequence resolves. The entry is never deleted (it backs the save-state diff view and Journal)
- Maximum consequence queue depth: no hard limit in schema, but content designers should target ≤ 30 unfired consequences at any time. Queue bloat is a content quality issue, not an engine issue.

**Tag taxonomy** (for content writers):

| Category | Tags | Notes |
|---|---|---|
| Relationship | `seen_by_sponsor`, `burned_peer`, `coalition_builder` | Affect NPC deltas when fired |
| Integrity | `integrity_debt_minor`, `integrity_debt_major` | Minor: −3 Integrity. Major: −8 Integrity AND sets `story.integrity.debt.major: true` |
| Opportunity | `latent_offer`, `horizon_labs_contact` | Gate external offer visibility |
| Narrative | `high_cost_high_fidelity`, `systemic_read`, `open_inquiry`, `risk_catch` | Feed pillar accumulation logic |
| Reputation | `reputation_hit_minor`, `reputation_hit_major` | Mitigated by Resilience |
| Setback | `minor_setback`, `major_setback` | Mitigated by Resilience |
| Track | `track_product`, `track_commercial`, `track_cto` | Contribute to `careerTrack` evaluation |
| Flag | `reliability_concern` | Sets Annual Review flag regardless of relationship score |

### 3.8 `questionHistory`

Append-only. Written the instant a choice is committed. The engine must write this before any other state update — if the write fails, nothing else updates. This is the save.

The `innerMonologue` field stores the one-line player-facing consequence note. It is pulled from the question content file at answer time and stored here for the Journal, which reconstructs the play history from this array alone.

### 3.9 `annualReviews`

One entry per completed year. Append-only.

**Compensation calculation:**
```
total = base_salary
      × (1 + (attributeAggregate × 0.40
             + performanceScore × 0.30
             + sponsorStrength × 0.20
             + politicalCapital × 0.10) / 100 × performance_multiplier)
```

`base_salary` is defined in `data/economy-model.xlsx` (doc 0.13 Economy Model — separate task) by ladder level and year. The schema records `totalAmount` as the output; the formula breakdown is stored for the diff view only.

**Promotion engine sequence:**
1. Evaluate all gating thresholds for `ladderLevel + 1` (from Appendix C of `docs/03_attributes.md`)
2. Evaluate `scorecardBands` from current attribute values and year's question history
3. If all gates met AND Delivery = "likely" or above AND Trust ≥ "in_discussion" AND Readiness ≥ "in_discussion": outcome = "promoted"
4. If gates met but any band is "below_line": outcome = "promoted_conditionally"
5. Otherwise: outcome = "not_promoted" with the specific failed gate surfaced as `promotionReason`
6. Resilience ≥ 75 suppresses the comp penalty from a "not_promoted" year (treated as neutral, not negative)

### 3.10 `flags`

Free-form key-value. The engine reads and writes flags during question evaluation, consequence resolution, and Annual Review. Content writers push flag operations in consequence payloads; the engine sets feature-unlock flags automatically based on stat thresholds.

**Naming convention:**
```
<domain>.<subdomain>.<specific>
```
Examples:
- `story.sofia.sentience_acknowledged`
- `ending.ethical_compass.eligible`
- `track.product.engaged`
- `feature.bold_plays.unlocked`
- `world.horizon_labs.visible`
- `review.y01.reliability_concern_raised`

**Feature flag automation:** These flags are computed and set by the engine at every attribute write — content writers do not set them manually:

| Flag | Set when |
|---|---|
| `feature.bold_plays.unlocked` | `adaptiveNerve` ≥ 40 |
| `feature.external_offers.visible` | `adaptiveNerve` ≥ 55 |
| `feature.external_offers.selectable` | `adaptiveNerve` ≥ 65 |
| `feature.senior_table_questions.unlocked` | `politicalAwareness` ≥ 85 |
| `feature.client_npcs.unlocked` | `marketSense` ≥ 55 |
| `feature.sofia_sentience_thread.unlocked` | `integrity` ≥ 50 |
| `feature.sofia_final_arc.unlocked` | `integrity` ≥ 85 |
| `feature.trusted_advisor_tier.unlocked` | `integrity` ≥ 70 AND `collaborativePull` ≥ 65 |

---

## 4. Save / Load Cycle

**Saving:**
The game saves automatically after every question answer. There is no manual save, no cloud sync in MVP, no multiple save slots. One `localStorage` key, one JSON object.

Export is available via UI: `JSON.stringify(gameState)` written to a downloadable `.json` file. The filename convention is `ascend_save_{saveId_first8chars}_{year}_{questionNumber}.json`.

**Loading:**
1. Parse `localStorage.getItem('ascend_save_v1')`
2. Validate against `game-state.schema.json` using a build-included validator (ajv or similar)
3. Check `meta.schemaVersion` against current schema version
4. If major version differs: halt, prompt player
5. If minor version differs: run migration chain silently
6. Hydrate store
7. Route to screen based on `progress.phase`

**Import:**
File picker → parse JSON → validate → migrate if needed → hydrate. The imported save replaces the current `localStorage` state entirely.

---

## 5. State Store Implementation Notes

The custom immutable store (see Phase 1.3 in `01_Task_Plan.md`) should implement:

```typescript
interface StateStore {
  getState(): GameState;
  dispatch(action: StateAction): void;
  subscribe(listener: () => void): () => void;  // returns unsubscribe
}
```

All state mutations go through `dispatch`. Actions are the atomic unit — one action per question answer, one action per consequence firing, one action per Annual Review stage. The event log (for the save-state diff view) is the action history.

Selectors that compute derived values (relationship band from score, ending eligibility, scorecard bands) live outside the store in a `selectors.ts` module. They are pure functions over `GameState`. They are never called inside reducers.

---

## 6. What Is Not In This Schema

Intentionally excluded:

- **Question content** — lives in `data/questions/year*/q*.json` (docs 0.10–0.11). The schema stores which questions were answered and what choices were made, not the question text.
- **NPC profiles** — live in `data/npcs/tier*/*.json` (docs 0.7–0.9). The schema stores relationship scores and arc beat progress, not NPC backstory or voice.
- **Economy model** — compensation bands by level/year live in `data/economy-model.xlsx`. The schema stores the computed `totalAmount`, not the model.
- **UI state** — which panels are open, which tab is active, scroll position. This is session state, not save state. Lives in a separate `UIStore` that is never persisted.
- **Computed/derived values** — relationship bands, ending eligibility, promotion gate pass/fail. Computed at read time from stored values.

---

*End of document. Schema file: `data/game-state.schema.json`*
