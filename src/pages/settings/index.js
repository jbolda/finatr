import React from 'react';
import { useDispatch, useSelector } from 'starfx/react';
import { changeSetting } from '~/src/store/settings.js';
import { Switch } from 'react-aria-components';

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
  const settingsList = ['all'].concat(Object.keys(settings));
  const allValue = Object.keys(settings).reduce((finalValue, setting) => {
    if (settings[setting] && finalValue) return true;
    return false;
  }, true);

  return (
    <>
      {settingsList.map((setting) => {
        const value = settings[setting] ?? allValue;
        return (
          <Switch
            key={setting}
            className={
              'group flex gap-2 items-center text-gray-800 disabled:text-gray-300 dark:text-zinc-200 dark:disabled:text-zinc-600 forced-colors:disabled:text-[GrayText] text-sm transition'
            }
            onChange={() =>
              dispatch(changeSetting({ key: setting, value: !value }))
            }
            isSelected={value}
          >
            <div
              className={`${
                value
                  ? 'bg-gray-700 dark:bg-zinc-300 forced-colors:!bg-[Highlight] group-pressed:bg-gray-800 dark:group-pressed:bg-zinc-200'
                  : 'bg-gray-400 dark:bg-zinc-400 group-pressed:bg-gray-500 dark:group-pressed:bg-zinc-300'
              } flex h-4 w-7 px-px items-center shrink-0 cursor-default rounded-full transition duration-200 ease-in-out shadow-inner border border-transparent`}
            >
              <span
                className={`${
                  value ? 'translate-x-[100%]' : 'translate-x-0'
                } h-3 w-3 transform rounded-full bg-white dark:bg-zinc-900 outline outline-1 -outline-offset-1 outline-transparent shadow transition duration-200 ease-in-out`}
              />
            </div>
            {setting}
          </Switch>
        );
      })}
    </>
  );
};

export default Settings;