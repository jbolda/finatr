import React from 'react';
import { Formik } from 'formik';

class AccountInput extends React.Component {
  render() {
    return (
      <React.Fragment>
        <h1 className="title has-text-centered">Add an Account</h1>
        <Formik
          initialValues={{
            name: `account2`,
            starting: 150
          }}
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
            <form onSubmit={handleSubmit}>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">name</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <input
                        type="text"
                        name="name"
                        className="input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.name}
                      />
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
                      <input
                        type="number"
                        name="starting"
                        className="input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.starting}
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
                      <input
                        type="number"
                        name="interest"
                        className="input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.interest}
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
                    <p className="control">
                      <input
                        type="text"
                        name="starting"
                        className="input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.vehicle}
                      />
                    </p>
                  </div>
                </div>
                {touched.vehicle &&
                  errors.vehicle && <div>{errors.vehicle}</div>}
              </div>
              <div class="field is-grouped is-grouped-centered">
                <div class="control">
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
      </React.Fragment>
    );
  }
}

export default AccountInput;
