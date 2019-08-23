import React from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs';
import '@reach/tabs/styles.css';

const TabView = ({ tabTitles, tabContents }) => (
  <Tabs>
    <TabList>
      {tabTitles.map(title => (
        <Tab>{title}</Tab>
      ))}
    </TabList>
    <TabPanels>
      {tabContents.map(content => (
        <TabPanel>{content}</TabPanel>
      ))}
    </TabPanels>
  </Tabs>
);

export default TabView;
