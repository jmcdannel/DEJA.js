// added .cjs extension to avoid issues with ESM
// with postcss.config.js
// https://tailwindcss.com/docs/installation#post-css-7-compat
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
