/** @jsx jsx */
import { jsx } from 'theme-ui';
import React from 'react';
import { navigate } from '@reach/router';
import { State } from '../../state';
import { Flex, Box, Button, Heading, Text } from 'rebass';

const listOfExamples = [
  {
    name: 'Simple Example',
    content: `
    This is a real simple example where you get paid every two weeks.
    Your only expense is paying rent once a month. Wouldn't that be nice!
    `,
    file: 'simple.json'
  },
  {
    name: 'High Housing Expenses',
    content: `
    This example shows what living in San Francisco, Silicon Valley,
    or Washington DC may look like. You get paid well relative to the
    rest of the country, but most of that goes to living expenses.
    You only have one source of income, but a decent salary nonetheless.
    You carry a credit card, and pay your other expenses with that.
    `,
    file: 'crazy rents.json'
  }
];

const Examples = () => (
  <State.Consumer>
    {model => (
      <React.Fragment>
        <Flex flexWrap="wrap" mx={-2}>
          <Box px={2} py={2} width={1 / 2}>
            <Heading p={1}>Examples</Heading>
            <Text p={1}>
              The following are various examples that you can test out. They are
              even valuable as a template to get you jump-started. Find one that
              seems to match your current situation? Give it a shot and see what
              it looks like. You can always come back here and try another.
            </Text>
          </Box>
        </Flex>
        <Flex flexWrap="wrap" mx={-2}>
          {listOfExamples.map(example => (
            <Box key={example.file} px={2} py={2} width={1 / 4}>
              <Heading p={1}>{example.name}</Heading>
              <Text p={1}>{example.content}</Text>
              <Button
                sx={{ variant: 'buttons.primary' }}
                onClick={event => loadExample(model, event)}
                value={example.file}
              >
                Load Example
              </Button>
            </Box>
          ))}
        </Flex>
      </React.Fragment>
    )}
  </State.Consumer>
);

export default Examples;

const loadExample = async (model, event) => {
  const example = await import(`./${event.currentTarget.value}`);
  const result = example.default;
  console.log('example loaded', result);
  model.setUpload(result);
  navigate(`/flow`);
};
