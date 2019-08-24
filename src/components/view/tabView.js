import React from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs';
import '@reach/tabs/styles.css';

const TabView = ({ tabTitles, tabContents }) => (
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
);

export default TabView;
