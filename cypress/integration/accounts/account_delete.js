describe('Transaction Delete Tests', () => {
  beforeEach(() => {
    cy.visit('/flow');
    cy.get('#accounts')
      .contains('Add Account')
      .click();

    cy.get('#accounts').within(() => {
      cy.findByLabelText('starting').type('{selectall}55');
      cy.findByLabelText('name').type('test account');
      cy.get('form').submit();
    });
  });

  it('deletes the recently added account', () => {
    cy.get('#accounts').within(() => {
      cy.findByText('55.00')
        .parent()
        .within(() => {
          cy.queryByText('X').click();
        });

      cy.queryByText('test account').should('not.exist');
    });
  });
});
