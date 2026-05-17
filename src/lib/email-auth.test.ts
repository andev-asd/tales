import { describe, expect, it } from 'vitest';
import {
  buildEmailSignInPayload,
  buildChangePasswordPayload,
} from './email-auth';

describe('email auth payloads', () => {
  it('builds sign-in payload for Better Auth email login', () => {
    expect(
      buildEmailSignInPayload('user@example.com', 'secret123', '/library'),
    ).toEqual({
      email: 'user@example.com',
      password: 'secret123',
      callbackURL: '/library',
    });
  });

  it('builds change-password payload', () => {
    expect(buildChangePasswordPayload('old-pass', 'new-pass')).toEqual({
      currentPassword: 'old-pass',
      newPassword: 'new-pass',
      revokeOtherSessions: false,
    });
  });
});
