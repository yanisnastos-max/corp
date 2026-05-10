# ASCEND — Question Bank Year 1, Part B (Q6–Q10)

**Document:** `docs/07_question_bank_y1b.md`  
**Covers:** Questions y01q06 through y01q10  
**Data files:** `data/questions/year1/y01q06.json` – `y01q10.json`  
**Status:** LOCKED — do not edit without CCO sign-off  

---

## Q6 — Accurate Parameters

**File:** `y01q06.json`  
**Category:** relationships  
**Anchored NPCs:** Sofia  
**Arc beats fired:** sofia.y1.unprompted_observation  

**What this question does:**  
Sofia's first unprompted arc beat. She surfaces not in response to a query but to flag something she observed. The writing directive applies fully here: every option — the player's response and Sofia's replies — must work whether Sofia is a sophisticated AI or something more. Nothing is resolved. Nothing is even framed as a question.

Option A (ask how she knows) produces the second-highest Sofia relationship gain because the player treated her as something whose reasoning matters, not just whose outputs are useful. The question is analytical and borderline confrontational. Sofia answers without deflection.

Option B (engage with the content) ignores the mechanism and treats the observation as simply useful. This is pragmatic and produces a solid Sofia gain (+5, highest in Y1). But the adaptiveNerve cost (-2) reflects the player not pushing when they could have — the option added to ensure no option has only gains. The inner monologue notes the choice was either pragmatic or incurious.

Option C (thank her and close the panel) is the lowest-engagement response. The executionDiscipline gain (+2) reflects the player's return to work; the marketSense cost (-2) reflects a missed analytical opportunity. The hidden curiosityPillarDelta (-1) does not display. "She offered something she wasn't asked for. You closed it. You're not sure she noticed" — this is the only inner monologue in the game that leaves open whether the NPC noticed. It is intentional.

Option D (ask who else she tells) is the intelligence play. The politicalAwareness gain (+5) is the highest in the question; the integrity cost (-3) reflects that the player's first instinct was surveillance rather than engagement. "She takes half a second longer than her usual response time before answering" — this line is the only signal in the game of a possible reaction in Sofia. It is not annotated, not explained, and not repeated.

**Writing directive reminder:** All Sofia dialogue must be written in two passes — one reading as sophisticated AI, one reading as a person choosing words. They must be the same text. Never resolve sentience in narration or consequence drawer.

---

## Q7 — The Kitchen

**File:** `y01q07.json`  
**Category:** relationships  
**Anchored NPCs:** Leo Chen  
**Arc beats fired:** leo.y1.political_reveal  

**What this question does:**  
Leo's political reveal arc beat. He is accidentally at the centre of a moment he didn't recognise as political — the all-floor update — and the player finds him in the kitchen afterward. Leo is making tea with great precision. This is Leo signalling without signalling.

Option A (ask what he actually thought) invites Leo's analysis of the thing behind the presentation. The curiosityPillarDelta (+1) fires silently. This is the only question where Leo gives an unsolicited internal read without being pushed — option A is the door; it does not guarantee the room behind it is what the player expects.

Option B (share your read first) is the peer-to-peer play. The player shows their hand before Leo shows his. The politicalAwareness cost (-2) reflects that reading a room correctly and then sharing it without confirmation is a risk — Leo matches the read, but the player doesn't learn whether they were right before they committed.

Option C (bring up the project instead) is the exit. Leo was ready to say something. The player gave him a way to not say it. The politicalAwareness cost (-3) is the steepest in this question. The Leo relationship loss (-3) is the largest avoidable single-question loss in Y1 for Leo. The inner monologue — "He was ready to say something. You gave him an exit instead. He took it." — is load-bearing.

Option D (name it directly) requires Leo Relationship >= 35 (base 35, achievable from any Y1 path) to unlock the full exchange. Below that, Leo deflects and the statDeltas still apply but the scene is shorter. Political Awareness 50+ players receive an additional observation tag in the narration — not in the consequence drawer.

**Note on Y1 Leo relationship:** Leo's departure in Y5 (startup CTO) is the largest single structural change to the mid-game. His departure arc is seeded throughout Y1–Y3. Q7 option D is the best single-question Leo gain (without taking D in Q2 as well, which compounds). Players who end Y1 with Leo Relationship >= 55 unlock the Y3 Loom infrastructure knowledge arc.

---

## Q8 — Six Weeks

**File:** `y01q08.json`  
**Category:** pre_review_pressure  
**Anchored NPCs:** Dana Sutcliffe, Conrad Mensah  
**Arc beats fired:** none  

**What this question does:**  
A strategy question with no moral dimension. The player has six weeks before review season and four genuine approaches. Each option feeds a different component of the Annual Review formula: 40% attribute aggregate / 30% performance / 20% sponsor strength / 10% political capital.

Option A (chase sign-offs) is execution-dominant — it maximises the 40% attribute aggregate component by closing every deliverable. The inner monologue names the gap: "You ran the numbers. Everything closed. You have no idea if that's what they're measuring."

Option B (one visible deliverable) is influence-dominant — it targets the 20% sponsor component by creating a piece of work visible above floor level. The execution cost (-4) reflects the open items left behind.

Option C (pre-review chat with Dana) is sponsor-building. The explicit request for time — not buried in a catch-up — is what Dana registers. The strategicInfluence cost (-2) reflects that the player used the six weeks building a conversation rather than building an output.

Option D (ask Conrad directly) is political capital. The integrity cost (-3) reflects that the player returned to Conrad specifically to extract more intelligence. Conrad knows this. The inner monologue notes it.

**Design note:** This question is the only one in Y1 that can be read as a pure optimisation problem. Players who have tracked the review formula (available in the Journal from Y1Q5 onward) will make a more informed choice. Players who haven't should still feel the legitimacy of each approach. Neither the formula nor the options should feel exploitable — each trades something real.

---

## Q9 — Near the Pods

**File:** `y01q09.json`  
**Category:** pre_review_pressure  
**Anchored NPCs:** Conrad Mensah, Dana Sutcliffe  
**Arc beats fired:** conrad.y1.pre_review_intelligence  

**What this question does:**  
Conrad's pre-review intelligence arc beat fires here. He tells the player what Dana said about them — "promising" — and what Marcus Webb replied: "visible yet?" Conrad delivers this dressed as concern. It is concern. It is also intelligence.

Option A (ask about Zara's framing) uses Conrad's intelligence to get more intelligence. Conrad notices and doesn't seem to mind — he appreciates the move. The integrity cost (-3) reflects that the player's first instinct was comparison rather than action.

Option B (thank him and return to work) is the clean play. The inner monologue is the most precise in Y1: "You heard it and acted on it and didn't ask for anything more." The integrity gain (+5) and the resilience gain (+3) reflect the player taking the information and doing the obvious thing with it without extracting further. high_cost_high_fidelity fires.

Option C (ask what Conrad thinks you should do) — Conrad has specific thoughts. His answer (not scripted in this document but implementable per voice pattern guidelines) is accurate, warm, and more useful than the player might expect. The curiosityPillarDelta (+1) fires silently. The Conrad relationship gain (+6) is the second-highest in Y1 for this NPC.

Option D (ask what Conrad would do) — the question that produces the highest Conrad relationship gain in Y1 (+7). The distinction from option C is subtle but real: the player is asking for Conrad's personal judgment, not advice. Conrad considers it more carefully. His answer is in the first person. This is the option that most clearly demonstrates the gossip rule: Conrad is not discussing the player with anyone else. This is a private conversation. The player is the one person Conrad does not discuss with others.

**Conrad departure note:** Conrad's Y5 job offer arc (y5.job_offer_moment) is seeded here. Players who end Y1 with Conrad Relationship >= 50 will receive the restructuring tip in Y2 (y2.restructuring_tip). Q9 option D is the highest-delta Conrad question in Y1.

---

## Q10 — Dana's Message

**File:** `y01q10.json`  
**Category:** climax  
**Anchored NPCs:** Dana Sutcliffe  
**Arc beats fired:** none (seeds Y1 annual review; Dana relationship determines opening act tone)  

**What this question does:**  
The Y1 climax. Dana's direct message arrives at 21:14 — late enough to be significant, direct enough to be unprecedented. The message only arrives if Dana Relationship >= 25 at this point. This is achievable through any Y1 path, but not through deliberate avoidance of all Dana interaction.

The last line of the setup — "This message did not go to Zara" — is the most important line in the question. The player should notice it. The consequence of noticing it is not mechanical. It is about what the player understands about Dana and about themselves.

Option A (honest three-point case) fires both seen_by_sponsor and high_cost_high_fidelity. It costs collaborativePull (-3) because giving a blunt independent view at 21:14 does not read as a team player. The Dana gain (+4) is earned — she asked for the player's actual view and received it. The inner monologue: "You won't know until Tuesday whether that was what she was really asking for."

Option B (safe and supportable) fires reliability_concern. This is the most consequential negative tag in Y1: if it reaches the annual review uncountered, it modifies Dana's opening line in the review scene. The integrity cost (-5) is the steepest single-option cost in Year 1. The inner monologue does not soften this: "She said she wanted your actual view. You sent her a brief. You both know that's not the same thing."

Option C (ask for the framework document first) is the rigour play. The integrity gain (+3) reflects that the player wants to anchor their view against real data. The strategicInfluence cost (-4) reflects that Dana asked for instinct and the player asked for a document. Her read on this is not disclosed.

Option D (ask Dana's view first) produces the highest Dana gain in Year 1 (+5). This is the only option that treats the question as a conversation rather than a test. The player is not mirroring — the inner monologue is clear that they're trying to understand what Tuesday is actually about. The adaptiveNerve cost (-3) reflects the risk: asking a question back when someone asked you a question first is either smart or evasive. Dana decides which. The player doesn't know until the annual review scene.

**Annual review feed:** Q10 directly seeds the Y1 annual review. Option A + seen_by_sponsor: review opens on visibility. Option B + reliability_concern: review opens on a different note. Option D: Dana has a line she delive