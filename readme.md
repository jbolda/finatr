# Reaccount
_helping you analyze your future cash flows_

## Usage
Most apps track your historical information and help you set up a budget. Argueably, budgets don't work for everyone. Even if you maintain a budget, it is still of great value to look to the future. The first version focuses on the near future checking that the inflows and outflows in your accounts are satisfactory. Essentially, will my accounts stay above zero with the planned expenditures. Tied into that, we need to understand a deal with variable debt payments (see credit cards) as future flows are more involved then a simple monthly payment you might see with a mortgage or a student loan payment. The next step from this is returning information regarding these flows such as a daily income and daily expenses. This type of information can be built upon going forward to forecast considerations like FI(RE).

## Help Out
The immediate plan is to get the site into a state that is usable for 90%+ of individuals. I suspect we are nearly there. The most important item is representing debt payback. Below is a list of known TODO items. Eventually these will be moved into issues/projects as the background information reaches a certain depth.

#### Items in Order of Priority
- [ ] convert resolve functions to take a date that tests are consistently repeatable
- [ ] increase test base especially to test number crunching functions (this makes adding big.js easier)
- [ ] incorporate big.js into arithmatic and number output
- [ ] clean up YNAB import
  - [ ] hide section, not everyone will use
  - [ ] transaction import should deal with positives/negatives better
  - [ ] transfers should import as two transactions
- [ ] add date picker to date fields
