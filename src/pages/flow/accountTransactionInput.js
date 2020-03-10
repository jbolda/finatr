import React from 'react';
import { State } from '../../state';
import { Box, Heading, Button, Label, Input, Select, Radio } from 'theme-ui';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { FieldGroup } from '../../components/bootstrap/Form';
import TransactionInputAmountComputed from './transactionInputAmountComputed';

const ComputedAmountSchema = Yup.object()
  .shape({
    operation: Yup.string(),
    reference: Yup.string()
      .notOneOf(['select'])
      .required('Required'),
    on: Yup.object().when('operation', (operation, ComputedAmountSchema) =>
      operation !== 'none' ? ComputedAmountSchema : Yup.object().strip()
    )
  })
  .required('Required');

const AccountTransactionSchema = Yup.object().shape({
  id: Yup.string(),
  debtAccount: Yup.string()
    .notOneOf(['select'])
    .required('Required'),
  raccount: Yup.string()
    .notOneOf(['select'])
    .required('Required'),
  description: Yup.string(),
  category: Yup.string(),
  start: Yup.date().required('Required'),
  rtype: Yup.string()
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
  value: Yup.number().when('valueType', {
    is: 'static',
    then: Yup.number().required('Required'),
    otherwise: Yup.number()
  }),
  valueType: Yup.string().required(),
  computedAmount: Yup.object().when('valueType', {
    is: 'dynamic',
    then: ComputedAmountSchema,
    otherwise: Yup.object().strip()
  })
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
            <Box
              sx={{
                maxWidth: 512,
                mx: 'auto',
                px: 3
              }}
            >
              <Heading variant="subtle">Add Debt Payback</Heading>
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
                      display="none"
                      type="text"
                      name="id"
                      id="debt-id"
                      sx={{ display: 'none' }}
                    />

                    <FieldGroup
                      errors={errors}
                      name="debtAccount"
                      prettyName="debt account"
                      id="debt-debtAccount"
                      touched={touched}
                    >
                      <Field
                        as={Select}
                        name="debtAccount"
                        id="debt-debtAccount"
                      >
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
                    </FieldGroup>

                    <FieldGroup
                      errors={errors}
                      name="raccount"
                      prettyName="payment account"
                      id="debt-raccount"
                      touched={touched}
                    >
                      <Field as={Select} name="raccount" id="debt-raccount">
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
                      id="debt-description"
                      touched={touched}
                    >
                      <Field
                        as={Input}
                        name="description"
                        id="debt-description"
                      />
                    </FieldGroup>

                    <FieldGroup
                      errors={errors}
                      name="category"
                      id="debt-category"
                      touched={touched}
                    >
                      <Field as={Input} name="category" id="debt-category" />
                    </FieldGroup>

                    <FieldGroup
                      errors={errors}
                      name="start"
                      id="debt-start"
                      touched={touched}
                    >
                      <Field
                        as={Input}
                        name="start"
                        id="debt-start"
                        type="date"
                        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                      />
                    </FieldGroup>

                    <FieldGroup
                      errors={errors}
                      name="beginAfterOccurrences"
                      prettyName="begin after X occurrences"
                      id="debt-beginAfterOccurrences"
                      touched={touched}
                    >
                      <Field
                        as={Input}
                        name="beginAfterOccurrences"
                        id="debt-beginAfterOccurrences"
                        type="number"
                      />
                    </FieldGroup>

                    <FieldGroup
                      errors={errors}
                      name="ending"
                      id="debt-ending"
                      touched={touched}
                    >
                      <Label>
                        <Field
                          as={Radio}
                          type="radio"
                          name="ending"
                          id="debt-ending"
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
                          id="debt-ending"
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
                          id="debt-ending"
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
                      </Label>
                      {values.ending === 'after Number of Occurrences' ? (
                        <FieldGroup
                          errors={errors}
                          name="occurrences"
                          id="debt-occurrences"
                          touched={touched}
                        >
                          <Field
                            as={Input}
                            name="occurrences"
                            id="debt-occurrences"
                            type="number"
                          />
                        </FieldGroup>
                      ) : values.ending === 'at Date' ? (
                        <FieldGroup
                          errors={errors}
                          name="end"
                          id="debt-end"
                          prettyName="At This Day"
                          touched={touched}
                        >
                          <Field
                            as={Input}
                            name="end"
                            id="debt-end"
                            type="date"
                          />
                        </FieldGroup>
                      ) : null}
                    </FieldGroup>

                    <FieldGroup
                      errors={errors}
                      name="rtype"
                      id="debt-rtype"
                      touched={touched}
                    >
                      <Field as={Select} name="rtype" id="debt-rtype">
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
                    </FieldGroup>

                    <FieldGroup
                      errors={errors}
                      name="cycle"
                      id="debt-cycle"
                      touched={touched}
                    >
                      <Field
                        as={Input}
                        type="number"
                        name="cycle"
                        id="debt-cycle"
                      />
                    </FieldGroup>

                    <TransactionInputAmountComputed
                      errors={errors}
                      touched={touched}
                      values={values}
                      setFieldValue={setFieldValue}
                      prefixID={'debt-'}
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
              />
            </Box>
          ) : null
        }
      </State.Consumer>
    );
  }
}

export default AccountTransactionInput;
