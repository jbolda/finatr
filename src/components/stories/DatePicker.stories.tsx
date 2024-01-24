import React from 'react';
import { Form } from 'react-aria-components';
import { Button } from '../../elements/Button.tsx';
import { DatePicker } from '../DatePicker.tsx';

export const Example = (args: any) => <DatePicker {...args} />;

export const Validation = (args: any) => (
  <Form className="flex flex-col gap-2 items-start">
    <DatePicker {...args} />
    <Button type="submit" variant="secondary">
      Submit
    </Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
