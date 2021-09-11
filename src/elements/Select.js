import React from 'react';

export const Select = ({ ...rest }) => (
  <select
    className="block w-full pr-10 py-2 text-base shadow-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
    {...rest}
  />
);
