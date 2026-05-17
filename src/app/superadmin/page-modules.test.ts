import { describe, expect, it } from 'vitest';
import * as superadminPage from './page';
import * as superadminUsersPage from './users/page';

describe('superadmin page modules', () => {
  it('forces dynamic rendering for database-backed routes', () => {
    expect(superadminPage.dynamic).toBe('force-dynamic');
    expect(superadminUsersPage.dynamic).toBe('force-dynamic');
  });
});
