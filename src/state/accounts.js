import {
  valueOf,
  relationship,
  StringType,
  BooleanType,
  ObjectType,
  Primitive
} from 'microstates';
import { Big } from './customTypes.js';
import { Transaction } from './transactions.js';
import { create } from 'domain';

class TransactionPayback extends Transaction {
  debtAccount = StringType;
}

class AccountPayback extends Primitive {
  transactions = relationship(({ parentValue }) => ({
    Type: [TransactionPayback],
    value: { references: { starting: parentValue.starting } }
  }));
  starting = Big;
}

class Account extends Primitive {
  name = StringType;
  starting = Big;
  interest = Big;
  vehicle = StringType;
  payback = relationship(({ parentValue }) => ({
    Type: AccountPayback,
    value: { starting: parentValue.starting }
  }));
}

class AccountComputed extends Account {
  visible = BooleanType;
}

export { Account, AccountComputed };
