module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1792px',
      '4xl': '2048px',
      '5xl': '2304px'
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
