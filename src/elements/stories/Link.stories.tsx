import React from 'react';
import { Link } from '../Link.tsx';

export const Example = (args: any) => <Link {...args}>The missing link</Link>;

Example.args = {
  href: 'https://www.imdb.com/title/tt6348138/',
  target: '_blank'
};
