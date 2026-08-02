import { describe, it, expect } from 'vitest';
import { checkPassword, PASSWORD_REQUIREMENTS } from './passwordPolicy';

describe('checkPassword', () => {
  it('rejects an empty password', () => {
    const { valid, results } = checkPassword('');
    expect(valid).toBe(false);
    expect(results.find((r) => r.key === 'length').met).toBe(false);
  });

  it('rejects non-string input as if empty', () => {
    const { valid } = checkPassword(undefined);
    expect(valid).toBe(false);
  });

  it('accepts a password meeting every requirement', () => {
    const { valid, results } = checkPassword('Correct-Horse-99');
    expect(valid).toBe(true);
    expect(results.every((r) => r.met)).toBe(true);
  });

  it('rejects passwords shorter than 12 characters', () => {
    const { results } = checkPassword('Sh0rt!');
    expect(results.find((r) => r.key === 'length').met).toBe(false);
  });

  it('requires an uppercase letter', () => {
    const { results } = checkPassword('lowercase-only-1!');
    expect(results.find((r) => r.key === 'uppercase').met).toBe(false);
  });

  it('requires a lowercase letter', () => {
    const { results } = checkPassword('UPPERCASE-ONLY-1!');
    expect(results.find((r) => r.key === 'lowercase').met).toBe(false);
  });

  it('requires a number', () => {
    const { results } = checkPassword('NoNumbersHere!!');
    expect(results.find((r) => r.key === 'number').met).toBe(false);
  });

  it('requires a special character', () => {
    const { results } = checkPassword('NoSpecialChars123');
    expect(results.find((r) => r.key === 'special').met).toBe(false);
  });

  it('rejects known common passwords regardless of case', () => {
    const { results } = checkPassword('PASSWORD1');
    expect(results.find((r) => r.key === 'notCommon').met).toBe(false);
  });

  it('exposes one result entry per requirement', () => {
    const { results } = checkPassword('anything');
    expect(results).toHaveLength(PASSWORD_REQUIREMENTS.length);
  });
});
