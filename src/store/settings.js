import { createThunks, mdw } from 'starfx';
import { schema } from './schema';

const thunks = createThunks();
// catch errors from task and logs them with extra info
thunks.use(mdw.err);
// where all the thunks get called in the middleware stack
thunks.use(thunks.routes());

export const changeSetting = thunks.create('setting', function* (ctx, next) {
  yield* next();

  console.log(schema);
  //   yield* update(schema.users.);
});
