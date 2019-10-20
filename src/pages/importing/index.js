/** @jsx jsx */
import { jsx } from 'theme-ui';
import React from 'react';
import { State } from '../../state';
import TabView from '../../components/view/tabView';
import { Flex, Box, Heading, Text, Button } from '@theme-ui/components';

import fileDownload from 'js-file-download';
import FileReaderInput from 'react-file-reader-input';
import YNABInput from './ynabInput.js';

class Importing extends React.Component {
  constructor(props) {
    super();
    this.state = {
      activeTab: 0
    };
  }

  tabClick(index) {
    this.setState({ activeTab: index });
  }

  handleUpload = (model, event, results) => {
    let result = JSON.parse(results[0][0].target.result);
    console.log('file upload result', result);
    model.setUpload(result);
  };

  handleDownload = model => {
    const modelState = model.state;
    const get = (arrayOfProperties, rootObject) =>
      arrayOfProperties.reduce(
        (drillingDownObject, prop) =>
          drillingDownObject && drillingDownObject[prop]
            ? drillingDownObject[prop]
            : undefined,
        rootObject
      );

    let outputData = {
      ...(get(['transactions'], modelState)
        ? { transactions: [...modelState.transactions] }
        : {}),
      ...(get(['accounts'], modelState)
        ? { accounts: [...modelState.accounts] }
        : {}),
      ...(!model.charts.isStartingToday
        ? { settings: { startDate: model.charts.graphDates.start } }
        : {}),
      ...(get(['taxStrategy', 'incomeReceived'], modelState) &&
      modelState.taxStrategy.incomeReceived.length !== 0
        ? {
            taxStrategy: {
              incomeReceived: [...modelState.taxStrategy.incomeReceived]
            }
          }
        : {}),
      ...(get(['forms', 'ynabForm', 'devToken', 'state'], model)
        ? { devToken: model.forms.ynabForm.devToken.state }
        : {}),
      ...(get(['forms', 'ynabForm', 'budgetId', 'state'], model)
        ? { budgetId: model.forms.ynabForm.budgetId.state }
        : {})
    };
    let fileData = JSON.stringify(outputData);
    fileDownload(fileData, 'financials.json');
  };

  render() {
    return (
      <State.Consumer>
        {model => (
          <React.Fragment>
            <Box>
              <Heading fontSize={[3, 4, 5]}>Importing and Exporting</Heading>
              <Heading fontSize={[2, 3, 4]}>The data is yours to own.</Heading>
            </Box>
            <TabView
              activeTab={this.state.activeTab}
              tabClick={this.tabClick.bind(this)}
              tabTitles={['Manual Upload/Download', 'Import From YNAB']}
              tabContents={[
                <Flex>
                  <Box width={1 / 3}>
                    <Text>Get your current data out:</Text>
                    <Button
                      sx={{ variant: 'buttons.primary' }}
                      onClick={this.handleDownload.bind(this, model)}
                    >
                      Download
                    </Button>
                  </Box>
                  <Box width={1 / 3}>
                    <Text>Import data from your computer:</Text>
                    <FileReaderInput
                      as="text"
                      id="my-file-input"
                      onChange={this.handleUpload.bind(this, model)}
                    >
                      <Button sx={{ variant: 'buttons.primary' }}>
                        Select a file!
                      </Button>
                    </FileReaderInput>
                  </Box>
                </Flex>,
                <YNABInput
                  initialDevToken={model.state.devToken}
                  initialBudgetId={model.state.budgetId}
                  addYNAB={this.addYNAB}
                />
              ]}
            />
          </React.Fragment>
        )}
      </State.Consumer>
    );
  }
}

export default Importing;
