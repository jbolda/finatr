import { useForm } from '@tanstack/react-form';
import { yupValidator } from '@tanstack/yup-form-adapter';
import { Formik, Field } from 'formik';
import React from 'react';
import { ListBoxItem } from 'react-aria-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'starfx/react';
import * as yup from 'yup';

import { Button } from '~/src/elements/Button';
import { Input } from '~/src/elements/Input';
import { NumberField } from '~/src/elements/NumberField';
import { Select } from '~/src/elements/Select.tsx';
import { TextField } from '~/src/elements/TextField';

import { accountAdd } from '../store/thunks/accounts';

const AccountSchema = yup.object({
  name: yup.string().min(3).required('Required').default(''),
  starting: yup.number().required('Required').default(0.0),
  interest: yup.number().default(0.0),
  vehicle: yup
    .mixed()
    .oneOf(['operating', 'loan', 'credit line', 'investment'])
    .required('Required')
    .default('operating')
});

function AccountInput(props) {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const dispatch = useDispatch();
  const { Field, handleSubmit, state, Subscribe, reset } = useForm({
    defaultValues: locationState?.account ?? AccountSchema.getDefault(),
    onSubmit: ({ value }) => {
      console.log(value);
      dispatch(accountAdd(value));
      reset();
      navigate(locationState?.navigateTo ?? '..', { relative: 'path' });
    },
    validators: { onChange: AccountSchema },
    validatorAdapter: yupValidator()
  });

  return (
    <div>
      <h1>Add an Account</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Field
          name="name"
          children={(field) => (
            <TextField
              label="Name"
              isRequired
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
              isRequired
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
              isRequired
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
          children={(field) => (
            <Select
              label="Account Vehicle"
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
    </div>
  );
}

export default AccountInput;
