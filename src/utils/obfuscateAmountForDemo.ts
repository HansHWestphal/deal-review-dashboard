// src/utils/obfuscateAmountForDemo.ts
// Deterministic pseudo-random obfuscation for monetary fields in demo mode

export function obfuscateAmountForDemo(amount: number, seed: string): number {
  if (amount == null || isNaN(amount) || amount === 0) return amount;
  // Simple string hash (djb2)
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) + seed.charCodeAt(i);
  }
  // Deterministic pseudo-random in [0,1)
  const rand = Math.abs((hash % 100000) / 100000);
  // Multiplier between 0.65 and 1.45
  const multiplier = 0.65 + (rand * 0.8);
  // Offset between -75k and +75k, scaled to amount magnitude
  const maxOffset = Math.max(5000, Math.min(75000, Math.round(amount * 0.25)));
  const offset = Math.round((rand - 0.5) * 2 * maxOffset);
  // Apply
  let obfuscated = amount * multiplier + offset;
  // Round to nearest 5,000
  obfuscated = Math.round(obfuscated / 5000) * 5000;
  // Clamp to >= 0
  return Math.max(0, obfuscated);
}
