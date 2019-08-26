import React from 'react';
import { Flex, Box } from 'rebass';

const HeaderRow = ({ items, columns }) => (
  <Flex flexWrap="wrap">
    {items.map(item => (
      <HeaderItem columns={columns || items.count} key={item}>
        {item}
      </HeaderItem>
    ))}
  </Flex>
);

const HeaderItem = ({ children, columns }) => (
  <Box
    px={0}
    width={[null, 1 / columns, 1 / columns]}
    display={['none', 'flex', 'flex']}
  >
    {children}
  </Box>
);

const DataRow = ({ items, columns, itemKey, itemHeaders }) => (
  <Flex flexWrap="wrap" mx={0}>
    {items.map((item, index) => (
      <DataItem
        columns={columns || items.count}
        key={`${itemKey}=${index}`}
        header={itemHeaders[index]}
      >
        {item}
      </DataItem>
    ))}
  </Flex>
);

const DataItem = ({ children, header, columns }) => (
  <React.Fragment>
    <Box px={0} width={[1 / 2, null, null]} display={['flex', 'none', 'none']}>
      {header}
    </Box>
    <Box px={0} width={[1 / 2, 1 / columns, 1 / columns]}>
      {children}
    </Box>
  </React.Fragment>
);

export { HeaderRow, DataRow };
