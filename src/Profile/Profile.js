//import
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebaseConfig';
import { ref, onValue, query, orderByChild, equalTo, remove} from 'firebase/database';
import { signOut } from 'firebase/auth';
//icone
import {  AiFillDelete } from 'react-icons/ai'; 
import { IoHomeSharp } from "react-icons/io5";
import {FaUser,FaMusic} from 'react-icons/fa'; 

import './Profile.css';

const Profile = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const audioRefs = useRef({});
  const [userName, setUserName] = useState('');

  //caricamento dati utente
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      const user = auth.currentUser;
  
      if (!user) {
        setError('User non autenticato');
        setLoading(false);
        return;
      }
      try {
        // recupero i post utente
        const postsRef = query(
          ref(db, 'posts'),
          orderByChild('userId'),
          equalTo(user.uid)
        );

        onValue(postsRef, (snapshot) => {
          const data = snapshot.val();

          if (data) {
            const userPosts = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            setPosts(userPosts);
            // prendo il primo nome utente
            setUserName(userPosts[0]?.userName || 'User');
          } else {
            setPosts([]);
          }
          setLoading(false);
        });

      } catch (error) {

        setError('errore caricamento post: ' + error.message);
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);
  

  //gestire cancellazione del post
  const handleDelete = async (postId) => {
    try {
      await remove(ref(db, 'posts/' + postId));
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Errore cancellazione post ', error);
    }
  };

  const handlePlay = (index) => {
    Object.values(audioRefs.current).forEach((audio, i) => {
      if (i !== index && audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    if (audioRefs.current[index]) {
      audioRefs.current[index].play().catch(error => {
        console.error('Errore riproduzione audio', error);
      });
    }
  };


  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  };

//navigazione
  const goToPost = () => {
    navigate('/post'); 
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      console.log('User logout con successo');
      navigate('/'); 
    } catch (error) {
      console.error('Errore di logout:', error.message);
    }
  };

  const handleHome = ()=>{
    navigate('/home');
  };

  const goToProfile = () => {
    navigate('/profile'); 
  };

  return (
    <div className="profile-container">
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
      <div className="welcome-message">
        <h2>Benvenuto, {userName}!</h2>
      </div>
      <div className="posts-list">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div key={post.id} className="profile-post-item">
              <div className="post-header">
                <div className="user-name">{post.userName}</div>
                <AiFillDelete className="delete-icon" onClick={() => handleDelete(post.id)} size={24} title="Delete Post" />
              </div>
              <div className="track-name">{post.trackName}</div>
              <img src={post.imageUrl} alt="Post" className="profile-post-image" />
              <audio
                controls
                className="profile-post-audio"
                ref={(el) => (audioRefs.current[index] = el)}
                onPlay={() => handlePlay(index)}
                onError={(event) => console.error('Error playing audio:', event.target.error)}>
                <source src={post.trackUrl} type="audio/mp3" />
                Il tuo browser non supporta questo formato audio
              </audio>
            </div>
          ))
        ) : (<p> <center>Non hai ancora postato</center></p>)}
      </div>
    </div>
  );  
};

export default Profile;