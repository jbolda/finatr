import { Formik, Field } from 'formik';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'starfx/react';
import * as yup from 'yup';

import { schema } from '~/src/store/schema.ts';

import { FieldGroup, Label } from '~/src/components/Form.js';

import { Button } from '~/src/elements/Button.tsx';
import { Input } from '~/src/elements/Input.js';
import { Radio } from '~/src/elements/Radio.js';
import { Select } from '~/src/elements/Select.js';

import { transactionAdd } from '../../store/thunks/transactions.ts';
import TransactionInputAmountComputed from './transactionInputAmountComputed';

const TransactionSchema = yup.object().shape({
  id: yup.string().default(''),
  raccount: yup.string().required('Required').default('none'),
  description: yup.string().default(''),
  category: yup.string().default(''),
  type: yup
    .mixed()
    .oneOf(['income', 'expense', 'transfer'])
    .required('Required')
    .default('expense'),
  start: yup.date().required('Required').default(new Date()),
  end: yup.date().default(undefined),
  occurrences: yup.number().default(0),
  beginAfterOccurrences: yup.number().default(0),
  ending: yup
    .mixed()
    .oneOf(['never', 'at Date', 'after Number of Occurrences'])
    .required('Required')
    .default('none'),
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
    .required('Required')
    .default('none'),
  cycle: yup.number().required('Required').default(0),
  value: yup.number().default(0),
  valueType: yup
    .mixed()
    .oneOf(['static']) //, 'dynamic'])
    .required('Required')
    .default('static')
  // computedAmount: yup.object().shape({
  //   operation: yup.string(),
  //   reference: yup.mixed().notOneOf(['select']),
  //   references: yup.object(),
  //   on: yup.object()
  // })
});

function TransactionInput(props) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const accounts = useSelector(schema.accounts.selectTableAsList);
  const dispatch = useDispatch();
  if (accounts.length === 0) {
    return <p>Make an account first...</p>;
  }

  return (
    <>
      <h1>Add a Transaction</h1>
      <Formik
        initialValues={
          state?.transaction
            ? {
                ...TransactionSchema.cast(state.transaction),
                start: new Date()
              }
            : TransactionSchema.getDefault()
        }
        enableReinitialize={true}
        validationSchema={TransactionSchema}
        onSubmit={(values, actions) => {
          console.log({ values });
          const casted = TransactionSchema.cast(values);
          console.log({ casted });
          dispatch(transactionAdd(casted));
          actions.setSubmitting(false);
          actions.resetForm();
          navigate(state?.navigateTo ?? '..', { relative: 'path' });
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
            className="flex flex-col gap-4"
          >
            <Field name="id" id="id" type="text" className="hidden" />

            <FieldGroup errors={errors} name="raccount" touched={touched}>
              <Field as={Select} name="raccount" id="raccount">
                <option key={'default'} value={''} disabled>
                  Select an Option
                </option>
                {accounts.map((account) => (
                  <option key={account.name} value={account.name}>
                    {account.name}
                  </option>
                ))}
              </Field>
            </FieldGroup>

            <FieldGroup errors={errors} name="description" touched={touched}>
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
              <FieldGroup errors={errors} name="occurrences" touched={touched}>
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
                <option value="day of week">Repeat on a Day of the Week</option>
                <option value="day of month">
                  Repeat on a Day of the Month
                </option>
                <option value="bimonthly">
                  Repeat Every Other Month on Day
                </option>
                <option value="quarterly">Repeat Every Quarter on Day</option>
                <option value="semiannually">Repeat Twice a Year on Day</option>
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
              <Button type="submit" isDisabled={isSubmitting}>
                Add Transaction
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </>
  );
}

export default TransactionInput;
