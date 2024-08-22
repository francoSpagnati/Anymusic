import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { FaUser, FaMusic } from 'react-icons/fa'; 
import { db, auth } from '../services/firebaseConfig';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { update } from 'firebase/database';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostsList from '../PostList/PostList';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [commentText, setCommentText] = useState('');
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const audioRefs = useRef({});

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
    loadMorePosts();
  }, []);

  const loadMorePosts = async () => {
    const postsRef = query(ref(db, 'posts'), orderByChild('createdAt'));
    onValue(postsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const newPosts = Object.keys(data)
                .map(key => ({ id: key, ...data[key] }))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setPosts(prevPosts => {
                // Filtra i nuovi post in modo da evitare duplicati
                const filteredPosts = newPosts.filter(newPost => 
                    !prevPosts.some(existingPost => existingPost.id === newPost.id)
                );
                
                return [...prevPosts, ...filteredPosts];
            });

            // Gestisci la fine del caricamento
            if (newPosts.length === 0 || newPosts.length < 10) { 
                setHasMore(false);
            }
        }
    });
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
        console.error('Error playing audio:', error);
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
      console.error('Error updating likes:', error);
    }
  };

  const addComment = async (postId) => {
    if (!commentText.trim()) return;

    const userId = currentUser.uid;

    const commentId = Date.now().toString(); 

    try {
      await update(ref(db, `posts/${postId}/comments/${commentId}`), {
        userId,
        text: commentText,
      });
      setCommentText(''); // Resetta il campo di input
    } catch (error) {
      console.error('Error adding comment:', error);
    }
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
      
      <InfiniteScroll
        dataLength={posts.length}
        next={loadMorePosts}
        hasMore={hasMore}
        loader={<h4>Caricando altri post...</h4>}
        endMessage={ <center><p>Non ci sono altri post</p></center>}
      >
        <PostsList
          posts={posts}
          users={users}
          handleLike={handleLike}
          handlePlay={handlePlay}
          handleError={(e) => console.log(e)}
          addComment={addComment}
          commentText={commentText}
          setCommentText={setCommentText}
        />
      </InfiniteScroll>
    </div>
  );
};

export default Home;
