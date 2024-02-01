import { Next, takeLeading, ThunkCtx } from 'starfx';
import { select } from 'starfx/store';

import { schema } from '../schema.ts';
import { thunks } from './foundation.ts';

import type { Settings } from '../schema.ts';
type SettingsKey = keyof Settings;
type TPay = { key: SettingsKey; value:boolean };

export const changeSetting = thunks.create<TPay>(
  '/thunks/setting', 
  {supervisor: takeLeading},
function* (ctx:ThunkCtx, next:Next) {
  const { key, value } = ctx.payload;
  console.log('ctx', ctx)
  console.log('value', value)
  console.log('key', key)

  if (ctx.payload.key === 'all') {
    const settings = yield* select(schema.settings.select);
    const newSettings = Object.keys(settings).reduce(
      (finalSettings, setting) => {
        finalSettings[setting] =  ctx.payload.value;
        return finalSettings;
      },
      {
        ...settings,
      }  
    );
    yield* schema.update(schema.settings.set(newSettings));
  } else {
    yield* schema.update(schema.settings.update({
      key: ctx.payload.key,
      value: ctx.payload.value,
    }));
  }
  yield* next();
});


