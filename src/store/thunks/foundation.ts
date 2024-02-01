import { createThunks, mdw } from 'starfx';

import type { ThunkCtx } from 'starfx';

export const thunks = createThunks<ThunkCtx>();
// catch errors from task and logs them with extra info
thunks.use(mdw.err);
// where all the thunks get called in the middleware stack
thunks.use(thunks.routes());
