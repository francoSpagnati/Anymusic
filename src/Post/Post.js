import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { storage, db, auth } from '../services/firebaseConfig';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, set, get } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid'; // Importa la libreria uuid
import { IoHomeSharp } from "react-icons/io5";
import {FaUser,FaMusic} from 'react-icons/fa'; 
import './Post.css'; // Assicurati di avere questo file CSS per lo stile

const PostTrack = () => {
  const [track, setTrack] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [trackName, setTrackName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!auth.currentUser) {
      setMessage('Devi essere autenticato per postare');
      setLoading(false);
      return;
    }

    try {
      if (!track || !image || !trackName) {
        throw new Error('Traccia, immagine, o nome della traccia mancante');
      }

      // Genera identificatori unici per l'immagine e la traccia
      const uniqueImageName = `${uuidv4()}_${image.name}`;
      const uniqueTrackName = `${uuidv4()}_${track.name}`;

      // Carica l'immagine
      const imageStorageRef = storageRef(storage, `images/${uniqueImageName}`);
      await uploadBytes(imageStorageRef, image);
      const imageUrl = await getDownloadURL(imageStorageRef);

      // Carica la traccia
      const trackStorageRef = storageRef(storage, `tracks/${uniqueTrackName}`);
      await uploadBytes(trackStorageRef, track);
      const trackUrl = await getDownloadURL(trackStorageRef);

      // Genera un ID unico per il post
      const postId = Date.now().toString();

      // Recupera il nome dell'utente dal database
      const userRef = dbRef(db, 'users/' + auth.currentUser.uid);
      const userSnapshot = await get(userRef);
      const userName = userSnapshot.val().name;

      // Salva il post nel Realtime Database
      await set(dbRef(db, 'posts/' + postId), {
        trackUrl,
        imageUrl,
        description,
        trackName,
        createdAt: new Date().toISOString(),
        userId: auth.currentUser.uid,
        userName, // Salva il nome dell'utente
        likes: 0,
        likedUsers: [], 
      });

      setMessage('Post aggiunto correttamente');
      setTimeout(() => navigate('/home'), 2000);
    } catch (error) {
      console.error('Errore aggiunta post:', error);
      setMessage(`Errore nell'aggiungere il post prova nuovamente: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleHome = ()=>{
    navigate('/home');
  }
  const goToProfile = () => {
    navigate('/profile'); 
  };
  const handleLogout = async () => {
    try {
      await signOut(auth); 
      console.log('user loggato correttamente');
      navigate('/'); 
    } catch (error) {
      console.error('Errore di logout:', error.message);
    }
  };
  const goToPost = () => {
    navigate('/post'); 
  };
  return (
    <div className="post-page">
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
    <div className="post-track-container">
      <h2>Post a Track</h2>
      <form onSubmit={handlePost} className="post-track-form">
        <label htmlFor="trackName">Nome della tua traccia</label>
        <input
          type="text"
          id="trackName"
          value={trackName}
          onChange={(e) => setTrackName(e.target.value)}
          required
        />

        <label htmlFor="track">Carica la tua traccia (File audio)</label>
        <input
          type="file"
          id="track"
          accept="audio/*"
          onChange={(e) => setTrack(e.target.files[0])}
          required
        />

        <label htmlFor="image">Carica la tua immagine di copertina</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />

        <label htmlFor="description">Scrivi una descrizione per la tua traccia</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>

        <button type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>

      {loading && <div className="loading-overlay">Posting...</div>}
      {message && <p className="message">{message}</p>}
    </div>
    </div>
  );
};

export default PostTrack;