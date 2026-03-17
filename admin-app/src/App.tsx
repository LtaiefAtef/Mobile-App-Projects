import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'

function App() {

  return (
    <BrowserRouter>
      <Routes>
          <Route path='/login' element= {<Login/>}/>
          <Route path='/' element= {<h1>Dashboard</h1>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
