import React from 'react';
import { Form } from 'react-aria-components';
import { Button } from '../../elements/Button.tsx';
import { DateRangePicker } from '../DateRangePicker';

export const Example = (args: any) => <DateRangePicker {...args} />;

export const Validation = (args: any) => (
  <Form className="flex flex-col gap-2 items-start">
    <DateRangePicker {...args} />
    <Button type="submit" variant="secondary">
      Submit
    </Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
