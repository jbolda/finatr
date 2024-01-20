import { createThunks, mdw } from 'starfx';
import { schema } from './schema';

const thunks = createThunks();
// catch errors from task and logs them with extra info
thunks.use(mdw.err);
// where all the thunks get called in the middleware stack
thunks.use(thunks.routes());

export const changeSetting = thunks.create('setting', function* (ctx, next) {
  yield* next();

  console.log(schema, ctx);
  yield* schema.settings.update(
    schema.settings.set((state) => ({
      ...state,
      [ctx.payload.option]: ctx.payload.value
    }))
  );
});

export const settingsThunk = thunks;
