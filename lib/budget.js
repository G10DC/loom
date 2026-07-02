// lib/budget.js — M5: per-phase window budget. track() accumulates tokens per phase; shouldCompact()
// returns whether the run is within budget, at the warn threshold, or at the compact threshold.
// Advisory only — it never destroys state (phase conclusions survive in the run state / checkpoint).

/** Default thresholds (tokens). ~12% of a 1M window is the stay-under target. */
export const DEFAULT_THRESHOLDS = { warnAt: 100_000, compactAt: 150_000 };

/**
 * @param {{ warnAt?: number, compactAt?: number }} [opts]
 */
export function createBudget(opts = {}) {
  const { warnAt, compactAt } = { ...DEFAULT_THRESHOLDS, ...opts };
  const perPhase = new Map();

  return {
    track(phase, tokens) {
      perPhase.set(phase, (perPhase.get(phase) || 0) + (tokens || 0));
    },
    phase(phase) {
      return perPhase.get(phase) || 0;
    },
    total() {
      let sum = 0;
      for (const v of perPhase.values()) sum += v;
      return sum;
    },
    /** @returns {{ compact: boolean, reason: string }} */
    shouldCompact() {
      const t = this.total();
      if (t >= compactAt) return { compact: true, reason: `total ${t} >= compact threshold ${compactAt}` };
      if (t >= warnAt) return { compact: false, reason: `total ${t} >= warn threshold ${warnAt}` };
      return { compact: false, reason: 'within budget' };
    },
  };
}
