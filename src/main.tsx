import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import type { MarketConfig, SimulationResults } from './types';


const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
