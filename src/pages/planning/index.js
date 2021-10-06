import React from 'react';
import { State } from '~src/state';
import IcicleChart from './icicleChart';

const Planning = (props) => {
  return (
    <State.Consumer>
      {(model) => (
        <React.Fragment>
          {/* {console.log(model.state)} */}
          <div>
            <IcicleChart data={model.state.transactionsComputed} />
            {model.state.transactionsComputed.map((transaction) => (
              <div>
                <span>{transaction.raccount}</span>
                <span>{transaction.category}</span>
                <span>{transaction.dailyRate.toFixed(2)}</span>
              </div>
            ))}
            <pre>{JSON.stringify(model.state, null, 2)}</pre>
          </div>
        </React.Fragment>
      )}
    </State.Consumer>
  );
};

export default Planning;
