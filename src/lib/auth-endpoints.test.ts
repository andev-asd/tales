import { describe, expect, it } from 'vitest';
import { buildGoogleSignInUrl } from './auth-endpoints';

describe('buildGoogleSignInUrl', () => {
  it('builds the social sign-in endpoint with callback url', () => {
    expect(buildGoogleSignInUrl('/library')).toBe(
      '/api/auth/sign-in/social?provider=google&callbackURL=%2Flibrary',
    );
  });
});
