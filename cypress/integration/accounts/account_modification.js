describe('Account Modifications Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
    cy.get('#accounts').contains('Add Account').click();

    cy.get('#accounts').within(() => {
      cy.findByLabelText('starting').type('{selectall}550');
      cy.findByLabelText('name').type('test account');
      cy.get('form').submit();

      cy.findByTestId('accounts-all-accounts').within(() =>
        cy
          .findByText('550.00')
          .parent()
          .parent()
          .within(() => cy.findByText('M').click())
      );
    });
  });

  it('switches back to the form', () => {
    cy.get('#accounts').within(() => cy.findByText('Add an Account'));
  });

  it('submits modified account', () => {
    cy.get('#accounts').within(() => {
      cy.findByLabelText('starting').type('{selectall}5996');
      cy.get('form').submit();

      cy.findByTestId('accounts-all-accounts').within(() =>
        cy.findByText('5996.00').should('exist')
      );
    });
  });

  it('check debt is listed in debt tab after submit', () => {
    cy.get('#accounts').within(() => {
      cy.findByLabelText('starting').type('{selectall}577');
      cy.findByLabelText('vehicle').select('Loan');
      cy.get('form').submit();

      cy.findByText('Debt').click();
      cy.findByTestId('accounts-debt').within(() => {
        cy.findByText('test account').should('be.visible');
        cy.findByText('577.00').should('be.visible');
      });
    });
  });
});
