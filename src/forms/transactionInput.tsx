import { parseDate, today, getLocalTimeZone } from '@internationalized/date';
import { useForm, useStore } from '@tanstack/react-form';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'starfx/react';
import { z } from 'zod';

import { transactionAdd } from '~/store/thunks/transactions.ts';
import { toHumanReoccurrence } from '~/store/utils/reoccurrence';

import { DatePicker } from '~/components/DatePicker.tsx';
import { ListBoxItem } from '~/components/ListBox.tsx';
import { Radio, RadioGroup } from '~/components/RadioGroup.tsx';

import { Button } from '~/elements/Button.tsx';
import { NumberField } from '~/elements/NumberField.tsx';
import { Select } from '~/elements/Select.tsx';
import { TextField } from '~/elements/TextField.tsx';

import { accountsFromSerialized } from '../store/selectors/accounts.ts';
import { getSchemaBase } from './helpers.ts';

// import TransactionInputAmountComputed from './transactionInputAmountComputed';

const TransactionFormSchema = z.object({
  id: z.string().optional(),
  raccount: z.string().default('none'),
  transferIn: z.string().default('none').nullable(),
  description: z.string().default(''),
  category: z.string().min(1),
  type: z.enum(['income', 'expense', 'transfer']).default('expense'),
  start: z.iso.date().default(today(getLocalTimeZone()).toString()),
  end: z.iso.date().optional(),
  occurrences: z.number().default(0),
  beginAfterOccurrences: z.number().optional().default(0),
  ending: z
    .enum(['never', 'at date', 'after number of occurrences'])
    .default('never'),
  rtype: z
    .enum([
      'none',
      'day',
      'day of week',
      'day of month',
      'bimonthly',
      'quarterly',
      'semiannually',
      'annually'
    ])
    .default('none'),
  cycle: z.number().default(0),
  value: z.number().default(0),
  valueType: z
    .enum(['static']) //, 'dynamic'])
    .optional()
    .default('static')
  // computedAmount: yup.object().shape({
  //   operation: yup.string(),
  //   reference: yup.mixed().notOneOf(['select']),
  //   references: yup.object(),
  //   on: yup.object()
  // })
});

const baseTransaction = getSchemaBase(TransactionFormSchema);

function TransactionInput() {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const dispatch = useDispatch();
  const accountsList = useSelector(accountsFromSerialized);
  const accounts = accountsList.sort((a, b) => (a.name > b.name ? 1 : -1));
  const { Field, handleSubmit, Subscribe, reset, store } = useForm({
    defaultValues: locationState?.transaction ?? baseTransaction.defaults,
    onSubmit: ({ value }) => {
      console.log(value);
      dispatch(transactionAdd(value));
      reset();
      navigate(locationState?.navigateTo ?? '..', { relative: 'path' });
    },
    validators: { onChange: TransactionFormSchema }
  });
  const ending = useStore(store, (state) => state.values.ending);

  if (accounts.length === 0) {
    return <p>Make an account first...</p>;
  }

  return (
    <>
      <h1 className="text-xl py-3">Add a Transaction</h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
      >
        <Field
          name="id"
          children={(field) => (
            <TextField
              label="ID"
              isRequired={baseTransaction.required.id}
              className="hidden"
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e)}
              errorMessage={field.state.meta.errors.join(', ')}
            />
          )}
        />

        <Field
          name="raccount"
          children={(field) => (
            <Select
              label="Account"
              isRequired={baseTransaction.required.raccount}
              items={accounts}
              selectedKey={field.state.value}
              onBlur={field.handleBlur}
              onSelectionChange={(e) => field.handleChange(e)}
              errorMessage={field.state.meta.errors.join(', ')}
            >
              {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
            </Select>
          )}
        />

        <Field
          name="description"
          children={(field) => (
            <TextField
              label="Description"
              isRequired={baseTransaction.required.description}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e)}
              errorMessage={field.state.meta.errors.join(', ')}
            />
          )}
        />

        <Field
          name="category"
          children={(field) => (
            <TextField
              label="Category"
              isRequired={baseTransaction.required.category}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e)}
              errorMessage={field.state.meta.errors.join(', ')}
            />
          )}
        />

        <Field
          name="type"
          children={(field) => (
            <Select
              label="Transaction Type"
              isRequired={baseTransaction.required.type}
              name={field.name}
              items={[
                { id: 'income', name: 'Income' },
                { id: 'expense', name: 'Expense' },
                { id: 'transfer', name: 'Transfer' }
              ]}
              selectedKey={field.state.value}
              onBlur={field.handleBlur}
              onSelectionChange={(e) => field.handleChange(e)}
              errorMessage={field.state.meta.errors.join(', ')}
            >
              {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
            </Select>
          )}
        />

        <Subscribe
          selector={(state) => state.values.type}
          children={(transactionType) => (
            <Field
              name="transferIn"
              children={(field) =>
                transactionType !== 'income' ? (
                  <Select
                    label="Account Target"
                    isRequired={!baseTransaction.required.transferIn}
                    items={[{ id: 'none', name: 'none' }].concat(accounts)}
                    selectedKey={field.state.value}
                    onBlur={field.handleBlur}
                    onSelectionChange={(e) =>
                      field.handleChange(e === 'none' ? null : e)
                    }
                    errorMessage={field.state.meta.errors.join(', ')}
                  >
                    {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
                  </Select>
                ) : null
              }
            />
          )}
        />

        <Field
          name="start"
          // this is a complex value saved as a string, skip field validation for now
          // validators={{ onChange: TransactionSchema.shape.start }}
          children={(field) => (
            <DatePicker
              label="Start Date"
              isRequired={baseTransaction.required.start}
              shouldForceLeadingZeros
              value={parseDate(field.state.value)}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e?.toString() ?? '')}
              errorMessage={field.state.meta.errors.join(', ')}
            />
          )}
        />

        <Field
          name="beginAfterOccurrences"
          children={(field) => (
            <NumberField
              label="Begin After Specified Occurences"
              isRequired={!baseTransaction.required.beginAfterOccurrences}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e)}
              errorMessage={field.state.meta.errors.join(', ')}
            />
          )}
        />

        <Field
          name="ending"
          children={(field) => (
            <RadioGroup
              label="Ending"
              isRequired={baseTransaction.required.ending}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e?.toString() ?? '')}
              errorMessage={field.state.meta.errors.join(', ')}
            >
              <Radio value="never">Never</Radio>
              <Radio value="at date">At Date</Radio>
              <Radio value="after number of occurrences">
                After Number Of Occurrences
              </Radio>
            </RadioGroup>
          )}
        />

        {ending === 'after number of occurrences' ? (
          <Field
            name="occurrences"
            children={(field) => (
              <NumberField
                label="Occurences"
                isRequired={baseTransaction.required.occurrences}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e)}
                errorMessage={field.state.meta.errors.join(', ')}
              />
            )}
          />
        ) : ending === 'at date' ? (
          <Field
            name="end"
            // this is a complex value saved as a string, skip field validation for now
            // validators={{ onChange: TransactionSchema.shape.end }}
            children={(field) => (
              <DatePicker
                label="End Date"
                isRequired={baseTransaction.required.end}
                shouldForceLeadingZeros
                value={parseDate(field.state.value)}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e?.toString() ?? '')}
                errorMessage={field.state.meta.errors.join(', ')}
              />
            )}
          />
        ) : null}

        <Field
          name="rtype"
          children={(field) => (
            <Select
              label="How Often Does This Occur?"
              isRequired={baseTransaction.required.rtype}
              name={field.name}
              items={[
                { id: 'none', name: 'No Repeating' },
                { id: 'day', name: 'Repeat Daily (or Every X Day)' },
                { id: 'day of week', name: 'Repeat on a Day of the Week' },
                { id: 'day of month', name: 'Repeat on a Day of the Month' },
                { id: 'bimonthly', name: 'Repeat Every Other Month on Day' },
                { id: 'quarterly', name: 'Repeat Every Quarter on Day' },
                { id: 'semiannually', name: 'Repeat Twice a Year on Day' },
                { id: 'annually', name: 'Repeat Every Year on Day' }
              ]}
              selectedKey={field.state.value}
              onBlur={field.handleBlur}
              onSelectionChange={(e) => field.handleChange(e)}
              errorMessage={field.state.meta.errors.join(', ')}
            >
              {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
            </Select>
          )}
        />

        <Subscribe
          selector={(state) => state}
          children={(state) => (
            <>
              <Field
                name="cycle"
                children={(field) => (
                  <NumberField
                    label={cycleLabel(state.values.rtype)}
                    isRequired={baseTransaction.required.cycle}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    isDisabled={state.values.rtype === 'none'}
                    description={toHumanReoccurrence(state.values)}
                    onChange={(e) => field.handleChange(e)}
                    errorMessage={field.state.meta.errors.join(', ')}
                  />
                )}
              />
            </>
          )}
        />

        <Field
          name="value"
          children={(field) => (
            <NumberField
              label="Value"
              isRequired={baseTransaction.required.value}
              formatOptions={{
                style: 'currency',
                currency: 'USD',
                currencySign: 'accounting'
              }}
              step={0.01}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e)}
              errorMessage={field.state.meta.errors.join(', ')}
            />
          )}
        />

        {/* <TransactionInputAmountComputed
          errors={errors}
          touched={touched}
          values={values}
          setFieldValue={setFieldValue}
        /> */}

        <Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" isDisabled={!canSubmit}>
              {isSubmitting ? '...' : 'Add Transaction'}
            </Button>
          )}
        />
      </form>
    </>
  );
}

export default TransactionInput;

const cycleLabel = (
  rtype:
    | 'none'
    | 'day'
    | 'day of week'
    | 'day of month'
    | 'bimonthly'
    | 'quarterly'
    | 'semiannually'
    | 'annually'
) => {
  switch (rtype) {
    case 'none':
      return 'No Repeating';
    case 'day':
      return 'How Often?';
    case 'day of week':
      return 'On Which Day Of The Week?';
    case 'day of month':
      return 'Which Day Of The Month?';
    case 'bimonthly':
      return 'Which Day Every Other Month?';
    case 'quarterly':
      return 'On Which Day Of The Quarter?';
    case 'semiannually':
      return 'Which Day Within The 6 Months?';
    case 'annually':
      return 'Which Day Of The Year?';
  }
};
