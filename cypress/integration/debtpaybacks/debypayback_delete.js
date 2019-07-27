describe('Debt Payback Form Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
    cy.wait(100);
    cy.get('#accounts')
      .contains('Add Account')
      .click();
    cy.get('form')
      .contains('name')
      .parent()
      .parent()
      .find('input')
      .type('Test Debt Submission');
    cy.get('form')
      .contains('vehicle')
      .parent()
      .parent()
      .find('select')
      .select('Loan');
    cy.get('form')
      .contains('starting')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}20000');
    cy.get('form').submit();

    cy.get('#accounts')
      .contains('Debt')
      .click();

    cy.get('#accounts')
      .contains('+')
      .click();

    cy.get('form')
      .contains('debt account')
      .parent()
      .parent()
      .find('select')
      .select('Test Debt Submission');
    cy.get('form')
      .contains('payment account')
      .parent()
      .parent()
      .find('select')
      .select('account');
    cy.get('form')
      .contains('rtype')
      .parent()
      .parent()
      .find('select')
      .select('No Repeating');
    cy.get('form')
      .contains('value')
      .parent()
      .parent()
      .find('input')
      .type('55');
    cy.get('form')
      .contains('start')
      .parent()
      .parent()
      .find('input')
      .type('2019-05-28');
    cy.get('form')
      .contains('occurrences')
      .parent()
      .parent()
      .find('input')
      .type('8');
    cy.get('form')
      .contains('cycle')
      .parent()
      .parent()
      .find('input')
      .type('1');
    cy.get('form').submit();
  });

  it('deletes the recently added debt payback', () => {
    cy.get('#accounts')
      .contains('2019-05-28')
      .parent()
      .parent()
      .parent()
      .within(() => {
        cy.contains('X').click();
      });

    cy.get('#accounts')
      .contains('2019-05-28')
      .should('not.exist');
  });
});
