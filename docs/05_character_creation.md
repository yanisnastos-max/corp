# ASCEND — Character Creation Spec

**Document:** `docs/05_character_creation.md`
**Version:** 1.0
**Status:** Canonical. Changes require Narrative Lead + Tech Lead sign-off.
**Data files:** `data/backgrounds.json` · `data/traits.json`
**Depends on:** `docs/03_attributes.md` (0.4) · `data/game-state.schema.json` (0.5)
**Unblocks:** Phase 1.5 (Onboarding Wizard build)

---

## Overview

Character creation is a five-step onboarding wizard. It takes roughly four to six minutes. Every step previews its implications in prose — no numbers, no stat bars, no MBTI labels. The player makes five decisions and arrives at a first-day scene that feels personal, not procedural.

The goals:
1. Give the player a character they recognize themselves in, or want to become.
2. Initialize the game state in a way that produces meaningfully different early play.
3. Earn narrative permission — when the game speaks in the player's voice, the player should believe it.

The game does not explain the mechanics during onboarding. It implies them.

---

## Step 1 — Name + Pronouns

**Screen:** Minimal. Two fields. No chrome.

**Fields:**
- **Name** — free text, 1–80 characters. No validation beyond length. The game uses the player's name in direct address and in formal documents (Annual Review, First-Day Letter). It does not use it in moment-to-moment narration (the game uses "you").
- **Pronouns** — free text, 1–40 characters. The game substitutes pronouns in NPC dialogue and the narrator's occasional third-person reference. The engine handles substitution by key: `{{pronoun.subject}}`, `{{pronoun.object}}`, `{{pronoun.possessive}}`, `{{pronoun.reflexive}}`.

**Pronoun parsing:** The engine expects a slash-separated string and assigns left-to-right: `she/her` → subject=she, object=her, possessive=her, reflexive=herself (inferred). Edge cases:
- `they/them` → subject=they, object=them, possessive=their, reflexive=themselves
- `he/him` → subject=he, object=him, possessive=his, reflexive=himself
- Non-standard entries: engine falls back to `they/them` for grammatical safety, without comment.

**UI note:** No dropdown. Free text only. The choice to enumerate pronouns is a content decision, not a technical constraint, and the CCO has declined to enumerate.

**State written:** `player.name`, `player.pronouns`

---

## Step 2 — Background

**Screen:** Seven cards. Each shows: background name, tagline, one short paragraph. Player taps a card to expand it — expanded view shows the starting role and a longer narrative description. No stat numbers visible.

**Selection:** One background only.

**The seven backgrounds:**

| ID | Name | Starting Role | Primary Stat Bonuses |
|----|------|--------------|----------------------|
| `ppe_lse` | PPE at LSE | Associate, Strategy & Policy | Political Awareness +10, Strategic Influence +8 |
| `cs_dropout` | CS Dropout | Associate, Product & Technology | Technical Credibility +15, Adaptive Nerve +10 |
| `engineering_state` | Engineering, State University | Associate, Operations & Product | Execution Discipline +10, Technical Credibility +12 |
| `philosophy_mba` | Philosophy + MBA | Associate, Strategy & Corporate Development | Strategic Influence +10, Market Sense +10 |
| `art_history` | Art History, Somehow | Associate, Brand & Communications | Adaptive Nerve +12, Collaborative Pull +8 |
| `international_student` | International Student (Visa Clock) | Associate, International Markets or Operations | Resilience +12, Political Awareness +5 |
| `apprenticeship_portfolio` | Apprenticeship / Portfolio Kid | Associate, Product Design or Operations | Collaborative Pull +10, Resilience +8 |

Full attribute bonus tables (including secondary bonuses and penalties) are in `data/backgrounds.json` and `docs/03_attributes.md` Appendix B.

**What the player sees on the card (example — PPE at LSE):**

> **PPE at LSE**
> *Politics, Philosophy, Economics at the London School of Economics.*
>
> You studied the architecture of power before you entered any building that had it. You can explain a central bank's decision in three sentences and read a policy document for what it doesn't say. The real education was learning which rooms you were and weren't meant to be in, and how to get into them anyway.

**What is never shown:** Specific stat bonuses, attribute labels, cognitive axis effects.

**State written:** `player.backgroundId`, initializes `attributes.visibleStats` with background bonuses applied to base values.

**Base values before background:** All visible stats start at 30 except Integrity (50) and Reputation (30 — same as others, noted separately because it is always earned).

---

## Step 3 — Traits

**Screen:** A grid of twelve cards. Each card shows the trait's display text (one sentence, behavioral, present-tense) and a selection context (one to two sentences of elaboration). Player picks exactly three. Selected cards highlight. A fourth tap on a selected card deselects it.

**Trait display** — behavioral language only. No psychological labels. No axis names. No percentages.

**The twelve traits:**

| ID | Display Text |
|----|-------------|
| `trait_room_reader` | You read the room before you enter it. |
| `trait_room_presence` | You make the room feel like it started when you arrived. |
| `trait_head_first` | You decide with your head and explain with your heart. |
| `trait_gut_first` | You decide with your gut and trust the logic will follow. |
| `trait_trust_the_plan` | You make the plan and trust the plan. |
| `trait_throw_the_plan` | You make the plan knowing you'll throw it out. |
| `trait_shape_before_pieces` | You see the shape of a problem before you see its pieces. |
| `trait_exact_account` | You want to know exactly what happened before you form a view. |
| `trait_prepared_unnoticed` | You prepare more than the room expected and resent the room for not noticing. |
| `trait_no_precedent` | You are most useful when the situation has no precedent. |
| `trait_process_anchor` | You trust the process when everyone else is improvising. |
| `trait_trust_fast` | You trust people faster than you should and are right more often than you expect. |

**Cognitive axis initialization:** Each trait pushes one or two cognitive axes by ±1 or ±2. The three chosen traits are summed; the result is clamped to [−5, +5]. Final values are written to `attributes.cognitiveAxes`.

Full axis delta table is in `data/traits.json`.

**Three traits also carry a small visible stat bonus** (≤ +3) in addition to axis effects:
- `trait_prepared_unnoticed` → Execution Discipline +3
- `trait_no_precedent` → Adaptive Nerve +3
- `trait_process_anchor` → Execution Discipline +3
- `trait_trust_fast` → Collaborative Pull +3

**Synergy and tension pairs** — documented in `data/traits.json` for future use. In MVP, these are informational only (no mechanical effect from combination). V1.0 may surface subtle narrative reactions to particularly coherent or contradictory trait sets.

**State written:** `player.traitIds` (array of 3), finalizes `attributes.cognitiveAxes`, applies any trait attribute bonuses to `attributes.visibleStats`.

---

## Step 4 — Work-Style Preview

**Screen:** A single prose paragraph. No form fields. No choices. A "Continue" button.

This step reflects the combination of background and traits back at the player in the game's narrative voice. It is the first time the game speaks directly to the player as a character. It should land like recognition.

### Generation Logic

The preview is assembled from three sources:

1. **Background fragment** — each background defines three named fragments: `opening`, `middle`, `closing` (in `data/backgrounds.json`).
2. **Dominant trait fragment** — the trait with the highest `|axis delta|` sum (most opinionated trait) contributes its `workStyleFragment`.
3. **Tension note** — if two or more of the chosen traits appear in each other's `tensionWith` list, a tension note is appended.

**Assembly template:**
```
{background.opening}

{background.middle} {dominant_trait.workStyleFragment}

{background.closing}
{tension_note if applicable}
```

**Example** — Background: PPE at LSE, Traits: trait_room_reader + trait_head_first + trait_trust_the_plan

> You've read about this company, this sector, this moment.
>
> You'll reach for frameworks when instinct would serve better, and be right just often enough that no one tells you to stop. You'll build the right answer and then spend as long again making the room believe it, which you will find deeply unfair and entirely necessary.
>
> The gap between your theory and the room's reality is where you'll do your best work — or your worst.

**Example with tension note** — Background: CS Dropout, Traits: trait_gut_first + trait_throw_the_plan + trait_trust_fast

> You will figure things out faster than people expect and explain them slower than you'd like.
>
> The politics will surprise you — not because you can't see them, but because they keep mattering when they shouldn't. You'll be right before you can explain why, which is either a superpower or a liability depending on whether anyone in the room trusts you yet.
>
> Your best moves will look like technical opinions. They won't always be.
>
> *You make decisions and change them fast. Some people will call this instinct. Others will call it inconsistency. Both will be watching.*

**Tension note templates** — triggered by specific trait conflicts. Written in italics, second person, present tense. Diagnostic, not judgmental.

| Conflict pair | Tension note |
|---|---|
| `trait_room_reader` + `trait_room_presence` | *You notice everything and present as if you noticed nothing. People will read this as either confidence or performance. Both will be useful.* |
| `trait_head_first` + `trait_gut_first` | *You process with your head and your gut simultaneously, which looks like confidence when they agree and like hesitation when they don't.* |
| `trait_trust_the_plan` + `trait_throw_the_plan` | *You build structures and abandon them. The pattern will look like flexibility until it looks like unreliability. The difference is whether you told anyone.* |
| `trait_trust_the_plan` + `trait_no_precedent` | *You want a process and a situation that's never had one. This will produce either an excellent framework or a very detailed map of the wrong place.* |
| `trait_prepared_unnoticed` + `trait_trust_fast` | *You prepare alone and trust quickly, which means your relationships run on optimism and your work runs on data. The gap between these two modes is where surprises live.* |

**State written:** None. This step reads state to generate the preview but writes nothing. It is display-only.

---

## Step 5 — First-Day Letter

**Screen:** A single-column document view. Serif type. AUREL letterhead. "Begin" button at the bottom.

This is the player's final onboarding step and their introduction to the game's voice. The letter is in-fiction — it is a real document in the world of the game. It is meant to feel slightly off: professionally warm in a way that is doing too much work, with bureaucratic subtext the player will learn to read.

### Template

The letter has a fixed structure with variable insertions. Seven background variants exist (keyed by `firstDayLetterVariant` in `backgrounds.json`); each shares the same structure with variant-specific salutation, role reference, and closer.

---

**Template — `formal_welcome` (PPE at LSE)**

---

AUREL London
King's Cross, N1C 4AX
{in_fiction_date: First Monday of September 2034}

**Personal and Confidential**

Dear {player.name},

We are pleased to confirm your appointment as {startingRole} within AUREL's London office. Your induction begins today.

AUREL's London operation occupies a particular position within the firm: close enough to the centre to matter; far enough to think. We expect our people to understand that distinction and to use it.

Your cohort joins at a moment of some consequence. The London team is the firm's regulatory interface for the EU and UK markets — a role that has become considerably more interesting since the AI Governance Compact of 2032. You will encounter decisions here that colleagues in Chicago will not face for another two or three years, if at all. Whether that excites or concerns you is, we suspect, already telling.

A few things we would ask you to hold:

AUREL's stated values are published on our intranet. We encourage you to read them. We also encourage you to observe, over the coming weeks, the distance between what we say and what we do. That distance is not hypocrisy. It is the operating reality of a company at this scale. Learning to work within it, rather than against it, is the first real skill this role will develop in you.

Your line manager, **Dana Sutcliffe**, will meet you at 09:30 in the third-floor collaboration suite. She will not be late.

We look forward to seeing what you make of this.

Yours sincerely,

**Eleanor Tate**
Head of Talent Acquisition, AUREL London
*(On behalf of the London Leadership Team)*

---

**Variant differences by background:**

| Variant | Salutation tone | Role reference | Distinctive closer |
|---|---|---|---|
| `formal_welcome` (PPE at LSE) | Formal, institutional | Strategy & Policy | "We look forward to seeing what you make of this." |
| `informal_welcome` (CS Dropout) | Direct, low-ceremony | Product & Technology | "We hire for what you can build. We'll see what else." |
| `operational_welcome` (Engineering) | Precise, procedural | Operations & Product | "AUREL runs on people who deliver. We expect you to be one." |
| `strategic_welcome` (Philosophy + MBA) | Measured, slightly arch | Strategy & Corporate Dev | "Most people join a company. We'd prefer you join a problem." |
| `creative_welcome` (Art History) | Warmer, disarming | Brand & Communications | "We don't entirely know why this works. We've decided not to interrogate it." |
| `international_welcome` (International Student) | Formal, explicitly welcoming | International Markets | "London is not a stepping stone. Treat it as if it isn't." |
| `portfolio_welcome` (Apprenticeship) | Matter-of-fact, earned-respect tone | Product Design or Operations | "Your work got you here. Your work will keep you here. Nothing else will." |

**State written:** `progress.phase` advances from `onboarding` to `question`. `progress.year` set to 1. `progress.questionNumber` set to 1. `progress.ladderLevel` set to 1. All NPC relationships are initialized to absent (first encounter triggers their addition). `flags.onboarding.completed` set to `true`.

**Transition:** After "Begin" is tapped, the screen fades and the first question loads. No interstitial. No tutorial popup. The game begins.

---

## Implementation Notes

### Axis Summation Example

Player picks: `trait_room_reader` (socialEnergy −2, signalReading +1) + `trait_gut_first` (decisionLens +2, signalReading +1) + `trait_trust_fast` (decisionLens +2, socialEnergy +1)

Summed before clamping:
- socialEnergy: −2 + 1 = −1
- signalReading: 1 + 1 = 2
- decisionLens: 2 + 2 = 4
- operatingStyle: 0

After clamping [−5, +5] — no changes needed here. Final `cognitiveAxes`: `{socialEnergy: -1, signalReading: 2, decisionLens: 4, operatingStyle: 0}`

### Attribute Initialization Order

1. Set all visible stats to base (30). Set Integrity to 50. Set Reputation to 30.
2. Apply background `primaryBonuses` and `secondaryBonuses` (additive, then clamp 0–100).
3. Apply any trait `attributeBonuses` (additive, then clamp 0–100).
4. Compute cognitive axes from selected traits (sum, then clamp −5/+5).
5. Set all pillars to 1.
6. Write full `attributes` object to game state.

### The "Resentment" Design Decision

The CCO has noted that several work-style preview fragments are unflattering ("and resent the room for not noticing", "which you will find deeply unfair"). This is intentional. The game earns the player's trust by being honest about their blindspots before they experience them. Players who feel recognized — including in their less flattering tendencies — play further and care more.

Do not soften these fragments in editing without a written argument for why.

---

## Appendix — Complete Trait Axis Delta Reference

| Trait ID | socialEnergy | signalReading | decisionLens | operatingStyle | Stat Bonus |
|---|---|---|---|---|---|
| `trait_room_reader` | −2 | +1 | 0 | 0 | — |
| `trait_room_presence` | +2 | 0 | +1 | 0 | — |
| `trait_head_first` | 0 | 0 | −2 | +1 | — |
| `trait_gut_first` | 0 | +1 | +2 | 0 | — |
| `trait_trust_the_plan` | 0 | 0 | −1 | +2 | — |
| `trait_throw_the_plan` | 0 | +1 | 0 | −2 | — |
| `trait_shape_before_pieces` | 0 | +2 | 0 | −1 | — |
| `trait_exact_account` | 0 | −2 | 0 | +1 | — |
| `trait_prepared_unnoticed` | −1 | 0 | 0 | +1 | Execution Discipline +3 |
| `trait_no_precedent` | 0 | +1 | 0 | −2 | Adaptive Nerve +3 |
| `trait_process_anchor` | 0 | 0 | −1 | +2 | Execution Discipline +3 |
| `trait_trust_fast` | +1 | 0 | +2 | 0 | Collaborative Pull +3 |

**Design note:** Most trait combinations produce axes in the ±3 range. A player who deliberately chooses three complementary traits can reach ±4 or ±5 on a single axis at creation — for example, `trait_gut_first` + `trait_trust_fast` + `trait_room_presence` produces `decisionLens +5` (the most relational fingerprint possible). This is intentional: players who know what they are can commit to it from the start. The cost is leaving other axes near 0 and foregoing the breadth that comes from a more varied trait set. ±5 at creation is a valid and expressive choice, not an exploit.

---

*End of document. Data files: `data/backgrounds.json` · `data/traits.json`*
