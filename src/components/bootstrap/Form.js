import React from 'react';

export function FieldHorizontal({ children }) {
  return <div className="field is-horizontal">{children}</div>;
}

export function FieldLabel({ children }) {
  return (
    <div className="field-label is-normal">
      <label className="label">{children}</label>
    </div>
  );
}

export function FieldBody({ children }) {
  return (
    <div className="field-body">
      <div className="field">{children}</div>
    </div>
  );
}

export function FieldControl({ children }) {
  return <div className="control">{children}</div>;
}

export function FieldGroup({
  name,
  prettyName = name,
  touched,
  errors,
  children
}) {
  return (
    <FieldHorizontal>
      <FieldLabel>{prettyName}</FieldLabel>
      <FieldBody>
        <FieldControl>{children}</FieldControl>
        {touched[name] && errors[name] ? (
          <p className="help is-danger">{errors[name]}</p>
        ) : null}
      </FieldBody>
    </FieldHorizontal>
  );
}
