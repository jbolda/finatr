import { select } from 'starfx';

import { schema, type Settings } from '../schema.ts';
import { thunks } from './foundation.ts';

export const changeSetting = thunks.create<{
  key: 'all' | keyof Settings;
  value: boolean;
}>('setting', function* (ctx, next) {
  const { key, value } = ctx.payload;

  if (key === 'all') {
    const settings = yield* select(schema.settings.select);
    const newSettings = Object.keys(settings).reduce(
      (finalSettings, setting) => {
        finalSettings[setting as keyof Settings] = value;
        return finalSettings;
      },
      {
        ...settings
      } as Settings
    );
    yield* schema.update(schema.settings.set(newSettings));
  } else {
    yield* schema.update(schema.settings.update({ key, value }));
  }
  yield* next();
});
