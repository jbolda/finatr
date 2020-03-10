import React from 'react';
import { State } from '../../state';
import BarChart from './barChart';
import IcicleChart from './icicleChart';
import { Box, Input } from '@theme-ui/components';

import Transactions from './transactions';
import Accounts from './accounts';

import * as Form from '../../components/bootstrap/Form';

class FinancialFlow extends React.Component {
  render() {
    return (
      <State.Consumer>
        {model => (
          <React.Fragment>
            <Box mx={1}>
              <BarChart data={model.charts.state} />
            </Box>
            <Box mx={3} sx={{ maxWidth: 384 }}>
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
            </Box>
            <Transactions />
            <Accounts />
            <IcicleChart data={model.state.transactionsComputed} />
          </React.Fragment>
        )}
      </State.Consumer>
    );
  }
}

export default FinancialFlow;
