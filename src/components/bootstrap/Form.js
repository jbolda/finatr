/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Box, Text } from '@theme-ui/components';
import { Label } from '@rebass/forms';
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
