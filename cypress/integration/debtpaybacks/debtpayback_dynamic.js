describe('Debt Payback Form Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
    cy.get('#accounts')
      .contains('Add Account')
      .click();

    cy.get('#accounts').within(() => {
      cy.findByLabelText('name').type('Test Debt Submission');
      cy.findByLabelText('vehicle').select('Loan');
      cy.findByLabelText('starting').type('{selectall}20000');
      cy.get('form').submit();

      cy.findByText('Debt').click();
    });
  });

  it('submits simple debt payback', () => {
    cy.findByText('+').click();

    cy.findByTestId('accounts-debt').within(() => {
      cy.findByLabelText('debt account').select('Test Debt Submission');
      cy.findByLabelText('payment account').select('account');
      cy.findByLabelText('rtype').select('Repeat on a Day of the Week');
      cy.findByLabelText('start').type('2019-04-28');
      cy.findByText('after Number of Occurrences').click();
      cy.findByLabelText('occurrences').type('{selectall}8');
      cy.findByLabelText('cycle').type('{selectall}1');
      cy.findByText('Dynamic').click();
      cy.findByLabelText('reference name').type('{selectall}Special Balance');
      cy.findByLabelText('reference value').type('{selectall}250');
      cy.findByLabelText('reference').select('Special Balance');
      cy.get('form').submit();

      cy.queryByText('0').should('be.visible');
    });
  });

  it('validates on non-entered references', () => {
    cy.findByTestId('accounts-debt').within(() => {
      cy.findByText('+').click();

      cy.findByLabelText('debt account').select('Test Debt Submission');
      cy.findByLabelText('payment account').select('account');
      cy.findByLabelText('rtype').select('Repeat on a Day of the Week');
      cy.findByLabelText('start').type('2019-04-28');
      cy.findByText('after Number of Occurrences').click();
      cy.findByLabelText('occurrences').type('{selectall}8');
      cy.findByLabelText('cycle').type('{selectall}1');
      cy.findByText('Dynamic').click();
      cy.findByLabelText('reference name').type('{selectall}Special Balance');
      cy.findByLabelText('reference value').type('{selectall}250');
      cy.get('form').submit();

      cy.findByText('reference')
        .parent()
        .should(refSection => {
          expect(refSection).to.contain('Required');
        });
    });
  });
});
