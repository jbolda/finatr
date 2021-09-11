describe('Debt Payback Form Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
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

      cy.findByText('55')
        .parent()
        .parent()
        .within(() => cy.findByText('M').click());
    });
  });

  it('modify fills in form', () => {
    cy.findByTestId('accounts-debt').within(() => {
      cy.findByLabelText('start').should('have.value', '2019-05-28');
    });
  });
});
