import React from 'react';
import { Link } from '@reach/router';
import { useColorMode } from 'theme-ui';
import { Flex, Box, Button, Text } from 'rebass';

export default props => {
  const [colorMode, setColorMode] = useColorMode();
  return (
    <header>
      <Flex px={2} alignItems="center" flexWrap="wrap">
        <Box>
          <Text fontWeight="bold">
            <Link to="/">finatr</Link>
          </Text>
        </Box>
        <Box mx="auto" />
        <Box>
          <Flex flexWrap="wrap">
            <Box>
              <Text p={2}>
                <Link to="/">Home</Link>
              </Text>
            </Box>
            <Box>
              <Text p={2}>
                <Link to="examples">Examples</Link>
              </Text>
            </Box>
            <Box>
              <Text p={2}>
                <Link to="flow">Cash Flow</Link>
              </Text>
            </Box>
            <Box>
              <Text p={2}>
                <Link to="accounts">Accounts</Link>
              </Text>
            </Box>
            <Box>
              <Text p={2}>
                <Link to="import">Import</Link>
              </Text>
            </Box>
            <Box>
              <Text p={2}>
                <Link to="taxes">Taxes</Link>
              </Text>
            </Box>
            <Box>
              <Button
                onClick={e => {
                  setColorMode(colorMode === 'light' ? 'dark' : 'light');
                }}
              >
                {colorMode === 'light' ? 'light' : 'dark'}
              </Button>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </header>
  );
};
