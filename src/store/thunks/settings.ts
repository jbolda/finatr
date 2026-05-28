import { select, type StoreUpdater, type SliceFromSchema } from 'starfx';

import { RootDoc } from '../schema/context.ts';
import {
  type Settings,
  metaSchema as schema,
  type MetaSchemaSlices,
  localPersistor
} from '../schema/index.ts';
import { thunks } from './foundation.ts';

type MetaState = SliceFromSchema<MetaSchemaSlices>;

export const changeSetting = thunks.create<{
  key: 'all' | keyof Settings;
  value: boolean;
}>('setting', function* (ctx, next) {
  const { key, value } = ctx.payload;

  if (key === 'all') {
    const settings = (yield* select(schema.settings.select)) as Settings;
    const newSettings = Object.keys(settings).reduce(
      (finalSettings, setting) => {
        finalSettings[setting as keyof Settings] = value;
        return finalSettings;
      },
      {
        ...settings
      } as Settings
    );

    // updating settings slice from thunk
    const updater = schema.settings.set(newSettings);
    yield* schema.update(updater as unknown as StoreUpdater<MetaState>);
  } else {
    // handle side effects for persistence toggle
    if (key === 'persist') {
      if (value) {
        // turning on persistence: immediately write whatever state we have
        // so a subsequent reload will at least see the current document. we
        // also attempt to rehydrate in case there was already data on disk.
        try {
          const doc = yield* RootDoc.expect();
          yield* localPersistor.adapter.setItem(
            localPersistor.key,
            doc as unknown as Partial<Settings>
          );
        } catch (err) {
          console.error('persist write failed during toggle on', err);
        }
        yield* localPersistor.rehydrate();
      } else {
        // turning off: clear out any stored snapshot
        yield* localPersistor.adapter.removeItem(localPersistor.key);
      }
    }

    const updater = schema.settings.update({ key, value });
    yield* schema.update(updater as unknown as StoreUpdater<MetaState>);
  }
  yield* next();
});
