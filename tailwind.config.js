/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D4739',
        secondary: '#8B956D',
        accent: '#C1A572',
        surface: '#F5F2E8',
        background: '#FAF8F3',
        success: '#6B8E5A',
        warning: '#D4A574',
        error: '#B67162',
        info: '#7695A8',
        moss: {
          50: '#f6f8f6',
          100: '#e8efe8',
          200: '#d3dfd3',
          300: '#b2c6b2',
          400: '#8ca58c',
          500: '#6d876d',
          600: '#556d55',
          700: '#465746',
          800: '#2D4739',
          900: '#263c2f'
        },
        sage: {
          50: '#f7f8f6',
          100: '#eef0eb',
          200: '#dde1d8',
          300: '#c3cab9',
          400: '#a5b095',
          500: '#8B956D',
          600: '#798157',
          700: '#636b47',
          800: '#52593c',
          900: '#464b34'
        },
        sand: {
          50: '#faf9f7',
          100: '#f4f1eb',
          200: '#ebe3d5',
          300: '#ddd0b7',
          400: '#cdb695',
          500: '#C1A572',
          600: '#b5955d',
          700: '#967b4d',
          800: '#7a6542',
          900: '#645339'
        }
      },
      fontFamily: {
        display: ['DM Serif Display', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      backgroundImage: {
        'paper-texture': "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23000\" fill-opacity=\"0.02\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/%3E%3C/g%3E%3C/svg%3E')"
      },
      animation: {
        'ripple': 'ripple 0.6s linear',
        'float': 'float 6s ease-in-out infinite',
        'zen-glow': 'zen-glow 4s ease-in-out infinite'
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'zen-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(139, 149, 109, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(139, 149, 109, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}