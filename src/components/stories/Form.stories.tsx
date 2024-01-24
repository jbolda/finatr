import React from 'react';
import { Button } from '../../elements/Button.tsx';
import { DateField } from '../../elements/DateField.tsx';
import { Form } from '../Form';
import { TextField } from '../../elements/TextField.tsx';

export const Example = (args: any) => (
  <Form {...args}>
    <TextField label="Email" name="email" type="email" isRequired />
    <DateField label="Birth date" isRequired />
    <div className="flex gap-2">
      <Button type="submit">Submit</Button>
      <Button type="reset" variant="secondary">
        Reset
      </Button>
    </div>
  </Form>
);
