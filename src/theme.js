export default {
  breakpoints: ['40em', '52em', '64em'],
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64],
  initialColorMode: 'light',
  useCustomProperties: true,
  useColorSchemeMediaQuery: true,
  colors: {
    text: '#000',
    background: '#fff',
    primary: '#07c',
    secondary: '#07c',
    muted: '#07c',
    accent: '#07c',
    modes: {
      dark: {
        text: '#e0dfdf',
        background: '#0c0c0c',
        primary: '#0cf',
        secondary: '#07c',
        muted: '#07c',
        accent: '#07c'
      }
    }
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256],
  fonts: {
    body: 'Libre Baskerville, serif',
    heading: 'Raleway, sans-serif',
    monospace: 'Menlo, monospace'
  },
  fontWeights: {
    body: 400,
    heading: 750,
    bold: 700
  },
  lineHeights: {
    body: 1.5,
    heading: 1.25
  },
  shadows: {
    small: '0 0 4px rgba(0, 0, 0, .125)',
    large: '0 0 24px rgba(0, 0, 0, .125)'
  },
  variants: {},
  text: {},
  buttons: {
    primary: {
      color: 'white',
      bg: 'primary'
    }
  }
};
