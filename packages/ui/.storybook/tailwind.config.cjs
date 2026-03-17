const path = require('node:path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.resolve(__dirname, '../src/**/*.{vue,js,ts,jsx,tsx}')],
  theme: { extend: {} },
  plugins: [],
}
