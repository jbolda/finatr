import { type SupabaseClient } from '@supabase/supabase-js';
import {
  Callable,
  createStore,
  createLocalStorageAdapter,
  createPersistor,
  parallel,
  PERSIST_LOADER_ID,
  persistStoreMdw,
  take,
  AnyState,
  Ok,
  Err,
  select,
  UpdaterCtx,
  Next,
  call,
  Operation,
  Result,
  updateStore,
  put,
  ensure
} from 'starfx';

import {
  AppState,
  initialState as schemaInitialState,
  schema,
  Transaction,
  Account
} from './schema.ts';
import { updateAuth } from './thunks/auth.ts';
import { connectReduxDevToolsExtension } from './thunks/devtools.ts';
import { tasks, thunks } from './thunks/index.ts';
import { reconcilerWithReconstitution } from './utils/reconcilerWithReconstitution.ts';

const devtoolsEnabled = true;
export function setupStore({
  logs = true,
  initialState = {},
  supabase
}: {
  logs: boolean;
  initialState: AnyState;
  supabase: SupabaseClient<any, 'public', any> | null;
}) {
  const localPersistor = createPersistor({
    key: 'finatr',
    adapter: createLocalStorageAdapter<AppState>(),
    reconciler: reconcilerWithReconstitution,
    allowlist: [
      'settings',
      'chartRange',
      'accounts',
      'transactions',
      'incomeReceived',
      'incomeExpected'
    ]
  });

  const store = createStore({
    initialState: {
      ...schemaInitialState,
      ...initialState
    },
    middleware: [persistStoreMdw(localPersistor), persistDBMdw(supabase)]
  });

  if (supabase)
    supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public'
        },
        (payload) => {
          console.log(payload);
          //   {
          //     "schema": "public",
          //     "table": "accounts",
          //     "commit_timestamp": "2024-10-12T08:13:44.729Z",
          //     "eventType": "INSERT",
          //     "new": {
          //         "id": "f87a4199-8fb2-42e8-854c-d30dc8dd58e5",
          //         "interest": {
          //             "amount": 2000,
          //             "scale": 2
          //         },
          //         "name": "account",
          //         "starting": {
          //             "amount": 40000,
          //             "currency": {
          //                 "base": 10,
          //                 "code": "USD",
          //                 "exponent": 2
          //             },
          //             "scale": 2
          //         },
          //         "user_id": "d3ff1312-1dd9-4487-8b0c-bc0b4d21014a",
          //         "vehicle": "operating",
          //         "visible": true
          //     },
          //     "old": {},
          //     "errors": null
          // }
        }
      )
      .subscribe();

  const tsks: Callable<unknown>[] = [];
  if (logs) {
    // log all actions dispatched
    tsks.push(function* logActions() {
      while (true) {
        const action = yield* take('*');
        console.log(action);
      }
    });
  }
  tsks.push(
    function* auth() {
      if (!supabase) return;
      const auth = yield* call(supabase.auth.getSession());
      if (auth.data?.session)
        yield* put(updateAuth([schema.auth.set(auth.data.session)]));

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        store.dispatch(
          updateAuth([schema.auth.set(session ? session : { user: null })])
        );
      });

      yield* ensure(() => data.subscription.unsubscribe());

      yield* take('auth:session');
      // only on first auth, rehydrate
      yield* dbRehydrate(supabase);

      // really suspend, no other good way right now? need an effection upgrade?
      while (true) {
        yield* take('auth:session');
      }
    },
    thunks.bootup,
    connectReduxDevToolsExtension({
      name: 'finatr',
      store,
      enabled: devtoolsEnabled
    }),
    ...tasks
  );

  store.run(function* () {
    yield* localPersistor.rehydrate();
    const group = yield* parallel(tsks);
    yield* schema.update(schema.loaders.success({ id: PERSIST_LOADER_ID }));
    yield* group;
  });

  return store;
}

function* dbRehydrate<S extends AnyState>(
  supabase: SupabaseClient<any, 'public', any>
): Operation<Result<undefined>> {
  try {
    const state = yield* select((s) => s);
    // @ts-expect-error
    if (!state.auth.user) return;

    // @ts-expect-error
    const { data: transactionArray, error: transactionsError } = yield* call(
      // @ts-expect-error
      supabase.from('transactions').select()
    );
    // @ts-expect-error
    const { data: accountArray, error: accountsError } = yield* call(
      // @ts-expect-error
      supabase.from('accounts').select()
    );
    const stateFromStorage = {
      transactions: transactionArray.reduce(
        (o: Record<string, any>, t: Record<string, any>) => {
          o[t.id] = t;
          return o;
        },
        {} as Record<string, any>
      ),
      accounts: accountArray.reduce(
        (o: Record<string, any>, t: Record<string, any>) => {
          o[t.id] = t;
          return o;
        },
        {} as Record<string, any>
      )
    };

    const nextState = reconcilerWithReconstitution(state, stateFromStorage);
    yield* updateStore<S>(function (state) {
      Object.keys(nextState).forEach((key: keyof S) => {
        state[key] = nextState[key];
      });
    });

    return Ok(undefined);
  } catch (error: unknown) {
    return Err(error as Error);
  }
}

const PATCH_REPLACE = 'replace';
const PATCH_ADD = 'add';
const PATCH_REMOVE = 'remove';
const dbAllowlist = ['accounts', 'transactions'];
function persistDBMdw<S extends AnyState>(
  supabase: SupabaseClient<any, 'public', any> | null
) {
  return function* (update: UpdaterCtx<S>, next: Next) {
    yield* next();
    if (!supabase) return;
    // cheap check as we likely only want to handle a single record here
    // avoid persist and otherwise updates
    if (update.patches.length > 3) return;

    const state = yield* select((s: S) => s);
    if (!state?.auth?.user) return;

    for (let patch of update.patches) {
      const table = patch.path[0] as 'accounts' | 'transactions';
      if (dbAllowlist.includes(table)) {
        try {
          switch (patch.op) {
            case PATCH_ADD:
              const data = staticalize(table, patch.value);
              // @ts-expect-error its really a promise
              yield* call(supabase.from(table).upsert(data));
              break;
            case PATCH_REPLACE:
              if (patch.path[1]) {
                const data = staticalize(table, patch.value);
                // @ts-expect-error its really a promise
                yield* call(supabase.from(table).upsert(data));
              }
              break;
            case PATCH_REMOVE:
              if (patch.path[1])
                yield* call(
                  // @ts-expect-error its really a promise
                  supabase.from(table).delete().eq('id', patch.path[1])
                );
              break;
          }
        } catch (error) {
          console.warn(error);
        }
      }
    }
  };
}

const staticalize = (table: string, item: Account | Transaction) => {
  const jsonify = JSON.parse(JSON.stringify(item));
  return jsonify;
};
