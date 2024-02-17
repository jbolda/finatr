import { schema } from '../schema';
import makeUUID from '../utils/makeUUID.ts';
import { thunks } from './foundation.ts';

export const accountAdd = thunks.create('account:add', function* (ctx, next) {
  const accountID = makeUUID();
  const account = { ...ctx.payload };
  account.id = accountID;
  yield* schema.update(schema.accounts.add({ [accountID]: account }));
  yield* next();
});