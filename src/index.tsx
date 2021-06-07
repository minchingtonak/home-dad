import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './style.css';
import './daypicker.css';
import { unregister } from './serviceWorkerRegistration';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

unregister();
