/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        vexor: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#cbd5e1',
            a: {
              color: '#38bdf8',
              '&:hover': {
                color: '#0ea5e9',
              },
            },
            code: {
              color: '#e2e8f0',
              backgroundColor: '#1e293b',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#0f172a',
              color: '#e2e8f0',
            },
            h1: { color: '#f1f5f9' },
            h2: { color: '#f1f5f9' },
            h3: { color: '#f1f5f9' },
            h4: { color: '#f1f5f9' },
            strong: { color: '#f1f5f9' },
            blockquote: {
              color: '#94a3b8',
              borderLeftColor: '#0ea5e9',
            },
          },
        },
      },
    },
  },
  plugins: [],
};
