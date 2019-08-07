import { create, valueOf, StringType, BooleanType } from 'microstates';
import { Big, defaults } from './customTypes.js';

class TransactionForm {
  /*defaults dont seem to actually take,
  so also setting these defaults in the form themselves.
  Come back and fix when bugs or whatever are resolved.*/
  id = defaults(StringType, '');
  raccount = defaults(StringType, 'select');
  description = defaults(StringType, '');
  category = defaults(StringType, '');
  type = defaults(StringType, 'income');
  start = defaults(StringType, '2019-01-01');
  beginAfterOccurrences = defaults(Big, 0);
  end = defaults(StringType, '');
  occurrences = defaults(Big, 0);
  rtype = defaults(StringType, '');
  ending = defaults(StringType, 'never');
  cycle = defaults(Big, 0);
  value = defaults(Big, 50);

  get state() {
    return valueOf(this);
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

class AccountTransactionForm {
  id = StringType;
  debtAccount = StringType;
  raccount = StringType;
  start = StringType;
  rtype = StringType;
  cycle = create(Big, 0);
  occurrences = create(Big, 0);
  value = create(Big, 0);

  get state() {
    return valueOf(this);
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
