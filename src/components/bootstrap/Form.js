import React from 'react';
import { Box, Text } from 'rebass';
import { Label } from '@rebass/forms';
import { ErrorMessage } from 'formik';

export function FieldHorizontal({ children }) {
  return <Box>{children}</Box>;
}

export function FieldLabel({ name, children }) {
  return <Label>{children}</Label>;
}

export function FieldGroup({ name, prettyName = name, children }) {
  return (
    <FieldHorizontal>
      <FieldLabel name={name}>{prettyName}</FieldLabel>
      {children}
      <ErrorMessage name={name} render={msg => <Text>{msg}</Text>} />
    </FieldHorizontal>
  );
}
