import { thunks as settingsThunk } from './settings.ts';
import {
  thunks as transactionsThunk,
  tasks as transactionTasks
} from './transactions.ts';
import { thunks as accountsThunk } from './accounts.ts';

export const thunks = [
  settingsThunk.bootup,
  transactionsThunk.bootup,
  accountsThunk.bootup
];

export const tasks = [...transactionTasks];
