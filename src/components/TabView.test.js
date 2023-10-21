/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TabView } from './TabView';

const defaultProps = {
  tabContents: [<div>tab one</div>],
  tabTitles: ['one']
};

describe(`initial state`, () => {
  it(`has activeTab=null when there aren't any tabTitles`, () => {
    render(<TabView />);
    expect(screen.queryByRole('tabpanel')).toEqual(null);
  });
});

describe(`render`, () => {
  it(`does not render tab contents`, () => {
    render(<TabView />);
    expect(screen.queryByRole('tabpanel')).toBe(null);
  });

  it('renders tab contents', () => {
    render(<TabView {...defaultProps} />);
    expect(screen.getByText('tab one')).toBeVisible();
  });
});
