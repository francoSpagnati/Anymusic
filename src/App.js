import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login/Login';
import Register from './Register/Register';
import Home from './Home/Home';
import Profile from './Profile/Profile';
import ProtectedRoute from './ProtectedRoute';
import Post from './Post/Post';
import OfflinePage from './OfflinePage'; // Importa il componente OfflinePage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />  {/* Pagina di login con pulsante per registrarsi */}
        <Route path="/register" element={<Register />} />  {/* Pagina di registrazione */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/post" element={<Post />} />  {/* Pagina di post */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<OfflinePage />} />
      </Routes>
    </Router>
  );
}

export default App;
