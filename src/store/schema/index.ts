import { type Session } from '@supabase/supabase-js';
import addDays from 'date-fns/fp/addDays/index.js';
import { type Dinero } from 'dinero.js';
import {
  type FxMap,
  type FxSchema,
  type StoreUpdater,
  updateStore,
  slice as sliceOG
} from 'starfx';

import { emptyAccount, emptyTransaction } from '../factory.ts';
import { obj as sliceObj } from './obj.ts';
import { table as sliceTable } from './table.ts';

const slice = { obj: sliceObj, table: sliceTable };

export function createSchema<
  O extends FxMap,
  S extends { [key in keyof O]: ReturnType<O[key]>['initialState'] }
>(slices: O): [FxSchema<S, O>, S] {
  const db = Object.keys(slices).reduce<FxSchema<S, O>>(
    (acc, key) => {
      (acc as any)[key] = slices[key](key);
      return acc;
    },
    {} as FxSchema<S, O>
  );

  const initialState = Object.keys(db).reduce((acc, key) => {
    (acc as any)[key] = db[key].initialState;
    return acc;
  }, {}) as S;

  function* update(ups: StoreUpdater<S> | StoreUpdater<S>[]) {
    return yield* updateStore(ups);
  }

  db.update = update;

  return [db, initialState];
}

const addYear = addDays(365);

export type ScaledNumber = {
  amount: number;
  scale: number;
};

export interface Settings {
  examples: boolean;
  import: boolean;
  accounts: boolean;
  transactions: boolean;
  planning: boolean;
  financialindependence: boolean;
  flow: boolean;
  taxes: boolean;
}

const defaultSettings = {
  examples: false,
  import: true,
  accounts: false,
  transactions: false,
  planning: true,
  financialindependence: false,
  flow: false,
  taxes: false
};

export type TransactionType = 'income' | 'expense' | 'transfer';
export type ValueType = 'static' | 'dynamic';
export type RepeatType =
  | 'none'
  | 'day'
  | 'day of week'
  | 'day of month'
  | 'bimonthly'
  | 'quarterly'
  | 'semiannually'
  | 'annually';
export interface Transaction {
  id: string;
  raccount: string; // account id
  vaccount: string; // account id
  transferIn?: string; // account id
  description: string;
  category: string;
  type: TransactionType;
  valueType: ValueType;
  start: string;
  ending: string;
  rtype: RepeatType;
  cycle: number;
  value: Dinero<number>;
  dailyRate: Dinero<number>;
  occurrences: number;
  beginAfterOccurrences: number;
}

export type AmountVehicle =
  | 'operating'
  | 'investment'
  | 'debt'
  | 'loan'
  | 'credit line';
export interface Account {
  id: string;
  name: string;
  starting: Dinero<number>;
  interest: ScaledNumber;
  vehicle: AmountVehicle;
  payback?: Transaction[];
}
export interface AccountMeta {
  snapshotDate: Date;
}

export interface ChartRange {
  start: Date;
  end: Date;
}

const referenceDate = new Date();
export const defaultChartBarRange = (refDate: Date) =>
  ({
    start: refDate,
    end: addYear(refDate)
  }) as ChartRange;
const defaultAccountSnapshotData: AccountMeta = {
  snapshotDate: referenceDate
};

interface IncomeReceived {
  id: string;
  date: string;
  group: string;
  gross: number;
  pretaxInvestments: number;
  hsa: number;
  federalTax: number;
  medicare: number;
  socialSecurity: number;
  stateTax: number;
}

interface IncomeExpected {
  quarter: number;
  group: string;
  quantity: number;
}

const [schema, initialState] = createSchema({
  cache: sliceOG.table({ empty: {} }),
  loaders: sliceOG.loaders(),
  auth: slice.obj<Session | { user: null }>({ user: null }),
  settings: slice.obj<Settings>(defaultSettings),
  transactions: slice.table<Transaction>({ empty: emptyTransaction }),
  accounts: slice.table<Account>({ empty: emptyAccount }),
  accountMeta: slice.obj<AccountMeta>(defaultAccountSnapshotData),
  chartRange: slice.obj(defaultChartBarRange(referenceDate)),
  incomeReceived: slice.table<IncomeReceived>(),
  incomeExpected: slice.table<IncomeExpected>()
});

export { schema, initialState };

export type AppState = typeof initialState;
