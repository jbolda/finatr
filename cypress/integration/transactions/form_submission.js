describe('Transaction Form Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
    cy.get('#transactions')
      .contains('Add Transaction')
      .click();
  });

  it('tab switches to the form', () => {
    cy.get('#transactions').within(() => {
      cy.findByText('Add a Transaction').should('be.visible');
    });
  });

  it('submits simple transaction', () => {
    cy.get('#transactions').within(() => {
      cy.findByLabelText('value').type('55');
      cy.findByLabelText('rtype').select('No Repeating');
      cy.get('form').submit();

      cy.findByTestId('transactions-all-transactions').within(() =>
        cy.findByText('55.00').should('be.visible')
      );

      cy.findByTestId('transactions-income').within(() =>
        // all transactions should be visible, so just check existence
        cy.findByText('55.00').should('exist')
      );
    });
  });

  it('check income is listed in income tab after submit', () => {
    cy.get('#transactions').within(() => {
      cy.findByLabelText('rtype').select('No Repeating');
      cy.findByLabelText('value').type('55');
      cy.get('form').submit();

      cy.findByTestId('transactions-income').within(() =>
        // all transactions should be visible, so just check existence
        cy.findByText('55.00').should('exist')
      );
    });
  });

  it('check expense is listed in expense tab after submit', () => {
    cy.get('#transactions').within(() => {
      cy.findByLabelText('rtype').select('No Repeating');
      cy.findByLabelText('value').type('67');
      cy.findByLabelText('type').select('Expense');
      cy.get('form').submit();

      cy.findByTestId('transactions-expenses').within(() =>
        // all transactions should be visible, so just check existence
        cy.findByText('67.00').should('exist')
      );
    });
  });

  it('check transfer is listed in transfer tab after submit', () => {
    cy.get('#transactions').within(() => {
      cy.findByLabelText('rtype').select('No Repeating');
      cy.findByLabelText('value').type('53');
      cy.findByLabelText('type').select('Transfer');
      cy.get('form').submit();

      cy.findByTestId('transactions-transfers').within(() =>
        // all transactions should be visible, so just check existence
        cy.findByText('53.00').should('exist')
      );
    });
  });
});
