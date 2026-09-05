/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary-500)',
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          950: 'var(--color-primary-950)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary-500)',
          50: 'var(--color-secondary-50)',
          100: 'var(--color-secondary-100)',
          500: 'var(--color-secondary-500)',
          600: 'var(--color-secondary-600)',
          700: 'var(--color-secondary-700)',
        },
        success: {
          DEFAULT: 'var(--color-success-500)',
          500: 'var(--color-success-500)',
          600: 'var(--color-success-600)',
        },
        danger: {
          DEFAULT: 'var(--color-danger-500)',
          500: 'var(--color-danger-500)',
          600: 'var(--color-danger-600)',
        },
        warning: {
          DEFAULT: 'var(--color-warning-500)',
          500: 'var(--color-warning-500)',
          600: 'var(--color-warning-600)',
        },
        brand: {
          50: '#FAF0F2',
          100: '#F5E1E5',
          200: '#E9C4CB',
          300: '#D79AA4',
          400: '#BF6E7C',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: '#4E262C',
          900: '#3D1F24',
          950: '#21141A',
        },
        plum: {
          500: 'var(--color-primary-500)',
          800: '#271820',
          900: '#21141A',
          950: '#1A1015',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'sm': 'var(--radius-sm, 8px)',
        'md': 'var(--radius-md, 12px)',
        'lg': 'var(--radius-lg, 16px)',
        'xl': 'var(--radius-xl, 20px)',
        '2xl': 'var(--radius-2xl, 24px)',
      }
    },
  },
  plugins: [],
}
