import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

console.log('=== Starting React App ===')

// Prevent browser extensions from interfering with SVG icons
document.documentElement.setAttribute('data-nogtm', 'true')
document.documentElement.setAttribute('translate', 'no')

// Global error handler
window.onerror = function(msg, url, line, col, error) {
  console.error('Global error:', msg, 'at', url, 'line', line)
  document.body.innerHTML = `
    <div style="padding: 30px; font-family: sans-serif;">
      <h1 style="color: red;">JavaScript Error</h1>
      <p><strong>Message:</strong> ${msg}</p>
      <p><strong>Location:</strong> ${url}:${line}:${col}</p>
      <pre style="background: #f5f5f5; padding: 15px; overflow: auto; max-width: 100%;">${error?.stack || 'No stack trace'}</pre>
    </div>
  `
  return false
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

try {
  const rootElement = document.getElementById('root')
  console.log('Root element:', rootElement)
  
  if (!rootElement) {
    throw new Error('Root element not found!')
  }
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <App />
          <Toaster position="bottom-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  )
  console.log('=== React Render Complete ===')
} catch (error) {
  console.error('=== RENDER ERROR ===', error)
  document.body.innerHTML = `
    <div style="padding: 30px; font-family: sans-serif;">
      <h1 style="color: red;">React Render Error</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <pre style="background: #f5f5f5; padding: 15px; overflow: auto;">${error.stack}</pre>
    </div>
  `
}
