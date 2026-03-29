/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            h1: { fontFamily: theme('fontFamily.display').join(', ') },
            h2: { fontFamily: theme('fontFamily.display').join(', ') },
            h3: { fontFamily: theme('fontFamily.display').join(', ') },
            h4: { fontFamily: theme('fontFamily.display').join(', ') },
            h5: { fontFamily: theme('fontFamily.display').join(', ') },
            h6: { fontFamily: theme('fontFamily.display').join(', ') },
          },
        },
      }),
      colors: {
        /** Main actions / links — coral (aligned with logo block coral) */
        primary: {
          50: '#fff4ef',
          100: '#ffe4d6',
          200: '#ffc9ad',
          300: '#ffa57a',
          400: '#ff7d47',
          500: '#FF6B35',
          600: '#e85a2a',
          700: '#bf4a24',
          800: '#983e22',
          900: '#7a3520',
        },
        /** Warm yellow — sunshine trim, secondary emphasis */
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFD60A',
          600: '#e6c205',
          700: '#ca8a04',
          800: '#a16207',
          900: '#854d0e',
        },
        /** Named brand tokens — see docs/BRAND_GUIDELINES.md */
        brand: {
          ink: '#1B3A4B',
          tagline: '#F4D35E',
          coral: '#FF6B35',
          sunshine: '#FFD60A',
          leaf: '#2A9D6F',
          sky: '#5FB4D9',
          lavender: '#DDD6FE',
          peach: '#FBCFE8',
          sand: '#FEF3C7',
          whatsapp: '#25D366',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        /** Baloo 2 — logo wordmark, all headings (h1–h6), main nav */
        display: ['"Baloo 2"', 'Inter', 'system-ui', 'sans-serif'],
        /** Logo tagline — geometric caps + letter-spacing */
        logoTagline: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
