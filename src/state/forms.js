import { create, valueOf, StringType } from 'microstates';
import { Big } from './customTypes.js';

class TransactionForm {
  id = StringType;
  raccount = StringType;
  description = StringType;
  category = StringType;
  type = StringType;
  start = StringType;
  rtype = StringType;
  cycle = Big;
  value = Big;

  get state() {
    return valueOf(this);
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
    console.log('init', this.state);
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
  cycle = Big;
  generatedOccurences = Big;
  value = Big;

  get state() {
    return valueOf(this);
  }
}

class YNABForm {
  devToken = StringType;
  budgetId = StringType;
}

class Forms {
  transactionForm = TransactionForm;
  accountForm = AccountForm;
  accountTransactionForm = AccountTransactionForm;
  ynabForm = YNABForm;

  get state() {
    return valueOf(this);
  }
}

export { Forms };
