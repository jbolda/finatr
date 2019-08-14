import { valueOf, StringType, BooleanType, Primitive } from 'microstates';
import { Big, defaults } from './customTypes.js';

class ComputedAmountForm extends Primitive {
  operation = StringType;
  reference = StringType;
  references = { Big };
  on = ComputedAmountForm;

  setComputedAmount() {
    if (!this.on.state) {
      return this.operation.set('none');
    } else {
      return this;
    }
  }
}

class KeyValue extends Primitive {
  name = StringType;
  value = Big;
}

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
  valueType = defaults(StringType, 'static');
  value = defaults(Big, 0);
  references = { Big };
  referencesArray = [KeyValue];
  computedAmount = ComputedAmountForm;

  setForm(nextTransaction) {
    if (!!nextTransaction.computedAmount) {
      return this.set(nextTransaction)
        .valueType.set('dynamic')
        .setEachReference(this.references.state)
        .computedAmount.setComputedAmount();
    } else {
      return this.set(nextTransaction);
    }
  }

  setEachReference(references) {
    if (!!references) {
      return this.referencesArray.set(
        references.keys().reduce((refArray, ref) => {
          return refArray.concat([{ name: ref, value: references[ref] }]);
        }, [])
      );
    } else {
      return this;
    }
  }

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
  valueType = defaults(StringType, 'static');
  value = defaults(Big, 0);
  references = { Big };
  referencesArray = [KeyValue];
  computedAmount = ComputedAmountForm;

  setForm(nextAccount, index) {
    const nextAccountTransaction = nextAccount.payback.transactions[index];
    if (!!nextAccountTransaction.computedAmount) {
      return this.set(nextAccountTransaction)
        .valueType.set('dynamic')
        .setEachReference(
          { starting: nextAccount.starting },
          nextAccount.payback.references,
          nextAccountTransaction.references
        )
        .computedAmount.setComputedAmount();
    } else {
      return this.set(nextAccountTransaction);
    }
  }

  setEachReference(
    accountReferences,
    paybackReferences,
    transactionReferences
  ) {
    const reftoArray = (references, whereFrom) => {
      console.log(references, whereFrom);
      return !references
        ? []
        : Object.keys(references).reduce((refArray, ref) => {
            return refArray.concat([
              { name: ref, value: references[ref], whereFrom: whereFrom }
            ]);
          }, []);
    };

    return this.referencesArray.set(
      []
        .concat(reftoArray(accountReferences, 'account'))
        .concat(reftoArray(paybackReferences, 'payback'))
        .concat(reftoArray(transactionReferences, 'transaction'))
    );
  }

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
