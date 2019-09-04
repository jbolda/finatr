import '@testing-library/cypress/add-commands';

describe('Account Modifications Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
    cy.get('#accounts')
      .contains('Add Account')
      .click();

    cy.get('#accounts').within(() => {
      cy.getByLabelText('starting').type('{selectall}550');

      cy.getByLabelText('name').type('test account');

      cy.get('form').submit();

      cy.getByTestId('accounts-all-accounts').within(() =>
        cy
          .getByText('550.00')
          .parent()
          .within(() => cy.getByText('M').click())
      );
    });
  });

  it('switches back to the form', () => {
    cy.get('#accounts').within(() => cy.queryByText('Add an Account'));
  });

  it('submits modified account', () => {
    cy.get('#accounts').within(() => {
      cy.getByLabelText('starting').type('{selectall}5996');

      cy.get('form').submit();

      cy.getByTestId('accounts-all-accounts').within(() =>
        cy.queryByText('5996.00').should('exist')
      );
    });
  });

  it('check debt is listed in debt tab after submit', () => {
    cy.get('#accounts').within(() => {
      cy.getByLabelText('starting').type('{selectall}577');

      cy.getByLabelText('vehicle').select('Loan');

      cy.get('form').submit();

      cy.getByText('Debt').click();
      cy.getByTestId('accounts-debt').within(() => {
        cy.queryByText('test account').should('be.visible');
        cy.queryByText('577.00').should('be.visible');
      });
    });
  });
});
