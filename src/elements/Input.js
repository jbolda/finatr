import React from 'react';

export const Input = ({ type = 'text', ...rest }) => (
  <input
    type={type}
    className="block w-full py-2 text-base shadow-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
    {...rest}
  />
);
