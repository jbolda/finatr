import React from 'react';
import { Grid, Box } from 'theme-ui';

const HeaderRow = ({ items, columns }) => (
  <Grid
    columns={[2, columns, columns]}
    sx={{
      mx: 0,
      borderColor: 'muted',
      borderBottomStyle: 'solid',
      borderBottomWidth: '2px'
    }}
  >
    {items.map(item => (
      <HeaderItem key={item}>{item}</HeaderItem>
    ))}
  </Grid>
);

const HeaderItem = ({ children }) => (
  <Box
    px={0}
    sx={{
      display: ['none', 'inline', 'inline']
    }}
  >
    {children}
  </Box>
);

const DataRow = ({ items, columns, itemKey, itemHeaders }) => (
  <Grid
    columns={[2, columns, columns]}
    sx={{
      mx: 0,
      borderColor: 'muted',
      borderBottomStyle: 'dashed',
      borderBottomWidth: '1px'
    }}
  >
    {items.map((item, index) => (
      <DataItem key={`${itemKey}=${index}`} header={itemHeaders[index]}>
        {item}
      </DataItem>
    ))}
  </Grid>
);

const DataItem = ({ children, header }) => (
  <React.Fragment>
    <Box px={0} sx={{ display: ['inline', 'none', 'none'] }}>
      {header}
    </Box>
    <Box px={0}>{children}</Box>
  </React.Fragment>
);

export { HeaderRow, DataRow };

const FlexTable = ({ itemHeaders, itemData }) => (
  <React.Fragment>
    <HeaderRow columns={itemHeaders.length} items={itemHeaders} />
    {itemData.map(items => (
      <DataRow
        key={items.key}
        itemKey={items.key}
        columns={itemHeaders.length}
        itemHeaders={itemHeaders}
        items={items.data}
      />
    ))}
  </React.Fragment>
);

export default FlexTable;
