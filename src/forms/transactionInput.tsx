import { parseDate, today, getLocalTimeZone } from '@internationalized/date';
import { useForm, useStore } from '@tanstack/react-form';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'starfx/react';
import { z } from 'zod';

import { schema } from '~/store/schema.ts';
import { transactionAdd } from '~/store/thunks/transactions.ts';
import { toHumanReoccurrence } from '~/store/utils/reoccurrence.ts';

import { DatePicker } from '~/components/DatePicker.tsx';
import { ListBoxItem } from '~/components/ListBox.tsx';
import { Radio, RadioGroup } from '~/components/RadioGroup.tsx';

import { Button } from '~/elements/Button.tsx';
import { NumberField } from '~/elements/NumberField.tsx';
import { Select } from '~/elements/Select.tsx';
import { TextField } from '~/elements/TextField.tsx';

// import TransactionInputAmountComputed from './transactionInputAmountComputed';

const TransactionSchema = z.object({
  id: z.string().optional(),
  raccount: z.string().default('none'),
  transferIn: z.string().default('none').nullable(),
  description: z.string().default(''),
  category: z.string().min(1),
  type: z.enum(['income', 'expense', 'transfer']).default('expense'),
  start: z.string().date(),
  end: z.string().date().optional(),
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

function TransactionInput() {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const dispatch = useDispatch();
  const accountsList = useSelector(schema.accounts.selectTableAsList);
  const accounts = accountsList.sort((a, b) => (a.name > b.name ? 1 : -1));
  const { Field, handleSubmit, Subscribe, reset, store, state } = useForm({
    defaultValues: locationState?.transaction ?? {
      id: '',
      raccount: 'none',
      transferIn: 'none',
      description: '',
      category: '',
      type: TransactionSchema.shape.type._def.defaultValue(),
      start: today(getLocalTimeZone()).toString(),
      end: undefined,
      occurrences: TransactionSchema.shape.occurrences._def.defaultValue(),
      beginAfterOccurrences:
        TransactionSchema.shape.beginAfterOccurrences._def.defaultValue(),
      ending: TransactionSchema.shape.ending._def.defaultValue(),
      rtype: TransactionSchema.shape.rtype._def.defaultValue(),
      cycle: TransactionSchema.shape.cycle._def.defaultValue(),
      value: TransactionSchema.shape.value._def.defaultValue(),
      valueType: TransactionSchema.shape.valueType._def.defaultValue()
    },
    onSubmit: ({ value }) => {
      console.log(value);
      dispatch(transactionAdd(value));
      reset();
      navigate(locationState?.navigateTo ?? '..', { relative: 'path' });
    },
    validators: { onChange: TransactionSchema }
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
          console.log(e);
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
              isRequired={!TransactionSchema.shape.id.isOptional()}
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
              isRequired={!TransactionSchema.shape.raccount.isOptional()}
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
              isRequired={!TransactionSchema.shape.description.isOptional()}
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
              isRequired={!TransactionSchema.shape.category.isOptional()}
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
              isRequired={!TransactionSchema.shape.type.isOptional()}
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
                    isRequired={
                      !TransactionSchema.shape.transferIn.isOptional()
                    }
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
              isRequired={!TransactionSchema.shape.start.isOptional()}
              shouldForceLeadingZeros
              value={parseDate(field.state.value)}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.toString())}
              errorMessage={field.state.meta.errors.join(', ')}
            />
          )}
        />

        <Field
          name="beginAfterOccurrences"
          children={(field) => (
            <NumberField
              label="Begin After Specified Occurences"
              isRequired={
                !TransactionSchema.shape.beginAfterOccurrences.isOptional()
              }
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
              isRequired={!TransactionSchema.shape.ending.isOptional()}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e)}
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
                isRequired={!TransactionSchema.shape.occurrences.isOptional()}
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
                isRequired={!TransactionSchema.shape.end.isOptional()}
                shouldForceLeadingZeros
                value={parseDate(field.state.value)}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.toString())}
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
              isRequired={!TransactionSchema.shape.rtype.isOptional()}
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
                    isRequired={!TransactionSchema.shape.cycle.isOptional()}
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
              isRequired={!TransactionSchema.shape.value.isOptional()}
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
