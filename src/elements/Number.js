import React from 'react';
import {
  NumberField,
  Label,
  Group,
  Input,
  Button,
  Text
} from 'react-aria-components';

export const Number = ({ label, description, errorMessage, ...props }) => (
  <NumberField {...props}>
    <Label>{label}</Label>
    <Group className="flex">
      <Button
        className="px-3 rounded-l-lg border border-transparent font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        slot="decrement"
      >
        -
      </Button>
      <Input className="block w-full py-2 text-base shadow-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      <Button
        className="px-3 rounded-r-lg border border-transparent font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        slot="increment"
      >
        +
      </Button>
    </Group>
    {description && <Text slot="description">{description}</Text>}
    {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
  </NumberField>
);
