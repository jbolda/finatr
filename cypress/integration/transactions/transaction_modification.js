describe('Transaction Modifications Tests', () => {
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
    cy.get('#transactions')
      .contains('55.00')
      .parent()
      .contains('M')
      .click();
  });

  it('switches back to the form', () => {
    cy.contains('Add a Transaction');
  });

  it('submits modified transaction', () => {
    cy.get('form')
      .contains('value')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}59');

    cy.get('form').submit();
    cy.get('#transactions').contains('59.00');
  });

  it('check income is listed in income tab after submit', () => {
    cy.get('form')
      .contains('value')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}57');

    cy.get('form').submit();
    cy.get('#transactions')
      .contains('Income')
      .click();
    cy.get('#transactions').contains('57.00');
  });
});
