/** @jsx jsx */
import { jsx } from 'theme-ui';
import { NavLink } from './link';

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
      <NavLink to="/" sx={{ variant: 'styles.navlink', p: 2 }}>
        Home
      </NavLink>
    </footer>
  );
};
