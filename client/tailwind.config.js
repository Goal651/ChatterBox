/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        vibrate: "vibrate 0.3s linear infinite",
      },
      keyframes: {
        vibrate: {
          "0%": { transform: "translate(1px, 1px) rotate(0deg)" },
          "25%": { transform: "translate(-1px, -2px) rotate(-1deg)" },
          "50%": { transform: "translate(-3px, 0px) rotate(1deg)" },
          "75%": { transform: "translate(2px, 1px) rotate(0deg)" },
          "100%": { transform: "translate(1px, -1px) rotate(-1deg)" },
        },
      },
    },
  },
  plugins: [
    daisyui
  ],

}

