describe('Debt Payback Form Tests', () => {
  beforeEach(() => {
    cy.visit('/planning');
    cy.get('#accounts').contains('Add Account').click();

    cy.get('#accounts').within(() => {
      cy.findByLabelText('name').type('Test Debt Submission');
      cy.findByLabelText('vehicle').select('Loan');
      cy.findByLabelText('starting').type('{selectall}20000');
      cy.get('form').submit();

      cy.findByText('Debt').click();
      cy.findByText('+').click();

      cy.findByLabelText('debt account').select('Test Debt Submission');
      cy.findByLabelText('payment account').select('account');
      cy.findByLabelText('repeat type').select('No Repeating');
      cy.findByLabelText('value').type('55');
      cy.findByLabelText('start').type('2019-05-28');
      cy.findByText('after Number of Occurrences').click({ force: true });
      cy.findByLabelText('occurrences').type('8');
      cy.findByLabelText('cycle').type('1');
      cy.findByTestId('accounts-debt').within(() => cy.get('form').submit());
    });
  });

  it('deletes the recently added debt payback', () => {
    cy.findByTestId('accounts-debt').within(() => {
      cy.findByText('2019-05-28')
        .parent()
        .parent()
        .within(() => cy.findByText('X').click());

      cy.findByText('2019-05-28').should('not.exist');
    });
  });
});
