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
          DEFAULT: 'rgb(var(--color-primary-500-rgb, 249 115 22) / <alpha-value>)',
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'rgb(var(--color-primary-500-rgb, 249 115 22) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600-rgb, 234 88 12) / <alpha-value>)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          950: 'var(--color-primary-950)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary-500)',
          50: 'var(--color-secondary-50)',
          100: 'var(--color-secondary-100)',
          200: 'var(--color-secondary-200)',
          300: 'var(--color-secondary-300)',
          400: 'var(--color-secondary-400)',
          500: 'var(--color-secondary-500)',
          600: 'var(--color-secondary-600)',
          700: 'var(--color-secondary-700)',
          800: 'var(--color-secondary-800)',
          900: 'var(--color-secondary-900)',
          950: 'var(--color-secondary-950)',
        },
        slate: {
          50: '#F9F9FB',
          100: '#F2F2F5',
          200: '#E4E4E9',
          300: '#CBCBD4',
          400: '#9E9EA7', // NeoVision cool silver text
          500: '#666670', // NeoVision muted text
          600: '#484852', // Dark borders & subtle graphite
          700: '#26262C', // NeoVision dark borders & dividers
          750: '#1F1F24',
          800: '#18181D', // NeoVision inner card & table headers
          850: '#141417', // NeoVision card container
          900: '#0E0E12', // NeoVision elevated surface
          950: '#08080A', // NeoVision pitch OLED obsidian background
        },
        zinc: {
          50: '#F9F9FB',
          100: '#F2F2F5',
          200: '#E4E4E9',
          300: '#CBCBD4',
          400: '#9E9EA7',
          500: '#666670',
          600: '#484852',
          700: '#26262C',
          800: '#18181D',
          850: '#141417',
          900: '#0E0E12',
          950: '#08080A',
        },
        neutral: {
          50: '#F9F9FB',
          100: '#F2F2F5',
          200: '#E4E4E9',
          300: '#CBCBD4',
          400: '#9E9EA7',
          500: '#666670',
          600: '#484852',
          700: '#26262C',
          800: '#18181D',
          850: '#141417',
          900: '#0E0E12',
          950: '#08080A',
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
        plum: {
          DEFAULT: 'var(--color-primary-500)',
          500: 'var(--color-primary-500)',
          800: '#18181D',
          900: '#0E0E12',
          950: '#08080A',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'var(--font-sans)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        handwriting: ['"Caveat"', 'cursive'],
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
