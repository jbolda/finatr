import React from 'react';
import { navigate } from '@reach/router';
import { State } from '../../state';

const listOfExamples = [
  { name: 'Simple Example', content: 'Lorem ipsum', file: 'simple.json' },
  {
    name: 'DC and SF Expensive',
    content: 'Lorem ipsum',
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
              <div className="column is-one-quarter">
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
