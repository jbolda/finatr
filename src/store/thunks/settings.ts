import { select } from 'starfx';

import { schema } from '../schema.ts';
import { thunks } from './foundation.ts';

export const changeSetting = thunks.create('setting', function* (ctx, next) {
  if (ctx.payload.key === 'all') {
    const settings = yield* select(schema.settings.select);
    const newSettings = Object.keys(settings).reduce(
      (finalSettings, setting) => {
        finalSettings[setting] = ctx.payload.value;
        return finalSettings;
      },
      {
        ...settings
      }
    );
    yield* schema.update(schema.settings.set(newSettings));
  } else {
    yield* schema.update(schema.settings.update(ctx.payload));
  }
  yield* next();
});
