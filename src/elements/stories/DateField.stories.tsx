import React from 'react';
import { Form } from 'react-aria-components';
import { Button } from '../Button.tsx';
import { DateField } from '../DateField.tsx';

export const Example = (args: any) => <DateField {...args} />;

export const Validation = (args: any) => (
  <Form className="flex flex-col gap-2 items-start">
    <DateField {...args} />
    <Button type="submit" variant="secondary">
      Submit
    </Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
