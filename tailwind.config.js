/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F6F5F',
          hover: '#2FA084',
        },
        secondary: {
          DEFAULT: '#2FA084',
        },
        accent: {
          DEFAULT: '#6FCF97',
        },
        border: {
          DEFAULT: '#D6E8DF',
          active: '#B8D9C8',
        },
        card: {
          DEFAULT: '#F5FBF7',
          highlight: '#EFF8F2',
        },
        text: {
          primary: '#222222',
          secondary: '#555555',
        },
        background: {
          DEFAULT: '#FFFFFF',
          page: '#FFFFFF',
          card: '#F5FBF7',
          highlight: '#EFF8F2',
        },
        // Mapped legacy tokens to smooth migration
        cream: {
          50: '#F5FBF7',
          100: '#EFF8F2',
          200: '#D6E8DF',
          300: '#B8D9C8',
        },
        ecogreen: {
          50: '#F5FBF7',
          100: '#EFF8F2',
          200: '#D6E8DF',
          500: '#1F6F5F',
          700: '#1F6F5F',
          900: '#1F6F5F',
        },
        ecoyellow: {
          400: '#1F6F5F',
          500: '#2FA084',
        },
        ecobrown: {
          500: '#222222',
          700: '#555555',
        },
        ecotext: {
          dark: '#222222',
          muted: '#555555',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '8px',
        'large': '10px',
      },
      boxShadow: {
        none: 'none',
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        inner: 'none',
        'soft': 'none',
        'soft-hover': 'none',
      }
    },
  },
  plugins: [],
};
