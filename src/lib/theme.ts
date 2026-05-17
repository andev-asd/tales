export const themeTokens = {
  colors: {
    bg: {
      default: '#f7f2e8',
      surface: '#fffaf4',
      elevated: '#ffffff',
    },
    fg: {
      primary: '#241b14',
      secondary: '#5f5347',
      muted: '#8a7d70',
    },
    accent: {
      primary: '#b86549',
      secondary: '#7a9071',
      premium: '#2f4058',
    },
    border: {
      default: 'rgba(36, 27, 20, 0.12)',
    },
  },
  typography: {
    font: {
      display: 'var(--font-display)',
      body: 'var(--font-body)',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  radius: {
    sm: '10px',
    md: '18px',
    lg: '28px',
    pill: '999px',
  },
  shadow: {
    soft: '0 10px 30px rgba(36, 27, 20, 0.06)',
  },
  motion: {
    fast: '160ms ease',
    base: '240ms ease',
  },
} as const;
