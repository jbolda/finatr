import React from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-aria-components';

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
    const StyledTab = ({ index, activeTab, ...props }) => {
      return (
        <Tab
          className={`${
            activeTab === index
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
      <div id={this.props.id}>
        {!this.props.tabTitles || !this.props.tabContents ? null : (
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(index) => this.tabClick(index)}
          >
            <TabList className="flex space-x-4 my-3 transition duration-500 ease-in-out">
              {this.props.tabTitles.map((title, index) => (
                <StyledTab
                  key={index}
                  id={index}
                  index={index}
                  activeTab={activeTab}
                >
                  <h3>{title}</h3>
                </StyledTab>
              ))}
            </TabList>
            {this.props.tabContents.map((content, index) => (
              <TabPanel
                key={index}
                id={index}
                data-testid={`${this.props.id}-${this.props.tabTitles[index]
                  .toLowerCase()
                  .replace(' ', '-')}`}
              >
                {content}
              </TabPanel>
            ))}
          </Tabs>
        )}
      </div>
    );
  }
}
