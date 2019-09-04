import '@testing-library/cypress/add-commands';

describe('Debt Payback Form Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
    cy.get('#accounts')
      .contains('Add Account')
      .click();

    cy.get('#accounts').within(() => {
      cy.getByLabelText('name').type('Test Debt Submission');

      cy.getByLabelText('vehicle').select('Loan');

      cy.getByLabelText('starting').type('{selectall}20000');

      cy.get('form').submit();

      cy.getByText('Debt').click();
    });
  });

  it('tab switches to the form', () => {
    cy.get('#accounts').within(() => {
      cy.getByText('+').click();
      cy.queryByText('Add Debt Payback').should('be.visible');
    });
  });

  it('submits simple debt payback', () => {
    cy.getByTestId('accounts-debt').within(() => {
      cy.getByText('+').click();

      cy.getByLabelText('debt account').select('Test Debt Submission');

      cy.getByLabelText('payment account').select('account');

      cy.getByLabelText('rtype').select('Repeat on a Day of the Week');

      cy.getByLabelText('value').type('{selectall}250');

      cy.getByLabelText('start').type('2019-04-28');

      cy.getByText('after Number of Occurrences').click();

      cy.getByLabelText('occurrences').type('{selectall}8');

      cy.getByLabelText('cycle').type('{selectall}1');

      cy.get('form').submit();

      cy.queryByText('250').should('be.visible');
    });
  });
});
