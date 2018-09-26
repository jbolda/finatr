import React from 'react';

export function Field({ children }) {
  return <div className="field is-horizontal">{children}</div>;
}

export function FieldLabel({ children }) {
  return (
    <div className="field-label is-normal">
      <label className="label">{children}</label>
    </div>
  );
}

export function FieldControl({ children }) {
  return (
    <div className="field-body">
      <div className="field">
        <div className="control">{children}</div>
      </div>
    </div>
  );
}
