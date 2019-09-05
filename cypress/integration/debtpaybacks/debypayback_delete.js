describe('Debt Payback Form Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
    cy.get('#accounts')
      .contains('Add Account')
      .click();

    cy.get('#accounts').within(() => {
      cy.getByLabelText('name').type('Test Debt Submission');
      cy.getByLabelText('vehicle').select('Loan');
      cy.getByLabelText('starting').type('{selectall}20000');
      cy.get('form').submit();

      cy.getByText('Debt').click();
      cy.getByText('+').click();

      cy.getByLabelText('debt account').select('Test Debt Submission');
      cy.getByLabelText('payment account').select('account');
      cy.getByLabelText('rtype').select('No Repeating');
      cy.getByLabelText('value').type('55');
      cy.getByLabelText('start').type('2019-05-28');
      cy.getByText('after Number of Occurrences').click();
      cy.getByLabelText('occurrences').type('8');
      cy.getByLabelText('cycle').type('1');
      cy.getByTestId('accounts-debt').within(() => cy.get('form').submit());
    });
  });

  it('deletes the recently added debt payback', () => {
    cy.getByTestId('accounts-debt').within(() => {
      cy.getByText('2019-05-28')
        .parent()
        .within(() => cy.getByText('X').click());

      cy.queryByText('2019-05-28').should('not.exist');
    });
  });
});
