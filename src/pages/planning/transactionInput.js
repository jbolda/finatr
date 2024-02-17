import React from 'react';
import { State } from '~/src/state';
import { useDispatch } from 'starfx/react';
import { transactionAdd } from '../../store/thunks/transactions';

import { Formik, Field } from 'formik';
import * as yup from 'yup';
import { FieldGroup, Label } from '~/src/components/Form';
import { Button } from '~/src/elements/Button';
import { Input } from '~/src/elements/Input';
import { Select } from '~/src/elements/Select';
import { Radio } from '~/src/elements/Radio';

import TransactionInputAmountComputed from './transactionInputAmountComputed';

const TransactionSchema = yup.object().shape({
  id: yup.string(),
  raccount: yup.string().required('Required'),
  description: yup.string(),
  category: yup.string(),
  type: yup
    .mixed()
    .oneOf(['income', 'expense', 'transfer'])
    .required('Required'),
  start: yup.date().required('Required'),
  end: yup.date(),
  occurrences: yup.number(),
  rtype: yup
    .mixed()
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
  cycle: yup.number().required('Required'),
  value: yup.number(),
  computedAmount: yup.object().shape({
    operation: yup.string(),
    reference: yup.mixed().notOneOf(['select']),
    references: yup.object(),
    on: yup.object()
  })
});

function TransactionInput(props) {
  const dispatch = useDispatch();
  return (
    <>
      <h2>Add a Transaction</h2>
      <State.Consumer>
        {(model) => (
          <Formik
            initialValues={model.forms.transactionForm.values}
            enableReinitialize={true}
            validationSchema={TransactionSchema}
            onSubmit={(values, actions) => {
              dispatch(transactionAdd(values));
              model.transactionUpsert(values);
              actions.setSubmitting(false);
              actions.resetForm();
              props.tabClick(0);
            }}
          >
            {({
              values,
              errors,
              touched,
              handleReset,
              handleSubmit,
              isSubmitting,
              setFieldValue
            }) => (
              <form
                onReset={handleReset}
                onSubmit={handleSubmit}
                autoComplete="off"
              >
                <Field name="id" id="id" type="text" className="hidden" />

                <FieldGroup errors={errors} name="raccount" touched={touched}>
                  <Field as={Select} name="raccount" id="raccount">
                    <option key={'default'} value={''} disabled>
                      Select an Option
                    </option>
                    {model.state.accountsComputed.map((account) => (
                      <option key={account.name} value={account.name}>
                        {account.name}
                      </option>
                    ))}
                  </Field>
                </FieldGroup>

                <FieldGroup
                  errors={errors}
                  name="description"
                  touched={touched}
                >
                  <Field as={Input} name="description" id="description" />
                </FieldGroup>

                <FieldGroup errors={errors} name="category" touched={touched}>
                  <Field as={Input} name="category" id="category" />
                </FieldGroup>

                <FieldGroup errors={errors} name="type" touched={touched}>
                  <Field as={Select} name="type" id="type">
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="transfer">Transfer</option>
                  </Field>
                </FieldGroup>

                <FieldGroup errors={errors} name="start" touched={touched}>
                  <Field
                    as={Input}
                    name="start"
                    id="start"
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
                    as={Input}
                    name="beginAfterOccurrences"
                    id="beginAfterOccurrences"
                    type="number"
                  />
                </FieldGroup>

                <FieldGroup errors={errors} name="ending" touched={touched}>
                  <Label name="ending" prettyName="never">
                    <Field
                      as={Radio}
                      type="radio"
                      name="ending"
                      id="ending"
                      checked={values.ending === 'never'}
                      onChange={() => setFieldValue('ending', 'never')}
                    />
                  </Label>
                  <Label name="ending" prettyName="at Date">
                    <Field
                      as={Radio}
                      type="radio"
                      name="ending"
                      id="ending"
                      checked={values.ending === 'at Date'}
                      onChange={() => setFieldValue('ending', 'at Date')}
                    />
                  </Label>
                  <Label name="ending" prettyName="after Number of Occurrences">
                    <Field
                      as={Radio}
                      type="radio"
                      name="ending"
                      id="ending"
                      checked={values.ending === 'after Number of Occurrences'}
                      onChange={() =>
                        setFieldValue('ending', 'after Number of Occurrences')
                      }
                    />
                  </Label>
                </FieldGroup>
                {values.ending === 'after Number of Occurrences' ? (
                  <FieldGroup
                    errors={errors}
                    name="occurrences"
                    touched={touched}
                  >
                    <Field
                      as={Input}
                      name="occurrences"
                      id="occurrences"
                      type="number"
                    />
                  </FieldGroup>
                ) : values.ending === 'at Date' ? (
                  <FieldGroup
                    errors={errors}
                    name="end"
                    prettyName="At This Day"
                    touched={touched}
                  >
                    <Field as={Input} name="end" id="end" type="date" />
                  </FieldGroup>
                ) : null}

                <FieldGroup
                  errors={errors}
                  name="rtype"
                  prettyName="repeat type"
                  touched={touched}
                >
                  <Field as={Select} name="rtype" id="rtype">
                    <option value="none">No Repeating</option>
                    <option value="day">Repeat Daily (or Every X Day)</option>
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
                    <option value="annually">Repeat Every Year on Day</option>
                  </Field>
                </FieldGroup>

                <FieldGroup errors={errors} name="cycle" touched={touched}>
                  <Field as={Input} name="cycle" id="cycle" type="number" />
                </FieldGroup>

                <TransactionInputAmountComputed
                  errors={errors}
                  touched={touched}
                  values={values}
                  setFieldValue={setFieldValue}
                />

                <div className="mt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    Add Transaction
                  </Button>
                </div>
              </form>
            )}
          </Formik>
        )}
      </State.Consumer>
    </>
  );
}

export default TransactionInput;
