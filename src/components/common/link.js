import React from 'react';
import { Link as LinkThemed, NavLink as NavLinkThemed } from 'theme-ui';
import { Link as LinkNavigation } from '@reach/router';

export default props => {
  return (
    <LinkThemed to={props.to} as={LinkNavigation} variant="links.primary">
      {props.children}
    </LinkThemed>
  );
};

const NavLink = props => {
  return (
    <NavLinkThemed to={props.to} as={LinkNavigation} variant="links.nav">
      {props.children}
    </NavLinkThemed>
  );
};

export { NavLink };
