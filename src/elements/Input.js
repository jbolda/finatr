import React from 'react';

export const Input = ({ ...rest }) => (
  <input
    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
    {...rest}
  />
);
