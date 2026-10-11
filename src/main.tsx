import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import { MathJaxContext } from 'better-react-mathjax';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <StrictMode>
    <MathJaxContext
      version={3} 
      config={{}} 
      hideUntilTypeset="first"
    >
      <App />
    </MathJaxContext>
  </StrictMode>
);
