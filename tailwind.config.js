/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs", // Update this to match your actual EJS file paths
    "./public/js/**/*.js", // Include JS files if you're using Tailwind CSS in JS files
    "./src/**/*.html", // Include HTML files from other directories
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
