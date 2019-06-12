describe('Transaction Delete Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('#transactions')
      .contains('Add Transaction')
      .click();

    cy.get('form')
      .contains('value')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}55');

    cy.get('form')
      .contains('description')
      .parent()
      .parent()
      .find('input')
      .type('test transaction');

    cy.get('form').submit();
  });

  it('deletes the recently added transaction', () => {
    cy.get('#transactions')
      .contains('test transaction')
      .parent()
      .within(() => {
        cy.contains('X').click();
      });

    cy.get('#transactions')
      .contains('test transaction')
      .should('not.exist');
  });
});
