/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Link } from '@reach/router';

export default props => {
  return (
    <footer
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        variant: 'styles.footer'
      }}
    >
      <Link to="/" sx={{ variant: 'styles.navlink', p: 2 }}>
        Home
      </Link>
    </footer>
  );
};
