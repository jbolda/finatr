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
  transactions = relationship(({ parentValue }) => {
    console.log(parentValue);
    return {
      Type: ArrayType.of(TransactionPayback),
      value: { references: { starting: parentValue.references.starting } }
    };
  });
  references = { Big };
}

class Account extends Primitive {
  name = StringType;
  starting = Big;
  interest = Big;
  vehicle = StringType;

  payback = relationship(({ parentValue }) => {
    console.log(parentValue);
    return {
      Type: AccountPayback,
      value: { references: { starting: parentValue.starting } }
    };
  });
}

class AccountComputed extends Account {
  visible = BooleanType;
}

export { Account, AccountComputed };
