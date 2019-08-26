import React from 'react';
import { State } from '../../state';

import TabView from '../../components/view/tabView';
import { HeaderRow, DataRow } from '../../components/bootstrap/FlexTable';
import AccountInput from './accountInput';
import AccountTransactionInput from './accountTransactionInput';

class AccountFlow extends React.Component {
  constructor(props) {
    super();
    this.setAccountForm = this.setAccountForm.bind(this);
    this.tabClick = this.tabClick.bind(this);
    this.state = { activeTab: 0 };
  }

  tabClick(index) {
    this.setState({ activeTab: index });
  }

  setAccountForm(model, index, name) {
    this.setState({ activeTab: index });
    model.modifyAccount(name);
  }

  render() {
    return (
      <State.Consumer>
        {model => (
          <section className="section" id="accounts">
            <TabView
              activeTab={this.state.activeTab}
              tabClick={this.tabClick}
              tabTitles={['All Accounts', 'Add Account', 'Debt']}
              tabContents={[
                <React.Fragment>
                  <button
                    className="button is-rounded is-small is-info"
                    onClick={model.toggleAllAccount}
                  >
                    Toggle All Visibility
                  </button>
                  <AccountTable
                    data={model.state.accountsComputed}
                    actions={{
                      model: model,
                      setAccountForm: this.setAccountForm,
                      deleteAccount: model.deleteAccount,
                      toggleAccountVisibility: model.toggleAccountVisibility
                    }}
                  />
                </React.Fragment>,
                <AccountInput tabClick={this.tabClick} />,
                <React.Fragment>
                  <DebtTable
                    data={model.state.accountsComputed}
                    actions={{
                      model: model,
                      setAccountForm: this.setAccountForm
                    }}
                  />
                  {model.state.accountsComputed.filter(
                    account =>
                      account.vehicle === 'debt' ||
                      account.vehicle === 'loan' ||
                      account.vehicle === 'credit line'
                  ).length === 0 ? null : (
                    <AccountTransactionInput tabClick={this.tabClick} />
                  )}
                </React.Fragment>
              ]}
            />
          </section>
        )}
      </State.Consumer>
    );
  }
}

export default AccountFlow;

const AccountTable = ({ data, actions }) =>
  data.length === 0 || !data ? (
    <div>There are no accounts to show.</div>
  ) : (
    <FlexAccountTable
      itemHeaders={[
        'visible',
        'name',
        'starting',
        'interest',
        'vehicle',
        'Modify',
        'Delete'
      ]}
      data={data}
      actions={actions}
    />
  );

const FlexAccountTable = ({ itemHeaders, data, actions }) => (
  <React.Fragment>
    <HeaderRow columns={itemHeaders.length} items={itemHeaders} />
    {data.map(account => (
      <DataRow
        key={account.name}
        itemKey={account.name}
        columns={itemHeaders.length}
        itemHeaders={itemHeaders}
        items={[
          <button
            onClick={actions.toggleAccountVisibility.bind(
              this,
              account.name.state
            )}
          >
            {account.visible.state ? `👀` : `🤫`}
          </button>,
          account.name,
          account.starting.toFixed(2),
          `${account.interest.toFixed(2)}%`,
          account.vehicle,
          <button
            className="button is-rounded is-small is-info"
            onClick={() =>
              actions.setAccountForm(actions.model, 1, account.name.state)
            }
          >
            M
          </button>,
          <button
            className="button is-rounded is-small is-danger"
            onClick={actions.deleteAccount.bind(this, account.name.state)}
          >
            <strong>X</strong>
          </button>
        ]}
      />
    ))}
  </React.Fragment>
);

const DebtTable = ({ data, actions }) =>
  data.filter(
    account =>
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
      ]}
      data={data}
      actions={actions}
    />
  );

const FlexDebtTable = ({ itemHeaders, data, actions }) => (
  <React.Fragment>
    <HeaderRow columns={itemHeaders.length} items={itemHeaders} />
    {data
      .filter(
        account =>
          account.vehicle === 'debt' ||
          account.vehicle === 'loan' ||
          account.vehicle === 'credit line'
      )
      .map(account => (
        <React.Fragment key={account.name}>
          <DataRow
            itemKey={account.name}
            columns={itemHeaders.length}
            itemHeaders={itemHeaders}
            items={[
              account.name,
              account.starting.toFixed(2),
              `${account.interest.toFixed(2)}%`,
              <button
                className="button is-rounded is-small is-success"
                onClick={
                  actions.model.forms.accountTransactionFormVisible.toggle
                }
              >
                +
              </button>,
              <button
                className="button is-rounded is-small is-info"
                onClick={() =>
                  actions.setAccountForm(actions.model, 1, account.name)
                }
              >
                M
              </button>,
              <button
                className="button is-rounded is-small is-danger"
                onClick={() => actions.model.deleteAccount(account.name)}
              >
                <strong>X</strong>
              </button>
            ]}
          />
          {account.payback ? (
            <PaybackTable data={account} actions={actions} />
          ) : null}
        </React.Fragment>
      ))}
  </React.Fragment>
);

const PaybackTable = ({ data, actions }) => (
  <FlexPaybackTable
    itemHeaders={[
      'description',
      'start',
      'rtype',
      'cycle',
      'value',
      'Modify',
      'Delete'
    ]}
    data={data}
    actions={actions}
  />
);

const FlexPaybackTable = ({ itemHeaders, data, actions }) => (
  <React.Fragment>
    <HeaderRow columns={itemHeaders.length} items={itemHeaders} />
    {data.payback.transactions.map((paybackTransaction, index) => (
      <DataRow
        key={index}
        itemKey={index}
        columns={itemHeaders.length}
        itemHeaders={itemHeaders}
        items={[
          paybackTransaction.description,
          paybackTransaction.start,
          paybackTransaction.rtype,
          paybackTransaction.cycle,
          paybackTransaction.value,
          <button
            className="button is-rounded is-small is-info"
            onClick={() => {
              actions.model.modifyAccountTransaction(data.name, index);
            }}
          >
            M
          </button>,
          <button
            className="button is-rounded is-small is-danger"
            onClick={() =>
              actions.model.deleteAccountTransaction(data.name, index)
            }
          >
            <strong>X</strong>
          </button>
        ]}
      />
    ))}
  </React.Fragment>
);
