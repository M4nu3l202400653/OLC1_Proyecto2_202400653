import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.v2.css'
import App from './App.v2.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
