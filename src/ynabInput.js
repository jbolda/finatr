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
              : ``
          }}
          enableReinitialize={true}
          onSubmit={(values, actions) => {
            let ynabAPI = new ynab.API(values.devToken);
            ynabAPI.accounts
              .getAccounts(values.budgetId)
              .then(response => {
                console.log(response);
                this.props.addYNAB(
                  { devToken: values.devToken, budgetId: values.budgetId },
                  response.data.accounts
                    .filter(account => account.closed === false)
                    .map(account => {
                      return {
                        name: account.name,
                        starting: Math.abs(account.cleared_balance) / 1000,
                        interest: 0,
                        vehicle: 'operating'
                      };
                    })
                );
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
