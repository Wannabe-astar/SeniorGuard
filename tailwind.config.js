/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary': '#2563EB',
        'secondary': '#64748B',
        'background': '#F8FAFC',
        'surface': '#FFFFFF',
        'text-primary': '#1E293B',
        'text-secondary': '#64748B',
        'error': '#DC2626',
        'success': '#16A34A',
        'warning': '#D97706',
        'info': '#0EA5E9',
        'border': '#E2E8F0',
        'senior-accent': '#7C3AED'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'senior-base': ['18px', '28px'],
        'senior-lg': ['20px', '32px'],
        'senior-xl': ['24px', '36px'],
      },
      spacing: {
        'senior': '2rem',
        'senior-lg': '3rem',
      }
    }
  },
  plugins: []
}
