import {
  relationship,
  StringType,
  BooleanType,
  ArrayType,
  Primitive
} from 'microstates';
import { Big } from './customTypes.js';
import { Transaction, AmountComputed } from './transactions.js';

class TransactionPayback extends Transaction {
  debtAccount = StringType;
  references = { Big };
  computedAmount = relationship(({ value, parentValue }) => {
    console.log(value, parentValue);
    return {
      Type: AmountComputed,
      value: {
        ...value,
        ...(!!parentValue.references
          ? { references: parentValue.references }
          : {})
      }
    };
  });
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
