import React from 'react';
import { State } from '../../state';
import BarChart from './barChart';
import { Box, Flex, Text } from 'rebass';
import { Input } from '@rebass/forms';

import Transactions from './transactions';
import Accounts from './accounts';

import * as Form from '../../components/bootstrap/Form';

class FinancialFlow extends React.Component {
  render() {
    return (
      <State.Consumer>
        {model => (
          <React.Fragment>
            <Flex flexWrap="wrap" mx={5}>
              <Box px={2} py={2} width={1 / 5}>
                <Text p={1}>Daily Income</Text>
                <Text p={1}>${model.stats.dailyIncome.toFixed}</Text>
              </Box>
              <Box px={2} py={2} width={1 / 5}>
                <Text p={1}>Daily Expenses</Text>
                <Text p={1}>${model.stats.dailyExpense.toFixed}</Text>
              </Box>
              <Box px={2} py={2} width={1 / 5}>
                <Text p={1}>Savings Rate</Text>
                <Text p={1}>{model.stats.savingsRate.toFixed}%</Text>
              </Box>
              <Box px={2} py={2} width={1 / 5}>
                <Text p={1}>Expense Multiple</Text>
                <Text p={1}>{model.stats.expenseMultiple.toFixed}x</Text>
                <Text p={1}>
                  +{model.stats.expenseMultipleIncreasePerYear.toFixed}
                  x/year
                </Text>
              </Box>
              <Box px={2} py={2} width={1 / 5}>
                <Text p={1}>% to FI (25x)</Text>
                <Text p={1}>{model.stats.percentToFINumber.toFixed}%</Text>
                {model.stats.yearsToFINumber.toFixed === '999.00' ? null : (
                  <Text p={1}>{model.stats.yearsToFINumber.toFixed}y</Text>
                )}
              </Box>

              <Box px={2} py={2} width={1 / 8}>
                <Text p={1}>% to +net worth</Text>
                <Text p={1}>
                  {model.stats.percentToPositiveNetWorth.toFixed}%
                </Text>
              </Box>
              <Box px={2} py={2} width={1 / 8}>
                <Text p={1}>% to FU Money (2x)</Text>
                <Text p={1}>
                  {model.stats.percentToFUMoneyConsidering.toFixed}%
                </Text>
                {model.stats.yearsToFUMoneyConsidering.toFixed ===
                '999.00' ? null : (
                  <Text p={1}>
                    {model.stats.yearsToFUMoneyConsidering.toFixed}y
                  </Text>
                )}
              </Box>
              <Box px={2} py={2} width={1 / 8}>
                <Text p={1}>% to FU Money (3x)</Text>
                <Text p={1}>
                  {model.stats.percentToFUMoneyConfident.toFixed}%
                </Text>
                {model.stats.yearsToFUMoneyConfident.toFixed ===
                '999.00' ? null : (
                  <Text p={1}>
                    {model.stats.yearsToFUMoneyConfident.toFixed}y
                  </Text>
                )}
              </Box>
              <Box px={2} py={2} width={1 / 8}>
                <Text p={1}>% to first FI milestone</Text>
                <Text p={1}>($100,000 Net Worth)</Text>
                <Text p={1}>{model.stats.percentToFirstFI.toFixed}%</Text>
              </Box>
              <Box px={2} py={2} width={1 / 8}>
                <Text p={1}>% to half FI (12.5x)</Text>
                <Text p={1}>{model.stats.percentToHalfFI.toFixed}%</Text>
                {model.stats.yearsToHalfFI.toFixed === '999.00' ? null : (
                  <Text p={1}>{model.stats.yearsToHalfFI.toFixed}y</Text>
                )}
              </Box>
              <Box px={2} py={2} width={1 / 8}>
                <Text p={1}>% to lean FI (17.5x)</Text>
                <Text p={1}>{model.stats.percentToLeanFI.toFixed}%</Text>
                {model.stats.yearsToLeanFI.toFixed === '999.00' ? null : (
                  <Text p={1}>{model.stats.yearsToLeanFI.toFixed}y</Text>
                )}
              </Box>
              <Box px={2} py={2} width={1 / 8}>
                <Text p={1}>% to flex FI (20x)</Text>
                <Text p={1}>{model.stats.percentToFlexFI.toFixed}%</Text>
                {model.stats.yearsToFlexFI.toFixed === '999.00' ? null : (
                  <Text p={1}>{model.stats.yearsToFlexFI.toFixed}y</Text>
                )}
              </Box>
              <Box px={2} py={2} width={1 / 8}>
                <Text p={1}>% to fat FI (30x)</Text>
                <Text p={1}>{model.stats.percentToFatFI.toFixed}%</Text>
                {model.stats.yearsToFatFI.toFixed === '999.00' ? null : (
                  <Text p={1}>{model.stats.yearsToFatFI.toFixed}y</Text>
                )}
              </Box>
            </Flex>
            <Flex flexWrap="wrap" mx={1}>
              <BarChart data={model.charts.state} />
            </Flex>
            <Flex flexWrap="wrap" mx={3}>
              <Form.FieldHorizontal>
                <Form.Label htmlFor="begin-graph">Beginning Flow On</Form.Label>
                <Input
                  name="begin-graph"
                  type="date"
                  pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                  value={model.charts.graphDates.start}
                  onChange={event =>
                    model.updateStartDateReCalc(event.target.value)
                  }
                />
              </Form.FieldHorizontal>
            </Flex>
            <Transactions />
            <Accounts />
          </React.Fragment>
        )}
      </State.Consumer>
    );
  }
}

export default FinancialFlow;
