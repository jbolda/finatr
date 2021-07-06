import React from 'react';
import TabView from './tabView';
import renderer from 'react-test-renderer';

describe(`tabClick`, () => {
  it(`sets the activeTab`, () => {
    let component = renderer.create(<TabView />).getInstance();
    component.tabClick(0);
    expect(component.state.activeTab).toEqual(0);
  });
});

describe(`initial state`, () => {
  it(`has activeTab=null when there aren't any tabTitles`, () => {
    let component = renderer.create(<TabView />).getInstance();
    expect(component.state.activeTab).toEqual(null);
  });

  it('has activeTab=0 when there are tabTitles', () => {
    let component = renderer
      .create(<TabView tabTitles={['some title']} />)
      .getInstance();
    expect(component.state.activeTab).toEqual(0);
  });
});

describe(`render`, () => {
  it(`does not render tab contents`, () => {
    const component = renderer.create(<TabView />);
    const content = component.toJSON();
    expect(content[1].children).toEqual(null);
  });

  it('renders tab contents', () => {
    const props = {
      tabContents: [<div>tab one</div>],
      tabTitles: ['one']
    };
    const component = renderer.create(<TabView {...props} />);
    const content = component.toJSON();
    expect(
      content[1].children[0].children[2].children[1].children[0].children
    ).toEqual(['tab one']);
  });
});
