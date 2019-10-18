/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Text } from 'rebass';

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
        Made with :heart: by{' '}
        <A href="https://www.jacobbolda.com">Jacob Bolda</A> and{' '}
        <A href="https://github.com/jbolda/finatr/graphs/contributors">
          all our contributors
        </A>
        .
      </Text>
      <Text sx={{ px: 1, color: 'muted' }}>
        Hosted with :heart: by{' '}
        <A href="https://www.netlify.com/?ref=www.finatr.com">Netlify</A>{' '}
        because they :heart: open source.
      </Text>
    </footer>
  );
};
