// Tailwind CSS v4 through PostCSS. Both bundlers read this file: webpack (`next dev --webpack`,
// needed on PCs where Windows Application Control blocks Next's native SWC binary) and Turbopack.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
