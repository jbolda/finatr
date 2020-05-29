const heading = {
  fontFamily: 'heading',
  lineHeight: 'heading',
  fontWeight: 'heading'
};

export default {
  breakpoints: ['40em', '52em', '64em'],
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64],
  initialColorMode: 'light',
  useCustomProperties: true, // true is default
  // ^ prevents FOUC aka flash of unstyled content
  useColorSchemeMediaQuery: true, // turns on dark mode if set in browser
  colors: {
    text: '#000',
    background: '#eff0ef',
    primary: '#192C3B',
    secondary: '#52777D',
    muted: '#9EBBA9',
    accent: '#07c',
    modes: {
      dark: {
        text: '#e0dfdf',
        background: '#0c0c0c',
        primary: '#03647d',
        secondary: '#07c',
        muted: '#31025d',
        accent: '#3ba7bf'
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
  text: {
    heading: { fontSize: [5, 6, 7], color: 'accent' },
    subtitle: { fontSize: [3, 4, 5] },
    subtle: { fontSize: [3, 4, 5] },
    section: { fontSize: [3, 4, 5] }
  },
  buttons: {
    primary: {
      color: 'background',
      bg: 'primary'
    },
    nav: {
      variant: 'buttons.primary',
      color: 'muted',
      bg: 'background',
      boxShadow: 'inset 0 0 2px'
    },
    outline: {
      variant: 'buttons.primary',
      color: 'primary',
      bg: 'transparent',
      boxShadow: 'inset 0 0 2px'
    }
  },
  links: {
    primary: { color: 'accent' },
    bold: {
      fontWeight: 'bold'
    },
    nav: {
      color: 'accent',
      fontWeight: 'bold',
      textDecoration: 'none',
      ':hover': { color: 'secondary', textDecoration: 'underline' }
    }
  },
  variants: {
    header: {
      bg: 'primary'
    },
    footer: { bg: 'primary' }
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body'
    },
    h1: {
      ...heading,
      fontSize: 5
    },
    h2: {
      ...heading,
      fontSize: 4
    },
    h3: {
      ...heading,
      fontSize: 3
    },
    h4: {
      ...heading,
      fontSize: 2
    },
    h5: {
      ...heading,
      fontSize: 1
    },
    h6: {
      ...heading,
      fontSize: 0
    },
    pre: {
      fontFamily: 'monospace',
      overflowX: 'auto',
      code: {
        color: 'inherit'
      }
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit'
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0
    },
    th: {
      textAlign: 'left',
      borderBottomStyle: 'solid'
    },
    td: {
      textAlign: 'left',
      borderBottomStyle: 'solid'
    }
  }
};
