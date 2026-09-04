/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAF0F2',
          100: '#F5E1E5',
          200: '#E9C4CB',
          300: '#D79AA4',
          400: '#BF6E7C',
          500: '#8A4A52', // Main Burgundy Rose accent
          600: '#753C44',
          700: '#602F36',
          800: '#4E262C',
          900: '#3D1F24',
          950: '#21141A', // Deep Plum Wine
        },
        plum: {
          500: '#8A4A52',
          800: '#271820',
          900: '#21141A',
          950: '#1A1015',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      }
    },
  },
  plugins: [],
}
