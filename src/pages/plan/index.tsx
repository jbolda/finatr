import React from 'react';
import { useDispatch, useSelector } from 'starfx/react';

import { metaSchema, loroSchema } from '~/store/schema/index.ts';
import {
  updatePersist,
  toggleSync,
  applySyncService
} from '~/store/thunks/persist.ts';

import { RadioGroup, Radio } from '~/components/RadioGroup.tsx';

import { Button } from '~/elements/Button.tsx';
import { Switch } from '~/elements/Switch.tsx';
import { TextField } from '~/elements/TextField.tsx';

const PlanOverview = () => {
  const dispatch = useDispatch();
  const metadata = useSelector(metaSchema.metadata.select);
  const sync = useSelector(metaSchema.sync.select);
  const persist = useSelector(metaSchema.persist.select);
  const accounts = useSelector(loroSchema.accounts.selectTableAsList);
  const transactions = useSelector(loroSchema.transactions.selectTableAsList);

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <h1 className="col-span-2 text-3xl font-semibold">{metadata.name}</h1>
        <div className="text-right text-sm/6 text-gray-500">
          Last Updated:{' '}
          {metadata.lastUpdated
            ? new Date(metadata.lastUpdated).toLocaleDateString()
            : 'N/A'}
        </div>
        <div className="text-right text-sm/6 text-gray-500">
          Sync Mode: {sync.service || 'Disabled'}
        </div>
        <div className="text-right text-sm/6 text-gray-500">
          Persistence:{' '}
          {persist.mode === 'file' ? 'File Storage' : 'Local Storage'}
          <div className="text-xs text-gray-700 dark:text-zinc-200">
            {persist.mode === 'file'
              ? `File: ${persist.fileStorage}`
              : `Key: ${persist.localStorage}`}
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-500 grid grid-cols-1 gap-2 md:grid-cols-2">
        <div>
          <span className="mr-4">Accounts: {accounts.length}</span>
          <span>Transactions: {transactions.length}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="p-4 rounded-lg border">
          <h2 className="text-lg font-semibold">Persistence</h2>
          <p className="text-sm text-gray-500 mb-2">
            Where your plan data is stored locally.
          </p>
          <RadioGroup
            label="Storage Mode"
            value={persist.mode ?? 'local'}
            onChange={(v) => dispatch(updatePersist({ key: 'mode', value: v }))}
          >
            <Radio value="local">Local Storage</Radio>
            <Radio value="file">File Storage</Radio>
          </RadioGroup>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <TextField
              label="Local Storage Key"
              value={persist.localStorage}
              onChange={(v) =>
                dispatch(updatePersist({ key: 'localStorage', value: v }))
              }
            />

            <TextField
              label="File Storage Name"
              value={persist.fileStorage}
              onChange={(v) =>
                dispatch(updatePersist({ key: 'fileStorage', value: v }))
              }
            />
          </div>
        </div>
        <div className="p-4 rounded-lg border">
          <h2 className="text-lg font-semibold">Sync</h2>
          <p className="text-sm text-gray-500 mb-2">
            Sync this plan with a remote service.
          </p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">Enable Sync</div>
            <Switch
              isSelected={Boolean(sync.service)}
              onChange={() => dispatch(toggleSync())}
            >
              {Boolean(sync.service) ? 'On' : 'Off'}
            </Switch>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <TextField
              label="Preferred Sync Service"
              value={persist.syncService}
              onChange={(v) =>
                dispatch(updatePersist({ key: 'syncService', value: v }))
              }
              description="Preferred endpoint for sync — will be used when enabling sync."
            />
            <div className="flex gap-2">
              <Button onPress={() => dispatch(applySyncService())}>
                Apply Sync Service
              </Button>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    sync.connected ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  aria-hidden
                />
                <div>
                  <strong>Active Sync:</strong> {sync.service || 'Disabled'}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <div>
                  Connected:{' '}
                  <span className="font-medium">
                    {sync.connected ? 'Yes' : 'No'}
                  </span>
                </div>
                <div aria-live="polite">
                  Last Message:{' '}
                  <span className="font-mono">{sync.lastMessage || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanOverview;
