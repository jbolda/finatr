import { test, expect } from '@playwright/experimental-ct-react17';
import React from 'react';

import { TabView } from './TabView.js';
import { TabViewContentTest } from './stories/TabView.story.jsx';

test(`has activeTab=null when there aren't any tabTitles`, async ({
  mount
}) => {
  const component = await mount(<TabView />);
  await expect(component.getByRole('tabpanel')).not.toBeAttached();
});

test(`does not render tab contents`, async ({ mount }) => {
  const component = await mount(<TabView />);
  await expect(component.getByRole('tabpanel')).toHaveText([]); // empty string
});

test('renders tab contents', async ({ mount }) => {
  const component = await mount(
    <TabViewContentTest tabTitles={['one']} tabContentStrings={['tab one']} />
  );
  await expect(component.getByRole('tabpanel')).toContainText('tab one');
});
