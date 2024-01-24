import React from 'react';
import { TabView } from '../TabView.jsx';

export const TabViewContentTest = ({ tabTitles, tabContentStrings }) => {
  const tabContents = tabContentStrings.map((tabContent) => (
    <div>{tabContent}</div>
  ));
  return <TabView tabTitles={tabTitles} tabContents={tabContents} />;
};
