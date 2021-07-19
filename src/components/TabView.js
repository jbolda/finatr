import React from 'react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useTabsContext
} from '@reach/tabs';

export class TabView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activeTab: null };
    if (!!props.tabTitles && props.tabTitles.length > 0) {
      this.state.activeTab = 0;
    }
  }

  tabClick(index) {
    if (this.props.tabClick) {
      this.props.tabClick(index);
    } else {
      this.setState({ activeTab: index });
    }
  }

  render() {
    const StyledTab = ({ index, ...props }) => {
      const { selectedIndex } = useTabsContext();

      return (
        <Tab
          className={`${
            selectedIndex === index
              ? 'bg-gray-200 text-gray-800'
              : 'text-gray-600 hover:text-gray-800'
          } m-1 px-3 py-2 font-medium text-sm rounded-md`}
          {...props}
        />
      );
    };

    let activeTab = this.props.activeTab
      ? this.props.activeTab
      : this.state.activeTab;

    return (
      <div>
        {!this.props.tabTitles || !this.props.tabContents ? null : (
          <Tabs
            index={activeTab}
            onChange={(index) => this.tabClick(index)}
            className="overflow-hidden shadow sm:rounded-lg"
          >
            <label htmlFor="tabs" className="sr-only">
              Select a tab
            </label>
            <TabList className="flex space-x-4 my-3 transition duration-500 ease-in-out">
              {this.props.tabTitles.map((title, index) => (
                <StyledTab key={title} index={index}>
                  <h3>{title}</h3>
                </StyledTab>
              ))}
            </TabList>
            <TabPanels className="bg-white px-4 py-5 sm:p-6">
              {this.props.tabContents.map((content, index) => (
                <TabPanel
                  key={index}
                  data-testid={`${this.props.id}-${this.props.tabTitles[index]
                    .toLowerCase()
                    .replace(' ', '-')}`}
                >
                  {content}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        )}
      </div>
    );
  }
}
