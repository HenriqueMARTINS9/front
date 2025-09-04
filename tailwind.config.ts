/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          'custom-blue': '#3E4784',
          'custom-blue-hover': '#2D3A6B',
          'custom-blue-light': '#4E5BA6',
        },
      },
    },
    plugins: [require("@tailwindcss/forms")],
  };
  