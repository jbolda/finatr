import React from 'react';
import { render } from 'react-dom';
import Financial from './financial';

const styles = {
  fontFamily: 'sans-serif',
  textAlign: 'center'
};

const App = () => <Financial />;

render(<App />, document.getElementById('root'));
