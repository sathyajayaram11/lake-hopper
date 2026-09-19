export function pickWeighted(weights: Record<string, number>, random: () => number = Math.random): string | null {
  const entries = Object.entries(weights).filter(([, weight]) => weight > 0);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (total <= 0) return null;

  let remaining = random() * total;
  for (const [id, weight] of entries) {
    remaining -= weight;
    if (remaining <= 0) return id;
  }
  return entries[entries.length - 1][0];
}
