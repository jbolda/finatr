import React from 'react';
import { ErrorMessage } from 'formik';
import { ExclamationCircleIcon } from '@heroicons/react/solid';

export const FieldGroup = ({
  name,
  id = name,
  prettyName = name,
  children,
  errors,
  touched
}) => {
  return (
    <div className="mt-2">
      <Label id={id} prettyName={prettyName} />
      <div className="mt-1 relative rounded-md shadow-sm">
        {children}
        {errors?.hasOwnProperty(name) && touched?.hasOwnProperty(name) ? ( // errors[name] && touched?.name ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>
      <ErrorMessage
        name={name}
        render={(msg) => <p className="mt-2 text-sm text-red-600">{msg}</p>}
      />
    </div>
  );
};

export const Label = ({ id, prettyName, children }) =>
  children ? (
    <div className="p-2">
      {children}
      <label htmlFor={id} className="text-sm font-medium text-gray-700 p-1">
        {prettyName}
      </label>
    </div>
  ) : (
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {prettyName}
    </label>
  );
