import React from 'react';
import { Form } from 'react-aria-components';
import { Button } from '../Button.tsx';
import { TextField } from '../TextField.tsx';

export const Example = (args: any) => <TextField {...args} />;

export const Validation = (args: any) => (
  <Form className="flex flex-col gap-2 items-start">
    <TextField {...args} />
    <Button type="submit" variant="secondary">
      Submit
    </Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
