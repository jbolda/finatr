import { createThunks, mdw } from 'starfx';
import { select } from 'starfx/store';
import { schema } from './schema';

const thunks = createThunks();
// catch errors from task and logs them with extra info
thunks.use(mdw.err);
// where all the thunks get called in the middleware stack
thunks.use(thunks.routes());

export const changeSetting = thunks.create('setting', function* (ctx, next) {
  if (ctx.payload.key === 'all') {
    const settings = yield* select(schema.settings.select);
    const newSettings = Object.keys(settings).reduce(
      (finalSettings, setting) => {
        finalSettings[setting] = ctx.payload.value;
        return finalSettings;
      },
      {}
    );
    yield* schema.update(schema.settings.set(newSettings));
  } else {
    yield* schema.update(schema.settings.update(ctx.payload));
  }
  yield* next();
});

export const settingsThunk = thunks;
