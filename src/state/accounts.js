import { valueOf, StringType, BooleanType } from 'microstates';
import { Big } from './customTypes.js';
import { Transaction } from './transactions.js';
import { create } from 'domain';

class TransactionPayback extends Transaction {
  debtAccount = StringType;
}

class AccountPayback {
  transactions = create([TransactionPayback], [{}]);
}

class Account {
  name = StringType;
  starting = Big;
  interest = Big;
  vehicle = StringType;
  payback = AccountPayback;

  get state() {
    return valueOf(this);
  }
}

class AccountComputed extends Account {
  visible = BooleanType;
}

export { Account, AccountComputed };
