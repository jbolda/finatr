import React from 'react';
import { State } from '../../state';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { FieldGroup } from '../../components/bootstrap/Form';

const TransactionSchema = Yup.object().shape({
  id: Yup.string(),
  raccount: Yup.string().required('Required'),
  description: Yup.string(),
  category: Yup.string(),
  type: Yup.mixed()
    .oneOf(['income', 'expense', 'transfer'])
    .required('Required'),
  start: Yup.date().required('Required'),
  end: Yup.date(),
  occurrences: Yup.number(),
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
  cycle: Yup.number().required('Required'),
  value: Yup.number()
    .moreThan(0)
    .required('Required')
});

class TransactionInput extends React.Component {
  render() {
    return (
      <React.Fragment>
        <h1 className="title has-text-centered">Add a Transaction</h1>
        <State.Consumer>
          {model => (
            <Formik
              initialValues={model.forms.transactionForm.values}
              validationSchema={TransactionSchema}
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
                isSubmitting,
                setFieldValue
              }) => (
                <form onSubmit={handleSubmit} autoComplete="off">
                  {console.log(values)}
                  <Field
                    type="text"
                    name="id"
                    className="input"
                    style={{ display: 'none' }}
                  />

                  <FieldGroup errors={errors} name="raccount" touched={touched}>
                    <div className="select">
                      <Field as="select" name="raccount">
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

                  <FieldGroup errors={errors} name="category" touched={touched}>
                    <Field name="category" className="input" />
                  </FieldGroup>

                  <FieldGroup errors={errors} name="type" touched={touched}>
                    <div className="select">
                      <Field as="select" name="type">
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                        <option value="transfer">Transfer</option>
                      </Field>
                    </div>
                  </FieldGroup>

                  <FieldGroup errors={errors} name="start" touched={touched}>
                    <Field
                      name="start"
                      type="date"
                      className="input"
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
                          setFieldValue('ending', 'after Number of Occurrences')
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
                      <Field as="select" name="rtype">
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
                    <Field name="cycle" type="number" className="input" />
                  </FieldGroup>

                  <FieldGroup errors={errors} name="value" touched={touched}>
                    <Field name="value" type="number" className="input" />
                  </FieldGroup>

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
