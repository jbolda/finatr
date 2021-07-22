import React from 'react';
import { State } from '~src/state';

class FinancialIndependence extends React.Component {
  render() {
    return (
      <State.Consumer>
        {(model) => (
          <React.Fragment>
            <div>
              <div>
                <p>Daily Income</p>
                <p>${model.stats.dailyIncome.toFixed}</p>
              </div>
              <div>
                <p>Daily Expenses</p>
                <p>${model.stats.dailyExpense.toFixed}</p>
              </div>
              <div>
                <p>Savings Rate</p>
                <p>{model.stats.savingsRate.toFixed}%</p>
              </div>
              <div>
                <p>Expense Multiple</p>
                <p>{model.stats.expenseMultiple.toFixed}x</p>
                <p>
                  +{model.stats.expenseMultipleIncreasePerYear.toFixed}
                  x/year
                </p>
              </div>
              <div>
                <p>% to FI (25x)</p>
                <p>{model.stats.percentToFINumber.toFixed}%</p>
                {model.stats.yearsToFINumber.toFixed === '999.00' ? null : (
                  <p>{model.stats.yearsToFINumber.toFixed}y</p>
                )}
              </div>
            </div>
            <div>
              <div>
                <p>% to +net worth</p>
                <p>{model.stats.percentToPositiveNetWorth.toFixed}%</p>
              </div>
              <div>
                <p>% to FU Money (2x)</p>
                <p>{model.stats.percentToFUMoneyConsidering.toFixed}%</p>
                {model.stats.yearsToFUMoneyConsidering.toFixed ===
                '999.00' ? null : (
                  <p>{model.stats.yearsToFUMoneyConsidering.toFixed}y</p>
                )}
              </div>
              <div>
                <p>% to FU Money (3x)</p>
                <p>{model.stats.percentToFUMoneyConfident.toFixed}%</p>
                {model.stats.yearsToFUMoneyConfident.toFixed ===
                '999.00' ? null : (
                  <p>{model.stats.yearsToFUMoneyConfident.toFixed}y</p>
                )}
              </div>
              <div>
                <p>% to first FI milestone</p>
                <p>($100,000 Net Worth)</p>
                <p>{model.stats.percentToFirstFI.toFixed}%</p>
              </div>
              <div>
                <p>% to half FI (12.5x)</p>
                <p>{model.stats.percentToHalfFI.toFixed}%</p>
                {model.stats.yearsToHalfFI.toFixed === '999.00' ? null : (
                  <p>{model.stats.yearsToHalfFI.toFixed}y</p>
                )}
              </div>
              <div>
                <p>% to lean FI (17.5x)</p>
                <p>{model.stats.percentToLeanFI.toFixed}%</p>
                {model.stats.yearsToLeanFI.toFixed === '999.00' ? null : (
                  <p>{model.stats.yearsToLeanFI.toFixed}y</p>
                )}
              </div>
              <div>
                <p>% to flex FI (20x)</p>
                <p>{model.stats.percentToFlexFI.toFixed}%</p>
                {model.stats.yearsToFlexFI.toFixed === '999.00' ? null : (
                  <p>{model.stats.yearsToFlexFI.toFixed}y</p>
                )}
              </div>
              <div>
                <p>% to fat FI (30x)</p>
                <p>{model.stats.percentToFatFI.toFixed}%</p>
                {model.stats.yearsToFatFI.toFixed === '999.00' ? null : (
                  <p>{model.stats.yearsToFatFI.toFixed}y</p>
                )}
              </div>
            </div>
          </React.Fragment>
        )}
      </State.Consumer>
    );
  }
}

export default FinancialIndependence;
