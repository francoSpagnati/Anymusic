import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebaseConfig';
import { ref, onValue, query, orderByChild, equalTo, remove } from 'firebase/database';
import { signOut } from 'firebase/auth';
import {  AiFillDelete } from 'react-icons/ai'; // Importa le icone
import {FaMusic} from 'react-icons/fa'; 

import './Profile.css';

const Profile = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const audioRefs = useRef({});

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        setError('User is not authenticated');
        setLoading(false);
        return;
      }

      try {
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
          } else {
            setPosts([]);
          }
          setLoading(false);
        });
      } catch (error) {
        setError('Error fetching posts: ' + error.message);
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  const handleDelete = async (postId) => {
    try {
      await remove(ref(db, 'posts/' + postId));
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post: ', error);
    }
  };

  const handlePlay = (index) => {
    // Pausa tutte le altre tracce
    Object.values(audioRefs.current).forEach((audio, i) => {
      if (i !== index && audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    // Riproduce la traccia selezionata
    if (audioRefs.current[index]) {
      audioRefs.current[index].play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }
  const goToPost = () => {
    navigate('/post'); 
  };
  const handleLogout = async () => {
    try {
      await signOut(auth); 
      console.log('User logged out successfully');
      navigate('/'); 
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };
  const handleHome = ()=>{
    navigate('/home');
  }

  return (
    <div className="profile-container">
      <header className="home-bar">
        <h1>AnyMusic</h1>
        <div className="nav-icons">
        <button className="back-button" onClick={handleHome}>Torna alla home</button>
          <div className="left-buttons">
            <FaMusic className="icon" onClick={goToPost} title="Post" />
          </div>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <div className="posts-list">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div key={post.id} className="profile-post-item">
              <div className="post-header">
                <div className="user-name">{post.userName}</div>
                <AiFillDelete 
                  className="delete-icon" 
                  onClick={() => handleDelete(post.id)} 
                  size={24} 
                  title="Delete Post" 
                />
              </div>
              <div className="track-name">{post.trackName}</div>
              <img src={post.imageUrl} alt="Post" className="profile-post-image" />
              <audio
                controls
                className="profile-post-audio"
                ref={(el) => (audioRefs.current[index] = el)}
                onPlay={() => handlePlay(index)}
                onError={(event) => console.error('Error playing audio:', event.target.error)}
              >
                <source src={post.trackUrl} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ))
        ) : (
          <p>No posts yet</p>
        )}
      </div>
    </div>
  );
};

export default Profile;