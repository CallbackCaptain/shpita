/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // Компактный режим для невысоких экранов (iPhone SE и подобные)
        short: { raw: '(max-height: 760px)' },
      },
    },
  },
  plugins: [],
};
