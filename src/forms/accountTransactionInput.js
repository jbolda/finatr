import React from 'react';
import { State } from '../state';
import { Formik, Field } from 'formik';

class AccountTransactionInput extends React.Component {
  constructor() {
    super();
    this.state = { visible: true };
  }

  toggleAccountTransactionVisibility() {
    this.setState((prevState, props) => ({ visible: !prevState.visible }));
  }

  render() {
    return this.state.visible ? (
      <div className="box">
        <h1 className="title has-text-centered">Add Debt Payback</h1>
        <State.Consumer>
          {model => (
            <Formik
              initialValues={{
                id: '',
                debtAccount: 'select',
                raccount: 'select',
                start: '',
                rtype: 'none',
                cycle: 0,
                occurences: 0,
                value: 0,
                ...model.forms.accountTransactionForm.state
              }}
              onSubmit={(values, actions) => {
                model.upsertAccountTransaction(values);
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
                      <label className="label">debt account</label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <div className="control">
                          <div className="select">
                            <Field component="select" name="debtAccount">
                              {model.state.accounts
                                .filter(account => account.vehicle === 'debt')
                                .map(account => (
                                  <option
                                    key={account.name}
                                    value={account.name}
                                  >
                                    {account.name}
                                  </option>
                                ))}
                            </Field>
                          </div>
                        </div>
                      </div>
                    </div>
                    {touched.debtAccount && errors.debtAccount && (
                      <div>{errors.debtAccount}</div>
                    )}
                  </div>
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label">payment account</label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <div className="control">
                          <div className="select">
                            <Field component="select" name="raccount">
                              {model.state.accounts.map(account => (
                                <option key={account.name} value={account.name}>
                                  {account.name}
                                </option>
                              ))}
                            </Field>
                          </div>
                        </div>
                      </div>
                    </div>
                    {touched.raccount && errors.raccount && (
                      <div>{errors.raccount}</div>
                    )}
                  </div>
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label">start</label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <p className="control">
                          <Field
                            name="start"
                            className="input"
                            type="date"
                            pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                          />
                        </p>
                      </div>
                    </div>
                    {touched.start && errors.start && <div>{errors.start}</div>}
                  </div>
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label">occurences</label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <p className="control">
                          <Field
                            type="number"
                            name="occurences"
                            className="input"
                          />
                        </p>
                      </div>
                    </div>
                    {touched.occurences && errors.occurences && (
                      <div>{errors.occurences}</div>
                    )}
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
          )}
        </State.Consumer>
      </div>
    ) : null;
  }
}

export default AccountTransactionInput;
