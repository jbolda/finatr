import React from 'react';
import { Consumer } from '@microstates/react';
import { Formik, Field } from 'formik';

class AccountInput extends React.Component {
  render() {
    return (
      <React.Fragment>
        <h1 className="title has-text-centered">Add an Account</h1>
        <Consumer>
          {model => (
            <Formik
              initialValues={model.state.accountForm}
              onSubmit={(values, actions) => {
                this.props.addAccount(values);
                actions.setSubmitting(false);
                actions.resetForm();
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
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label">name</label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <p className="control">
                          <Field type="text" name="name" className="input" />
                        </p>
                      </div>
                    </div>
                    {touched.name && errors.name && <div>{errors.name}</div>}
                  </div>
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label">starting</label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <p className="control">
                          <Field
                            type="number"
                            name="starting"
                            className="input"
                          />
                        </p>
                      </div>
                    </div>
                    {touched.starting &&
                      errors.starting && <div>{errors.starting}</div>}
                  </div>
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label">interest</label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <p className="control">
                          <Field
                            type="number"
                            name="interest"
                            className="input"
                          />
                        </p>
                      </div>
                    </div>
                    {touched.interest &&
                      errors.interest && <div>{errors.interest}</div>}
                  </div>
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label">vehicle</label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <div className="control">
                          <div className="select">
                            <Field component="select" name="vehicle">
                              <option value="operating">Operating</option>
                              <option value="debt">Debt</option>
                              <option value="investment">Investment</option>
                            </Field>
                          </div>
                        </div>
                      </div>
                    </div>
                    {touched.vehicle &&
                      errors.vehicle && <div>{errors.vehicle}</div>}
                  </div>
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
        </Consumer>
      </React.Fragment>
    );
  }
}

export default AccountInput;
