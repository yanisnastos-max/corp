# ASCEND — Question Bank Year 1, Part A (Q1–Q5)

**Document:** `docs/07_question_bank_y1a.md`  
**Covers:** Questions y01q01 through y01q05  
**Data files:** `data/questions/year1/y01q01.json` – `y01q05.json`  
**Status:** LOCKED — do not edit without CCO sign-off  

---

## Design Principles (Year 1)

Year 1 is the orientation year. The player does not yet know the rules of AUREL. The questions in Y1 are designed to teach by consequence rather than instruction.

**Iron rules (all questions):**
- Every option has at least one gain and one cost. No saint option. No idiot option.
- Stat deltas are never announced during the question. The consequence drawer opens after.
- NPC relationship deltas are never shown in real time. They surface as behaviour changes.
- Inner monologue is one sentence. It reflects what the player just chose, not what they should have chosen.

**Y1 pacing:**
- Q1–Q2: orientation (establish register, meet Leo)
- Q3–Q4: first tests (information ethics, operational pressure)
- Q5: escalation (first direct competition)
- Q6–Q7: relationships (Sofia, Leo — see Part B)
- Q8–Q9: pre-review pressure
- Q10: climax (Dana's direct message)

---

## Q1 — Quick Sync

**File:** `y01q01.json`  
**Category:** orientation  
**Anchored NPCs:** Dana Sutcliffe, Zara Okafor, Leo Chen  
**Arc beats fired:** none  

**What this question does:**  
The opening question establishes the player's social register for the entire first year. This is not a strategy question — it is a signal question. The player's choice tells them (and the NPCs observing them) which mode they default to under a low-stakes introduction.

Option A (lead with credentials) is the most common choice and the most forgettable one. It builds strategicInfluence without costing the player anything obvious, but the loss of collaborativePull and politicalAwareness is real — the player signals orientation-toward-resume rather than orientation-toward-room.

Option B (lead with curiosity) is the inverse — high relational gain, lower strategic. The inner monologue notes that the player was more honest than they meant to be. This is the option most likely to produce a strong Q2 dynamic with Leo.

Option C (brief and deflect) preserves integrity at the cost of initial visibility. Dana's expression during option C is identical to her expression during option A — the player cannot read her yet. This asymmetry is intentional.

Option D (bold AUREL observation) is the high-risk opening. It fires high_cost_high_fidelity and costs executionDiscipline (the player burned time preparing a distinctive observation instead of basic readiness). The upside — reputation gain of +3 at week one — is the fastest reputation growth available at this stage. The "specific kind of quiet" in the inner monologue is not annotated.

**Design note on Dana:** Dana does not react visibly to any of these options in the moment. Her read on the player is cumulative. This question seeds that accumulation.

---

## Q2 — The Annotated Brief

**File:** `y01q02.json`  
**Category:** orientation  
**Anchored NPCs:** Leo Chen, Zara Okafor  
**Arc beats fired:** leo.y1.small_favour  

**What this question does:**  
Leo's small favour arc beat fires here. He offers the player a document that would take a week to compile independently. The question is what the player does with that offer.

The mechanical point is Leo relationship delta. Options A and D produce the strongest gains: A for simple acceptance (Leo respects not making it complicated), D for the deeper engagement (the player treats the document as a starting point for a conversation rather than a resource to extract).

Option B is the trap. Sharing with Zara reads to Leo as redistribution — he gave it to the player specifically. His "sure" response and the small expression change are the only signals. Nothing is annotated. This surfaces later: Leo becomes slightly less forthcoming in Q7 if his Y1 relationship is below 40.

Option C is the integrity path. Leo's "fair enough" is written without judgment. He doesn't track reciprocity; the player's relationship delta from C is -2, but Leo doesn't mark the player as difficult. The cost is execution — the player takes the harder route through Q4 without the historical context the brief contained.

Option D's curiosityPillarBonus (+1) is not displayed. It accumulates in the pillar tracker silently.

**Writing note:** Leo's "six seconds" in the setup is a framing device, not a timer. The decision happens at the player's pace.

---

## Q3 — Something You Should Know

**File:** `y01q03.json`  
**Category:** first_test  
**Anchored NPCs:** Grace Oduya, Zara Okafor  
**Arc beats fired:** grace.y1.unprompted_intelligence  

**What this question does:**  
The first ethical test. Grace gives the player information they were not supposed to have. The question is not whether to use it — it is what kind of person the player is when they receive a gift with moral weight.

Option A (act on it) fires seen_by_sponsor — the presentation lands. But the integrity cost of -3 is the steepest of any Y1 option at this point, and the inner monologue is the most self-aware in the question set: the player chose to use information they weren't supposed to have, and they knew it.

Option B (do nothing) fires high_cost_high_fidelity. The player had a map and walked the original route. The inner monologue names this precisely. The integrity gain (+5) is the highest in Y1 Q1–Q5.

Option C (ask Grace more) fires both systemic_read and risk_catch, and produces the strongest Grace relationship gain of any Y1 question. Grace offered something carefully. The player's choice to understand rather than extract is what she finds valuable. This option seeds the Y2 and Y4 Grace arc beats with a better foundation.

Option D (tell Zara) fires burned_peer and costs both integrity (-4) and Grace relationship (-6). The Zara gain (+3) is genuine — Zara does appreciate being told. But Grace's awareness of the redistribution is permanent and not announced. Her subsequent arc beats become less forthcoming. "Her expression doesn't change" is doing meaningful work.

**Critical design note:** The burned_peer tag from option D does not carry an immediate consequence. It queues. Where it fires is not disclosed in this document.

---

## Q4 — The Incomplete Brief

**File:** `y01q04.json`  
**Category:** first_test  
**Anchored NPCs:** Dana Sutcliffe  
**Arc beats fired:** Conrad's team social (y01q04) fires as a separate unannotated scene tonight  

**What this question does:**  
Operational pressure under time constraint. The gap in the brief is structural, not typographic. It changes the recommendation. Dana is unavailable. The player has ninety minutes and four genuine approaches.

Option A (present as-is) is execution-dominant. Nobody spots the gap. The inner monologue holds the tension: "No one caught it. That's not the same as it not mattering." The Dana gain (+2) reflects competent delivery; the strategicInfluence cost (-4) reflects a missed judgment opportunity.

Option B (fill it yourself) is the strategic gamble. The player's reconstructed section is defensible but is not Dana's version. This distinction matters if the decision surfaces in a future conversation — Dana will have a subtle reaction. The seen_by_sponsor tag fires because the room noticed the player handled an incomplete brief without flagging it.

Option C (flag to Dana) is the only option that builds Dana relationship through transparency. Dana's response — "Good catch. Use your judgment — I trust it" — is the first time she expresses direct trust in Year 1. The strategicInfluence cost (-3) is because the player escalated rather than solved.

Option D (present with addendum) is the adaptive play — the player makes the gap visible on their own terms, frames it as a deliberate decision rather than an oversight. The ambiguity in the inner monologue is intentional. The room's reaction is not revealed.

**Conrad scene note:** The team social fires tonight as a consequence of the Y1Q4 timeframe, not as a choice within this question. The scene is unannotated. Players at Conrad Relationship 30+ who help with clear-up gain a passive relationship delta that is never shown in any consequence drawer.

---

## Q5 — One Slot

**File:** `y01q05.json`  
**Category:** escalation  
**Anchored NPCs:** Dana Sutcliffe, Zara Okafor  
**Arc beats fired:** none (sets up Zara arc trajectory)  

**What this question does:**  
The first direct competition with Zara. Dana has set up a zero-sum framing: one slot, two pitches, separate recommendation notes. The player can compete within the frame or reject it.

Option A (strongest case) is the within-frame play — direct, cleanly delivered, what Dana asked for. The collaborativePull cost (-3) is load-bearing: if the player has been building a collaborative register through Q1–Q4, option A here creates a pattern inconsistency that will compound in Year 2.

Option B (co-ownership proposal) rejects Dana's framing entirely. Dana's read on option B is modified by relationship score: at 40+, she finds it interesting; below 40, she finds it presumptuous. This is not revealed at the time. The Zara gain (+6) is the highest single-question Zara delta in Year 1.

Option C (message Zara first) is morally ambiguous. The inner monologue makes this explicit: the player is "either building a coalition or gathering intelligence" and is not certain which. The integrity cost (-3) reflects this genuine ambiguity. The risk_catch tag fires because the player is treating the zero-sum frame as information to collect before committing.

Option D (send first) is the speed play. The systemic_read tag fires and queues — if the player repeats this pattern (speed over quality) in future questions, the queued consequence surfaces in the annual review.

**Zara trajectory note:** Option B in Q5 produces the conditions for the Y2 coalition arc. Options A and D comp