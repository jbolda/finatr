import { useForm } from '@tanstack/react-form';
import React from 'react';
import { ListBoxItem } from 'react-aria-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'starfx/react';
import { z } from 'zod';

import { accountAdd } from '~/src/store/thunks/accounts';

import { Button } from '~/src/elements/Button.tsx';
import { NumberField } from '~/src/elements/NumberField.tsx';
import { Select } from '~/src/elements/Select.tsx';
import { TextField } from '~/src/elements/TextField.tsx';

import { getSchemaBase } from './helpers';

const AccountSchema = z.object({
  name: z.string().min(1),
  starting: z.number().nonnegative().step(0.01).default(0.0),
  interest: z.number().nonnegative().default(0.0),
  vehicle: z
    .enum(['operating', 'loan', 'credit line', 'investment'])
    .default('operating')
});

const accountBase = getSchemaBase(AccountSchema);

function AccountInput() {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const dispatch = useDispatch();
  const { Field, handleSubmit, Subscribe, reset } = useForm({
    defaultValues: locationState?.account ?? accountBase.defaults,
    onSubmit: ({ value }) => {
      console.log(value);
      dispatch(accountAdd(value));
      reset();
      navigate(locationState?.navigateTo ?? '..', { relative: 'path' });
    },
    validators: { onChange: AccountSchema }
  });

  return (
    <>
      <h1 className="text-xl py-3">Add an Account</h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
      >
        <Field
          name="name"
          children={(field) => (
            <TextField
              label="Name"
              isRequired={accountBase.required.name}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e)}
              errorMessage={field.state.meta.errors.join(', ')}
            />
          )}
        />

        <Field
          name="starting"
          children={(field) => (
            <NumberField
              label="Starting"
              isRequired={accountBase.required.starting}
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

        <Field
          name="interest"
          children={(field) => (
            <NumberField
              label="Interest"
              isRequired={accountBase.required.interest}
              formatOptions={{
                style: 'percent',
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
              }}
              step={0.0001}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e)}
              errorMessage={field.state.meta.errors.join(', ')}
            />
          )}
        />

        <Field
          name="vehicle"
          children={(field) => (
            <Select
              label="Account Vehicle"
              isRequired={accountBase.required.vehicle}
              items={[
                { id: 'operating', name: 'Operating' },
                { id: 'loan', name: 'Loan' },
                { id: 'credit line', name: 'Credit Line' },
                { id: 'investment', name: 'Investment' }
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
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" isDisabled={!canSubmit}>
              {isSubmitting
                ? '...'
                : locationState?.account
                  ? `Modify Account`
                  : `Add Account`}
            </Button>
          )}
        />
      </form>
    </>
  );
}

export default AccountInput;
