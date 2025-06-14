import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Layout from './Layout'
import { routeArray } from './config/routes'

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/garden" replace />} />
          <Route path="/" element={<Layout />}>
            {routeArray.map(route => (
              <Route
                key={route.id}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Route>
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="z-[9999]"
          toastClassName="bg-surface border border-sage-200 text-moss-800 shadow-lg"
          progressClassName="bg-accent"
        />
      </div>
    </BrowserRouter>
  )
}

export default App