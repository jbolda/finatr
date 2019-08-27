import React from 'react';
import { Button } from 'rebass';
import { Label, Input, Select, Radio } from '@rebass/forms';
import { Field, FieldArray } from 'formik';
import { FieldGroup } from '../../components/bootstrap/Form';

const TransactionInputAmountComputed = ({
  errors,
  touched,
  values,
  setFieldValue
}) => (
  <FieldGroup name="valueType" prettyName="amount">
    <Label>
      <Field
        as={Radio}
        type="radio"
        name="valueType"
        checked={values.valueType === 'static'}
        onChange={() => setFieldValue('valueType', 'static')}
      />
      Static
    </Label>
    <Label>
      <Field
        as={Radio}
        type="radio"
        name="valueType"
        checked={values.valueType === 'dynamic'}
        onChange={() => {
          setFieldValue('computedAmount.reference', '');
          setFieldValue('computedAmount.operation', 'none');
          setFieldValue('referencesArray[0]', {
            name: 'give me a name',
            value: 0,
            whereFrom: 'transaction'
          });
          setFieldValue('valueType', 'dynamic');
          setFieldValue('value', 0);
        }}
      />
      Dynamic
    </Label>
    {values.valueType === 'static' ? (
      <FieldGroup errors={errors} name="value" touched={touched}>
        <Field as={Input} name="value" type="number" />
      </FieldGroup>
    ) : (
      <React.Fragment>
        <References values={values} setFieldValue={setFieldValue} />
        <RecursiveAmountComputed
          values={values}
          setFieldValue={setFieldValue}
          level={0}
        />
      </React.Fragment>
    )}
  </FieldGroup>
);

export default TransactionInputAmountComputed;

const References = ({ errors, touched, values, setFieldValue }) => (
  <FieldArray
    name="referencesArray"
    render={arrayHelpers => (
      <React.Fragment>
        {values.referencesArray && values.referencesArray.length > 0 ? (
          <React.Fragment>
            {values.referencesArray.map((reference, index) =>
              reference.whereFrom !== 'transaction' ? null : (
                <React.Fragment key={index}>
                  <FieldGroup
                    name={`referencesArray[${index}].name`}
                    prettyName={`reference name`}
                  >
                    <Field as={Input} name={`referencesArray[${index}].name`} />
                  </FieldGroup>
                  <FieldGroup
                    name={`referencesArray[${index}].value`}
                    prettyName={`reference value`}
                  >
                    <Field
                      as={Input}
                      name={`referencesArray[${index}].value`}
                      type="number"
                    />
                  </FieldGroup>
                  <Button
                    type="button"
                    variant="outline"
                    mr={1}
                    mb={2}
                    color={'red'}
                    onClick={() => arrayHelpers.remove(index)}
                  >
                    -
                  </Button>
                </React.Fragment>
              )
            )}
            <Button
              type="button"
              variant="outline"
              color={'green'}
              onClick={() =>
                arrayHelpers.push({
                  name: '',
                  value: 0,
                  whereFrom: 'transaction'
                })
              }
            >
              +
            </Button>
          </React.Fragment>
        ) : (
          <Button
            type="button"
            variant="outline"
            m={1}
            color={'green'}
            onClick={() =>
              arrayHelpers.push({
                name: '',
                value: 0,
                whereFrom: 'transaction'
              })
            }
          >
            {/* show this when user has removed all friends from the list */}+
          </Button>
        )}
      </React.Fragment>
    )}
  />
);

const RecursiveAmountComputed = ({ values, setFieldValue, level }) => (
  <React.Fragment>
    <FieldGroup
      name={`computedAmount${'.on'.repeat(level)}.reference`}
      prettyName="reference"
    >
      <Field
        as={Select}
        name={`computedAmount${'.on'.repeat(level)}.reference`}
      >
        <option key={'default'} value="select">
          Select
        </option>
        {!values.referencesArray
          ? null
          : values.referencesArray.map((reference, index) => (
              <option key={index} value={reference.name}>
                {reference.name}
              </option>
            ))}
      </Field>
    </FieldGroup>

    <FieldGroup
      name={`computedAmount${'.on'.repeat(level)}.operation`}
      prettyName="operate on"
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
    <Label>
      <Field
        as={Radio}
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
              'select'
            );
          }
        }}
      />
      {operationType}
    </Label>
  </React.Fragment>
);
