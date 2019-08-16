import React from 'react';
import { ErrorMessage } from 'formik';

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

export function FieldGroup({ name, prettyName = name, children }) {
  return (
    <FieldHorizontal>
      <FieldLabel>{prettyName}</FieldLabel>
      <FieldBody>
        <FieldControl>{children}</FieldControl>
        <ErrorMessage
          name={name}
          render={msg => <p className="help is-danger">{msg}</p>}
        />
      </FieldBody>
    </FieldHorizontal>
  );
}
