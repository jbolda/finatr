import React from 'react';
import { useDispatch, useSelector } from 'starfx/react';
import { changeSetting } from '~/src/store/settings.js';

const Settings = (props) => {
  const settings = useSelector((state) => state.settings);

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
          <SettingsToggle settings={settings} />
        </div>
      </div>
    </div>
  );
};

const SettingsToggle = ({ settings }) => {
  const dispatch = useDispatch();
  const settingsList = Object.keys(settings);

  return (
    <>
      {settingsList.map((setting) => (
        <label
          key={setting}
          className="relative inline-flex items-center cursor-pointer"
        >
          <input
            type="checkbox"
            value={settings[setting]}
            className="sr-only peer"
            // TODO this dispatch doesn't seem to fire off the event
            //  likely that the thunk isn't actually wired up
            onClick={() => dispatch(changeSetting(setting, settings[setting]))}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            {setting}
          </span>
        </label>
      ))}
    </>
  );
};

export default Settings;
