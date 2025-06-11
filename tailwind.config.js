/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // 將 @tailwindcss/typography 加入到 plugins 陣列中
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
