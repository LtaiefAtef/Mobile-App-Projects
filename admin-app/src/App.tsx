import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/SideBar'
import Contract from './pages/Contract'
import Clients from './pages/Clients'
import Claims from './pages/Claim'

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex'}}>
        <Sidebar />
        <main style={{ flex: 1, minHeight: '100vh' }}>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path='/contracts' element={<ProtectedRoute><Contract /></ProtectedRoute>} />
            <Route path='/clients' element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path='/claims' element={<ProtectedRoute><Claims /></ProtectedRoute>} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App