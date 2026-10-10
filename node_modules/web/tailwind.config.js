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
          forest: '#2d5a27',
          sage: '#8a9a5b',
          ivory: '#fffff0',
        }
      }
    },
  },
  plugins: [],
}
