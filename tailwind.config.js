/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        mds: {
          navy: "#284b7b",
          cyan: "#10bad7",
          sky: "#6fd6e8",
          mist: "#e8f4f7",
          ink: "#17314e",
          slate: "#5e738c",
        },
      },
      boxShadow: {
        mds: "0 18px 50px rgba(23, 49, 78, 0.14)",
      },
    },
  },
  plugins: [],
}
