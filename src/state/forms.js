import { create, valueOf, StringType } from 'microstates';
import { Big } from './customTypes.js';

class TransactionForm {
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
  value = create(Big, 50);

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
  occurences = create(Big, 0);
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
  transactionForm = create(TransactionForm, {});
  accountForm = AccountForm;
  accountTransactionForm = create(AccountTransactionForm);
  ynabForm = YNABForm;

  get state() {
    return valueOf(this);
  }

  initialize() {
    let init = this;
    if (!init.transactionForm) {
      init = init.transactionForm.set({});
    }
  }
}

export { Forms };
