import React from 'react';
import { Box } from 'rebass';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs';
import '@reach/tabs/styles.css';

class TabView extends React.Component {
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
    let activeTab = this.props.activeTab
      ? this.props.activeTab
      : this.state.activeTab;

    return (
      <Box id={this.props.id} pt={4} pb={4}>
        {!this.props.tabTitles || !this.props.tabContents ? null : (
          <Tabs index={activeTab} onChange={index => this.tabClick(index)}>
            <TabList>
              {this.props.tabTitles.map(title => (
                <Tab key={title}>{title}</Tab>
              ))}
            </TabList>
            <TabPanels>
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
      </Box>
    );
  }
}

export default TabView;
