/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Link } from '@reach/router';

export default props => {
  return (
    <Link
      to={props.to}
      sx={{
        variant: 'variants.link'
      }}
    >
      {props.children}
    </Link>
  );
};

const NavLink = props => {
  return (
    <Link
      to={props.to}
      sx={{
        textDecoration: 'none',
        ':hover': { color: 'muted', textDecoration: 'underline' },
        variant: 'variants.navLink'
      }}
    >
      {props.children}
    </Link>
  );
};

export { NavLink };
