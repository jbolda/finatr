import React from 'react';
import { Field } from 'formik';
import { FieldGroup } from '../../components/bootstrap/Form';

const TransactionInputAmountComputed = ({
  errors,
  touched,
  values,
  setFieldValue
}) => (
  <FieldGroup
    errors={errors}
    name="valueType"
    prettyName="value"
    touched={touched}
  >
    <label className="radio">
      <Field
        type="radio"
        name="valueType"
        checked={values.valueType === 'static'}
        onChange={() => setFieldValue('valueType', 'static')}
      />
      Static
    </label>
    <label className="radio">
      <Field
        type="radio"
        name="valueType"
        checked={values.valueType === 'dynamic'}
        onChange={() => {
          setFieldValue('computedAmount.reference', '');
          setFieldValue('computedAmount.operation', 'none');
          setFieldValue('valueType', 'dynamic');
          setFieldValue('value', 0);
        }}
      />
      Dynamic
    </label>
    {values.valueType === 'static' ? (
      <FieldGroup errors={errors} name="value" touched={touched}>
        <Field name="value" type="number" className="input" />
      </FieldGroup>
    ) : (
      <RecursiveAmountComputed
        errors={errors}
        touched={touched}
        values={values}
        setFieldValue={setFieldValue}
        level={0}
      />
    )}
  </FieldGroup>
);

export default TransactionInputAmountComputed;

const RecursiveAmountComputed = ({
  errors,
  touched,
  values,
  setFieldValue,
  level
}) => (
  <React.Fragment>
    <FieldGroup
      errors={errors}
      name={`computedAmount${'.on'.repeat(level)}.reference`}
      prettyName="reference"
      touched={touched}
    >
      <Field
        name={`computedAmount${'.on'.repeat(level)}.reference`}
        className="input"
      />
    </FieldGroup>

    <FieldGroup
      errors={errors}
      name={`computedAmount${'.on'.repeat(level)}.operation`}
      prettyName="operate on"
      touched={touched}
    >
      <Operation
        operationType="none"
        values={values}
        level={level}
        setFieldValue={setFieldValue}
      />
      <Operation
        operationType="plus"
        values={values}
        level={level}
        setFieldValue={setFieldValue}
      />
      <Operation
        operationType="minus"
        values={values}
        level={level}
        setFieldValue={setFieldValue}
      />

      {retrieveNested('operation', values, level) !== 'none' ? (
        <React.Fragment>
          <RecursiveAmountComputed
            errors={errors}
            touched={touched}
            values={values}
            setFieldValue={setFieldValue}
            level={level + 1}
          />
        </React.Fragment>
      ) : null}
    </FieldGroup>
  </React.Fragment>
);

const retrieveNested = (value, values, levelRequired, recursiveLevel = 0) => {
  if (!values) return 'none';
  const computedAmount = recursiveLevel === 0 ? values.computedAmount : values;
  return levelRequired === recursiveLevel
    ? computedAmount[value]
    : retrieveNested(
        value,
        computedAmount.on,
        levelRequired,
        recursiveLevel + 1
      );
};

const Operation = ({ operationType, values, level, setFieldValue }) => (
  <React.Fragment>
    <label className="radio">
      <Field
        type="radio"
        name={`computedAmount${'.on'.repeat(level)}.operation`}
        checked={retrieveNested('operation', values, level) === operationType}
        onChange={() => {
          setFieldValue(
            `computedAmount${'.on'.repeat(level)}.operation`,
            operationType
          );
          if (operationType !== 'none') {
            setFieldValue(
              `computedAmount${'.on'.repeat(level + 1)}.operation`,
              'none'
            );
            setFieldValue(
              `computedAmount${'.on'.repeat(level + 1)}.reference`,
              ''
            );
          }
        }}
      />
      {operationType}
    </label>
  </React.Fragment>
);
