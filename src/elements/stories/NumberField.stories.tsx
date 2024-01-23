import React from 'react';
import { Form } from 'react-aria-components';
import { Button } from '../Button.tsx';
import { NumberField } from '../NumberField.tsx';

export const Example = (args: any) => <NumberField {...args} />;

export const Validation = (args: any) => (
  <Form className="flex flex-col gap-2 items-start">
    <NumberField {...args} />
    <Button type="submit" variant="secondary">
      Submit
    </Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
