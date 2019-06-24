import {
  create,
  relationship,
  StringType,
  NumberType,
  BooleanType,
  Primitive
} from 'microstates';
import { Big, _Big } from './customTypes.js';

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
        return this.references.entries[this.reference.state].toNumber;
    }
  }
}

class Transaction extends Primitive {
  id = StringType;
  raccount = StringType;
  description = StringType;
  category = StringType;
  type = StringType;
  start = StringType;
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
}

class TransactionComputed extends Transaction {
  fromAccounts = BooleanType;
  dailyRate = Big;
  y = Big;

  computeValue() {
    if (!!this.computedAmount.state && this.computedAmount.state.references) {
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

export { Transaction, TransactionComputed };
