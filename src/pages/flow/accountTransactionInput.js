import React from 'react';
import { State } from '../../state';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { FieldGroup } from '../../components/bootstrap/Form';
import TransactionInputAmountComputed from './transactionInputAmountComputed';

const AccountTransactionSchema = Yup.object().shape({
  id: Yup.string(),
  debtAccount: Yup.string().required('Required'),
  raccount: Yup.string().required('Required'),
  description: Yup.string(),
  category: Yup.string(),
  start: Yup.date().required('Required'),
  rtype: Yup.mixed()
    .oneOf([
      'none',
      'day',
      'day of week',
      'day of month',
      'bimonthly',
      'quarterly',
      'semiannually',
      'annually'
    ])
    .required('Required'),
  occurrences: Yup.number(),
  cycle: Yup.number().required('Required'),
  value: Yup.number().required('Required')
});

class AccountTransactionInput extends React.Component {
  constructor() {
    super();
    this.state = { visible: true };
  }

  render() {
    return (
      <State.Consumer>
        {model =>
          model.forms.accountTransactionFormVisible.state ? (
            <div className="box">
              <h1 className="title has-text-centered">Add Debt Payback</h1>
              <Formik
                enableReinitialize={true}
                initialValues={model.forms.accountTransactionForm.values}
                validationSchema={AccountTransactionSchema}
                onSubmit={(values, actions) => {
                  model.upsertAccountTransaction(values);
                  actions.setSubmitting(false);
                  actions.resetForm();
                  model.forms.accountTransactionFormVisible.toggle();
                }}
                render={({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting,
                  setFieldValue
                }) => (
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <Field
                      type="text"
                      name="id"
                      className="input"
                      style={{ display: 'none' }}
                    />

                    <FieldGroup
                      errors={errors}
                      name="debtAccount"
                      prettyName="debt account"
                      touched={touched}
                    >
                      <div className="select">
                        <Field component="select" name="debtAccount">
                          <option key={'default'} value={'select'} disabled>
                            Select an Option
                          </option>
                          {model.state.accountsComputed
                            .filter(
                              account =>
                                account.vehicle === 'debt' ||
                                account.vehicle === 'loan' ||
                                account.vehicle === 'credit line'
                            )
                            .map(account => (
                              <option key={account.name} value={account.name}>
                                {account.name}
                              </option>
                            ))}
                        </Field>
                      </div>
                    </FieldGroup>

                    <FieldGroup
                      errors={errors}
                      name="raccount"
                      prettyName="payment account"
                      touched={touched}
                    >
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
                    </FieldGroup>

                    <FieldGroup
                      errors={errors}
                      name="description"
                      touched={touched}
                    >
                      <Field name="description" className="input" />
                    </FieldGroup>

                    <FieldGroup
                      errors={errors}
                      name="category"
                      touched={touched}
                    >
                      <Field name="category" className="input" />
                    </FieldGroup>

                    <FieldGroup errors={errors} name="start" touched={touched}>
                      <Field
                        name="start"
                        className="input"
                        type="date"
                        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                      />
                    </FieldGroup>

                    <FieldGroup
                      errors={errors}
                      name="beginAfterOccurrences"
                      prettyName="begin after X occurrences"
                      touched={touched}
                    >
                      <Field
                        name="beginAfterOccurrences"
                        type="number"
                        className="input"
                      />
                    </FieldGroup>

                    <FieldGroup errors={errors} name="ending" touched={touched}>
                      <label className="radio">
                        <Field
                          type="radio"
                          name="ending"
                          checked={values.ending === 'never'}
                          onChange={() => setFieldValue('ending', 'never')}
                        />
                        never
                      </label>
                      <label className="radio">
                        <Field
                          type="radio"
                          name="ending"
                          checked={values.ending === 'at Date'}
                          onChange={() => setFieldValue('ending', 'at Date')}
                        />
                        at Date
                      </label>
                      <label className="radio">
                        <Field
                          type="radio"
                          name="ending"
                          checked={
                            values.ending === 'after Number of Occurrences'
                          }
                          onChange={() =>
                            setFieldValue(
                              'ending',
                              'after Number of Occurrences'
                            )
                          }
                        />
                        after Number of Occurrences
                      </label>
                      {values.ending === 'after Number of Occurrences' ? (
                        <FieldGroup
                          errors={errors}
                          name="occurrences"
                          touched={touched}
                        >
                          <Field
                            name="occurrences"
                            type="number"
                            className="input"
                          />
                        </FieldGroup>
                      ) : values.ending === 'at Date' ? (
                        <FieldGroup
                          errors={errors}
                          name="end"
                          prettyName="At This Day"
                          touched={touched}
                        >
                          <Field name="end" type="date" className="input" />
                        </FieldGroup>
                      ) : null}
                    </FieldGroup>

                    <FieldGroup errors={errors} name="rtype" touched={touched}>
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
                    </FieldGroup>

                    <FieldGroup errors={errors} name="cycle" touched={touched}>
                      <Field type="number" name="cycle" className="input" />
                    </FieldGroup>

                    <TransactionInputAmountComputed
                      errors={errors}
                      touched={touched}
                      values={values}
                      setFieldValue={setFieldValue}
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
            </div>
          ) : null
        }
      </State.Consumer>
    );
  }
}

export default AccountTransactionInput;
