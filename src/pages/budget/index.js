import React from 'react';
import { State } from '../../state';
import { Flex, Grid, Card, Heading, Text } from 'theme-ui';

export default () => {
  return (
    <State.Consumer>
      {model => (
        <React.Fragment>
          <Flex sx={{ mx: 5, flexDirection: 'column' }}>
            <Heading as="h2">Income</Heading>
            <Grid as="section" columns={[1, 2, 3]}>
              {model.state.transactionsComputed
                .filter(transaction => transaction.type === 'income')
                .map(transaction => (
                  <Card>
                    {[
                      transaction.raccount,
                      transaction.description,
                      transaction.category,
                      transaction.type,
                      transaction.start,
                      transaction.rtype,
                      !transaction.cycle ? '' : transaction.cycle.toFixed(0),
                      !transaction.value ? '' : transaction.value.toFixed(2),
                      transaction.dailyRate.toFixed(2)
                    ].map(v => (
                      <Text>{v}</Text>
                    ))}
                  </Card>
                ))}
            </Grid>
            <Heading as="h2">Expenses</Heading>
            <Grid as="section" columns={[1, 2, 3]}>
              {model.state.transactionsComputed
                .filter(transaction => transaction.type === 'expense')
                .map(transaction => (
                  <Card>
                    {[
                      transaction.raccount,
                      transaction.description,
                      transaction.category,
                      transaction.type,
                      transaction.start,
                      transaction.rtype,
                      !transaction.cycle ? '' : transaction.cycle.toFixed(0),
                      !transaction.value ? '' : transaction.value.toFixed(2),
                      transaction.dailyRate.toFixed(2)
                    ].map(v => (
                      <Text>{v}</Text>
                    ))}
                  </Card>
                ))}
            </Grid>
          </Flex>
        </React.Fragment>
      )}
    </State.Consumer>
  );
};
