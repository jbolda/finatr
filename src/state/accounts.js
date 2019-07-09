import {
  relationship,
  StringType,
  BooleanType,
  ArrayType,
  Primitive
} from 'microstates';
import { Big } from './customTypes.js';
import { Transaction } from './transactions.js';

class TransactionPayback extends Transaction {
  debtAccount = StringType;
}

class AccountPayback extends Primitive {
  transactions = relationship(({ value, parentValue }) => ({
    Type: ArrayType.of(TransactionPayback),
    value: value.map(t => ({
      ...t,
      references: {
        ...t.references,
        starting: parentValue.references.starting
      }
    }))
  }));
  references = { Big };
}

class Account extends Primitive {
  name = StringType;
  starting = Big;
  interest = Big;
  vehicle = StringType;

  payback = relationship(({ value, parentValue }) => ({
    Type: AccountPayback,
    value: { ...value, references: { starting: parentValue.starting } }
  }));
}

class AccountComputed extends Account {
  visible = BooleanType;
}

export { Account, AccountComputed };
