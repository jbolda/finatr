import React from 'react';
import Link from '../../components/common/link';
import { State } from '../../state';
import { Box, Grid, Heading, Text } from '@theme-ui/components';

const Homepage = () => (
  <State.Consumer>
    {model => (
      <React.Fragment>
        <Box
          sx={{
            maxWidth: 512,
            mx: 'auto',
            px: 5
          }}
        >
          <Heading variant="text.heading">finatr</Heading>
          <Heading variant="text.subtitle">
            helping you analyze your future cash flows
          </Heading>
        </Box>
        <Grid columns={[1, 2, 2]} gap={1}>
          <Box p={1}>
            <aside className="menu">
              <Text variant="section">Pages</Text>
              <ul>
                <li>
                  <Link to="examples">Examples</Link>
                </li>
                <li>
                  <Link to="flow">Cash Flow</Link>
                </li>
                <li>
                  <Link to="accounts">Accounts (Cash Flow Breakdown)</Link>
                </li>
                <li>
                  <Link to="import">Import (Bring Data In, Take It Out)</Link>
                </li>
                <li>
                  <Link to="taxes">Taxes (in alpha)</Link>
                </li>
              </ul>
            </aside>
          </Box>
          <Box p={1}>
            <Text variant="section">About</Text>
            <Text>
              Most apps track your historical information and help you set up a
              budget. Argueably, budgets don't work for everyone. Even if you
              maintain a budget, it is still of great value to look to the
              future. The first version focuses on the near future checking that
              the inflows and outflows in your accounts are satisfactory.
              Essentially, will my accounts stay above zero with the planned
              expenditures. Tied into that, we need to understand a deal with
              variable debt payments (see credit cards) as future flows are more
              involved then a simple monthly payment you might see with a
              mortgage or a student loan payment. The next step from this is
              returning information regarding these flows such as a daily income
              and daily expenses. This type of information can be built upon
              going forward to forecast considerations like FI(RE).
            </Text>
          </Box>
        </Grid>
      </React.Fragment>
    )}
  </State.Consumer>
);

export default Homepage;
