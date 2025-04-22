/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#082D73",
        buttonColor: "#0E89CB",
        buttonColorHover: "#1168A0",
        secondary: "#F56505",
      },

      fontFamily: {
        protest: ["Cabin", "sans-serif"],
        jaro: ["Lato", "sans-serif"],
        roboto: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
