describe('Account Form Tests', () => {
  beforeEach(() => {
    cy.visit('/planning');
    cy.get('#accounts').contains('Add Account').click();
  });

  it('tab switches to the form', () => {
    cy.get('#accounts').within(() => {
      cy.findByText('Add an Account').should('exist');
    });
  });

  it('submits simple account', () => {
    cy.get('#accounts').within(() => {
      cy.findByLabelText('name').type('Test Account Submission');
      cy.get('form').submit();

      cy.findByTestId('accounts-all-accounts').within(() =>
        cy.findByText('Test Account Submission').should('exist')
      );
    });
  });

  it('check debt is listed in debt tab after submit', () => {
    cy.get('#accounts').within(() => {
      cy.findByLabelText('name').type('Test Debt Account');
      cy.findByLabelText('vehicle').select('Loan');
      cy.get('form').submit();

      cy.findByTestId('accounts-debt').within(() =>
        cy.findByText('Test Debt Account').should('exist')
      );
    });
  });
});
