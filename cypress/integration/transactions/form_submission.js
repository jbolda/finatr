describe('Transaction Form Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
    cy.get('#transactions')
      .contains('Add Transaction')
      .click();
  });

  it('tab switches to the form', () => {
    cy.get('#transactions').within(() => {
      cy.getByText('Add a Transaction').should('exist');
    });
  });

  it('submits simple transaction', () => {
    cy.get('#transactions').within(() => {
      cy.getByLabelText('value').type('55');

      cy.getByLabelText('rtype').select('No Repeating');

      cy.get('form').submit();

      cy.getByTestId('transactions-all-transactions').within(() =>
        cy.queryByText('55.00').should('exist')
      );

      cy.getByTestId('transactions-income').within(() =>
        cy.queryByText('55.00').should('exist')
      );
    });
  });

  it('check income is listed in income tab after submit', () => {
    cy.get('#transactions').within(() => {
      cy.getByLabelText('rtype').select('No Repeating');

      cy.getByLabelText('value').type('55');

      cy.get('form').submit();

      cy.getByTestId('transactions-income').within(() =>
        cy.queryByText('55.00').should('exist')
      );
    });
  });

  it('check expense is listed in expense tab after submit', () => {
    cy.get('#transactions').within(() => {
      cy.getByLabelText('rtype').select('No Repeating');

      cy.getByLabelText('value').type('67');

      cy.getByLabelText('type').select('Expense');

      cy.get('form').submit();

      cy.getByTestId('transactions-expenses').within(() =>
        cy.queryByText('67.00').should('exist')
      );
    });
  });

  it('check transfer is listed in transfer tab after submit', () => {
    cy.get('#transactions').within(() => {
      cy.getByLabelText('rtype').select('No Repeating');

      cy.getByLabelText('value').type('53');

      cy.getByLabelText('type').select('Transfer');

      cy.get('form').submit();

      cy.getByTestId('transactions-transfers').within(() =>
        cy.queryByText('53.00').should('exist')
      );
    });
  });
});
