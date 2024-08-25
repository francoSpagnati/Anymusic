import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../services/firebaseConfig';
import { ref, onValue, query, orderByChild, update } from 'firebase/database';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Importa le icone del cuore
import './PostList.css';

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState({}); // Stato per memorizzare gli username
  const [commentTexts, setCommentTexts] = useState({}); // Stato per memorizzare il testo del commento per ogni post
  const previousPostCount = useRef(0); // Per tracciare il numero di post precedenti

  const audioRefs = useRef({});
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = ref(db, 'users');
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        setUsers(data || {});
      });
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRef = query(ref(db, 'posts'), orderByChild('createdAt'));
        onValue(postsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const postsData = Object.keys(data)
              .map(key => ({ id: key, ...data[key] }))
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              // Mostra la notifica se c'è un nuovo post
            if (previousPostCount.current < postsData.length) {
              const newPost = postsData[0]; 
              showNotification(newPost);
            }

            previousPostCount.current = postsData.length;
            setPosts(postsData);
          } else {
            setPosts([]);
          }
        });
      } catch (error) {
        console.error('Errore caricamento post', error);
      }
    };

    fetchPosts();
  }, []);

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

  const handleError = (event) => {
    const error = event.target.error;
    console.log(error);
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
  const showNotification = (post) => {
    if (!("Notification" in window)) {
      alert("Questo browser non supporta le notifiche desktop");
    } else if (Notification.permission === "granted") {
      new Notification("Nuovo post!", {
        lang: "it",
        body: `Un nuovo post è stato creato da ${post.userName}: ${post.trackName}`,
        icon: "icon_url.png",
        vibrate: [200, 100, 200],
        image: post.imageUrl,
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Nuovo post!", {
            lang: "it",
            body: `Un nuovo post è stato creato da ${post.userName}: ${post.trackName}`,
            icon: "icon_url.png",
            vibrate: [200, 100, 200],
            image: post.imageUrl,
          });
        }
      });
    }
  };

  return (
    <div className="posts-container">
      {posts.map((post, index) => {
        const likedUsers = post.likedUsers || [];
        const hasLiked = likedUsers.includes(currentUser?.uid);
        const commentText = commentTexts[post.id] || '';

        return (
          <div key={post.id} className="post-item">
            <div className="post-header">
              <div className="user-name">{post.userName}</div>
              <div className="track-name">{post.trackName}</div>
            </div>
            <img src={post.imageUrl} alt="Post" className="post-image" />
            <audio
              controls
              className="post-audio"
              ref={(el) => (audioRefs.current[index] = el)}
              onPlay={() => handlePlay(index)}
              onError={handleError}
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
                  <strong>{users[comment.userId]?.name || 'Utente sconosciuto'}:</strong> {comment.text}
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
      })}
    </div>
  );
};

export default PostsList;
