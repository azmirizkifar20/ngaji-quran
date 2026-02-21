/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 12px 40px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      }
    },
  },
  plugins: [],
};
