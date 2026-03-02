import React from 'react';
import { useDispatch, useSelector } from 'starfx/react';

import { metaSchema as schema, type Settings } from '~/store/schema/index.ts';
import { changeSetting } from '~/store/thunks/settings.ts';

import { Switch } from '~/elements/Switch.tsx';

const Settings = () => {
  // TODO typings: remove `as any` cast when schema.settings type is
  // exported correctly or when selector helpers are typed better upstream.
  const settings = useSelector((schema as any).settings.select) as Settings;
  return (
    <div className="relative max-w-lg mx-auto divide-y-2 divide-gray-200 lg:max-w-7xl">
      <div className="pb-6">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-xl text-gray-500">
          This is still in an alpha state.
        </p>
        <SettingsToggle settings={settings} />
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-medium">Persistence</h2>
          <p className="text-sm text-gray-500 mb-4">
            Control whether the application stores data in your browser.
          </p>
          <PersistToggle settings={settings} />
        </div>
      </div>
    </div>
  );
};

type SettingsAll = keyof Settings | 'all';
const SettingsToggle = ({ settings }: { settings: Settings }) => {
  const dispatch = useDispatch();
  // omit the persist key from the general features list
  const settingsList = ['all'].concat(
    Object.keys(settings).filter((k) => k !== 'persist')
  ) as SettingsAll[];
  const allValue = (
    settingsList.filter((s) => s !== 'all') as (keyof Settings)[]
  ).reduce((finalValue, setting) => {
    if (settings[setting] && finalValue) return true;
    return false;
  }, true);

  return (
    <>
      {settingsList.map((setting) => {
        const value =
          setting === 'all' ? allValue : settings[setting as keyof Settings];
        const label = setting === 'all' ? 'all features' : setting;
        return (
          <Switch
            key={setting}
            className={
              'group flex gap-2 items-center text-gray-800 disabled:text-gray-300 dark:text-zinc-200 dark:disabled:text-zinc-600 forced-colors:disabled:text-[GrayText] text-sm transition'
            }
            onChange={() =>
              dispatch(changeSetting({ key: setting, value: !value }))
            }
            isSelected={!!value}
          >
            {label}
          </Switch>
        );
      })}
    </>
  );
};

const PersistToggle = ({ settings }: { settings: Settings }) => {
  const dispatch = useDispatch();
  const value = settings.persist;
  return (
    <Switch
      key="persist"
      className={
        'group flex gap-2 items-center text-gray-800 disabled:text-gray-300 dark:text-zinc-200 dark:disabled:text-zinc-600 forced-colors:disabled:text-[GrayText] text-sm transition'
      }
      onChange={() =>
        dispatch(changeSetting({ key: 'persist', value: !value }))
      }
      isSelected={value}
    >
      Save data to local storage
    </Switch>
  );
};
export default Settings;
