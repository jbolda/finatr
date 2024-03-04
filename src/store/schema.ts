import Big from 'big.js';
import { format } from 'date-fns';
import addDays from 'date-fns/fp/addDays/index.js';
import { createSchema, slice } from 'starfx/store';

import { emptyTransaction, emptyAccount } from './factory.ts';

const addYear = addDays(365);

interface Settings {
  planning: boolean;
  import: boolean;
  examples: boolean;
  flow: boolean;
  transactions: boolean;
  accounts: boolean;
  taxes: boolean;
}

const defaultSettings = {
  examples: false,
  accounts: false,
  transactions: false,
  planning: true,
  flow: false,
  import: false,
  taxes: false
};

type TransactionType = 'income' | 'expense' | 'transfet';
interface Transaction {
  id: string;
  raccount: string;
  description: string;
  category: string;
  type: TransactionType;
  start: string;
  end: string;
  rtype: string;
  cycle: number; // Big
  value: number; // Big
  dailyRate: number; // Big
  occurrences: number; // Big
  beginAfterOccurrences: number;
}

interface TransactionComputed extends Transaction {
  fromAccounts: boolean;
  y: number; // Big
}

interface Account {
  name: string;
  starting: number; // Big
  interest: number; // Big
  vehicle: string;
  payback: Transaction[];
}

interface ChartBarData {
  id: string;
  transaction: Transaction;
  data: {
    date: Date;
    y0: typeof Big;
  }[];
}

interface ChartBarRange {
  start: Date;
  startString: string;
  end: Date;
  endString: string;
}

const referenceDate = new Date();
const defaultChartBarRange: ChartBarRange = {
  start: referenceDate,
  startString: format(referenceDate, 'yyyy-MM-dd'),
  end: addYear(referenceDate),
  endString: format(addYear(referenceDate), 'yyyy-MM-dd')
};

const [schema, initialState] = createSchema({
  cache: slice.table({ empty: {} }),
  loaders: slice.loader(),
  settings: slice.obj<Settings>(defaultSettings),
  transactions: slice.table({ empty: emptyTransaction }),
  transactionsComputed: slice.table({
    empty: emptyTransaction
  }),
  accounts: slice.table({ empty: emptyAccount }),
  chartBarData: slice.table<ChartBarData>(),
  chartBarRange: slice.obj(defaultChartBarRange),
  chartBarMax: slice.num(),
  chartLineData: slice.table(),
  chartLineMax: slice.num()
});

export { schema, initialState };

export type AppState = typeof initialState;
