import React from 'react';
import { State } from '~src/state';

import { Formik, Field } from 'formik';
import * as yup from 'yup';
import { FieldGroup, Label } from '../../components/Form';
import { Button } from '~src/elements/Button';
import { Input } from '~src/elements/Input';
import { Select } from '~src/elements/Select';
import TransactionInputAmountComputed from './transactionInputAmountComputed';

const ComputedAmountSchema = yup
  .object()
  .shape({
    operation: yup.string(),
    reference: yup.string().notOneOf(['select']).required('Required'),
    on: yup
      .object()
      .when('operation', (operation, ComputedAmountSchema) =>
        operation !== 'none' ? ComputedAmountSchema : yup.object().strip()
      )
  })
  .required('Required');

const AccountTransactionSchema = yup.object().shape({
  id: yup.string(),
  debtAccount: yup.string().notOneOf(['select']).required('Required'),
  raccount: yup.string().notOneOf(['select']).required('Required'),
  description: yup.string(),
  category: yup.string(),
  start: yup.date().required('Required'),
  rtype: yup
    .string()
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
  occurrences: yup.number(),
  cycle: yup.number().required('Required'),
  value: yup.number().when('valueType', {
    is: 'static',
    then: yup.number().required('Required'),
    otherwise: yup.number()
  }),
  valueType: yup.string().required(),
  computedAmount: yup.object().when('valueType', {
    is: 'dynamic',
    then: ComputedAmountSchema,
    otherwise: yup.object().strip()
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
        {(model) =>
          model.forms.accountTransactionFormVisible.state ? (
            <div>
              <h3 className="text-1xl font-semibold py-5">Add Debt Payback</h3>
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
                      className="hidden"
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
                            (account) =>
                              account.vehicle === 'debt' ||
                              account.vehicle === 'loan' ||
                              account.vehicle === 'credit line'
                          )
                          .map((account) => (
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
                      name="debt-ending"
                      prettyName="ending"
                      touched={touched}
                    >
                      <Label id="debt-ending-never" prettyName="never">
                        <Field
                          as={Input}
                          type="radio"
                          name="ending"
                          id="debt-ending-never"
                          value="never"
                          checked={values.ending === 'never'}
                          onChange={() => setFieldValue('ending', 'never')}
                        />
                      </Label>
                      <Label id="debt-ending-date" prettyName="at Date">
                        <Field
                          as={Input}
                          type="radio"
                          name="ending"
                          id="debt-ending-date"
                          value="at Date"
                          checked={values.ending === 'at Date'}
                          onChange={() => setFieldValue('ending', 'at Date')}
                        />
                      </Label>
                      <Label
                        id="debt-ending-after"
                        prettyName="after Number of Occurrences"
                      >
                        <Field
                          as={Input}
                          type="radio"
                          name="ending"
                          id="debt-ending-after"
                          value="after Number of Occurrences"
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
                      prettyName="repeat type"
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

                    <div className="mt-3">
                      <Button
                        sx={{ variant: 'buttons.primary' }}
                        type="submit"
                        disabled={isSubmitting}
                      >
                        Add Transaction
                      </Button>
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
