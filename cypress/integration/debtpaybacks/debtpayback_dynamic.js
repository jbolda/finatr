describe('Debt Payback Form Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
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
  });

  it('submits simple debt payback', () => {
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
      .select('Repeat on a Day of the Week');
    cy.get('form')
      .contains('start')
      .parent()
      .parent()
      .find('input')
      .type('2019-04-28');
    cy.get('form')
      .contains('occurrences')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}8');
    cy.get('form')
      .contains('cycle')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}1');

    cy.get('form')
      .contains('Dynamic')
      .find('input')
      .check();
    cy.get('form')
      .contains('reference name')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}Special Balance');
    cy.get('form')
      .contains('reference value')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}250');
    cy.get('form').submit();

    cy.get('#accounts').contains('1 for 0');
  });

  it('validates on non-entered references', () => {
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
      .select('Repeat on a Day of the Week');
    cy.get('form')
      .contains('start')
      .parent()
      .parent()
      .find('input')
      .type('2019-04-28');
    cy.get('form')
      .contains('occurrences')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}8');
    cy.get('form')
      .contains('cycle')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}1');

    cy.get('form')
      .contains('Dynamic')
      .find('input')
      .check();
    cy.get('form')
      .contains('reference name')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}Special Balance');
    cy.get('form')
      .contains('reference value')
      .parent()
      .parent()
      .find('input')
      .type('{selectall}250');
    cy.get('form').submit();

    cy.get('form')
      .contains('reference')
      .parent()
      .parent()
      .parent()
      .should(refSection => {
        expect(refSection).to.contain('Required');
      });
  });
});
