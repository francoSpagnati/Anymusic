//Import
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login/Login';
import Register from './Register/Register';
import Home from './Home/Home';
import Profile from './Profile/Profile';
import ProtectedRoute from './ProtectedRoute';
import Post from './Post/Post';
import UserProfile from './UserProfile/UserProfile'; 
import OfflinePage from './OfflinePage'; 

const App = () => {
  //stato per controllo online/offline
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    //per controllare stato della rete
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

        {/*rotte pubbliche  */}
        <Route path="/" element={isOnline ? <Login /> : <OfflinePage />} />
        <Route path="/register" element={isOnline ? <Register /> : <OfflinePage />} />
        
        {/* rotte protette */}
        <Route 
          path="/home" 
          element={isOnline ? (<ProtectedRoute><Home /></ProtectedRoute>) : (<OfflinePage />)} 
        />
        <Route 
          path="/profile" 
          element={isOnline ? (<ProtectedRoute><Profile /></ProtectedRoute>) : (<OfflinePage />)} 
        />
        <Route 
          path="/post" 
          element={isOnline ? (<ProtectedRoute><Post /></ProtectedRoute>) : (<OfflinePage />)} 
        />
        <Route 
          path="/profile/:userId" 
          element={isOnline ? (<ProtectedRoute><UserProfile /></ProtectedRoute>) : (<OfflinePage />)} 
        />
        {/* rotta per pagine inesistenti*/}
        <Route path="*" element={ isOnline ? <OfflinePage /> : <OfflinePage /> } />
      </Routes>
    </Router>
  );
};

export default App;
