/** @jsx jsx */
import { jsx } from 'theme-ui';
import React from 'react';
import { State } from '../../state';
import {
  Box,
  Heading,
  Button,
  Label,
  Input,
  Select,
  Radio
} from '@theme-ui/components';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { FieldGroup } from '../../components/bootstrap/Form';
import TransactionInputAmountComputed from './transactionInputAmountComputed';

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
  value: Yup.number(),
  computedAmount: Yup.object().shape({
    operation: Yup.string(),
    reference: Yup.mixed().notOneOf(['select']),
    references: Yup.object(),
    on: Yup.object()
  })
});

class TransactionInput extends React.Component {
  render() {
    return (
      <Box
        sx={{
          maxWidth: 512,
          mx: 'auto',
          px: 3
        }}
      >
        <Heading variant="subtle">Add a Transaction</Heading>
        <State.Consumer>
          {model => (
            <Formik
              initialValues={model.forms.transactionForm.values}
              enableReinitialize={true}
              validationSchema={TransactionSchema}
              onSubmit={(values, actions) => {
                model.transactionUpsert(values);
                actions.setSubmitting(false);
                actions.resetForm();
                this.props.tabClick(0);
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
                  <Field
                    name="id"
                    id="id"
                    type="text"
                    sx={{ display: 'none' }}
                  />

                  <FieldGroup errors={errors} name="raccount" touched={touched}>
                    <Field as={Select} name="raccount" id="raccount">
                      <option key={'default'} value={'select'} disabled>
                        Select an Option
                      </option>
                      {model.state.accountsComputed.map(account => (
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
                    <Label>
                      <Field
                        as={Radio}
                        type="radio"
                        name="ending"
                        id="ending"
                        checked={values.ending === 'never'}
                        onChange={() => setFieldValue('ending', 'never')}
                      />
                      never
                    </Label>
                    <Label>
                      <Field
                        as={Radio}
                        type="radio"
                        name="ending"
                        id="ending"
                        checked={values.ending === 'at Date'}
                        onChange={() => setFieldValue('ending', 'at Date')}
                      />
                      at Date
                    </Label>
                    <Label>
                      <Field
                        as={Radio}
                        type="radio"
                        name="ending"
                        id="ending"
                        checked={
                          values.ending === 'after Number of Occurrences'
                        }
                        onChange={() =>
                          setFieldValue('ending', 'after Number of Occurrences')
                        }
                      />
                      after Number of Occurrences
                    </Label>
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
                  </FieldGroup>

                  <FieldGroup errors={errors} name="rtype" touched={touched}>
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

                  <Button
                    sx={{ variant: 'buttons.primary' }}
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Add Transaction
                  </Button>
                </form>
              )}
            </Formik>
          )}
        </State.Consumer>
      </Box>
    );
  }
}

export default TransactionInput;
