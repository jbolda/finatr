describe('Transaction Delete Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
    cy.wait(100);
    cy.get('#accounts')
      .contains('Add Account')
      .click();

    cy.get('form')
      .contains('starting')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}55');

    cy.get('form')
      .contains('name')
      .parent()
      .parent()
      .find('input')
      .type('test account');

    cy.get('form').submit();
  });

  it('deletes the recently added account', () => {
    cy.get('#accounts')
      .contains('55.00')
      .parent()
      .within(() => {
        cy.contains('X').click();
      });

    cy.get('#accounts')
      .contains('test account')
      .should('not.exist');
  });
});
