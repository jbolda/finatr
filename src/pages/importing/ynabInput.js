import React from 'react';
import { Formik, Field } from 'formik';
import { State } from '../../state';
import * as ynab from 'ynab';
import getDay from 'date-fns/fp/getDay';
import getDate from 'date-fns/fp/getDate';
import parse from 'date-fns/parse';

class YNABInput extends React.Component {
  render() {
    return (
      <React.Fragment>
        <h1 className="title has-text-centered">Add All Accounts from YNAB</h1>
        <h2 className="subtitle has-text-centered">
          This all happens in your browser and is only exchanged with YNAB.
        </h2>
        <State.Consumer>
          {model => (
            <Formik
              initialValues={{
                devToken: model.forms.ynabForm.devToken.state,
                budgetId: model.forms.ynabForm.budgetId.state,
                importTransactions: false
              }}
              enableReinitialize={true}
              onSubmit={(values, actions) => {
                let ynabAPI = new ynab.API(values.devToken);
                ynabAPI.accounts
                  .getAccounts(values.budgetId)
                  .then(accountResponse => {
                    console.log('accounts', accountResponse);
                    let ynabAccounts = accountResponse.data.accounts
                      .filter(account => account.closed === false)
                      .map(account => {
                        return {
                          name: account.name,
                          starting: Math.abs(account.cleared_balance) / 1000,
                          interest: 0,
                          vehicle: 'operating'
                        };
                      });
                    let ynabScheduledTransactions = [];
                    if (values.importTransactions) {
                      ynabAPI.scheduledTransactions
                        .getScheduledTransactions(values.budgetId)
                        .then(scheduledTransactionResponse => {
                          console.log(
                            'transactions',
                            scheduledTransactionResponse
                          );
                          scheduledTransactionResponse.data.scheduled_transactions.forEach(
                            transaction => {
                              let ynabSanitizedFrequency = consumeYNABRepeat(
                                transaction,
                                ynabScheduledTransactions
                              );
                              ynabScheduledTransactions.push({
                                id: transaction.id,
                                raccount: transaction.account_name,
                                category:
                                  consumeYNABType(transaction) === 'transfer'
                                    ? 'transfer'
                                    : transaction.category_name,
                                type: consumeYNABType(transaction),
                                start: transaction.date_first,
                                rtype: ynabSanitizedFrequency.repeat,
                                cycle: ynabSanitizedFrequency.cycle,
                                value: Math.abs(transaction.amount) / 1000
                              });
                            }
                          );
                          model.addYNAB(
                            {
                              devToken: values.devToken,
                              budgetId: values.budgetId
                            },
                            ynabAccounts,
                            ynabScheduledTransactions
                          );
                        });
                    } else {
                      model.addYNAB(
                        {
                          devToken: values.devToken,
                          budgetId: values.budgetId
                        },
                        ynabAccounts,
                        ynabScheduledTransactions
                      );
                    }
                  })
                  .catch(error => {
                    console.log(error);
                  });
                actions.setSubmitting(false);
                actions.resetForm();
              }}
              render={({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting
              }) => (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label">Developer Token</label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <p className="control">
                          <Field
                            type="text"
                            name="devToken"
                            className="input"
                          />
                        </p>
                      </div>
                    </div>
                    {touched.devToken && errors.devToken && (
                      <div>{errors.devToken}</div>
                    )}
                  </div>
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label">Budget ID</label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <p className="control">
                          <Field
                            type="text"
                            name="budgetId"
                            className="input"
                          />
                        </p>
                      </div>
                    </div>
                    {touched.budgetId && errors.budgetId && (
                      <div>{errors.budgetId}</div>
                    )}
                  </div>
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="checkbox">
                        <Field type="checkbox" name="importTransactions" />{' '}
                        Import Transactions Too (Recommend Only Doing This
                        Initially)
                      </label>
                    </div>
                    {touched.importTransactions &&
                      errors.importTransactions && (
                        <div>{errors.importTransactions}</div>
                      )}
                  </div>
                  <div className="field is-grouped is-grouped-centered">
                    <div className="control">
                      <button
                        className="button is-link"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        Load Accounts
                      </button>
                    </div>
                  </div>
                </form>
              )}
            />
          )}
        </State.Consumer>
      </React.Fragment>
    );
  }
}

export default YNABInput;

const consumeYNABType = transaction => {
  if (transaction.transfer_account_id) {
    return 'transfer';
  } else if (transaction.category_name === 'Inflow: To Be Budgeted') {
    return 'income';
  } else {
    return 'expense';
  }
};

const consumeYNABRepeat = (transaction, scheduledArray) => {
  let ynabSanitizedFrequency = {};
  switch (transaction.frequency) {
    default:
    case 'never':
      ynabSanitizedFrequency.repeat = 'none';
      ynabSanitizedFrequency.cycle = 0;
      break;
    case 'daily':
      ynabSanitizedFrequency.repeat = 'daily';
      ynabSanitizedFrequency.cycle = 1;
      break;
    case 'weekly':
      ynabSanitizedFrequency.repeat = 'day of week';
      ynabSanitizedFrequency.cycle = getDay(parseDate(transaction.date_first));
      break;
    case 'everyOtherWeek':
      ynabSanitizedFrequency.repeat = 'daily';
      ynabSanitizedFrequency.cycle =
        getDay(parseDate(transaction.date_first)) + 14;
      break;
    case 'twiceAMonth':
      ynabSanitizedFrequency.repeat = 'day of month';
      ynabSanitizedFrequency.cycle = getDate(parseDate(transaction.date_first));
      // the above will create the first,
      // and the below will add in the second
      scheduledArray.push({
        id: transaction.id,
        raccount: transaction.account_name,
        category: transaction.category_name,
        type: consumeYNABType(transaction),
        start: transaction.date_next,
        rtype: 'day of month',
        cycle: getDate(parseDate(transaction.date_last)),
        value: Math.abs(transaction.amount) / 1000
      });
      break;
    case 'every4Weeks':
      ynabSanitizedFrequency.repeat = 'daily';
      ynabSanitizedFrequency.cycle = 28;
      break;
    case 'monthly':
      ynabSanitizedFrequency.repeat = 'day of month';
      ynabSanitizedFrequency.cycle = getDate(parseDate(transaction.date_first));
      break;
    // we can't deal with:
    // everyOtherMonth, every3Months, every4Months, twiceAYear, yearly, everyOtherYear
    // so we punt for now and put it in the default case
  }

  return ynabSanitizedFrequency;
};

const parseDate = stringDate => parse(stringDate, 'yyyy-MM-dd', new Date());
