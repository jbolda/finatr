import React from 'react';
import { State } from './state';
import TabView from './components/view/tabView';

import fileDownload from 'js-file-download';
import FileReaderInput from 'react-file-reader-input';
import YNABInput from './forms/ynabInput.js';

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
    model.transactions.set(result.transactions);
    model.accounts.set(result.accounts);
    model.taxStrategy.set(result.taxStrategy);
    model.forms.ynabForm.devToken.set(result.devToken);
    model.forms.ynabForm.budgetId.set(result.budgetId);
    model.reCalc();
  };

  handleDownload = model => {
    const modelState = model.state;
    let outputData = {
      transactions: [...modelState.transactions],
      accounts: [...modelState.accounts],
      taxStrategy: modelState.taxStrategy,
      devToken: model.forms.ynabForm.devToken.state,
      budgetId: model.forms.ynabForm.budgetId.state
    };
    let fileData = JSON.stringify(outputData);
    fileDownload(fileData, 'financials.json');
  };

  render() {
    return (
      <State.Consumer>
        {model => (
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
        )}
      </State.Consumer>
    );
  }
}

export default Importing;
