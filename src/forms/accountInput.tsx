import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
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

const AccountSchema = z.object({
  name: z.string().min(1),
  starting: z.number().default(0.0),
  interest: z.number().default(0.0),
  vehicle: z
    .enum(['operating', 'loan', 'credit line', 'investment'])
    .default('operating')
});

function AccountInput() {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const dispatch = useDispatch();
  const { Field, handleSubmit, Subscribe, reset } = useForm({
    defaultValues: locationState?.account ?? {
      name: '',
      starting: 0.0,
      interest: 0.0,
      vehicle: AccountSchema.shape.vehicle._def.defaultValue()
    },
    onSubmit: ({ value }) => {
      console.log(value);
      dispatch(accountAdd(value));
      reset();
      navigate(locationState?.navigateTo ?? '..', { relative: 'path' });
    },
    validatorAdapter: zodValidator()
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
          validators={{ onChange: AccountSchema.shape.name }}
          children={(field) => (
            <TextField
              label="Name"
              isRequired={!AccountSchema.shape.name.isOptional()}
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
          validators={{ onChange: AccountSchema.shape.starting }}
          children={(field) => (
            <NumberField
              label="Starting"
              isRequired={!AccountSchema.shape.starting.isOptional()}
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
          validators={{ onChange: AccountSchema.shape.interest }}
          children={(field) => (
            <NumberField
              label="Interest"
              isRequired={!AccountSchema.shape.interest.isOptional()}
              step={0.01}
              formatOptions={{
                style: 'percent'
              }}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e)}
              errorMessage={field.state.meta.errors.join(', ')}
            />
          )}
        />

        <Field
          name="vehicle"
          validators={{ onChange: AccountSchema.shape.vehicle }}
          children={(field) => (
            <Select
              label="Account Vehicle"
              isRequired={!AccountSchema.shape.vehicle.isOptional()}
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
              {isSubmitting ? '...' : 'Add Account'}
            </Button>
          )}
        />
      </form>
    </>
  );
}

export default AccountInput;
