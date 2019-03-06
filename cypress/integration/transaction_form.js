describe('Transaction Form Tests', function() {
  it('tab switches to the form', function() {
    cy.visit('/')
    cy.contains('Add Transaction').click()
    cy.get('form').contains('value').parent().parent().find('input').type('55')
    cy.get('form').submit()
  })
})
