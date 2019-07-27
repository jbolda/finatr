describe('Account Form Tests', () => {
  beforeEach(() => {
    cy.wait(100);
    cy.visit('/flow');
    cy.wait(100);
    cy.get('#accounts')
      .contains('Add Account')
      .click();
  });

  it('tab switches to the form', () => {
    cy.contains('Add an Account');
  });

  it('submits simple account', () => {
    cy.get('form')
      .contains('name')
      .parent()
      .parent()
      .find('input')
      .type('Test Account Submission');

    cy.get('form').submit();
    cy.get('#accounts').contains('Test Account Submission');
  });

  it('check debt is listed in debt tab after submit', () => {
    cy.get('form')
      .contains('name')
      .parent()
      .parent()
      .find('input')
      .type('Test Debt Account');

    cy.get('form')
      .contains('vehicle')
      .parent()
      .parent()
      .find('select')
      .select('Loan');

    cy.get('form').submit();
    cy.get('#accounts')
      .contains('Debt')
      .click();
    cy.get('#accounts').contains('Test Debt Account');
  });
});
