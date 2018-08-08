import React from 'react';
import { Formik, Field } from 'formik';
import * as ynab from 'ynab';

class YNABInput extends React.Component {
  render() {
    return (
      <React.Fragment>
        <h1 className="title has-text-centered">Add All Accounts from YNAB</h1>
        <h2 className="subtitle has-text-centered">
          This all happens in your browser and is only exchanged with YNAB.
        </h2>
        <Formik
          initialValues={{
            devToken: this.props.initialDevToken
              ? this.props.initialDevToken
              : ``,
            budgetId: this.props.initialBudgetId
              ? this.props.initialBudgetId
              : ``,
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
                      console.log('transactions', scheduledTransactionResponse);
                      ynabScheduledTransactions = scheduledTransactionResponse.data.scheduled_transactions.map(
                        transaction => ({
                          id: transaction.id,
                          raccount: transaction.account_name,
                          category: transaction.category_name,
                          type: `expense`,
                          start: transaction.date_first,
                          rtype: transaction.frequency,
                          cycle: 5,
                          value: transaction.amount / 1000
                        })
                      );
                      this.props.addYNAB(
                        {
                          devToken: values.devToken,
                          budgetId: values.budgetId
                        },
                        ynabAccounts,
                        ynabScheduledTransactions
                      );
                    });
                } else {
                  this.props.addYNAB(
                    { devToken: values.devToken, budgetId: values.budgetId },
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
                      <Field type="text" name="devToken" className="input" />
                    </p>
                  </div>
                </div>
                {touched.devToken &&
                  errors.devToken && <div>{errors.devToken}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">Budget ID</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <Field type="text" name="budgetId" className="input" />
                    </p>
                  </div>
                </div>
                {touched.budgetId &&
                  errors.budgetId && <div>{errors.budgetId}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="checkbox">
                    <Field type="checkbox" name="importTransactions" /> Import
                    Transactions Too (Recommend Only Doing This Initially)
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
      </React.Fragment>
    );
  }
}

export default YNABInput;
