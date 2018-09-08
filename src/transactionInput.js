import React from 'react';
import { Formik, Field } from 'formik';

class TransactionInput extends React.Component {
  render() {
    const { accounts } = this.props;
    return (
      <React.Fragment>
        <h1 className="title has-text-centered">Add a Transaction</h1>
        <Formik
          initialValues={this.props.initialValues}
          onSubmit={(values, actions) => {
            this.props.addTransaction(values);
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
              <Field
                type="text"
                name="id"
                className="input"
                style={{ display: 'none' }}
              />
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">account</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <div className="control">
                      <div className="select">
                        <Field component="select" name="raccount">
                          {accounts.map(account => (
                            <option key={account.name} value={account.name}>
                              {account.name}
                            </option>
                          ))}
                        </Field>
                      </div>
                    </div>
                  </div>
                </div>
                {touched.raccount &&
                  errors.raccount && <div>{errors.raccount}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">description</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <Field type="text" name="description" className="input" />
                    </p>
                  </div>
                </div>

                {touched.description &&
                  errors.description && <div>{errors.description}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">category</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <Field type="text" name="category" className="input" />
                    </p>
                  </div>
                </div>
                {touched.category &&
                  errors.category && <div>{errors.category}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">type</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <div className="control">
                      <div className="select">
                        <Field component="select" name="type">
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                          <option value="transfer">Transfer</option>
                        </Field>
                      </div>
                    </div>
                  </div>
                </div>
                {touched.type && errors.type && <div>{errors.type}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">start</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <Field type="text" name="start" className="input" />
                    </p>
                  </div>
                </div>
                {touched.start && errors.start && <div>{errors.start}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">rtype</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <div className="select">
                      <Field component="select" name="rtype">
                        <option value="none">No Repeating</option>
                        <option value="day">
                          Repeat Daily (or Every X Day)
                        </option>
                        <option value="day of week">
                          Repeat on a Day of the Week
                        </option>
                        <option value="day of month">
                          Repeat on a Day of the Month
                        </option>
                        <option value="bimonthly">
                          Repeat Every Other Month on Day
                        </option>
                        <option value="quarterly">
                          Repeat Every Quarter on Day
                        </option>
                        <option value="semiannually">
                          Repeat Twice a Year on Day
                        </option>
                        <option value="annually">
                          Repeat Every Year on Day
                        </option>
                      </Field>
                    </div>
                  </div>
                </div>
                {touched.rtype && errors.rtype && <div>{errors.rtype}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">cycle</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <Field type="number" name="cycle" className="input" />
                    </p>
                  </div>
                </div>
                {touched.cycle && errors.cycle && <div>{errors.cycle}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">value</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <Field type="number" name="value" className="input" />
                    </p>
                  </div>
                </div>
                {touched.value && errors.value && <div>{errors.value}</div>}
              </div>
              <div className="field is-grouped is-grouped-centered">
                <div className="control">
                  <button
                    className="button is-link"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Add Transaction
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

export default TransactionInput;
