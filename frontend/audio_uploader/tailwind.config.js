/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Scan these files for class usage
    "./public/index.html"
  ],
  theme: {
    extend: {
      minHeight: {
        'screen-minus-nav': 'calc(100vh - 4.75rem)',
      },
      padding: {
        'nav': '4.75rem',
      },
      fontFamily: {
        sans: ['Epilogue', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: '#000000',
        secondary: '#1E1E1E',
      },
    },
  },
  plugins: [],
}
