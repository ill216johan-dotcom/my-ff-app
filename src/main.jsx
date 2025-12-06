import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'dark';
const html = document.documentElement;
if (savedTheme === 'dark') {
  html.classList.add('dark');
} else {
  html.classList.remove('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
