import React from 'react';
import { Form } from 'react-aria-components';
import { Button } from '../Button.tsx';
import { SearchField } from '../SearchField.tsx';

export const Example = (args: any) => <SearchField {...args} />;

export const Validation = (args: any) => (
  <Form className="flex flex-col gap-2 items-start">
    <SearchField {...args} />
    <Button type="submit" variant="secondary">
      Submit
    </Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
