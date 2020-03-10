import React from 'react';
import { Box, Text, Label } from 'theme-ui';
import { ErrorMessage } from 'formik';

export function FieldHorizontal({ children }) {
  return <Box p={1}>{children}</Box>;
}

export function FieldGroup({ name, id, prettyName = name, children }) {
  return (
    <FieldHorizontal>
      <Label htmlFor={id || name}>{prettyName}</Label>
      {children}
      <ErrorMessage
        name={name}
        render={msg => <Text sx={{ color: 'red' }}>{msg}</Text>}
      />
    </FieldHorizontal>
  );
}

export { Label };
