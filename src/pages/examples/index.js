import React from 'react';
// import { Link } from '@reach/router';
import { State } from '../../state';

const Examples = () => (
  <State.Consumer>
    {model => (
      <React.Fragment>
        <section className="section">
          <div className="columns is-centered is-multiline">
            <div className="column is-one-quarter">
              <p className="content">Simple Example</p>
              <button
                className="button"
                onClick={event => loadExample(model, event)}
                value={'simple'}
              >
                Load Example
              </button>
            </div>
          </div>
        </section>
      </React.Fragment>
    )}
  </State.Consumer>
);

export default Examples;

const loadExample = async (model, event) => {
  const example = await import(`./${event.currentTarget.value}.json`);
  const result = example.default;
  console.log('example loaded', result);
  model.setUpload(result);
};
