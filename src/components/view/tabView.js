import React from 'react';
import { Box } from 'rebass';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs';
import '@reach/tabs/styles.css';

const TabView = ({ tabTitles, tabContents }) => (
  <Box pt={4} pb={4}>
    <Tabs>
      <TabList>
        {tabTitles.map(title => (
          <Tab key={title}>{title}</Tab>
        ))}
      </TabList>
      <TabPanels>
        {tabContents.map((content, index) => (
          <TabPanel key={index}>{content}</TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  </Box>
);

export default TabView;
