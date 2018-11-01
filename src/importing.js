import React from 'react';
import { Consumer } from '@microstates/react';
import TabView from '/src/components/view/tabView';

import fileDownload from 'js-file-download';
import FileReaderInput from 'react-file-reader-input';
import YNABInput from '/src/forms/ynabInput.js';

class Importing extends React.Component {
  handleUpload = (model, results) => {
    let result = JSON.parse(results[0][0].target.result);
    console.log(result);
    model.transactions
      .set(result.transactions)
      .accounts.set(result.transactions)
      .forms.ynabForm.devToken.set(result.devToken)
      .forms.ynabForm.budgetId.set(result.budgetId);
  };

  handleDownload = model => {
    let outputData = {
      transactions: [...model.state.transactions],
      accounts: [...model.state.accounts],
      devToken: model.forms.ynabForm.devToken.state,
      budgetId: model.forms.ynabForm.budgetId.state
    };
    let fileData = JSON.stringify(outputData);
    fileDownload(fileData, 'financials.json');
  };

  render() {
    return (
      <Consumer>
        {model => (
          <TabView
            ref={ref => (this.transactionTabs = ref)}
            tabTitles={['Import From YNAB', 'Manual Upload/Download']}
            tabContents={[
              <div className="container is-fluid">
                <YNABInput
                  initialDevToken={model.state.devToken}
                  initialBudgetId={model.state.budgetId}
                  addYNAB={this.addYNAB}
                />
              </div>,
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
              </nav>
            ]}
          />
        )}
      </Consumer>
    );
  }
}

export default Importing;
