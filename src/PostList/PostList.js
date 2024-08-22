import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../services/firebaseConfig';
import { ref, onValue, query, orderByChild, update } from 'firebase/database';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Importa le icone del cuore
import './PostList.css';

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  
  const audioRefs = useRef({});
  const currentUser = auth.currentUser;

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
            setPosts(postsData);
          } else {
            setPosts([]);
          }
        });
      } catch (error) {
        console.error('Error fetching posts: ', error);
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
        console.error('Error playing audio:', error);
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
      console.error('Error updating likes:', error);
    }
  };

  return (
    <div className="posts-container">
      {posts.map((post, index) => {
        const likedUsers = post.likedUsers || [];
        const hasLiked = likedUsers.includes(currentUser?.uid);

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
              Your browser does not support the audio element.
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
          </div>
        );
      })}
    </div>
  );
};

export default PostsList;