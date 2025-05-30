/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Scan these files for class usage
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
