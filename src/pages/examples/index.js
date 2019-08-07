import React from 'react';
import { navigate } from '@reach/router';
import { State } from '../../state';

const listOfExamples = [
  {
    name: 'Simple Example',
    content: `
    This is a real simple example where you get paid every two weeks.
    Your only expense is paying rent once a month. Wouldn't that be nice!
    `,
    file: 'simple.json'
  },
  {
    name: 'Incredibly Expensive Rents',
    content: `
    This example shows what living in San Francisco, Silicon Valley,
    or Washington DC may look like. You get paid well relative to the
    rest of the country, but most of that goes to living expenses.
    You only have one source of income, but a decent salary nonetheless.
    You carry a credit card, and pay your other expenses with that.
    `,
    file: 'crazy rents.json'
  }
];

const Examples = () => (
  <State.Consumer>
    {model => (
      <React.Fragment>
        <section className="section">
          <div className="columns is-centered">
            <div className="column is-half">
              <p className="title">Examples</p>
              <div className="content">
                The following are various examples that you can test out. They
                are even valuable as a template to get you jump-started. Find
                one that seems to match your current situation? Give it a shot
                and see what it looks like. You can always come back here and
                try another.
              </div>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="columns is-centered is-multiline">
            {listOfExamples.map(example => (
              <div className="column is-one-quarter" key={example.file}>
                <div className="card">
                  <header className="card-header">
                    <p className="card-header-title">{example.name}</p>
                  </header>
                  <div className="card-content">
                    <div className="content">{example.content}</div>
                  </div>
                  <footer className="card-footer">
                    <div className="buttons card-footer-item">
                      <button
                        className="button is-fullwidth is-white"
                        onClick={event => loadExample(model, event)}
                        value={example.file}
                      >
                        Load Example
                      </button>
                    </div>
                  </footer>
                </div>
              </div>
            ))}
          </div>
        </section>
      </React.Fragment>
    )}
  </State.Consumer>
);

export default Examples;

const loadExample = async (model, event) => {
  const example = await import(`./${event.currentTarget.value}`);
  const result = example.default;
  console.log('example loaded', result);
  model.setUpload(result);
  navigate(`/flow`);
};
