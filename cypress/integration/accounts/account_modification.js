describe('Account Modifications Tests', () => {
  beforeEach(() => {
    cy.wait(100);
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
      .type('{selectall}550');

    cy.get('form')
      .contains('name')
      .parent()
      .parent()
      .find('input')
      .type('test account');

    cy.get('form').submit();
    cy.get('#accounts')
      .contains('550.00')
      .parent()
      .contains('M')
      .click();
  });

  it('switches back to the form', () => {
    cy.contains('Add an Account');
  });

  it('submits modified account', () => {
    cy.get('form')
      .contains('starting')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}5996');

    cy.get('form').submit();
    cy.get('#accounts').contains('5996.00');
  });

  it('check debt is listed in debt tab after submit', () => {
    cy.get('form')
      .contains('starting')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}577');

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
    cy.get('#accounts').contains('test account');
  });
});
