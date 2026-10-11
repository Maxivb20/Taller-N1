import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ClubProvider } from './context/ClubContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './styles/styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ClubProvider>
          <App />
        </ClubProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
