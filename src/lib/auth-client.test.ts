import { describe, expect, it } from 'vitest';
import { authClientBaseURL } from './auth-client';

describe('auth client configuration', () => {
  it('uses same-origin auth requests instead of a hardcoded host', () => {
    expect(authClientBaseURL).toBeUndefined();
  });
});
