/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Box, Text, Link } from 'theme-ui';

const A = ({ href, children }) => (
  <a
    href={href}
    sx={{
      variant: 'links.nav'
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
    <Box
      as="footer"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        p: 2
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
    </Box>
  );
};
