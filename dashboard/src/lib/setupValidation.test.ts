import { describe, expect, it } from 'vitest';
import { parseIntInput, tierPreview, validateTiers, type TierLike } from './setupValidation';

const msg = {
  ascending: 'must ascend',
  maxStamps: ({ goal }: { goal: number }) => `max ${goal}`,
  singleTierStamps: ({ goal }: { goal: number }) => `single must be ${goal}`,
  lastTierStamps: ({ goal }: { goal: number }) => `last must be ${goal}`,
};

const previewMsg = {
  spend: ({ euros }: { euros: number }) => `spend ${euros}`,
  visits: ({ count }: { count: number }) => `${count} visits`,
  unlocked: 'unlocked',
};

const tier = (id: string, threshold: number | string): TierLike =>
  ({ id, name: '', threshold, rewardName: 'reward' });

describe('parseIntInput', () => {
  it('preserves empty string', () => {
    expect(parseIntInput('')).toBe('');
  });
  it('preserves typed zero', () => {
    expect(parseIntInput('0')).toBe(0);
  });
  it('parses positive integers', () => {
    expect(parseIntInput('42')).toBe(42);
  });
  it('returns empty when not parsable', () => {
    expect(parseIntInput('abc')).toBe('');
  });
});

describe('validateTiers', () => {
  it('flags non-ascending thresholds', () => {
    const errs = validateTiers([tier('a', 10), tier('b', 5)], 'POINTS', 0, msg);
    expect(errs.b).toBe('must ascend');
  });

  it('flags STAMPS threshold exceeding goalStamps', () => {
    const errs = validateTiers([tier('a', 15)], 'STAMPS', 10, msg);
    expect(errs.a).toBe('max 10');
  });

  it('STAMPS single tier must equal goalStamps', () => {
    const errs = validateTiers([tier('a', 8)], 'STAMPS', 10, msg);
    expect(errs.a).toBe('single must be 10');
  });

  it('STAMPS last tier must equal goalStamps', () => {
    const errs = validateTiers([tier('a', 5), tier('b', 8)], 'STAMPS', 10, msg);
    expect(errs.b).toBe('last must be 10');
  });

  it('POINTS does not enforce a max', () => {
    const errs = validateTiers([tier('a', 1000)], 'POINTS', 0, msg);
    expect(errs.a).toBeUndefined();
  });

  it('valid STAMPS multi-tier returns no errors', () => {
    const errs = validateTiers([tier('a', 5), tier('b', 10)], 'STAMPS', 10, msg);
    expect(errs).toEqual({});
  });
});

describe('tierPreview', () => {
  it('POINTS: spend = (threshold - welcomePoints) / pointsPerCurrency', () => {
    expect(tierPreview(50, 'POINTS', 2, 10, 0, previewMsg)).toBe('spend 20');
  });

  it('POINTS: rounds up euros', () => {
    expect(tierPreview(11, 'POINTS', 2, 0, 0, previewMsg)).toBe('spend 6');
  });

  it('POINTS: welcomePoints covering threshold returns unlocked', () => {
    expect(tierPreview(10, 'POINTS', 1, 10, 0, previewMsg)).toBe('unlocked');
  });

  it('STAMPS: visits = threshold - welcomeStamps', () => {
    expect(tierPreview(10, 'STAMPS', 0, 0, 2, previewMsg)).toBe('8 visits');
  });

  it('STAMPS: welcomeStamps covering threshold returns unlocked', () => {
    expect(tierPreview(5, 'STAMPS', 0, 0, 5, previewMsg)).toBe('unlocked');
  });

  it('zero/negative threshold returns empty', () => {
    expect(tierPreview(0, 'POINTS', 1, 0, 0, previewMsg)).toBe('');
  });

  it('POINTS pointsPerCurrency=0 reports 0 euros (not Infinity)', () => {
    expect(tierPreview(50, 'POINTS', 0, 0, 0, previewMsg)).toBe('spend 0');
  });
});
