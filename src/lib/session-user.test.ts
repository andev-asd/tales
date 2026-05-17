import { describe, expect, it } from 'vitest';
import { mapSessionToHeaderUser } from './session-user';

describe('mapSessionToHeaderUser', () => {
  it('maps Better Auth session shape to header user shape', () => {
    const result = mapSessionToHeaderUser({
      user: {
        name: 'Andrew',
        image: 'https://example.com/avatar.png',
      },
    });

    expect(result).toEqual({
      id: null,
      email: null,
      name: 'Andrew',
      image: 'https://example.com/avatar.png',
      role: null,
    });
  });

  it('returns null for missing session', () => {
    expect(mapSessionToHeaderUser(null)).toBeNull();
  });
});
