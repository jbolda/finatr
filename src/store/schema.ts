import { createSchema, slice } from 'starfx/store';

export interface Settings {
  planning: boolean;
  import: boolean;
  examples: boolean;
  flow: boolean;
  accounts: boolean;
  taxes: boolean;
}

const defaultSettings = {
  planning: true,
  import: false,
  examples: false,
  flow: false,
  accounts: false,
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
  cycle: number; // big
  value: number; // big
  occurrences: number;
  beginAfterOccurrences: number;
}
const defaultTransaction = {
  id: '0',
  raccount: '',
  description: '',
  category: '',
  type: '',
  start: '',
  end: '',
  rtype: '',
  cycle: 0,
  value: 0,
  // computedAmount = relationship(({ value, parentValue }) => ({
  //   Type: AmountComputed,
  //   value: {
  //     ...value,
  //     ...(!!parentValue.references
  //       ? { references: parentValue.references }
  //       : {})
  //   }
  // }));
  occurrences: 0,
  beginAferOccurrences: 0
};

interface TransactionComputed extends Transaction {
  fromAccounts: boolean;
  dailyRate: number; // Big
  y: number; // Big
}

interface Account {
  name: string;
  starting: number; // Big
  interest: number; // Big
  vehicle: string;
  payback: Transaction[];
}
const defaultAccount = {
  name: '',
  starting: 0, // Big
  interest: 0, // Big
  vehicle: '',
  payback: []
} as Account;



export const [schema, initialState] = createSchema({
  loaders: slice.loader(),
  cache: slice.table({ empty: {}}),
  settings: slice.obj(defaultSettings),
  transactions: slice.table({ empty: defaultTransaction }),
  transactionsComputed: slice.table<Account>({
    empty: {} as Account,
  }),
  accounts: slice.table({ 
  empty: {} as Account }),
});

// export { schema, initialState };

export type AppState = typeof initialState;