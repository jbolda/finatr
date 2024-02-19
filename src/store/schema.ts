import { createSchema, slice } from 'starfx/store';
import { defaultTransaction, defaultAccount } from './factory.ts';
import Big from 'big.js';

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

interface Transaction {
  id: string;
  raccount: string;
  description: string;
  category: string;
  type: string;
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

interface BarChartData {
  id: string;
  transactionID: string;
  data: {
    date: Date;
    y: typeof Big;
  }[];
}

const [schema, initialState] = createSchema({
  cache: slice.table({ empty: {} }),
  loaders: slice.loader(),
  settings: slice.obj<Settings>(defaultSettings),
  transactions: slice.table({ empty: defaultTransaction }),
  transactionsComputed: slice.table({
    empty: defaultTransaction
  }),
  accounts: slice.table({ empty: defaultAccount }),
  chartBarData: slice.table<BarChartData>()
});

export { schema, initialState };

export type AppState = typeof initialState;
