import React from 'react';
import { map } from 'microstates';
import { State } from '../../state';

import TabView from '../../components/view/tabView';
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
                    data={model.accountsComputed}
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
                  <div>
                    <DebtTable
                      data={model.state.accountsComputed}
                      actions={{
                        model: model,
                        setAccountForm: this.setAccountForm
                      }}
                    />
                  </div>
                  <div>
                    {model.state.accountsComputed.filter(
                      account =>
                        account.vehicle === 'debt' ||
                        account.vehicle === 'loan' ||
                        account.vehicle === 'credit line'
                    ).length === 0 ? null : (
                      <AccountTransactionInput tabClick={this.tabClick} />
                    )}
                  </div>
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
    <table className="table is-striped is-hoverable">
      <thead>
        <tr>
          <th />
          <th>name</th>
          <th>
            <abbr title="starting balance">starting</abbr>
          </th>
          <th>interest</th>
          <th>vehicle</th>
          <th>Modify</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {map(data, account => (
          <tr key={account.name.state}>
            <td
              onClick={actions.toggleAccountVisibility.bind(
                this,
                account.name.state
              )}
            >
              {account.visible.state ? `👀` : `🤫`}
            </td>
            <th>{account.name.state}</th>
            <td>{account.starting.toFixed}</td>
            <td>{account.interest.toFixed}%</td>
            <td>{account.vehicle.state}</td>
            <td>
              <button
                className="button is-rounded is-small is-info"
                onClick={() =>
                  actions.setAccountForm(actions.model, 1, account.name.state)
                }
              >
                M
              </button>
            </td>
            <td>
              <button
                className="delete"
                onClick={actions.deleteAccount.bind(this, account.name.state)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
    data
      .filter(
        account =>
          account.vehicle === 'debt' ||
          account.vehicle === 'loan' ||
          account.vehicle === 'credit line'
      )
      .map(account => (
        <div className="media box" key={account.name}>
          <div className="media-content">
            <div className="content">
              <p>
                <strong>{account.name}</strong>{' '}
                <small>{`$${account.starting} @ ${account.interest}%`}</small>
              </p>
            </div>
            {account.payback ? (
              <PaybackTable data={account} actions={actions} />
            ) : null}
          </div>
          <div className="media-right">
            <button
              className="button is-rounded is-small is-success"
              onClick={actions.model.forms.accountTransactionFormVisible.toggle}
            >
              +
            </button>
            <button
              className="button is-rounded is-small is-info"
              onClick={() =>
                actions.setAccountForm(actions.model, 1, account.name)
              }
            >
              M
            </button>
            <button
              className="delete"
              onClick={() => actions.model.deleteAccount(account.name)}
            />
          </div>
        </div>
      ))
  );

const PaybackTable = ({ data, actions }) =>
  data.payback.transactions.map((paybackTransaction, index) => (
    <div className="media" key={index}>
      <div className="media-content">
        <p>
          <strong>{paybackTransaction.start}</strong>{' '}
          <small>{`${paybackTransaction.rtype} @ ${paybackTransaction.cycle} for ${paybackTransaction.value}`}</small>
        </p>
        <p>{paybackTransaction.description}</p>
      </div>
      <div className="media-right">
        <button
          className="button is-rounded is-small is-info"
          onClick={() => {
            actions.model.modifyAccountTransaction(data.name, index);
          }}
        >
          M
        </button>
        <button
          className="delete"
          onClick={() =>
            actions.model.deleteAccountTransaction(data.name, index)
          }
        />
      </div>
    </div>
  ));
