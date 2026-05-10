# ASCEND — Annual Review System

**Document:** `docs/08_annual_review.md`  
**Data file:** `data/review-rules.json`  
**Status:** LOCKED — do not edit without CCO sign-off  

---

## Overview

The Annual Review is the mechanical and narrative hinge of each game year. It closes the year, assigns the promotion outcome, and opens the three-lane opportunity for Year N+1. It is also the primary scene in which the player's cumulative choices become legible — not as a score, but as a story Dana (or her successor) tells back to them.

Every review has three acts:

1. **Compensation Act** — salary/band adjustment, delivered first, always
2. **Promotion Act** — outcome (promoted / not promoted / conditionally promoted) with rationale
3. **Three-Lane Act** — the opportunity framing for the year ahead: internal mobility, external signal, or strategic relationship

The scene should never feel like a report card. It should feel like a conversation in which the player realises how much of themselves they revealed over the previous twelve months.

---

## Formula

The promotion outcome is computed from four components:

| Component | Weight | Source |
|---|---|---|
| Attribute Aggregate | 40% | Weighted average of visible stats at year-end |
| Performance Score | 30% | Question outcomes, deliverable tags, consequence fires |
| Sponsor Strength | 20% | Relationship score with primary sponsor (Dana Y1–Y5) |
| Political Capital | 10% | Conrad + Grace relationship, consequence tag accumulation |

### Attribute Aggregate (40%)

Not a simple average. The aggregate uses an internal weighting:

- executionDiscipline: 30% of the aggregate
- strategicInfluence: 20% of the aggregate
- reputation: 20% of the aggregate
- Remaining 7 stats (politicalAwareness, collaborativePull, adaptiveNerve, marketSense, technicalCredibility, resilience, integrity): averaged, 30% of the aggregate

This means high-integrity, low-execution players can still score well on attribute aggregate if their strategicInfluence and reputation are strong. The aggregate is never shown directly — only the outcome it feeds.

### Performance Score (30%)

Computed from:
- Tags accumulated: seen_by_sponsor (+8 per fire), high_cost_high_fidelity (+5 per fire), open_inquiry (+3 per fire), systemic_read (+2 per fire)
- Negative tags: reliability_concern (-10 per fire), burned_peer (-5 per fire), risk_catch (neutral: -2 or +2 depending on outcome of the triggering question)
- Question outcome pattern: if >60% of questions chose the option with highest integrity delta, performance score gains +5
- Deliverable completion rate: open items at year-end reduce performance score by 2 per unclosed item

### Sponsor Strength (20%)

Primary sponsor is Dana Sutcliffe for Years 1–5. Secondary sponsors become available from Year 3 onward (Tier 2 NPCs). Sponsor strength = relationship score at year-end, normalised to 0–100 scale, weighted by tier (Tier 1 sponsor = full weight; Tier 2 sponsor = 0.7 weight).

### Political Capital (10%)

Sum of Conrad Mensah relationship + Grace Oduya relationship, divided by 2, normalised. If Conrad has departed (Y5 trigger), his weight is zeroed and Grace carries the full political capital component. Political capital is the smallest component but can be the deciding factor in marginal outcomes (see Scorecard below).

---

## Scorecard

The scorecard has four dimensions, each rated against four bands:

| Dimension | below_line | in_discussion | likely | sponsor_dependent |
|---|---|---|---|---|
| Delivery | <40 performance | 40–59 | 60–79 | 80+ but sponsor <60 |
| Visibility | strategicInfluence <35 | 35–54 | 55–74 | 75+ but seen_by_sponsor unfired |
| Trust | integrity <40 OR reliability_concern fired | 40–59 OR one concern | 60–79, no concerns | 80+ |
| Readiness | attribute aggregate <45 | 45–59 | 60–74 | 75+ with sponsor support |

**Promotion threshold:** The player is promoted if at least 3 of 4 dimensions are rated `likely` or `sponsor_dependent`, AND at least 1 is `likely`.

**Conditional promotion:** The player is promoted_conditionally if exactly 2 dimensions are `likely` or better, and the remaining 2 are `in_discussion`. Dana assigns a condition. The condition becomes the framing question for Year N+1.

**No promotion:** Anything below conditional. Dana's language in this scene is precise and not unkind. The no-promotion scene is the most difficult to write in the game. It must never feel like a punishment. It must feel like an accurate read.

---

## Three-Lane Opportunity

After the promotion act, Dana (or sponsor) introduces one of three framing opportunities for the year ahead:

**internal_mobility** — A cross-team project, a role change within AUREL, or an elevated deliverable. Triggered when: promotion outcome is positive OR when player has high execution and mid-range visibility. "There's something I want you to consider for next year."

**external_offer** — Signal that the player's profile is generating interest outside AUREL. Triggered when: strategicInfluence >= 65 AND reputation >= 60 AND either seen_by_sponsor fired twice or sponsor relationship >= 70. This is not an offer — it is a signal that an offer is becoming plausible. The actual External Offer track begins in Year 3 at earliest.

**strategic_relationship** — An introduction, a recommendation, or an access grant to a Tier 2 NPC not yet in the player's network. Triggered when: political capital component >= 65 AND at least one Conrad or Grace arc beat fired during the year. This is the lane that most often surprises players — they didn't know Conrad's infrastructure was valuable until it pays out in a review scene.

Only one lane opens per year. If multiple triggers fire, Dana (or sponsor) chooses the one most consistent with the player's year-end attribute profile.

---

## Sample Scene — Y1 Annual Review with Dana Sutcliffe

*The following is a complete sample scene for implementation. It demonstrates all three acts, the conditional branch on Q10 option D, and the reliability_concern tag consequence. Writer note: Dana's voice in review scenes should be warmer than her day-to-day voice. She has made a decision before the player walks in. She is now choosing how to share it.*

---

**[REVIEW SCENE OPENS — Dana's office, end of Year 1]**

Dana is at her desk when the player arrives. She has a document open. She closes it.

"Sit down."

**[ACT 1 — COMPENSATION]**

"Your band stays where it is for now — that's standard for Year 1. You'll see a cost-of-living adjustment in January. Nothing exciting."

She says this without apology. It is the factual part of the meeting and she dispenses with it efficiently.

**[ACT 2 — PROMOTION]**

*[Branch: if Q10 option D was chosen AND Dana Relationship >= 50]*

"You asked me something a few weeks ago that I found — useful. Instead of answering my question, you asked what I was actually trying to understand. I want you to know I noticed that."

She pauses.

"You're not being promoted this cycle. That's not a reflection on the year — it's a reflection on where we are in the pipeline. What I can tell you is that your name came up in a conversation with Marcus, and the word I used was 'promising.'"

*[Branch: if reliability_concern tag fired (Q10 option B)]*

"There were a couple of moments this year where I got back something careful when I needed something honest. I want to flag that, not as a criticism — as information. Careful is useful. But I can tell the difference, and so can a room. Think about that going into next year."

*[Branch: default (no special tags)]*

"Year 1 is Year 1. You delivered what you were asked to deliver. The question for next year is whether you can start asking for things that aren't on the list yet."

**[ACT 3 — THREE-LANE]**

*[Branch: internal_mobility triggered]*

"There's a cross-team format starting in Q2 that I'd like you to think about. Conrad's involved. It'll put you in front of people you haven't met yet. I'm not asking you to commit today — but I wanted you to know the conversation is available."

*[Branch: external_offer triggered]*

"I had a conversation last month that I won't go into, but I want you to know your profile is being seen in rooms you haven't been in. That's early. But it's real."

*[Branch: strategic_relationship triggered]*

"I'm going to introduce you to someone at the start of Q1. You won't know her yet — you will. Consider this my recommendation."

**[SCENE CLOSE]**

Dana stands. The meeting is complete. She does not say 'good luck.' She says: "Same time next year."

---

## Implementation Notes

**Write order:** Compute attribute aggregate → compute performance score → compute sponsor strength → compute political capital → compute scorecard → determine promotion outcome → determine three-lane → run scene branches.

**Review save point:** The game saves state immediately after the review scene closes, not before. The player cannot replay the review scene by closing the app.

**Y2+ reviews:** Dana is the sponsor for Y1–Y5. From Y3, secondary sponsors (Tier 2 NPCs) can augment sponsor strength but cannot replace Dana. From Y6, Dana's successor (determined by Y5 VP committee arc beat dana.y6.vp_committee) may become the primary reviewer. The review scene structure remains identical; the NPC and voice changes.

**No-promotion scene note:** The no-promotion scene must be written by a human. The spec above is guidance only. The scene should take approximately 90 seconds of reading time. Dana does not apologise. She does not soften. She tells the truth in a way that is more useful than comfort.
