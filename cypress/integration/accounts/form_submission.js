describe('Account Form Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
    cy.get('#accounts')
      .contains('Add Account')
      .click();
  });

  it('tab switches to the form', () => {
    cy.get('#accounts').within(() => {
      cy.getByText('Add an Account').should('exist');
    });
  });

  it('submits simple account', () => {
    cy.get('#accounts').within(() => {
      cy.getByLabelText('name').type('Test Account Submission');

      cy.get('form').submit();

      cy.getByTestId('accounts-all-accounts').within(() =>
        cy.queryByText('Test Account Submission').should('exist')
      );
    });
  });

  it('check debt is listed in debt tab after submit', () => {
    cy.get('#accounts').within(() => {
      cy.getByLabelText('name').type('Test Debt Account');

      cy.getByLabelText('vehicle').select('Loan');

      cy.get('form').submit();

      cy.getByTestId('accounts-debt').within(() =>
        cy.queryByText('Test Debt Account').should('exist')
      );
    });
  });
});
