import React from 'react';
import { State } from '~/src/state';
import { useDispatch } from 'starfx/react';
import { accountAdd } from '../../store/thunks/accounts';

import { Input } from '~/src/elements/Input';
import { Select } from '~/src/elements/Select';
import { Button } from '~/src/elements/Button';

import { Formik, Field } from 'formik';
import * as yup from 'yup';
import { FieldGroup } from '../../components/Form';

const AccountSchema = yup.object().shape({
  name: yup.string().min(1).required('Required'),
  starting: yup.number().required('Required'),
  interest: yup.number(),
  vehicle: yup
    .mixed()
    .oneOf(['operating', 'loan', 'credit line', 'investment'])
    .required('Required')
});

function AccountInput(props) {
  const dispatch = useDispatch();
  return (
    <div>
      <h4 variant="subtle">Add an Account</h4>
      <State.Consumer>
        {(model) => (
          <Formik
            initialValues={model.forms.accountForm.values}
            enableReinitialize={true}
            validationSchema={AccountSchema}
            onSubmit={(values, actions) => {
              dispatch(accountAdd(values));
              model.upsertAccount(values);
              actions.setSubmitting(false);
              actions.resetForm();
              props.tabClick(0);
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
                    name="starting"
                    id="starting"
                  />
                </FieldGroup>

                <FieldGroup errors={errors} name="interest" touched={touched}>
                  <Field
                    as={Input}
                    type="number"
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
                  <Button type="submit" disabled={isSubmitting}>
                    Add Account
                  </Button>
                </div>
              </form>
            )}
          </Formik>
        )}
      </State.Consumer>
    </div>
  );
}

export default AccountInput;
