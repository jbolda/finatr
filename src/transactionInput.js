import React from 'react';
import { Formik } from 'formik';

class TransactionInput extends React.Component {
  render() {
    return (
      <React.Fragment>
        <h1 className="title has-text-centered">Add a Transaction</h1>
        <Formik
          initialValues={{
            id: `oasidjas1`,
            raccount: `account`,
            vaccount: `vaccount`,
            category: `test default`,
            type: `income`,
            start: `2018-03-22`,
            rtype: `day`,
            cycle: 3,
            value: 150
          }}
          onSubmit={(values, actions) => {
            this.props.addTransaction(values);
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
                  <label className="label">id</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <input
                        type="text"
                        name="id"
                        className="input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.id}
                      />
                    </p>
                  </div>
                </div>

                {touched.id && errors.id && <div>{errors.id}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">raccount</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <input
                        type="text"
                        name="raccount"
                        className="input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.raccount}
                      />
                    </p>
                  </div>
                </div>
                {touched.raccount &&
                  errors.raccount && <div>{errors.raccount}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">category</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <input
                        type="text"
                        name="category"
                        className="input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.category}
                      />
                    </p>
                  </div>
                </div>
                {touched.category &&
                  errors.category && <div>{errors.category}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">type</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <input
                        type="text"
                        name="type"
                        className="input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.type}
                      />
                    </p>
                  </div>
                </div>
                {touched.type && errors.type && <div>{errors.type}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">start</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <input
                        type="text"
                        name="start"
                        className="input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.start}
                      />
                    </p>
                  </div>
                </div>
                {touched.start && errors.start && <div>{errors.start}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">rtype</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <input
                        type="text"
                        name="rtype"
                        className="input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.rtype}
                      />
                    </p>
                  </div>
                </div>
                {touched.rtype && errors.rtype && <div>{errors.rtype}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">cycle</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <input
                        type="number"
                        name="cycle"
                        className="input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.cycle}
                      />
                    </p>
                  </div>
                </div>
                {touched.cycle && errors.cycle && <div>{errors.cycle}</div>}
              </div>
              <div className="field is-horizontal">
                <div className="field-label is-normal">
                  <label className="label">value</label>
                </div>
                <div className="field-body">
                  <div className="field">
                    <p className="control">
                      <input
                        type="number"
                        name="value"
                        className="input"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.value}
                      />
                    </p>
                  </div>
                </div>
                {touched.value && errors.value && <div>{errors.value}</div>}
              </div>
              <div class="field is-grouped is-grouped-centered">
                <div class="control">
                  <button
                    className="button is-link"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Add Transaction
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

export default TransactionInput;
