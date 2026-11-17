/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0B1020",
        surface: "#151D30",
        primary: "#527BFF",
        light: "#80A8FF",
        success: "#26C995",
        ink: "#F5F7FC",
        muted: "#A6B1C5",
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
