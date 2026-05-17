import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'var(--bg-default)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          text: 'var(--fg-primary)',
          secondary: 'var(--fg-secondary)',
          muted: 'var(--fg-muted)',
          accent: 'var(--accent-primary)',
          accentSecondary: 'var(--accent-secondary)',
          premium: 'var(--accent-premium)',
          border: 'var(--border-default)'
        }
      },
      borderRadius: {
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: '999px'
      },
      boxShadow: {
        soft: 'var(--shadow-soft)'
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)']
      }
    }
  },
  plugins: [],
};

export default config;
