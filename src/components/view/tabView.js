/** @jsx jsx */
import { jsx } from 'theme-ui';
import React from 'react';
import { Box, Heading } from '@theme-ui/components';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs';

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
            <TabList sx={{ display: 'flex', overflowX: 'auto' }}>
              {this.props.tabTitles.map((title, index) => (
                <Tab
                  key={title}
                  sx={{
                    display: 'inline-block',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderColor: activeTab === index ? 'primary' : 'muted',
                    borderBottomStyle: 'solid',
                    transition: 'all 500ms ease'
                  }}
                >
                  <Heading
                    sx={{ fontSize: [3, 3, 4], variant: 'text.heading' }}
                  >
                    {title}
                  </Heading>
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {this.props.tabContents.map((content, index) => (
                <TabPanel
                  key={index}
                  sx={{ outline: 'none', py: 2 }}
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
