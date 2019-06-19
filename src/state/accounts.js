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

class TransactionPayback extends Transaction {
  debtAccount = StringType;
  // starting = Big;
}

class AccountPayback extends Primitive {
  transactions = [TransactionPayback];
  // transactions = relationship().map(test => {
  //   console.log(test, test.value, test.parentValue);
  //   return {
  //     Type: TransactionPayback,
  //     value: { starting: value.starting }
  //   };
  // });

  // transactions = relationship.map(({ parentValue }) => ({
  //   Type: TransactionPayback,
  //   value: { references: { starting: parentValue.starting } }
  // }));

  // starting = Big;
}

class Account extends Primitive {
  name = StringType;
  starting = Big;
  interest = Big;
  vehicle = StringType;

  // payback = relationship(({ parentValue }) => ({
  //   Type: AccountPayback,
  //   value: { starting: parentValue.starting }
  // }));

  // payback = relationship(({ parentValue }) => ({
  //   Type: AccountPayback,
  //   value: { starting: parentValue.starting }
  // })).map(test => {
  //   console.log(test, test.value, test.parentValue);
  //   console.log(
  //     test.value.parent,
  //     test.value.parent.starting,
  //     test.value.parent.starting.toNumber
  //   );
  //   return {
  //     Type: TransactionPayback,
  //     value: { starting: test.value.parent.starting.toNumber }
  //   };
  // });

  // payback = relationship(({ parentValue }) => ({
  //   Type: AccountPayback,
  //   value: relationship().map(test => {
  //     console.log(test, test.value, test.parentValue);
  //     console.log(
  //       test.value.parent,
  //       test.value.parent.starting,
  //       test.value.parent.starting.toNumber
  //     );
  //     return {
  //       Type: TransactionPayback,
  //       value: { starting: test.value.parent.starting.toNumber }
  //     };
  //   })
  // }));

  payback = relationship(({ parentValue }) => ({
    Type: AccountPayback,
    value: relationship().map(test => {
      console.log(test, test.value, test.parentValue);
      console.log(
        test.value.parent,
        test.value.parent.starting,
        test.value.parent.starting.toNumber
      );
      return {
        Type: TransactionPayback,
        value: { starting: test.value.parent.starting.toNumber }
      };
    })
  }));
}

class AccountComputed extends Account {
  visible = BooleanType;
}

export { Account, AccountComputed };
