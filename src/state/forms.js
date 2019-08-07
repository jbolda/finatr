import { valueOf, StringType, BooleanType, Primitive } from 'microstates';
import { Big, defaults } from './customTypes.js';

class TransactionForm extends Primitive {
  id = defaults(StringType, '');
  raccount = defaults(StringType, 'select');
  description = defaults(StringType, '');
  category = defaults(StringType, '');
  type = defaults(StringType, 'income');
  start = defaults(StringType, '2019-01-01');
  ending = defaults(StringType, 'never');
  beginAfterOccurrences = defaults(Big, 0);
  end = defaults(StringType, '');
  occurrences = defaults(Big, 0);
  rtype = defaults(StringType, '');
  cycle = defaults(Big, 0);
  value = defaults(Big, 0);

  get values() {
    return Object.keys(this).reduce(
      (values, key) => Object.assign(values, { [key]: valueOf(this[key]) }),
      {}
    );
  }
}

class AccountForm extends Primitive {
  name = defaults(StringType, '');
  starting = defaults(Big, 0);
  interest = defaults(Big, 0);
  vehicle = defaults(StringType, 'operating');

  get values() {
    return Object.keys(this).reduce(
      (values, key) => Object.assign(values, { [key]: valueOf(this[key]) }),
      {}
    );
  }
}

class AccountTransactionForm extends Primitive {
  id = defaults(StringType, '');
  debtAccount = defaults(StringType, 'select');
  raccount = defaults(StringType, 'select');
  start = defaults(StringType, '');
  rtype = defaults(StringType, 'none');
  cycle = defaults(Big, 0);
  occurrences = defaults(Big, 0);
  value = defaults(Big, 0);

  get values() {
    return Object.keys(this).reduce(
      (values, key) => Object.assign(values, { [key]: valueOf(this[key]) }),
      {}
    );
  }
}

class YNABForm extends Primitive {
  devToken = defaults(StringType, '');
  budgetId = defaults(StringType, '');
}

class Forms extends Primitive {
  transactionForm = TransactionForm;
  accountForm = AccountForm;
  accountTransactionForm = AccountTransactionForm;
  accountTransactionFormVisible = BooleanType;
  ynabForm = YNABForm;
}

export { Forms };
