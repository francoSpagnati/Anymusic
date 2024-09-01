//import
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { FaUser, FaMusic } from 'react-icons/fa'; 
import { auth } from '../services/firebaseConfig';
import PostsList from '../PostList/PostList';
import { IoHomeSharp } from "react-icons/io5";
import './Home.css';

const Home = () => {
  //gestione dei percorsi
  const navigate = useNavigate();
  //gestione del logout utente
  const handleLogout = async () => {
    try {
      await signOut(auth); 
      console.log('User logged out successfully');
      navigate('/'); 
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };
  //routing
  const goToProfile = () => {
    navigate('/profile'); 
  };

  const goToPost = () => {
    navigate('/post'); 
  };
  const handleHome = ()=>{
    navigate('/home');
  }

  return (
    <div className="home-container">
      <header className="home-bar">
        <h1>AnyMusic</h1>
        <div className="nav-icons">
          <div className="left-buttons">
            <IoHomeSharp  className="icon" onClick={handleHome} title='Torna alla home'/>
            <FaUser className='icon' onClick={goToProfile} title='vai al profilo'/>
            <FaMusic className="icon" onClick={goToPost} title="Post" />
          </div>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <PostsList />
    </div>
  );
};

export default Home;