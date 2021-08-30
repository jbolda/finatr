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
    });
  });

  it('tab switches to the form', () => {
    cy.get('#accounts').within(() => {
      cy.findByText('+').click();
      cy.findByText('Add Debt Payback').should('be.visible');
    });
  });

  it('submits simple debt payback', () => {
    cy.findByTestId('accounts-debt').within(() => {
      cy.findByText('+').click();

      cy.findByLabelText('debt account').select('Test Debt Submission');
      cy.findByLabelText('payment account').select('account');
      cy.findByLabelText('repeat type').select('Repeat on a Day of the Week');
      cy.findByLabelText('value').type('{selectall}250');
      cy.findByLabelText('start').type('2019-04-28');
      cy.findByText('after Number of Occurrences').click({ force: true });
      cy.findByLabelText('occurrences').type('{selectall}8');
      cy.findByLabelText('cycle').type('{selectall}1');
      cy.get('form').submit();

      cy.findByText('250').should('be.visible');
    });
  });
});
