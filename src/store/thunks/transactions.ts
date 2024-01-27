import { takeLatest } from 'starfx';
import { schema } from '../schema';
import { thunks } from './foundation.ts';

export const transactionAdd = thunks.create(
  'transaction:add',
  function* (ctx, next) {
    yield* schema.update(schema.transactions.add([ctx.payload]));
    yield* next();
  }
);

export { thunks };

function* watchTransactions() {
  const task = yield* takeLatest('transaction:add', function* (action) {
    console.log({ action });
  });
}

export const tasks = [watchTransactions];
