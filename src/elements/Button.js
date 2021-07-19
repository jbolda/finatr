import React from 'react';

const buttons = {
  xs: ['px-2.5', 'py-1.5', 'text-xs'],
  sm: ['px-3', 'py-2', 'text-sm'],
  md: ['px-4', 'py-2', 'text-sm'],
  lg: ['px-4', 'py-2', 'text-base'],
  xl: ['px-6', 'py-3', 'text-base']
};

export const Button = ({ children, size }) => (
  <button
    type="button"
    className={`inline-flex items-center ${buttons[size].join(
      ' '
    )} border border-transparent font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
  >
    {children}
  </button>
);
