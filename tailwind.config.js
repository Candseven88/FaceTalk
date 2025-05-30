/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f6ff',
          100: '#e0eeff',
          200: '#c1ddff',
          300: '#a1c7ff',
          400: '#81a9ff',
          500: '#618bff',
          600: '#3e64fb',
          700: '#3451e0',
          800: '#2c40b5',
          900: '#293a8f',
          950: '#121a40',
        },
        'facebook-blue': '#1877F2',
        'facebook-dark': '#0E1F40',
        'facebook-hover': '#166FE5',
        'subtle-bg': '#F0F2F5',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'bounce-sm': 'bounceSm 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(66, 153, 225, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(66, 153, 225, 0.8)' },
        },
        bounceSm: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      },
      boxShadow: {
        'card': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'button': '0 2px 6px rgba(0, 0, 0, 0.08)',
        'button-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 15px rgba(66, 153, 225, 0.5)',
        'glow-strong': '0 0 25px rgba(66, 153, 225, 0.8)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
} 