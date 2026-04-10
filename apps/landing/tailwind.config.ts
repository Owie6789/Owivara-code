/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Saans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        whatsapp: '#25D366',
        'whatsapp-dark': '#128C7E',
        'bg-app': '#0B0C10',
        'bg-card': 'rgba(255, 255, 255, 0.03)',
        'border-card': 'rgba(255, 255, 255, 0.06)',
        'text-muted': '#9ca3af',
        'text-primary': '#f3f4f6',
      },
    },
  },
  plugins: [],
}
