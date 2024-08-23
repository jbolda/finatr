import { toDecimal } from 'dinero.js';
import { Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Group } from 'react-aria-components';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import type { Dispatch } from 'redux';
import type { AnyAction } from 'starfx';
import { useDispatch, useSelector } from 'starfx/react';

import { schema, type Account } from '~/src/store/schema.ts';
import { accountRemove } from '~/src/store/thunks/accounts.ts';
import { toHumanCurrency } from '~/src/store/utils/dineroUtils.ts';

import { TabView } from '~/src/components/TabView.tsx';
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader
} from '~/src/components/Table';

import { Button } from '~/src/elements/Button.tsx';

// import AccountTransactionInput from '../accounts/accountTransactionInput';
// import AccountInput from './accountInput';

const modifyAccount = (navigate: NavigateFunction, account: Account) => {
  return navigate('/accounts/set', {
    state: {
      account: {
        id: account.id,
        name: account.name,
        starting: toDecimal(account.starting),
        interest:
          account.interest.amount * Math.pow(10, -account.interest.scale),
        vehicle: account.vehicle
      }
    }
  });
};

const AccountFlow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const accounts = useSelector(schema.accounts.selectTableAsList);
  const debt = accounts.filter(
    (account) =>
      account.vehicle === 'debt' ||
      account.vehicle === 'loan' ||
      account.vehicle === 'credit line'
  );

  return (
    <TabView
      id="accounts"
      activeTab={activeTab}
      tabClick={setActiveTab}
      tabTitles={['Accounts', 'Debt']}
      tabContents={[
        <React.Fragment>
          <Table aria-label="All Accounts" selectionMode="none">
            <TableHeader>
              <Column isRowHeader>Name</Column>
              {['Starting', 'Interest', 'Vehicle', 'Actions'].map((h) => (
                <Column key={h}>{h}</Column>
              ))}
            </TableHeader>
            <TableBody renderEmptyState={() => 'No accounts.'}>
              {accounts.map((account) => (
                <AccountRow
                  key={account.id}
                  account={account}
                  navigate={navigate}
                  dispatch={dispatch}
                />
              ))}
            </TableBody>
          </Table>
        </React.Fragment>,
        <React.Fragment>
          <React.Fragment>
            {/* <AccountTransactionInput tabClick={this.tabClick} /> */}
            <Table aria-label="Debt Accounts" selectionMode="none">
              <TableHeader>
                <Column isRowHeader>Name</Column>
                {['Starting', 'Interest', 'Vehicle', 'Actions'].map((h) => (
                  <Column key={h}>{h}</Column>
                ))}
              </TableHeader>
              <TableBody renderEmptyState={() => 'No accounts.'}>
                {debt.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    navigate={navigate}
                    dispatch={dispatch}
                  />
                ))}
              </TableBody>
            </Table>
          </React.Fragment>
          {/* // <FlexDebtTable
    //   itemHeaders={[
    //     'account name',
    //     'starting',
    //     'interest',
    //     'Add',
    //     'Modify',
    //     'Delete'
    //     // 'Payback'
    //   ]}
    //   data={data}
    // />} */}
        </React.Fragment>
      ]}
    />
  );
};

export default AccountFlow;

const AccountRow = ({
  account,
  navigate,
  dispatch
}: {
  account: Account;
  navigate: NavigateFunction;
  dispatch: Dispatch<AnyAction>;
}) => (
  <Row>
    <Cell>{account.name}</Cell>
    <Cell>{toHumanCurrency(account.starting)}</Cell>
    <Cell>
      {`${account.interest.amount * Math.pow(10, -account.interest.scale)}
  %`}
    </Cell>
    <Cell>{account.vehicle}</Cell>
    <Cell>
      <Group aria-label="Actions" className="space-x-1">
        <Button
          aria-label="Modify"
          onPress={() => modifyAccount(navigate, account)}
          className="px-0.5"
        >
          <Pencil className="max-h-3" />
        </Button>
        <Button
          aria-label="Delete"
          onPress={() => dispatch(accountRemove({ id: account.id }))}
          className="px-0.5"
        >
          <Trash2 className="max-h-3" />
        </Button>
      </Group>
    </Cell>
  </Row>
);

// const PaybackTable = ({ data, actions }) => (
//   <FlexTable
//     itemHeaders={[
//       'description',
//       'start',
//       'rtype',
//       'cycle',
//       'value',
//       'Modify',
//       'Delete'
//     ]}
//     itemData={data.payback.transactions.map((paybackTransaction, index) => ({
//       key: index,
//       data: [
//         paybackTransaction.description,
//         paybackTransaction.start,
//         paybackTransaction.rtype,
//         paybackTransaction.cycle,
//         paybackTransaction.value,
//         <Button
//           sx={{
//             variants: 'outline',
//             color: 'blue'
//           }}
//           onClick={() => {
//             actions.model.modifyAccountTransaction(data.name, index);
//           }}
//         >
//           M
//         </Button>,
//         <Button
//           sx={{
//             variants: 'outline',
//             color: 'green'
//           }}
//           onClick={() =>
//             actions.model.deleteAccountTransaction(data.name, index)
//           }
//         >
//           X
//         </Button>
//       ]
//     }))}
//     actions={actions}
//   />
// );
