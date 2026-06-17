// Pure helpers extracted from SetupWizardPage so they can be unit-tested.

export interface TierLike {
  id: string;
  name: string;
  threshold: number | string;
  rewardName: string;
}

export type ProgramType = 'POINTS' | 'STAMPS';

/**
 * Parse the user's typed input as a positive integer.
 * Empty string stays empty (so the input can render blank).
 * Anything non-parsable becomes empty too. 0 is preserved.
 */
export function parseIntInput(raw: string): number | string {
  if (raw === '') return '';
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? '' : n;
}

interface TierErrorMessages {
  ascending: string;
  maxStamps: (params: { goal: number }) => string;
  singleTierStamps: (params: { goal: number }) => string;
  lastTierStamps: (params: { goal: number }) => string;
}

/**
 * Validate a list of tier drafts and return a per-tier error map.
 * Threshold/order errors only — missing reward name and missing threshold are
 * surfaced via input-level red borders, not as inline messages.
 */
export function validateTiers(
  tiers: TierLike[],
  type: ProgramType,
  goalStamps: number,
  msg: TierErrorMessages,
): Record<string, string> {
  const errs: Record<string, string> = {};

  tiers.forEach((tier, idx) => {
    const v = Number(tier.threshold);
    if (v > 0 && idx > 0) {
      const prev = Number(tiers[idx - 1].threshold);
      if (prev && v <= prev) errs[tier.id] = msg.ascending;
    }
    if (type === 'STAMPS' && v > 0) {
      if (v > goalStamps) {
        errs[tier.id] = msg.maxStamps({ goal: goalStamps });
      } else if (tiers.length === 1 && v !== goalStamps) {
        errs[tier.id] = msg.singleTierStamps({ goal: goalStamps });
      } else if (tiers.length > 1 && idx === tiers.length - 1 && v !== goalStamps) {
        errs[tier.id] = msg.lastTierStamps({ goal: goalStamps });
      }
    }
  });

  return errs;
}

interface PreviewMessages {
  spend: (params: { euros: number }) => string;
  visits: (params: { count: number }) => string;
  unlocked: string;
}

/**
 * Live "what does this tier mean for the customer" preview.
 * POINTS: euros they have to spend, after the welcome bonus.
 * STAMPS: visits they have to make, after the welcome stamps.
 */
export function tierPreview(
  threshold: number,
  type: ProgramType,
  pointsPerCurrency: number,
  welcomePoints: number,
  welcomeStamps: number,
  msg: PreviewMessages,
): string {
  if (!threshold || threshold <= 0) return '';
  if (type === 'POINTS') {
    const remaining = Math.max(0, threshold - welcomePoints);
    if (remaining === 0) return msg.unlocked;
    const euros = pointsPerCurrency > 0 ? Math.ceil(remaining / pointsPerCurrency) : 0;
    return msg.spend({ euros });
  }
  const remaining = Math.max(0, threshold - welcomeStamps);
  if (remaining === 0) return msg.unlocked;
  return msg.visits({ count: remaining });
}
