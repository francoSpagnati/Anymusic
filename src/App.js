import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login/Login';
import Register from './Register/Register';
import Home from './Home/Home';
import Profile from './Profile/Profile';
import ProtectedRoute from './ProtectedRoute';
import Post from './Post/Post';
import OfflinePage from './OfflinePage'; // Importa il componente OfflinePage

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    //pulizia
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={isOnline ? <Login /> : <OfflinePage />} />
        <Route path="/register" element={isOnline ? <Register /> : <OfflinePage />} />
        <Route path="/profile" element={isOnline ? <Profile /> : <OfflinePage />} />
        <Route path="/post" element={isOnline ? <Post /> : <OfflinePage />} />
        <Route
          path="/home"
          element={
            isOnline ? (
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            ) : (
              <OfflinePage />
            )
          }
        />
        <Route path="*" element={isOnline ? <OfflinePage /> : <OfflinePage />} />
      </Routes>
    </Router>
  );
};

export default App;
