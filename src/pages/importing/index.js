import React from 'react';
import { State } from '~/src/state';
import { TabView } from '~/src/components/TabView';
const Flex = ({ children }) => <div>{children}</div>;
const Box = ({ children }) => <div>{children}</div>;
import { Button } from '~/src/elements/Button';

import fileDownload from 'js-file-download';
import FileReaderInput from 'react-file-reader-input';
import Papa from 'papaparse';
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
    const [progressEvent, file] = results[0];
    if (file.name.endsWith('.json')) {
      const result = JSON.parse(progressEvent.target.result);
      console.log('file upload result', result);
      return model.setUpload(result);
    } else if (file.name.endsWith('.csv')) {
      const result = {
        accounts: Papa.parse(progressEvent.target.result, { header: true }).data
      };
      console.log('file upload result', result);
      return model.setUpload(result);
    }
    return console.log(
      "Invalid filetype, not a json or csv. We didn't do anything with the file you uploaded."
    );
  };

  handleDownload = (model) => {
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
      ...{ settings: { startDate: model.charts.graphDates.start } },
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
        {(model) => (
          <div className="bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
            <div className="relative max-w-lg mx-auto divide-y-2 divide-gray-200 lg:max-w-7xl">
              <div className="pb-6">
                <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
                  Importing and Exporting
                </h2>
                <p className="text-xl text-gray-500">
                  The data is yours to own.
                </p>
              </div>
              <TabView
                activeTab={this.state.activeTab}
                tabClick={this.tabClick.bind(this)}
                tabTitles={['Manual Upload/Download', 'Import From YNAB']}
                tabContents={[
                  <div>
                    <div>
                      <p className="my-3 text-base text-gray-500">
                        Get your current data out
                      </p>
                      <Button onClick={this.handleDownload.bind(this, model)}>
                        Download
                      </Button>
                    </div>
                    <div>
                      <p className="my-3 text-base text-gray-500">
                        Import data from your computer
                      </p>
                      <FileReaderInput
                        as="text"
                        id="my-file-input"
                        onChange={this.handleUpload.bind(this, model)}
                      >
                        <Button>Select a file!</Button>
                      </FileReaderInput>
                    </div>
                  </div>,
                  <YNABInput
                    initialDevToken={model.state.devToken}
                    initialBudgetId={model.state.budgetId}
                    addYNAB={this.addYNAB}
                  />
                ]}
              />
            </div>
          </div>
        )}
      </State.Consumer>
    );
  }
}

export default Importing;
