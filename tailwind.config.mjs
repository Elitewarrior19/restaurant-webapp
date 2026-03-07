/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        saffron: "#E86A00",
        deepGreen: "#0B7A4A",
        cream: "#FFF6EA",
        charcoal: "#1F2933"
      },
      borderRadius: {
        lg: "12px"
      }
    }
  },
  plugins: []
};

