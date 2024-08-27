import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { ref, onValue, query, orderByChild, equalTo, update, get } from 'firebase/database';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaMusic } from 'react-icons/fa';
import { IoHomeSharp } from "react-icons/io5";
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [commentTexts, setCommentTexts] = useState({});
  const [commentAuthors, setCommentAuthors] = useState({});
  const audioRefs = useRef({});
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = ref(db, `users/${userId}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        setUserData(data);
      });
    };

    const fetchUserPosts = async () => {
      const postsRef = query(ref(db, 'posts'), orderByChild('userId'), equalTo(userId));
      onValue(postsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const postsData = Object.keys(data)
            .map(key => ({ id: key, ...data[key] }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setUserPosts(postsData);

          // Fetch authors of comments
          postsData.forEach(post => {
            if (post.comments) {
              Object.values(post.comments).forEach(comment => {
                fetchUserName(comment.userId);
              });
            }
          });
        } else {
          setUserPosts([]);
        }
      });
    };

    const fetchUserName = async (userId) => {
      if (commentAuthors[userId]) return; // Evita di fare fetch se già esiste

      const userRef = ref(db, `users/${userId}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          setCommentAuthors(prevState => ({
            ...prevState,
            [userId]: snapshot.val().name || 'Utente sconosciuto'
          }));
        } else {
          setCommentAuthors(prevState => ({
            ...prevState,
            [userId]: 'Utente sconosciuto'
          }));
        }
      });
    };

    fetchUserData();
    fetchUserPosts();
  }, [userId, commentAuthors]);

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

  const handleLike = async (postId, currentLikes, likedUsers = []) => {
    if (!currentUser) return;

    const userId = currentUser.uid;
    const hasLiked = likedUsers.includes(userId);

    try {
      const postRef = ref(db, `posts/${postId}`);

      if (hasLiked) {
        const updatedLikedUsers = likedUsers.filter(id => id !== userId);
        await update(postRef, {
          likes: Math.max(currentLikes - 1, 0),
          likedUsers: updatedLikedUsers,
        });
      } else {
        await update(postRef, {
          likes: currentLikes + 1,
          likedUsers: [...likedUsers, userId],
        });
      }
    } catch (error) {
      console.error('Errore aggiornamento like', error);
    }
  };

  const handleCommentChange = (postId, text) => {
    setCommentTexts(prevState => ({
      ...prevState,
      [postId]: text
    }));
  };

  const addComment = async (postId) => {
    const commentText = commentTexts[postId] || '';
    if (!commentText.trim()) return;

    const userId = currentUser.uid;
    const commentId = Date.now().toString();

    try {
      await update(ref(db, `posts/${postId}/comments/${commentId}`), {
        userId,
        text: commentText,
      });
      setCommentTexts(prevState => ({
        ...prevState,
        [postId]: ''
      })); 
    } catch (error) {
      console.error('Errore aggiunta commento', error);
    }
  };

  if (!userData) {
    return <div>Caricamento...</div>;
  }
  
  const goToProfile = () => {
    navigate('/profile'); 
  };

  const goToPost = () => {
    navigate('/post'); 
  };
  
  const handleHome = ()=>{
    navigate('/home');
  }
  
  const handleLogout = async () => {
    try {
      await signOut(auth); 
      console.log('User logged out successfully');
      navigate('/'); 
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <div className="user-profile-container">
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
      <h1 className="user-profile-name">{userData.name}</h1>
      <div className="user-posts-container">
        {userPosts.length > 0 ? (
          userPosts.map((post, index) => {
            const likedUsers = post.likedUsers || [];
            const hasLiked = likedUsers.includes(currentUser?.uid);
            const commentText = commentTexts[post.id] || '';

            return (
              <div key={post.id} className="user-post-item">
                <div className="post-header">
                  <div className="track-name">{post.trackName}</div>
                </div>
                <img src={post.imageUrl} alt="Post" className="post-image" />
                <audio
                  controls
                  className="post-audio"
                  ref={(el) => (audioRefs.current[index] = el)}
                  onPlay={() => handlePlay(index)}
                  onError={(e) => console.log(e.target.error)}
                >
                  <source src={post.trackUrl} type="audio/mp3" />
                  Il tuo browser non supporta questo formato audio...
                </audio>
                <p className="post-description">{post.description}</p>
                <div className="post-footer">
                  <button
                    className="like-button"
                    onClick={() => handleLike(post.id, post.likes, likedUsers)}
                  >
                    {hasLiked ? <FaHeart color="red" /> : <FaRegHeart />}
                  </button>
                  <span className="likes-count">{`Likes: ${Math.round(post.likes)}`}</span>
                </div>
                <div className="comments-section">
                  <h4>Commenti:</h4>
                  {Object.values(post.comments || {}).map(comment => (
                    <div key={comment.userId}>
                      <strong>{commentAuthors[comment.userId] || 'Caricamento...'}:</strong> {comment.text}
                    </div>
                  ))}
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                    placeholder="Aggiungi un commento..."
                  />
                  <button onClick={() => addComment(post.id)}>Invia</button>
                </div>
              </div>
            );
          })
        ) : (
          <p>Nessun post trovato.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
