import {
  create,
  valueOf,
  StringType,
  BooleanType,
  Primitive
} from 'microstates';
import { Big } from './customTypes.js';

class AmountComputedForm extends Primitive {
  operation = StringType;
  reference = StringType;
  references = { Big };
  on = AmountComputedForm;

  setAmountComputed() {
    if (!this.on.state) {
      return this.operation.set('none');
    } else {
      return this.setAmountComputed();
    }
  }
}

class TransactionForm extends Primitive {
  /*defaults dont seem to actually take,
  so also setting these defaults in the form themselves.
  Come back and fix when bugs or whatever are resolved.*/
  id = create(StringType, '');
  raccount = create(StringType, '');
  description = create(StringType, '');
  category = create(StringType, '');
  type = create(StringType, '');
  start = create(StringType, '');
  rtype = create(StringType, '');
  cycle = create(Big, 0);
  valueType = StringType;
  value = 0;
  amountComputed = AmountComputedForm;

  setForm(nextTransaction) {
    if (!!nextTransaction.computedAmount) {
      return this.set(nextTransaction)
        .valueType.set('dynamic')
        .amountComputed.setAmountComputed();
    } else {
      return this.set(nextTransaction);
    }
  }

  get values() {
    // this should pull defaults, however maybe relationship
    // is the better way to deal with defaults, save for now
    // (also this doesn't seem to work, will come back later)
    return Object.keys(this).reduce(
      (values, key) => Object.assign(values, { [key]: valueOf(this[key]) }),
      {}
    );
  }
}

class AccountForm {
  /*defaults dont seem to actually take,
  so also setting these defaults in the form themselves.
  Come back and fix when bugs or whatever are resolved.*/
  name = create(StringType, '');
  starting = create(Big, 0);
  interest = create(Big, 0);
  vehicle = create(StringType, 'operating');

  intialize() {
    return this;
  }

  get state() {
    return valueOf(this);
  }
}

class AccountTransactionForm extends Primitive {
  id = StringType;
  debtAccount = StringType;
  raccount = StringType;
  start = StringType;
  rtype = StringType;
  cycle = Big;
  occurrences = Big;
  valueType = StringType;
  value = Big;

  setForm(nextAccountTransaction) {
    if (!!nextAccountTransaction.computedAmount) {
      return this.set(nextAccountTransaction).valueType.set('dynamic');
    } else {
      return this.set(nextAccountTransaction);
    }
  }
}

class YNABForm {
  devToken = create(StringType, '');
  budgetId = create(StringType, '');
}

class Forms {
  transactionForm = TransactionForm;
  accountForm = AccountForm;
  accountTransactionForm = AccountTransactionForm;
  accountTransactionFormVisible = BooleanType;
  ynabForm = YNABForm;

  get state() {
    return valueOf(this);
  }
}

export { Forms };
