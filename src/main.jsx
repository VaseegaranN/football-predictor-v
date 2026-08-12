import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './components/ThemeProvider.jsx'
import { PredictionsProvider } from './hooks/PredictionsProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark">
      <PredictionsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PredictionsProvider>
    </ThemeProvider>
  </StrictMode>,
)
