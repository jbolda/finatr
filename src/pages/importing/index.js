import React from 'react';
import { State } from '../../state';
import TabView from '../../components/view/tabView';

import fileDownload from 'js-file-download';
import FileReaderInput from 'react-file-reader-input';
import YNABInput from '../../forms/ynabInput.js';

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
          <section className="section">
            <h1 className="title">Importing and Exporting</h1>
            <h2 className="subtitle">The data is yours to own.</h2>
            <TabView
              activeTab={this.state.activeTab}
              tabClick={this.tabClick.bind(this)}
              tabTitles={['Manual Upload/Download', 'Import From YNAB']}
              tabContents={[
                <nav className="level">
                  <div className="level-left">
                    <div className="level-item has-text-centered">
                      <div>
                        <p className="heading">Get your current</p>
                        <p className="heading">data out:</p>
                        <button
                          className="button is-success"
                          onClick={this.handleDownload.bind(this, model)}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="level-item has-text-centered">
                      <div>
                        <p className="heading">Import data from</p>
                        <p className="heading">your computer:</p>
                        <FileReaderInput
                          as="text"
                          id="my-file-input"
                          onChange={this.handleUpload.bind(this, model)}
                        >
                          <button className="button is-link">
                            Select a file!
                          </button>
                        </FileReaderInput>
                      </div>
                    </div>
                  </div>
                </nav>,
                <div className="container is-fluid">
                  <YNABInput
                    initialDevToken={model.state.devToken}
                    initialBudgetId={model.state.budgetId}
                    addYNAB={this.addYNAB}
                  />
                </div>
              ]}
            />
          </section>
        )}
      </State.Consumer>
    );
  }
}

export default Importing;
