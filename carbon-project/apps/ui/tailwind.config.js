/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        registry: '#10b981', // green
        token: '#8b5cf6', // purple
        evidence: '#3b82f6', // blue
      },
    },
  },
  plugins: [],
};

