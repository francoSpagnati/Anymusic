import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { FaUser, FaMusic } from 'react-icons/fa'; 
import { auth } from '../services/firebaseConfig';
import PostsList from '../PostList/PostList'; // Importa il componente per i post
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      console.log('User logged out successfully');
      navigate('/'); 
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  const goToProfile = () => {
    navigate('/profile'); 
  };

  const goToPost = () => {
    navigate('/post'); 
  };

  return (
    <div className="home-container">
      <header className="home-bar">
        <h1>AnyMusic</h1>
        <div className="nav-icons">
          <div className="left-buttons">
            <FaMusic className="icon" onClick={goToPost} title="Post" />
            <FaUser className="icon" onClick={goToProfile} title="Profile" />
          </div>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <PostsList />
    </div>
  );
};

export default Home;