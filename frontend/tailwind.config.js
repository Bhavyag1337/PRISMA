/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      'dark-bg': 'var(--color-dark-bg)',
      'dark-card': 'var(--color-dark-card)',
      'dark-border': 'var(--color-dark-border)',
      'dark-text': 'var(--color-dark-text)',
      'dark-muted': 'var(--color-dark-muted)',
      'primary': 'var(--color-primary)',
      'primary-hover': 'var(--color-primary-hover)',
      'accent': 'var(--color-accent)',
      'success': 'var(--color-success)',
      'warning': 'var(--color-warning)',
      'danger': 'var(--color-danger)',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    }
  },
  plugins: [],
}
