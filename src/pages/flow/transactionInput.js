import React from 'react';
import { State } from '../../state';
import { Formik, Field } from 'formik';

import * as Form from '../../components/bootstrap/Form';

function FieldInput({
  fieldName,
  touched,
  errors,
  fieldType = 'text',
  pattern
}) {
  return (
    <React.Fragment>
      <Form.Field>
        <Form.FieldLabel>{fieldName}</Form.FieldLabel>
        <Form.FieldControl>
          <Field
            type={fieldType}
            name={fieldName}
            pattern={pattern}
            className="input"
          />
        </Form.FieldControl>
      </Form.Field>
      {touched[fieldName] && errors[fieldName] && (
        <div>{errors[fieldName]}</div>
      )}
    </React.Fragment>
  );
}

class TransactionInput extends React.Component {
  render() {
    return (
      <React.Fragment>
        <h1 className="title has-text-centered">Add a Transaction</h1>
        <State.Consumer>
          {model => (
            <Formik
              initialValues={{
                id: '',
                raccount: 'select',
                description: '',
                category: '',
                type: 'income',
                start: '2018-01-01',
                rtype: 'none',
                cycle: 0,
                value: 0,
                ...model.forms.transactionForm.state
              }}
              onSubmit={(values, actions) => {
                model.transactionUpsert(values);
                actions.setSubmitting(false);
                actions.resetForm();
                this.props.tabClick(0);
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
                  <Form.Field>
                    <Form.FieldLabel>account</Form.FieldLabel>
                    <Form.FieldControl>
                      <div className="select">
                        <Field component="select" name="raccount">
                          <option key={'default'} value={'select'} disabled>
                            Select an Option
                          </option>
                          {model.state.accountsComputed.map(account => (
                            <option key={account.name} value={account.name}>
                              {account.name}
                            </option>
                          ))}
                        </Field>
                      </div>
                    </Form.FieldControl>
                  </Form.Field>
                  {touched.raccount && errors.raccount && (
                    <div>{errors.raccount}</div>
                  )}

                  <FieldInput
                    errors={errors}
                    fieldName="description"
                    touched={touched}
                  />

                  <FieldInput
                    errors={errors}
                    fieldName="category"
                    touched={touched}
                  />

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

                  <FieldInput
                    errors={errors}
                    fieldName="start"
                    touched={touched}
                    fieldType="date"
                    pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                  />

                  <FieldInput
                    errors={errors}
                    fieldName="occurrences"
                    touched={touched}
                    fieldType="number"
                  />

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

                  <FieldInput
                    errors={errors}
                    fieldName="cycle"
                    touched={touched}
                    fieldType="number"
                  />

                  <FieldInput
                    errors={errors}
                    fieldName="value"
                    touched={touched}
                    fieldType="number"
                  />

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
      </React.Fragment>
    );
  }
}

export default TransactionInput;
