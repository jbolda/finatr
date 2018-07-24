import React from 'react';
import BarChart from './barChart';
import fileDownload from 'js-file-download';
import FileReaderInput from 'react-file-reader-input';

class Financial extends React.Component {
  constructor() {
    super();
    let data = [];
    let dOne = {
      id: `oasidjas1`,
      raccount: `account`,
      vaccount: `vaccount`,
      category: `test default`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day`,
      cycle: 3,
      value: 150
    };
    data.push(dOne);
    let dTwo = {
      id: `oasis2`,
      raccount: `account`,
      vaccount: `vaccount`,
      category: `test default`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day`,
      cycle: 1,
      value: 100
    };
    data.push(dTwo);
    let dThree = {
      id: `oasis3`,
      raccount: `account`,
      vaccount: `vaccount`,
      category: `test complex`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day of week`,
      repeat: 3,
      cycle: 2,
      value: 35
    };
    data.push(dThree);
    let dFour = {
      id: `oasis6`,
      raccount: `account`,
      vaccount: `vaccount`,
      category: `test complex`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day of month`,
      repeat: 1,
      cycle: 1,
      value: 90
    };
    data.push(dFour);
    let dFive = {
      id: `oasis8`,
      raccount: `account`,
      vaccount: `vaccount`,
      category: `test comp`,
      type: `expense`,
      start: `2018-03-22`,
      rtype: `day`,
      repeat: 1,
      cycle: 1,
      value: 112
    };
    data.push(dFive);

    this.state = {
      transactions: data,
      accounts: [{ name: 'account', starting: 3000 }]
    };
  }

  handleUpload = (event, results) => {
    let result = JSON.parse(results[0][0].target.result);
    console.log(result);
    this.setState({ ...result });
  };

  handleDownload = () => {
    let outputData = {
      transactions: [...this.state.transactions],
      accounts: [...this.state.accounts]
    };
    let fileData = JSON.stringify(outputData);
    fileDownload(fileData, 'financials.json');
  };

  render() {
    return (
      <React.Fragment>
        <section className="section">
          <BarChart data={this.state} />
        </section>
        <nav className="level">
          <div className="level-left">
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Get your current</p>
                <p className="heading">data out:</p>
                <button
                  className="button is-success"
                  onClick={this.handleDownload}
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
                  onChange={this.handleUpload}
                >
                  <button className="button is-link">Select a file!</button>
                </FileReaderInput>
              </div>
            </div>
          </div>
        </nav>
      </React.Fragment>
    );
  }
}

export default Financial;
