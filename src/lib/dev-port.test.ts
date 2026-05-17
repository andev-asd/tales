import { describe, expect, it } from 'vitest';
import { appDevPort, appDevUrl } from './dev-port';

describe('dev port configuration', () => {
  it('pins local app runtime to port 3002', () => {
    expect(appDevPort).toBe(3002);
    expect(appDevUrl).toBe('http://127.0.0.1:3002');
  });
});
