import React from 'react';
import { State } from '../../state';
import BarChart from './barChart';
import { Flex, Box, Heading } from '@theme-ui/components';

const AccountInfo = props => (
  <State.Consumer>
    {model =>
      model.charts.state.AccountChart.map(account => (
        <Flex key={account.account.name}>
          <Box m={2}>
            <Heading variant="subtle">{account.account.name}</Heading>
            <BarChart data={model.charts.state} account={account} />
          </Box>
        </Flex>
      ))
    }
  </State.Consumer>
);

export default AccountInfo;
