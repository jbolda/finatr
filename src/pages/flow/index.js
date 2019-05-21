import React from 'react';
import { State } from '../../state';
import BarChart from './barChart';

import Transactions from './transactions';
import Accounts from './accounts';

import * as Form from '../../components/bootstrap/Form';

class FinancialFlow extends React.Component {
  render() {
    return (
      <State.Consumer>
        {model => (
          <React.Fragment>
            <section className="section">
              <div className="level">
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Daily Income</p>
                    <p className="heading">
                      ${model.stats.dailyIncome.state.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Daily Expenses</p>
                    <p className="heading">
                      ${model.stats.dailyExpense.state.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Savings Rate</p>
                    <p className="heading">
                      {model.stats.savingsRate.state.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">% to FI</p>
                    <p className="heading">
                      {model.stats.fiNumber.state.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
              <BarChart data={model.charts.state} />
            </section>
            <section className="section">
              <div className="container">
                <Form.Field>
                  <Form.FieldLabel>Beginning Flow On</Form.FieldLabel>
                  <Form.FieldControl>
                    <input
                      className="input"
                      name="begin-graph"
                      type="date"
                      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                      value={model.charts.graphDates.start}
                      onChange={event =>
                        model.updateStartDateReCalc(event.target.value)
                      }
                    />
                  </Form.FieldControl>
                </Form.Field>
              </div>
            </section>
            <Transactions />
            <Accounts />
          </React.Fragment>
        )}
      </State.Consumer>
    );
  }
}

export default FinancialFlow;
