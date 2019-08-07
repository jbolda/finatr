import React from 'react';
import { State } from '../../state';
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
      <React.Fragment>
        <h1 className="title has-text-centered">Add an Account</h1>
        <State.Consumer>
          {model => (
            <Formik
              initialValues={model.forms.accountForm.values}
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
                    <Field type="text" name="name" className="input" />
                  </FieldGroup>

                  <FieldGroup errors={errors} name="starting" touched={touched}>
                    <Field type="number" name="starting" className="input" />
                  </FieldGroup>

                  <FieldGroup errors={errors} name="interest" touched={touched}>
                    <Field type="number" name="interest" className="input" />
                  </FieldGroup>

                  <FieldGroup errors={errors} name="vehicle" touched={touched}>
                    <div className="select">
                      <Field as="select" name="vehicle">
                        <option value="operating">Operating</option>
                        <option value="loan">Loan</option>
                        <option value="credit line">Credit Line</option>
                        <option value="investment">Investment</option>
                      </Field>
                    </div>
                  </FieldGroup>

                  <div className="field is-grouped is-grouped-centered">
                    <div className="control">
                      <button
                        className="button is-link"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        Add Account
                      </button>
                    </div>
                  </div>
                </form>
              )}
            />
          )}
        </State.Consumer>
      </React.Fragment>
    );
  }
}

export default AccountInput;
