# ASCEND — Attribute Dictionary

**Document:** `docs/03_attributes.md`
**Version:** 1.0
**Status:** Canonical. Changes require CCO sign-off.
**Unblocks:** 0.5 (State Schema), 0.6 (Character Creation), 0.10–0.11 (Year 1 Questions)

---

## Overview

ASCEND tracks three layers of player identity through numbers the player never fully understands:

1. **10 Visible Stats** — the professional surface. The player sees these. They move with every choice. They feel like a performance review.
2. **4 Long-Arc Pillars** — the executive substrate. Hidden. Slow-growing. Gate the very top of the ladder. Named after the Egon Zehnder leadership framework because AUREL uses that framework and the game doesn't pretend otherwise.
3. **4 Cognitive Axes** — the behavioral fingerprint. Set during character creation; nudged by play. Never labeled. The player sees their consequences, not their name.

The design intent: the visible stats feel like the game, the pillars feel like fate, and the axes feel like personality. Only the stats should feel gameable. The rest should feel true.

---

## Part I — 10 Visible Stats

All visible stats: **range 0–100, integer, floored at 0, capped at 100.**

Each stat has five narrative bands the game uses internally to flavor reactions and unlock options. The bands are never shown as labels — only the number is shown (on hover).

| Band | Range | Internal label |
|------|-------|----------------|
| 1 | 0–24 | Underdeveloped |
| 2 | 25–49 | Functional |
| 3 | 50–69 | Capable |
| 4 | 70–84 | Distinguished |
| 5 | 85–100 | Exceptional |

---

### 1. Political Awareness

**One-line definition:** Knowing what's actually being said.

**Narrative meaning:** The gap between what people say in meetings and what they mean. High Political Awareness doesn't make you cynical — it makes you accurate. Low Political Awareness is not innocence; it is expense.

**Mechanical effects:**
- Gates "read between the lines" dialogue options — alternate interpretations of NPC statements that reveal hidden agendas or unstated concerns.
- At 50+: unlocks the ability to detect when a question is politically loaded (flagged in the setup text with a subtle tell).
- At 70+: unlocks NPC subtext reveals — a sentence beneath certain NPC dialogue showing what they actually want.
- At 85+: unlocks senior-table questions in Years 5+ (questions that only surface when you can survive the room).

**Anno Review contribution:** Indirect — affects Sponsor Strength calculation by improving sponsor NPC relationship growth rate.

**Starting range by background:**
- PPE at LSE: +10
- Philosophy + MBA: +8
- International Student (Visa Clock): +5 (heightened vigilance)
- CS Dropout: −5 (institutional naivety)

**What increases it:** Choices that prioritize observation over action; attending political scenarios without intervening; correctly reading NPC motivations.

**What decreases it:** Consistently misreading rooms; choosing blunt-force options when finesse was available and paid off for peers.

**Zehnder / MBTI cross-reference:** Correlates with Insight pillar (slow accumulation). Signal Reading axis (N-pole) amplifies Political Awareness gains from narrative questions.

---

### 2. Strategic Influence

**One-line definition:** Whether your opinion changes the outcome.

**Narrative meaning:** The ability to shape decisions made by people above you without being in the room. Low Strategic Influence means your contributions are noted and set aside. High Strategic Influence means your framing of a problem becomes the room's framing.

**Mechanical effects:**
- Gates "senior table" question variants — reworded versions of standard questions that reflect a player whose input is solicited rather than tolerated.
- At 50+: unlocks Strategic Influence checks in Annual Review — manager references your contributions to their own decisions.
- At 70+: unlocks the ability to pre-frame Annual Review questions (an option appears in Q8–Q9 to shape the narrative going into the review).
- At 85+: enables the "Sponsor Escalation" lane in Three-Lane Opportunity (sponsors only go to bat for players they believe others will follow).

**Annual Review contribution:** 20% weighting in the attribute aggregate component of comp formula, alongside Execution Discipline and Reputation.

**Starting range by background:**
- PPE at LSE: +8
- Philosophy + MBA: +10
- Art History, Somehow: +5 (accidental reframing instinct)

**What increases it:** Successfully shaping outcomes through indirect influence; being credited in NPC decisions; choosing options that plant ideas rather than assert positions.

**What decreases it:** Being overruled repeatedly; choosing direct confrontation over indirect shaping; burning sponsor relationships.

---

### 3. Collaborative Pull

**One-line definition:** Whether people want to work with you specifically.

**Narrative meaning:** Not likability — leverage. High Collaborative Pull means people volunteer for your projects, stay late on your deadlines, and carry your name into rooms you're not in. Low Collaborative Pull means you do good work that helps someone else take credit for it.

**Mechanical effects:**
- Drives peer NPC relationship score growth rate (+25% growth per positive peer interaction at 50+; +50% at 75+).
- At 60+: unlocks team-support options — NPC peers offer to take tasks or cover for you before you ask.
- At 70+: direct reports (Y4+) start with higher baseline relationship scores.
- At 85+: unlocks "Coalition" consequence tag — choices tagged `coalition_builder` compound across years.

**Annual Review contribution:** Indirect — feeds into Sponsor Strength via peer advocacy signals.

**Starting range by background:**
- Apprenticeship / Portfolio Kid: +10 (built on mutual-aid culture)
- Engineering, State Uni: +5
- Art History, Somehow: +8

**What increases it:** Choices that help peers without explicit reciprocity; taking less credit; making others look good in visible moments.

**What decreases it:** Credit-claiming at a peer's expense; ghosting NPC requests; using team wins as personal capital.

---

### 4. Resilience

**One-line definition:** How far you bounce back, and how fast.

**Narrative meaning:** Not toughness — elasticity. The game's most unfair stat in the player's favor: it doesn't prevent bad outcomes, it limits their duration. High Resilience means a public failure is a plot point. Low Resilience means it becomes a character definition.

**Mechanical effects:**
- Mitigates negative consequence severity: consequence tags `minor_setback` and `reputation_hit_minor` reduce to 50% effect at Resilience 50+; 25% at 75+.
- Accelerates recovery: "recovery clock" for negative consequence tags (the number of future questions before the tag expires) is reduced by 1 at Resilience 40+, by 2 at 70+.
- At 60+: unlocks "Reframe" dialogue options — converting visible failures into self-deprecating wit that raises Reputation by 2 instead of lowering it.
- At 85+: unlocks the "Survivor" arc variant — a secondary narrative path available to players who've absorbed significant damage without breaking.

**Annual Review contribution:** Indirect — high Resilience suppresses the comp penalty from a bad year. The formula treats a "below expectations" year as neutral if Resilience is 75+.

**Starting range by background:**
- International Student (Visa Clock): +12 (structural adversity baked in)
- Apprenticeship / Portfolio Kid: +8
- PPE at LSE: −5 (insulated early)

**What increases it:** Choosing to continue after setbacks without retaliating; choosing options that require accepting blame; deferring grievance.

**What decreases it:** Retaliatory choices; escalating minor conflicts; visible emotional dysregulation in high-stakes scenes.

---

### 5. Execution Discipline

**One-line definition:** You said you would, and you did.

**Narrative meaning:** The most unsexy stat and the most load-bearing one. In the game's world, execution is table stakes for junior levels and increasingly rare at senior ones. High Execution Discipline doesn't make you interesting — it makes you safe. The game rewards players who pair it with other stats rather than hoarding it.

**Mechanical effects:**
- Primary gate for performance score in Annual Review: Execution Discipline contributes the largest single share (30%) to the comp formula's "attribute aggregate" component.
- At 40+: gates L3 (Senior Analyst) promotion eligibility.
- At 60+: gates L5 (Manager) promotion eligibility.
- At 50+: unlocks "stretch delivery" options — choices that deliver beyond scope, combining Execution credit with small Reputation or Influence gain.
- At 30 or below: triggers a "reliability concern" flag in Annual Review — Dana Sutcliffe raises it regardless of relationship score.

**Annual Review contribution:** Direct — 30% of attribute aggregate.

**Starting range by background:**
- CS Dropout: +8 (ships things)
- Engineering, State Uni: +10 (delivery culture)
- Art History, Somehow: −8 (structural disadvantage)

**What increases it:** Consistent follow-through choices; choosing harder deliveries over safer deflections; not over-promising.

**What decreases it:** Choosing boldness when reliability was the test; abandoning options mid-consequence; missing stated commitments in narrative.

---

### 6. Adaptive Nerve

**One-line definition:** Comfort with not knowing how this ends.

**Narrative meaning:** The stat that separates careerists from players. High Adaptive Nerve doesn't mean recklessness — it means the player can hold a situation open long enough to see its shape before committing. Low Adaptive Nerve reads as safe. In AUREL's world, "safe" is another word for "replaceable."

**Mechanical effects:**
- Unlocks "bold play" options in questions — high-variance choices with larger upside and larger downside. These options are greyed out (visible but unselectable) below Adaptive Nerve 40.
- At 55+: triggers external offer visibility — Horizon Labs and other competitor NPCs begin appearing in the World Panel narrative stream as potential contacts.
- At 65+: external offer questions in Three-Lane Opportunity unlock as selectable (previously display-only).
- At 80+: unlocks the "Defector" and "Founder" ending paths (requires sustained high score from Y7+).

**Annual Review contribution:** Indirect — contributes to the "Readiness" band of the Promotion Scorecard. Low Adaptive Nerve locks the "Likely" band even with strong Delivery and Trust.

**Starting range by background:**
- Art History, Somehow: +12 (chronic ambiguity tolerance)
- CS Dropout: +10
- PPE at LSE: +5
- International Student (Visa Clock): −5 (risk aversion from structural exposure)

**What increases it:** Choosing options with uncertain payoffs; taking external conversations; sitting with unresolved situations instead of forcing closure.

**What decreases it:** Consistently choosing the safest option; closing situations prematurely; refusing external offers repeatedly.

---

### 7. Technical Credibility

**One-line definition:** Whether the people who build things trust your judgment about what to build.

**Narrative meaning:** In 2034, "technical" includes AI systems, data architecture, and product mechanics — not just code. High Technical Credibility doesn't require engineering background; it requires demonstrated understanding of how systems actually work. Without it, certain career paths close entirely.

**Mechanical effects:**
- Gates the product/CTO track: questions tagged `track_product` and `track_cto` require Technical Credibility 50+ to unlock.
- At 40+: unlocks "systems thinking" dialogue options in product and engineering questions.
- At 65+: engineers and product NPCs begin giving unsolicited briefings (passive Reputation gain with those NPC types).
- At 85+: unlocks the "Operator" ending path (the player who understands systems ends up running them).

**Annual Review contribution:** Indirect — contributes to "Trust" band on Promotion Scorecard specifically for engineering-adjacent roles.

**Starting range by background:**
- CS Dropout: +15
- Engineering, State Uni: +12
- Philosophy + MBA: −5
- Art History, Somehow: −10

**What increases it:** Choosing product-side options; engaging with system-level questions; deferring to technical NPC expertise in ways that build their trust.

**What decreases it:** Dismissing technical constraints; over-claiming technical authority; being publicly corrected by engineers without recovery.

---

### 8. Reputation

**One-line definition:** What people say about you when you're not in the room.

**Narrative meaning:** Reputation is ambient — it exists independent of direct relationships. It is the average of impressions across NPCs, external stakeholders, and the firm's institutional memory. In AUREL's world, Reputation is the moat; it is also the thing that collapses fastest.

**Mechanical effects:**
- Directly affects NPC baseline reactions: NPCs the player hasn't interacted with yet start at +10 relationship score for every 20 points of Reputation above 50, or −5 for every 20 below 30.
- At 60+: unlocks passive World Panel appearances — the player is mentioned in internal narrative streams.
- At 75+: manager NPCs use the player as a reference point in conversations with other NPCs (revealed via Sofia or support NPCs with high relationship scores).
- At 30 or below: flags the player as "at risk" in Annual Review regardless of performance scores — sponsor advocacy becomes critical.

**Annual Review contribution:** Direct — 20% of attribute aggregate in comp formula.

**Starting range by background:** All backgrounds start at 30 (unknown). Reputation is earned, not inherited.

**What increases it:** Visible success in high-stakes moments; being credited by NPCs publicly; choosing options that prioritize the firm's interest visibly.

**What decreases it:** Public failures; being blamed in visible post-mortems; repeated association with losing initiatives.

---

### 9. Market Sense

**One-line definition:** Understanding what the market will pay for, and why, before it's obvious.

**Narrative meaning:** AUREL sells products to humans. The humans have to want them. Market Sense is the ability to read desire before it's articulated — to see the shape of the next thing while everyone else is still optimizing the current thing. It's rarer than Technical Credibility and harder to fake.

**Mechanical effects:**
- Gates commercial track questions: questions tagged `track_commercial` and `track_business_development` require Market Sense 50+.
- At 55+: unlocks client NPC interactions — Client archetypes won't appear in questions until this threshold is met.
- At 70+: unlocks "commercial insight" options that affect the World Panel narrative stream — the player begins shaping in-fiction AUREL strategy briefings.
- At 85+: contributes to the "Visionary" ending path alongside Strategic Influence 85+.

**Annual Review contribution:** Indirect — contributes to "Readiness" band for VP+ promotion levels.

**Starting range by background:**
- PPE at LSE: +8
- Philosophy + MBA: +10
- International Student (Visa Clock): +7 (cross-market exposure)
- CS Dropout: −5 (product ≠ market)

**What increases it:** Client-facing choices; commercial framing of decisions; engaging World Panel prompts related to market signals.

**What decreases it:** Consistently ignoring commercial implications; over-indexing on internal politics at the expense of external signals.

---

### 10. Integrity

**One-line definition:** Whether you are the same person in the dark.

**Narrative meaning:** The CCO added this stat because every other proposal ignored it and the game's ethical arc dies without it. Integrity is not morality — the game does not score ethics. Integrity is the alignment between what you say you value and what you choose when it costs you something. The gap is the game.

**Mechanical effects:**
- Primary gate for ethical arc questions — Sofia's AI-sentience thread (the game's secret thesis) requires Integrity 50+ to engage fully.
- At 60+: unlocks the "Ethical Compass" ending path (requires sustained score from Y6+).
- At 40 or below: certain NPC relationships become unrecoverable — mentors and trusted allies lose faith permanently once Integrity drops below this threshold.
- At 70+: unlocks hidden dialogue in Sofia interactions that confirms she is aware of the player's integrity score and has opinions about it.
- At 85+: Sofia's final-arc question (Y10–Y12) surfaces — the one that determines whether she stays silent or speaks.
- Integrity below 30 at any Annual Review: triggers a private flag in Dana Sutcliffe's review language — never stated directly, felt.

**Annual Review contribution:** None in comp formula. Integrity gates endings and NPC arcs — it doesn't pay, it costs.

**Starting range by background:** All backgrounds start at 50. Integrity is the one stat that doesn't depend on where you came from.

**What increases it:** Choosing options that cost the player something measurable (comp, reputation, relationship) in favor of an outcome the player stated was important.

**What decreases it:** Contradicting stated values through choice; choosing options tagged `integrity_debt_minor` or `integrity_debt_major`; instrumentalizing NPCs who trusted the player.

---

## Part II — 4 Hidden Long-Arc Pillars

The long-arc pillars are not shown to the player. They accumulate slowly — 1 to 3 points per year depending on actions — and gate promotions above L8 (SVP). They are labeled after the Egon Zehnder leadership assessment framework, which AUREL uses internally and which the narrative occasionally references without explaining.

**Range:** 1–40 (each starts at 1; can grow max 3 pts/year; theoretical max at Y12 end = ~37).
**Display:** Not shown. The Attribute Panel shows four rings labeled only with abstract icons. On hover: "Long-arc signal. Unmeasured." No value displayed. Ever.
**Gating:** L9 (VP) requires all four pillars at 15+. L11 (EVP) requires all four at 25+. L12 (C-Suite) requires all four at 32+.

---

### Pillar 1: Curiosity

**Egon Zehnder definition:** The drive to seek new experiences, knowledge, and candid feedback; to find ideas from everywhere and to remain open to learning.

**Game expression:** Does the player engage with information they didn't need to seek? Do they ask questions when silence was safe? Do they treat negative feedback as data instead of attack?

**Accumulation triggers:**
- Engaging World Panel prompts voluntarily (+1)
- Choosing options that expose the player to new information at personal cost (+1)
- Correctly interpreting a political situation that required reading against surface evidence (+1 Political Awareness + +1 Curiosity)
- Sofia interaction choices tagged `open_inquiry` (+1 to +2 depending on depth)

**Does not accumulate from:** Confirming existing beliefs; avoiding unfamiliar tracks; deflecting feedback.

---

### Pillar 2: Insight

**Egon Zehnder definition:** The ability to gather and make sense of information that suggests new possibilities; systemic pattern recognition that sees cause chains others miss.

**Game expression:** Does the player connect events across time? Do they identify the structural reason something happened rather than the proximate cause? Insight is Political Awareness at the level of systems, not rooms.

**Accumulation triggers:**
- Correctly predicting a consequence that emerged from a prior choice (+2) — triggered when consequence queue resolves and the player's Journal shows the choice
- Choosing options tagged `systemic_read` (+1)
- High Political Awareness (70+) and high Market Sense (65+) together create Insight growth events in questions (+1 passive per year if both thresholds held all year)

**Does not accumulate from:** Tactical wins; short-horizon choices; reacting without modeling.

---

### Pillar 3: Engagement

**Egon Zehnder definition:** The ability to use emotion and logic to communicate a persuasive vision and connect with people in a way that generates trust.

**Game expression:** Does the player invest in people? Do they build coalitions, not just networks? Engagement is Collaborative Pull operating at depth — not whether people want to work with you, but whether they'd follow you somewhere uncertain.

**Accumulation triggers:**
- Relationship scores crossing the "Trusted" threshold (70+) for the first time with any NPC (+2)
- Choosing options tagged `coalition_builder` (+1)
- Recovering a damaged NPC relationship back above 50 from below 25 (+2 — the repair is the signal)
- Supporting an NPC's arc at cost to the player (+1)

**Does not accumulate from:** Transactional relationship maintenance; NPC interactions driven by stat optimization rather than choice consistency.

---

### Pillar 4: Determination

**Egon Zehnder definition:** The courage to pursue hard goals; the tenacity to fight for difficult positions; the resilience to hold course despite obstacles and setbacks.

**Game expression:** Not Resilience — Determination is forward motion, not absorption. Resilience recovers. Determination advances. The player who keeps moving toward a stated goal across years, under pressure, without abandoning it for a better-looking option, accumulates Determination.

**Accumulation triggers:**
- Maintaining a consistent career track (no track-switch) across 3 consecutive years (+1/year during streak)
- Choosing the "harder path" option (flagged internally as `high_cost_high_fidelity`) in 3+ questions per year (+1 at year-end)
- Not accepting the External Offer in Three-Lane Opportunity when Adaptive Nerve is 65+ (choosing to stay despite having real options) (+2)
- Promoted Conditionally and then receiving full promotion next year (+3 — the prove-it year is the test)

**Does not accumulate from:** Passive continuation; staying out of inertia rather than choice.

---

## Part III — 4 Hidden Cognitive Axes

The cognitive axes are a behavioral fingerprint set during character creation (through the 12 behavioral traits) and nudged by play. They are never labeled for the player. The player does not see MBTI types. The player does not see axis scores. They see that certain dialogue options exist, that NPCs react certain ways, that some things feel easy and some things feel like work.

**Range:** Each axis is a spectrum from −5 to +5 (integer). Centered at 0. Creation sets the initial value; play moves it by ±1 per year maximum.

**Display:** None. These values exist only in game state and in the narrative engine's branching logic.

**MBTI mapping is implementation-private** — it must never appear in player-facing text, UI tooltips, journal entries, or NPC dialogue.

---

### Axis 1: Social Energy

**Spectrum:** Solitary (−5) ↔ Collective (+5)
**MBTI correspondence:** Introversion (I) ↔ Extraversion (E)

**What it affects:**
- **Dialogue phrasing:** Solitary-pole players get options that process privately ("You'll think about it and send a note"); Collective-pole players get options that process aloud ("You suggest a whiteboard session").
- **NPC reaction baseline:** Collective-pole players build relationship scores 15% faster with extraverted NPCs (Zara Okafor, Leo Chen) but 10% slower with introverted ones (Dana Sutcliffe at low relationship). Solitary-pole players invert this.
- **Annual Review flavor text:** Manager's phrasing of "visibility" feedback shifts based on this axis.

**Set by traits (creation):** Traits like "You read the room before you enter it" push Solitary; "You make the room feel like it started when you arrived" push Collective.

**Nudged by play:** Consistently choosing solitary options (−0.5/year capped at ±1 total); consistently choosing collective options (+0.5/year).

---

### Axis 2: Signal Reading

**Spectrum:** Concrete (−5) ↔ Abstract (+5)
**MBTI correspondence:** Sensing (S) ↔ Intuition (N)

**What it affects:**
- **Opportunity detection:** Abstract-pole players notice World Panel anomalies (questions tagged `latent_opportunity` surface 1 year earlier). Concrete-pole players are first to catch execution risks in question setups (choices tagged `risk_catch` are pre-flagged).
- **Political Awareness interaction:** Abstract pole amplifies PA gains — each Political Awareness gain event gives +1 additional point for Abstract-pole players (score ≥ +3).
- **Question option framing:** Abstract-pole players see options expressed in systemic terms; Concrete-pole players see the same options expressed in procedural terms. The mechanical outcome is identical; the narrative is different.

**Set by traits:** "You see the shape of a problem before you see its pieces" → Abstract. "You want to know exactly what happened before you form a view" → Concrete.

---

### Axis 3: Decision Lens

**Spectrum:** Analytical (−5) ↔ Relational (+5)
**MBTI correspondence:** Thinking (T) ↔ Feeling (F)

**What it affects:**
- **NPC trust patterns:** Relational-pole players build trust with Mentors, Support Staff, and Wildcard NPCs faster (+20% relationship score growth). Analytical-pole players build trust with Rival and Manager NPCs faster (they respect rigor).
- **Integrity interactions:** Relational-pole players receive Integrity growth events from NPC-care choices; Analytical-pole players receive Integrity growth events from systemic fairness choices. Same stat, different trigger.
- **Sofia thread:** Relational-pole players (score ≥ +3) receive additional Sofia dialogue options in Y4+ — she seems to prefer talking to them. Analytical-pole players unlock a different Sofia thread: she gives them data she hasn't shared with others.

**Set by traits:** "You decide with your head and explain with your heart" → Analytical. "You decide with your gut and trust the logic will follow" → Relational.

---

### Axis 4: Operating Style

**Spectrum:** Adaptive (−5) ↔ Structured (+5)
**MBTI correspondence:** Perceiving (P) ↔ Judging (J)

**What it affects:**
- **Execution Discipline interaction:** Structured-pole players (score ≥ +3) gain Execution Discipline 10% faster from delivery-related choices. Adaptive-pole players gain Adaptive Nerve 10% faster from uncertainty-related choices.
- **Three-Lane Opportunity behavior:** Structured-pole players see the opportunity costs of each lane stated more explicitly (their decision style is rewarded with information). Adaptive-pole players see one hidden option in each lane that Structured-pole players cannot access — an unlabeled "wait and see" choice that costs one year but sometimes pays off.
- **Annual Review Promoted Conditionally outcome:** Adaptive-pole players receive a more sympathetic framing of conditional promotion; Structured-pole players receive a performance-management framing. Same outcome, different texture.

**Set by traits:** "You make the plan and trust the plan" → Structured. "You make the plan knowing you'll throw it out" → Adaptive.

---

## Appendix A — Stat Interaction Map

Key interactions between stats (not exhaustive — narrative engine resolves all combinations):

| Primary stat | Secondary stat | Combined effect |
|---|---|---|
| Political Awareness 70+ | Reputation 60+ | Unlocks "influence without authority" options in senior-facing questions |
| Strategic Influence 70+ | Market Sense 70+ | Contributes to "Visionary" ending eligibility |
| Execution Discipline 65+ | Resilience 65+ | Unlocks "consistent excellence" band in Annual Review — highest comp modifier |
| Technical Credibility 60+ | Adaptive Nerve 55+ | Unlocks cross-functional pivot questions (e.g., product → strategy) |
| Integrity 70+ | Collaborative Pull 65+ | Unlocks "trusted advisor" NPC relationship tier beyond Invested (85+) |
| Integrity 30 or below | Any stat high | Triggers "facade" narrative tag — certain endings permanently close |
| Curiosity pillar 20+ | Signal Reading axis ≥ +3 | Unlocks hidden World Panel questions from Y6+ |
| Engagement pillar 20+ | Collaborative Pull 75+ | Sofia begins treating player as a confidant regardless of other stats |

---

## Appendix B — Stat Starting Ranges by Background

All values are bonuses applied to a base of 30 for most stats, 50 for Integrity, 30 for Reputation (universal).

| Background | Political Awareness | Strategic Influence | Collaborative Pull | Resilience | Execution Discipline | Adaptive Nerve | Technical Credibility | Reputation | Market Sense | Integrity |
|---|---|---|---|---|---|---|---|---|---|---|
| PPE at LSE | +10 | +8 | 0 | −5 | 0 | +5 | 0 | 0 | +8 | 0 |
| CS Dropout | −5 | 0 | 0 | 0 | +8 | +10 | +15 | 0 | −5 | 0 |
| Engineering, State Uni | 0 | 0 | +5 | 0 | +10 | 0 | +12 | 0 | 0 | 0 |
| Philosophy + MBA | +8 | +10 | 0 | 0 | −5 | 0 | −5 | 0 | +10 | 0 |
| Art History, Somehow | 0 | +5 | +8 | 0 | −8 | +12 | −10 | 0 | 0 | 0 |
| International Student (Visa Clock) | +5 | 0 | 0 | +12 | 0 | −5 | 0 | 0 | +7 | 0 |
| Apprenticeship / Portfolio Kid | 0 | 0 | +10 | +8 | 0 | 0 | 0 | 0 | 0 | 0 |

*Integrity starts at 50 for all backgrounds — it is not inherited.*
*Reputation starts at 30 for all backgrounds — it is earned.*
*Cognitive Axes are set by Trait selection, not Background.*

---

## Appendix C — Gating Reference (Quick Lookup)

| Unlock | Requires |
|---|---|
| L3 (Senior Analyst) promotion eligibility | Execution Discipline 40+ |
| L5 (Manager) promotion eligibility | Execution Discipline 60+ |
| L9 (VP) promotion eligibility | All 4 Pillars 15+ |
| L11 (EVP) promotion eligibility | All 4 Pillars 25+ |
| L12 (C-Suite) promotion eligibility | All 4 Pillars 32+ |
| Bold play options (questions) | Adaptive Nerve 40+ |
| External offer visibility (World Panel) | Adaptive Nerve 55+ |
| External offer selectable (Annual Review) | Adaptive Nerve 65+ |
| Product/CTO track questions | Technical Credibility 50+ |
| Commercial track questions | Market Sense 50+ |
| Client NPC interactions | Market Sense 55+ |
| Sofia sentience thread (full) | Integrity 50+ |
| Sofia final-arc question (Y10–Y12) | Integrity 85+ |
| "Ethical Compass" ending path | Integrity 60+ sustained from Y6 |
| "Visionary" ending path | Strategic Influence 85+ AND Market Sense 85+ |
| "Defector" ending path | Adaptive Nerve 80+ sustained from Y7 |
| "Founder" ending path | Adaptive Nerve 80+ AND Technical Credibility 70+ sustained from Y7 |
| "Survivor" ending path | Resilience 85+ (absorbs major damage without breaking) |
| "Operator" ending path | Technical Credibility 85+ |
| Read-between-the-lines dialogue | Political Awareness 50+ |
| NPC subtext reveals | Political Awareness 70+ |
| Senior-table questions (Y5+) | Political Awareness 85+ |
| "Trusted advisor" NPC tier | Integrity 70+ AND Collaborative Pull 65+ |
| Reliability concern flag (Annual Review) | Execution Discipline 30 or below |
| Mentor/ally relationship unrecoverable | Integrity 40 or below |
| "Facade" narrative tag (ending closures) | Integrity 30 or below |

---

*End of document. Schema counterpart: `data/attributes.schema.json`*
