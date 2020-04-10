import {
  create,
  relationship,
  valueOf,
  StringType,
  NumberType,
  BooleanType,
  ArrayType,
  Primitive
} from 'microstates';
import { Big, _Big } from './customTypes.js';
import { determineUnique } from './utils.js';

class AmountComputed extends Primitive {
  operation = StringType;
  reference = StringType;
  references = { Big };
  on = relationship(({ value, parentValue }) => ({
    Type: AmountComputed,
    value: {
      ...value,
      references: parentValue.references
    }
  }));

  get compute() {
    const state = this.state;
    // calling a Big function is a transition which we can't do in a getter
    // use state to run big functions, and microstates (on this)
    // to call the getters (e.g. compute)

    // also, for some reason, the relationship seems to not carry the Big Type
    // with it, so when we do this.state, we don't have a big.js object, just a number
    // so temporarily coercing it from a number into a big.js object that
    // we can use that function
    switch (state.operation) {
      case 'add':
        return _Big(state.references[state.reference]).add(this.on.compute);
      case 'minus':
        return _Big(state.references[state.reference]).minus(this.on.compute);
      default:
        // we have a microstate here and are returning just the number
        return this.references.entries[state.reference].toNumber;
    }
  }
}

class Transaction extends Primitive {
  id = StringType;
  raccount = StringType;
  description = StringType;
  groups = ArrayType.of(StringType);
  category = StringType;
  type = StringType;
  start = StringType;
  end = StringType;
  rtype = StringType;
  cycle = Big;
  value = Big;
  references = { Big };
  computedAmount = relationship(({ value, parentValue }) => ({
    Type: AmountComputed,
    value: {
      ...value,
      ...(!!parentValue.references
        ? { references: parentValue.references }
        : {})
    }
  }));
  occurrences = create(NumberType, 0);
  beginAferOccurrences = create(NumberType, 0);

  computeValue() {
    if (this.state.computedAmount && this.computedAmount.state.references) {
      // it is kind of janky to use the value's positive/negative sign on
      // the computed value, but that is how coercePaybacks communicates
      // that it is a transfer or not. Might be worth thinking about this more
      // and refactoring to credit/debit style instead

      // compute should return a non-microstate number
      return this.value.set(this.value.state.s * this.computedAmount.compute);
    } else {
      return this;
    }
  }
}

class TransactionComputed extends Transaction {
  fromAccounts = BooleanType;
  dailyRate = Big;
  y = Big;
}

class TransactionGroup extends Primitive {
  groupName = StringType; // category from Transaction
  description = StringType;
  groups = relationship(({ parentValue }) => ({
    Type: ArrayType.of(TransactionGroup),
    value: determineUnique(parentValue).map(group => ({
      groupName: group,
      transactions: parentValue.transactions.filter(transaction =>
        transaction.groups.includes(group)
      )
    }))
  }));
  transactions = ArrayType.of(TransactionComputed);

  log() {
    // not certain why this is not working
    // nothing logs out from this
    if (this.groupName.state === 'root') {
      for (const group of this.groups) {
        console.log('TransactionGroup logged', valueOf(group));
        console.log('TransactionGroup logged', valueOf(group.groups));
      }
    }
    return this;
  }
}

export { Transaction, TransactionComputed, TransactionGroup };
