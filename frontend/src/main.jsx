import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { BlackHoleTransitionProvider } from './transitions/BlackHoleTransitionProvider.jsx'
import { PreferencesProvider } from './preferences/PreferencesProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreferencesProvider>
      <BrowserRouter>
        <BlackHoleTransitionProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BlackHoleTransitionProvider>
      </BrowserRouter>
    </PreferencesProvider>
  </StrictMode>,
)
