import { Formik, Field } from 'formik';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'starfx/react';
import * as yup from 'yup';

import { FieldGroup } from '~/src/components/Form.js';

import { Button } from '~/src/elements/Button';
import { Input } from '~/src/elements/Input';
import { Select } from '~/src/elements/Select.js';

import { accountAdd } from '../../store/thunks/accounts';

const AccountSchema = yup.object().shape({
  name: yup.string().min(1).required('Required').default(''),
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
  const { state } = useLocation();
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Add an Account</h1>
      <Formik
        initialValues={state?.account ?? AccountSchema.getDefault()}
        enableReinitialize={true}
        validationSchema={AccountSchema}
        onSubmit={(values, actions) => {
          // numbers seem to come back as text if not touched
          const casted = AccountSchema.cast(values);
          dispatch(accountAdd(casted));
          actions.resetForm();
          actions.setSubmitting(false);
          navigate(state?.navigateTo ?? '..', { relative: 'path' });
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting
        }) => (
          <form onSubmit={handleSubmit} autoComplete="off">
            <FieldGroup errors={errors} name="name" touched={touched}>
              <Field as={Input} type="text" name="name" id="name" />
            </FieldGroup>

            <FieldGroup errors={errors} name="starting" touched={touched}>
              <Field
                as={Input}
                type="number"
                step="0.01"
                name="starting"
                id="starting"
              />
            </FieldGroup>

            <FieldGroup errors={errors} name="interest" touched={touched}>
              <Field
                as={Input}
                type="number"
                step="0.01"
                name="interest"
                id="interest"
              />
            </FieldGroup>

            <FieldGroup errors={errors} name="vehicle" touched={touched}>
              <Field as={Select} name="vehicle" id="vehicle">
                <option value="operating">Operating</option>
                <option value="loan">Loan</option>
                <option value="credit line">Credit Line</option>
                <option value="investment">Investment</option>
              </Field>
            </FieldGroup>

            <div className="mt-4">
              <Button type="submit" isDisabled={isSubmitting}>
                Add Account
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}

export default AccountInput;
