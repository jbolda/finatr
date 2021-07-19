import React from 'react';
import { Link as RRLink, NavLink as RRNavLink } from 'react-router-dom';

const Link = ({ to, children }) => {
  return <RRLink to={to}>{children}</RRLink>;
};

const NavLink = ({ to, children }) => {
  return <RRNavLink to={to}>{children}</RRNavLink>;
};

export { Link, NavLink };
