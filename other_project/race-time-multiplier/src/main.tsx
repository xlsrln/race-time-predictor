
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure the root element exists before rendering
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error('Failed to find the root element');
}
