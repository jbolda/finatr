describe('Transaction Delete Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
    cy.get('#transactions')
      .contains('Add Transaction')
      .click();

    cy.get('#transactions').within(() => {
      cy.getByLabelText('rtype').select('No Repeating');
      cy.getByLabelText('value').type('{selectall}55');
      cy.getByLabelText('description').type('test transaction');
      cy.get('form').submit();
    });
  });

  it('deletes the recently added transaction', () => {
    cy.get('#transactions')
      .contains('test transaction')
      .parent()
      .within(() => {
        cy.contains('X').click();
      });

    cy.getByTestId('transactions-all-transactions')
      .contains('test transaction')
      .should('not.exist');
  });
});
