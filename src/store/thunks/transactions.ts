import Big from 'big.js';

import { schema } from '../schema';
import { thunks } from './foundation.ts';
import makeUUID from '../utils/makeUUID.ts';
import { transactionCompute } from './transactionReoccurrence/index.ts';

export const transactionAdd = thunks.create(
  'transaction:add',
  function* (ctx, next) {
    const transactionID = makeUUID();

    yield* schema.update(
      schema.transactions.add({ [transactionID]: transaction })
    );
    yield* next();
  }
);

export { thunks };
