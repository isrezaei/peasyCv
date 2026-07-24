// Tailwind CSS v4 is wired through its PostCSS plugin (no tailwind.config.js —
// v4 is CSS-first; theme tokens live in src/app/globals.css via @theme).
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
