import React from 'react';
import { Text, Link } from 'theme-ui';

const A = ({ href, children }) => (
  <a
    href={href}
    sx={{
      textDecoration: 'none',
      ':hover': { color: 'muted', textDecoration: 'underline' },
      variant: 'variants.navLink'
    }}
  >
    {children}
  </a>
);

const Heart = () => (
  <span role="img" aria-label="heart symbol">
    ❤️️️
  </span>
);

export default props => {
  return (
    <footer
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        variant: 'variants.footer'
      }}
    >
      <Text sx={{ px: 1, color: 'muted' }}>
        Made with <Heart /> by{' '}
        <A href="https://www.jacobbolda.com">Jacob Bolda</A> and{' '}
        <A href="https://github.com/jbolda/finatr/graphs/contributors">
          all our contributors
        </A>
        .
      </Text>

      <Link href="https://www.netlify.com">
        <img
          src="https://www.netlify.com/img/global/badges/netlify-color-bg.svg"
          alt="Deploys by Netlify"
        />
      </Link>
    </footer>
  );
};
