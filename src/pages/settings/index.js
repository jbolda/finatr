import React from 'react';
import { useDispatch, useSelector } from 'starfx/react';
import { db } from '~src/store';

const Settings = (props) => {
  const settings = useSelector(() => db.settings);
  return (
    <div className="bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
      <div className="relative max-w-lg mx-auto divide-y-2 divide-gray-200 lg:max-w-7xl">
        <div className="pb-6">
          <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
            Settings
          </h1>
          <p className="text-xl text-gray-500">
            This is still in an alpha state.
          </p>
          <pre>{JSON.stringify(settings, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default Settings;
