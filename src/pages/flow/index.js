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
                      ${model.stats.dailyIncome.toFixed}
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Daily Expenses</p>
                    <p className="heading">
                      ${model.stats.dailyExpense.toFixed}
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Savings Rate</p>
                    <p className="heading">
                      {model.stats.savingsRate.toFixed}%
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Expense Multiple</p>
                    <p className="heading">
                      {model.stats.expenseMultiple.toFixed}x
                    </p>
                    <p className="heading">
                      +{model.stats.expenseMultipleIncreasePerYear.toFixed}
                      x/year
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">% to FI (25x)</p>
                    <p className="heading">
                      {model.stats.percentToFINumber.toFixed}%
                    </p>
                    {model.stats.yearsToFINumber.toFixed === '999.00' ? null : (
                      <p className="heading">
                        {model.stats.yearsToFINumber.toFixed}y
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="level">
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">% to +net worth</p>
                    <p className="heading">
                      {model.stats.percentToPositiveNetWorth.toFixed}%
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">% to FU Money (2x)</p>
                    <p className="heading">
                      {model.stats.percentToFUMoneyConsidering.toFixed}%
                    </p>
                    {model.stats.yearsToFUMoneyConsidering.toFixed ===
                    '999.00' ? null : (
                      <p className="heading">
                        {model.stats.yearsToFUMoneyConsidering.toFixed}y
                      </p>
                    )}
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">% to FU Money (3x)</p>
                    <p className="heading">
                      {model.stats.percentToFUMoneyConfident.toFixed}%
                    </p>
                    {model.stats.yearsToFUMoneyConfident.toFixed ===
                    '999.00' ? null : (
                      <p className="heading">
                        {model.stats.yearsToFUMoneyConfident.toFixed}y
                      </p>
                    )}
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">% to first FI milestone</p>
                    <p className="heading">($100,000 Net Worth)</p>
                    <p className="heading">
                      {model.stats.percentToFirstFI.toFixed}%
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">% to half FI (12.5x)</p>
                    <p className="heading">
                      {model.stats.percentToHalfFI.toFixed}%
                    </p>
                    {model.stats.yearsToHalfFI.toFixed === '999.00' ? null : (
                      <p className="heading">
                        {model.stats.yearsToHalfFI.toFixed}y
                      </p>
                    )}
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">% to lean FI (17.5x)</p>
                    <p className="heading">
                      {model.stats.percentToLeanFI.toFixed}%
                    </p>
                    {model.stats.yearsToLeanFI.toFixed === '999.00' ? null : (
                      <p className="heading">
                        {model.stats.yearsToLeanFI.toFixed}y
                      </p>
                    )}
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">% to flex FI (20x)</p>
                    <p className="heading">
                      {model.stats.percentToFlexFI.toFixed}%
                    </p>
                    {model.stats.yearsToFlexFI.toFixed === '999.00' ? null : (
                      <p className="heading">
                        {model.stats.yearsToFlexFI.toFixed}y
                      </p>
                    )}
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">% to fat FI (30x)</p>
                    <p className="heading">
                      {model.stats.percentToFatFI.toFixed}%
                    </p>
                    {model.stats.yearsToFatFI.toFixed === '999.00' ? null : (
                      <p className="heading">
                        {model.stats.yearsToFatFI.toFixed}y
                      </p>
                    )}
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
