import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const isStandalonePwa =
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone);

if (isStandalonePwa) {
  document.documentElement.classList.add('pwa-standalone');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
