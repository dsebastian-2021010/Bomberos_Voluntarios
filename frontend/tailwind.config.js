/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDEAEB',
          100: '#FACBCE',
          200: '#F3979D',
          300: '#EA646C',
          400: '#DE3A44',
          500: '#C8102E',
          600: '#AE0E28',
          700: '#8A0B20',
          800: '#650818',
          900: '#3F0510',
        },
        ink: {
          50: '#F5F5F5',
          100: '#E0E0E0',
          200: '#B8B8B8',
          300: '#8A8A8A',
          400: '#5C5C5C',
          500: '#3A3A3A',
          600: '#2A2A2A',
          700: '#1E1E1E',
          800: '#151515',
          900: '#0D0D0D',
        },
        gold: {
          400: '#F7C948',
          500: '#F4B400',
          600: '#CC9500',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
