import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import Routes from './routes';

import './app.scss';

const App = () => {
  return (
    <BrowserRouter>
      <div className="container">
        <Routes />
      </div>
    </BrowserRouter>
  );
};

export default App;
