import React from 'react';

import { TabView } from '../TabView.jsx';

type TabViewContentTestProps = {
  tabTitles: string[];
  tabContentStrings: string[];
};

export const TabViewContentTest: React.FC<TabViewContentTestProps> = ({
  tabTitles,
  tabContentStrings
}) => {
  const tabContents = tabContentStrings.map((tabContent, i) => (
    <div key={i}>{tabContent}</div>
  ));
  // TabView is a JS file with loose typing; cast to any for stories
  const Tv: any = TabView as any;
  return <Tv tabTitles={tabTitles} tabContents={tabContents} />;
};
