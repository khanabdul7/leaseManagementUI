import { useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Customers from './pages/Customers'
import Items from './pages/Items'
import Leases from './pages/Leases'
import { Navigate } from 'react-router-dom'

function App() {

  return (
    <>
      <AppLayout />
      <Routes>
        <Route path="/" element={<Navigate to="/customers" />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/items" element={<Items />} />
        <Route path="/leases" element={<Leases />} />
      </Routes> 
    </>
  )
}

export default App
