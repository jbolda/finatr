import React from 'react';
import { Field, FieldArray } from 'formik';
import { FieldGroup, Label } from '~src/components/Form';
import { Button } from '~src/elements/Button';
import { Input } from '~src/elements/Input';
import { Select } from '~src/elements/Select';

const TransactionInputAmountComputed = ({
  errors,
  touched,
  values,
  setFieldValue,
  prefixID = ''
}) => (
  <FieldGroup name="valueType" prettyName="amount" id={`${prefixID}valueType`}>
    <Label>
      <Field
        as={Input}
        type="radio"
        name="valueType"
        id={`${prefixID}valueType`}
        checked={values.valueType === 'static'}
        onChange={() => setFieldValue('valueType', 'static')}
      />
      Static
    </Label>
    <Label>
      <Field
        as={Input}
        type="radio"
        name="valueType"
        id={`${prefixID}valueType`}
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
      <FieldGroup
        errors={errors}
        name="value"
        id={`${prefixID}value`}
        touched={touched}
      >
        <Field as={Input} name="value" id={`${prefixID}value`} type="number" />
      </FieldGroup>
    ) : (
      <React.Fragment>
        <References
          values={values}
          setFieldValue={setFieldValue}
          prefixID={prefixID}
        />
        <RecursiveAmountComputed
          values={values}
          setFieldValue={setFieldValue}
          level={0}
          prefixID={prefixID}
        />
      </React.Fragment>
    )}
  </FieldGroup>
);

export default TransactionInputAmountComputed;

const References = ({
  errors,
  touched,
  values,
  setFieldValue,
  prefixID = ''
}) => (
  <FieldArray
    name="referencesArray"
    render={(arrayHelpers) => (
      <React.Fragment>
        {values.referencesArray && values.referencesArray.length > 0 ? (
          <React.Fragment>
            {values.referencesArray.map((reference, index) =>
              reference.whereFrom !== 'transaction' ? null : (
                <React.Fragment key={index}>
                  <FieldGroup
                    name={`referencesArray[${index}].name`}
                    prettyName={`reference name`}
                    id={`${prefixID}referencesArray[${index}].name`}
                  >
                    <Field
                      as={Input}
                      name={`referencesArray[${index}].name`}
                      id={`${prefixID}referencesArray[${index}].name`}
                    />
                  </FieldGroup>
                  <FieldGroup
                    name={`referencesArray[${index}].value`}
                    prettyName={`reference value`}
                    id={`${prefixID}referencesArray[${index}].value`}
                  >
                    <Field
                      as={Input}
                      name={`referencesArray[${index}].value`}
                      id={`${prefixID}referencesArray[${index}].value`}
                      type="number"
                    />
                  </FieldGroup>
                  <Button
                    type="button"
                    sx={{ variant: 'buttons.primary' }}
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
              sx={{ variant: 'buttons.primary', color: 'green' }}
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
            sx={{ variant: 'buttons.primary', color: 'green' }}
            m={1}
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
        )}
      </React.Fragment>
    )}
  />
);

const RecursiveAmountComputed = ({
  values,
  setFieldValue,
  level,
  prefixID = ''
}) => (
  <React.Fragment>
    <FieldGroup
      name={`computedAmount${'.on'.repeat(level)}.reference`}
      prettyName="reference"
      id={`${prefixID}computedAmount${'.on'.repeat(level)}.reference`}
    >
      <Field
        as={Select}
        name={`computedAmount${'.on'.repeat(level)}.reference`}
        id={`${prefixID}computedAmount${'.on'.repeat(level)}.reference`}
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
      id={`${prefixID}computedAmount${'.on'.repeat(level)}.operation`}
    >
      <Operation
        operationType="none"
        values={values}
        level={level}
        setFieldValue={setFieldValue}
        prefixID={prefixID}
      />
      <Operation
        operationType="plus"
        values={values}
        level={level}
        setFieldValue={setFieldValue}
        prefixID={prefixID}
      />
      <Operation
        operationType="minus"
        values={values}
        level={level}
        setFieldValue={setFieldValue}
        prefixID={prefixID}
      />

      {retrieveNested('operation', values, level) !== 'none' ? (
        <React.Fragment>
          <RecursiveAmountComputed
            values={values}
            setFieldValue={setFieldValue}
            level={level + 1}
            prefixID={prefixID}
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

const Operation = ({
  operationType,
  values,
  level,
  setFieldValue,
  prefixID = ''
}) => (
  <React.Fragment>
    <Label>
      <Field
        as={Input}
        name={`computedAmount${'.on'.repeat(level)}.operation`}
        id={`${prefixID}computedAmount${'.on'.repeat(level)}.operation`}
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
