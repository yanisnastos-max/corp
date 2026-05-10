// ASCEND — Data loader (typed fetch wrappers)
// Full implementation: task 1.5

export async function loadQuestion(year: number, n: number): Promise<unknown> {
  const id = `y${String(year).padStart(2,'0')}q${String(n).padStart(2,'0')}`;
  const res = await fetch(`/data/questions/year${year}/${id}.json`);
  if (!res.ok) throw new Error(`Failed to load question ${id}`);
  return res.json();
}

export async function loadNpc(id: string): Promise<unknown> {
  const res = await fetch(`/data/npcs/tier1/${id}.json`);
  if (!res.ok) throw new Error(`Failed to load NPC ${id}`);
  return res.json();
}

export async function loadReviewRules(): Promise<unknown> {
  const res = await fetch('/data/review-rules.json');
  if (!res.ok) throw new Error('Failed to load review rules');
  return res.json();
}
