import { describe, expect, it } from 'vitest';
import { themeTokens } from './theme';

describe('themeTokens', () => {
  it('exposes the core token groups for future reskinning', () => {
    expect(themeTokens.colors.bg.default).toBeDefined();
    expect(themeTokens.colors.accent.primary).toBeDefined();
    expect(themeTokens.typography.font.display).toBeDefined();
    expect(themeTokens.radius.lg).toBeDefined();
    expect(themeTokens.shadow.soft).toBeDefined();
    expect(themeTokens.motion.fast).toBeDefined();
  });
});
