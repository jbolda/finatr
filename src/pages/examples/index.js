import React from 'react';
import { useNavigate } from 'react-router-dom';
import { State } from '../../state';

import example_simple from 'url:./simple.json';
import example_highRents from 'url:./high_rents.json';

const listOfExamples = [
  {
    name: 'Simple Example',
    content: `
    This is a real simple example where you get paid every two weeks.
    Your only expense is paying rent once a month. Wouldn't that be nice!
    `,
    file: example_simple
  },
  {
    name: 'High Housing Expenses',
    content: `
    This example shows what living in San Francisco, Silicon Valley,
    or Washington DC may look like. You get paid well relative to the
    rest of the country, but most of that goes to living expenses.
    You only have one source of income, but a decent salary nonetheless.
    You carry a credit card, and pay your other expenses with that.
    `,
    file: example_highRents
  }
];

const Examples = () => (
  <State.Consumer>
    {(model) => (
      <div className="bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
        <div className="relative max-w-lg mx-auto divide-y-2 divide-gray-200 lg:max-w-7xl">
          <ExampleHeading />
          <ExampleList listOfExamples={listOfExamples} model={model} />
        </div>
      </div>
    )}
  </State.Consumer>
);

export default Examples;

const ExampleHeading = () => (
  <div>
    <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
      Examples
    </h2>
    <div className="mt-3 sm:mt-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:items-center">
      <p className="text-xl text-gray-500">
        The following are various examples that you can test out. They are even
        valuable as a template to get you jump-started. Find one that seems to
        match your current situation? Give it a shot and see what it looks like.
        You can always come back here and try another.
      </p>
    </div>
  </div>
);

const ExampleList = ({ model, listOfExamples }) => {
  const navigate = useNavigate();

  const loadExample = async (model, event) => {
    const result = await fetch(event.currentTarget.value);
    const json = await result.json();
    console.log('example loaded', json);
    model.setUpload(json);
    navigate(`/flow`);
  };

  return (
    <div className="mt-6 pt-10 grid gap-16 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-12">
      {listOfExamples.map((example) => (
        <div key={example.file}>
          <button
            className="mt-2 block text-left"
            onClick={(event) => loadExample(model, event)}
            value={example.file}
          >
            <div>
              <p className="text-xl font-semibold text-gray-900">
                {example.name}
              </p>
              <p className="mt-3 text-base text-gray-500">{example.content}</p>
            </div>
          </button>
          <div className="mt-3">
            <button
              className="text-base font-semibold text-indigo-600 hover:text-indigo-500"
              onClick={(event) => loadExample(model, event)}
              value={example.file}
            >
              {`Load Example ->`}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
