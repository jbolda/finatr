import {
  valueOf,
  StringType,
  NumberType,
  BooleanType,
  Primitive
} from 'microstates';
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
  value = NumberType;
}

class TransactionFormPrimitive extends Primitive {
  id = defaults(StringType, '');
  raccount = defaults(StringType, 'select');
  description = defaults(StringType, '');
  category = defaults(StringType, '');
  type = defaults(StringType, 'income');
  start = defaults(StringType, '2019-01-01');
  ending = defaults(StringType, 'never');
  beginAfterOccurrences = defaults(NumberType, 0);
  end = defaults(StringType, '');
  occurrences = defaults(NumberType, 0);
  rtype = defaults(StringType, '');
  cycle = defaults(NumberType, 0);
  valueType = defaults(StringType, 'static');
  value = defaults(NumberType, 0);
  references = { Big };
  referencesArray = [KeyValue];
  computedAmount = ComputedAmountForm;

  get values() {
    return Object.keys(this).reduce(
      (values, key) => Object.assign(values, { [key]: valueOf(this[key]) }),
      {}
    );
  }
}

class TransactionForm extends TransactionFormPrimitive {
  // we are working in .state here
  setForm(nextTransaction) {
    if (!!nextTransaction.computedAmount) {
      return this.set(nextTransaction)
        .valueType.set('dynamic')
        .setEachReference(nextTransaction.references)
        .computedAmount.setComputedAmount();
    } else {
      return this.set(nextTransaction);
    }
  }

  setEachReference(references) {
    // we are working in .state here
    return this.referencesArray.set(
      !references
        ? []
        : Object.keys(references).reduce((refArray, ref) => {
            return refArray.concat([
              { name: ref, value: references[ref], whereFrom: 'transaction' }
            ]);
          }, [])
    );
  }
}

class AccountForm extends Primitive {
  name = defaults(StringType, '');
  starting = defaults(NumberType, 0);
  interest = defaults(NumberType, 0);
  vehicle = defaults(StringType, 'operating');

  get values() {
    return Object.keys(this).reduce(
      (values, key) => Object.assign(values, { [key]: valueOf(this[key]) }),
      {}
    );
  }
}

class AccountTransactionForm extends TransactionFormPrimitive {
  debtAccount = defaults(StringType, 'select');

  setForm(nextAccount, index) {
    // we are working in .state here
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
    // we are working in .state here
    const reftoArray = (references, whereFrom) => {
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
