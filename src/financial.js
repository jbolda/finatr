import React from 'react';
import BarChart from './barChart';
import resolveData from './resolveFinancials';
import TransactionInput from './transactionInput';
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
      cycle: 1,
      value: 90
    };
    data.push(dFour);
    let dThreePointFive = {
      id: `oasis92`,
      raccount: `account`,
      vaccount: `vaccount`,
      category: `test complex`,
      type: `income`,
      start: `2018-09-22`,
      rtype: `none`,
      value: 190
    };
    data.push(dThreePointFive);
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

    let dataArray = {
      transactions: data,
      accounts: [{ name: 'account', starting: 3000 }]
    };

    this.state = resolveData(dataArray);
  }

  handleUpload = (event, results) => {
    let result = JSON.parse(results[0][0].target.result);
    console.log(result);
    this.setState(resolveData(result));
  };

  handleDownload = () => {
    let outputData = {
      transactions: [...this.state.transactions],
      accounts: [...this.state.accounts]
    };
    let fileData = JSON.stringify(outputData);
    fileDownload(fileData, 'financials.json');
  };

  addTransaction = result => {
    console.log(result);
    let newState = { ...this.state };
    newState.transactions.push(result);
    this.setState(resolveData(newState));
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
        <section className="section">
          {transactionTable(this.state.transactions)}
        </section>
        <section className="section">
          <TransactionInput addTransaction={this.addTransaction} />
        </section>
      </React.Fragment>
    );
  }
}

export default Financial;

const transactionTable = data => (
  <table className="table is-striped is-hoverable">
    <thead>
      <tr>
        <th>
          <abbr title="id">id</abbr>
        </th>
        <th>
          <abbr title="real account">raccount</abbr>
        </th>
        <th>
          <abbr title="category">category</abbr>
        </th>
        <th>
          <abbr title="type">type</abbr>
        </th>
        <th>
          <abbr title="start">start</abbr>
        </th>
        <th>
          <abbr title="repeat type">rtype</abbr>
        </th>
        <th>
          <abbr title="cycle">cycle</abbr>
        </th>
        <th>
          <abbr title="value">value</abbr>
        </th>
      </tr>
    </thead>
    <tbody>
      {data.map(transaction => (
        <tr>
          <th>{transaction.id}</th>
          <td>{transaction.raccount}</td>
          <td>{transaction.category}</td>
          <td>{transaction.type}</td>
          <td>{transaction.start}</td>
          <td>{transaction.rtype}</td>
          <td>{transaction.cycle}</td>
          <td>{transaction.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
