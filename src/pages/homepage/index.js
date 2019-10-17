/** @jsx jsx */
import { jsx } from 'theme-ui';
import React from 'react';
import Link from '../../components/common/link';
import { State } from '../../state';
import { Box, Flex, Heading, Text } from 'rebass';

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
          <Heading fontSize={[5, 6, 7]} color="primary">
            finatr
          </Heading>
          <Text fontSize={[3, 4, 5]} color="primary">
            helping you analyze your future cash flows
          </Text>
        </Box>
        <Flex>
          <Box p={5} width={1 / 2}>
            <aside className="menu">
              <Text fontSize={[3, 4, 5]} color="primary">
                Pages
              </Text>
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
          <Box p={5} width={1 / 2}>
            <Text fontSize={[3, 4, 5]} color="primary">
              About
            </Text>
            <div className="content">
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
            </div>
          </Box>
        </Flex>
      </React.Fragment>
    )}
  </State.Consumer>
);

export default Homepage;
