import React from 'react';

export const Radio = ({ ...rest }) => (
  <input
    className="p-2 text-base shadow-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    {...rest}
    type="radio"
  />
);
