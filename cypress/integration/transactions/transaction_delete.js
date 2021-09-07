describe('Transaction Delete Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
    cy.get('#transactions').contains('Add Transaction').click();

    cy.get('#transactions').within(() => {
      cy.findByLabelText('repeat type').select('No Repeating');
      cy.findByLabelText('value').type('{selectall}55');
      cy.findByLabelText('description').type('test transaction');
      cy.get('form').submit();
    });
  });

  it('deletes the recently added transaction', () => {
    cy.get('#transactions')
      .contains('test transaction')
      .parent()
      .parent()
      .within(() => {
        cy.contains('X').click();
      });

    cy.findByTestId('transactions-all-transactions')
      .contains('test transaction')
      .should('not.exist');
  });
});
