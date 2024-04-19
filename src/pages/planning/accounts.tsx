import { toDecimal } from 'dinero.js';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'starfx/react';

import { schema } from '~/src/store/schema';
import { accountRemove } from '~/src/store/thunks/accounts';

import { FlexTable } from '~/src/components/FlexTable';
import { TabView } from '~/src/components/TabView';

import { Button } from '~/src/elements/Button';

import AccountInput from './accountInput';
import AccountTransactionInput from './accountTransactionInput';

const modifyAccount = (navigate, account) => {
  return navigate('/accounts/set', {
    state: {
      account: {
        id: account.id,
        name: account.name,
        starting: account.starting.toFixed(2),
        interest: account.interest.toFixed(2),
        vehicle: account.vehicle
      }
    }
  });
};

const AccountFlow = () => {
  const [activeTab, setActiveTab] = useState(0);
  const accounts = useSelector(schema.accounts.selectTableAsList);

  return (
    <TabView
      id="accounts"
      activeTab={activeTab}
      tabClick={setActiveTab}
      tabTitles={['Accounts', 'Debt']}
      tabContents={[
        <React.Fragment>
          {/* <Button onClick={model.toggleAllAccount}>
            Toggle All Visibility
          </Button> */}
          <AccountTable data={accounts} />
        </React.Fragment>,
        <React.Fragment>
          <DebtTable data={accounts} />
          {/* {accounts.filter(
            (account) =>
              account.vehicle === 'debt' ||
              account.vehicle === 'loan' ||
              account.vehicle === 'credit line'
          ).length === 0 ? null : (
            <AccountTransactionInput tabClick={this.tabClick} />
          )} */}
        </React.Fragment>
      ]}
    />
  );
};

export default AccountFlow;

const AccountTable = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return data.length === 0 || !data ? (
    <div>There are no accounts to show.</div>
  ) : (
    <FlexTable
      itemHeaders={[
        // 'visible',
        'name',
        'starting',
        'interest',
        'vehicle',
        'Modify',
        'Delete'
      ]}
      itemData={data.map((account) => ({
        key: account.name,
        data: [
          // <Button onPress={() => console.log('//TODO handle visibility')}>
          //   {account.visible ? `👀` : `🤫`}
          // </Button>,
          account.name,
          toDecimal(account.starting),
          `${account.interest.amount * Math.pow(10, -account.interest.scale)}%`,
          account.vehicle,
          <Button onPress={() => modifyAccount(navigate, account)}>M</Button>,
          <Button onPress={() => dispatch(accountRemove({ id: account.id }))}>
            <strong>X</strong>
          </Button>
        ]
      }))}
    />
  );
};

const DebtTable = ({ data }) =>
  data.filter(
    (account) =>
      account.vehicle === 'debt' ||
      account.vehicle === 'loan' ||
      account.vehicle === 'credit line'
  ).length === 0 || !data ? (
    <div>There are no debts to show.</div>
  ) : (
    <FlexDebtTable
      itemHeaders={[
        'account name',
        'starting',
        'interest',
        'Add',
        'Modify',
        'Delete'
        // 'Payback'
      ]}
      data={data}
    />
  );

const FlexDebtTable = ({ itemHeaders, data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  console.log({ itemHeaders, data });
  return (
    <FlexTable
      itemHeaders={itemHeaders}
      itemData={data
        .filter(
          (account) =>
            account.vehicle === 'debt' ||
            account.vehicle === 'loan' ||
            account.vehicle === 'credit line'
        )
        .map((account) => ({
          key: account.name,
          data: [
            account.name,
            toDecimal(account.starting),
            `${
              account.interest.amount * Math.pow(10, -account.interest.scale)
            }%`,
            // <Button
            //   sx={{
            //     variants: 'outline',
            //     color: 'green'
            //   }}
            //   onClick={actions.model.forms.accountTransactionFormVisible.toggle}
            // >
            //   +
            // </Button>,
            <Button
              onPress={() =>
                navigate('/accounts/set', {
                  state: {
                    navigateTo: 'accounts',
                    account: {
                      id: account.id,
                      name: account.name,
                      starting: account.starting.toFixed(2),
                      interest: `${
                        account.interest.amount *
                        Math.pow(10, -account.interest.scale)
                      }%`,
                      vehicle: account.vehicle
                    }
                  }
                })
              }
            >
              M
            </Button>,
            <Button onPress={() => dispatch(accountRemove({ id: account.id }))}>
              <strong>X</strong>
            </Button>
            // account.payback ? (
            //   <PaybackTable data={account} actions={actions} />
            // ) : null
          ]
        }))}
    />
  );
};

const PaybackTable = ({ data, actions }) => (
  <FlexTable
    itemHeaders={[
      'description',
      'start',
      'rtype',
      'cycle',
      'value',
      'Modify',
      'Delete'
    ]}
    itemData={data.payback.transactions.map((paybackTransaction, index) => ({
      key: index,
      data: [
        paybackTransaction.description,
        paybackTransaction.start,
        paybackTransaction.rtype,
        paybackTransaction.cycle,
        paybackTransaction.value,
        <Button
          sx={{
            variants: 'outline',
            color: 'blue'
          }}
          onClick={() => {
            actions.model.modifyAccountTransaction(data.name, index);
          }}
        >
          M
        </Button>,
        <Button
          sx={{
            variants: 'outline',
            color: 'green'
          }}
          onClick={() =>
            actions.model.deleteAccountTransaction(data.name, index)
          }
        >
          X
        </Button>
      ]
    }))}
    actions={actions}
  />
);
