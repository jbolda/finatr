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
    this.state = { data: data };
  }

  handleChange = (event, results) => {
    console.log(results);
    // results.forEach(result => {
    // const [e, file] = result;
    // this.props.dispatch(uploadFile(e.target.result));
    // console.log(`Successfully uploaded ${file.name}!`);
    // });
  };

  handleDownload = () => {
    let fileData = JSON.stringify(this.state.data);
    fileDownload(fileData, 'financials.json');
  };

  render() {
    return (
      <div>
        <BarChart data={this.state.data} />
        <button onClick={this.handleDownload}>Download</button>
        <form>
          <label htmlFor="my-file-input">Upload a File:</label>
          <FileReaderInput
            as="text"
            id="file-input"
            onChange={this.handleChange}
          >
            <button>Select a file!</button>
          </FileReaderInput>
        </form>
      </div>
    );
  }
}

export default Financial;
