/** @jsx jsx */
import { jsx } from 'theme-ui';
import React from 'react';
import { State } from '../../state';
import { Box, Heading, Button } from '@theme-ui/components';
import { Input, Select } from '@rebass/forms';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { FieldGroup } from '../../components/bootstrap/Form';

const AccountSchema = Yup.object().shape({
  name: Yup.string()
    .min(1)
    .required('Required'),
  starting: Yup.number().required('Required'),
  interest: Yup.number(),
  vehicle: Yup.mixed()
    .oneOf(['operating', 'loan', 'credit line', 'investment'])
    .required('Required')
});

class AccountInput extends React.Component {
  render() {
    return (
      <Box
        sx={{
          maxWidth: 512,
          mx: 'auto',
          px: 3
        }}
      >
        <Heading>Add an Account</Heading>
        <State.Consumer>
          {model => (
            <Formik
              initialValues={model.forms.accountForm.values}
              enableReinitialize={true}
              validationSchema={AccountSchema}
              onSubmit={(values, actions) => {
                model.upsertAccount(values);
                actions.setSubmitting(false);
                actions.resetForm();
                this.props.tabClick(0);
              }}
              render={({
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

                  <Button
                    sx={{ variant: 'buttons.primary' }}
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Add Account
                  </Button>
                </form>
              )}
            />
          )}
        </State.Consumer>
      </Box>
    );
  }
}

export default AccountInput;
