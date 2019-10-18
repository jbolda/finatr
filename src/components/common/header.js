/** @jsx jsx */
import { jsx } from 'theme-ui';
import { NavLink } from './link';
import { useColorMode } from 'theme-ui';
import { Flex, Box, Button, Text } from 'rebass';

export default props => {
  const [colorMode, setColorMode] = useColorMode();
  return (
    <header sx={{ variant: 'variants.header' }}>
      <Flex px={2} py={1} alignItems="center" flexWrap="wrap">
        <Box>
          <Text fontWeight="bold">
            <NavLink to="/">finatr</NavLink>
          </Text>
        </Box>
        <Box mx="auto" />
        <Box>
          <Flex flexWrap="wrap">
            <Box>
              <Text p={2}>
                <NavLink to="/">Home</NavLink>
              </Text>
            </Box>
            <Box>
              <Text p={2}>
                <NavLink to="examples">Examples</NavLink>
              </Text>
            </Box>
            <Box>
              <Text p={2}>
                <NavLink to="flow">Cash Flow</NavLink>
              </Text>
            </Box>
            <Box>
              <Text p={2}>
                <NavLink to="accounts">Accounts</NavLink>
              </Text>
            </Box>
            <Box>
              <Text p={2}>
                <NavLink to="import">Import</NavLink>
              </Text>
            </Box>
            <Box>
              <Text p={2}>
                <NavLink to="taxes">Taxes</NavLink>
              </Text>
            </Box>
            <Box>
              <Button
                sx={{ variant: 'buttons.nav' }}
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
