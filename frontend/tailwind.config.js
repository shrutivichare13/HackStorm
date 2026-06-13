/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'amazon-navy': '#232F3E',
        'amazon-navy-light': '#37475A',
        'amazon-orange': '#FF9900',
        'amazon-orange-dark': '#E88B00',
        'amazon-blue': '#146EB4',
        'amazon-teal': '#007185',
      }
    },
  },
  plugins: [],
}
