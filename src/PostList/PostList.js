import React, { useRef } from 'react';
import {auth } from '../services/firebaseConfig';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; 
import './PostList.css';

const PostsList = ({ posts, users, handleLike, handlePlay, handleError, addComment, commentText, setCommentText }) => {
  const audioRefs = useRef({});
  const currentUser = auth.currentUser;

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
                onChange={(e) => setCommentText(e.target.value)}
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
