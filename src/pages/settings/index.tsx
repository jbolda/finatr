import React from 'react';
import { useDispatch, useSelector } from 'starfx/react';

import { schema, type Settings } from '~/store/schema/index.ts';
import { changeSetting } from '~/store/thunks/settings.ts';

import { Switch } from '~/elements/Switch.tsx';

const Settings = () => {
  const settings = useSelector(schema.settings.select);
  return (
    <div className="relative max-w-lg mx-auto divide-y-2 divide-gray-200 lg:max-w-7xl">
      <div className="pb-6">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-xl text-gray-500">
          This is still in an alpha state.
        </p>
        <SettingsToggle settings={settings} />
      </div>
    </div>
  );
};

type SettingsAll = keyof Settings | 'all';
const SettingsToggle = ({ settings }: { settings: Settings }) => {
  const dispatch = useDispatch();
  const settingsList = ['all'].concat(Object.keys(settings)) as SettingsAll[];
  const allValue = (Object.keys(settings) as (keyof Settings)[]).reduce(
    (finalValue, setting) => {
      if (settings[setting] && finalValue) return true;
      return false;
    },
    true
  );

  return (
    <>
      {settingsList.map((setting) => {
        // but technically SettingsAll which includes 'all' so fallback
        const value = settings?.[setting as keyof Settings] ?? allValue;
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
            {setting}
          </Switch>
        );
      })}
    </>
  );
};

export default Settings;
