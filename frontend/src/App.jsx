import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';


export const serverUrl = 'http://localhost:5000/api';
const App = () => {
  return (
   <Routes>
      <Route path='/' element={<Dashboard/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<Signup/>}/>
   </Routes>
  )
}

export default App
