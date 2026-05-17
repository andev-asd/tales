import { describe, expect, it } from 'vitest';
import { authModelNames } from './auth-schema';

describe('auth schema mapping', () => {
  it('maps Better Auth core models to Prisma models present in this project', () => {
    expect(authModelNames.user).toBe('auth_user');
    expect(authModelNames.session).toBe('auth_session');
    expect(authModelNames.account).toBe('auth_account');
    expect(authModelNames.verification).toBe('auth_verification');
  });
});
