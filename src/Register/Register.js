//import
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { set, ref as dbRef } from 'firebase/database';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //gestione registrazione di un nuovo utente su firebase
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // salvo nome utente nel db
      await set(dbRef(db, 'users/' + user.uid), {
        name,
        email,
      });

      console.log('User registrato con successo');
      navigate('/home');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Registrazione fallita: email già registrata.');
      } else if (error.code === 'auth/weak-password') {
        setError('Registrazione fallita: la password è troppo debole.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Registrazione fallita: l\'email non è valida.');
      } else {
        setError('Registrazione fallita: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigate('/');
  };

  return (
    <div className='login-page'>
      <header className="homepage-header">
        <h1>AnyMusic</h1>
      </header>
      {error && <p className="error-message">{error}</p>}
      <div className='login-container'>
      <form onSubmit={handleRegister} className='login-form'>

        <h2><center>Register</center></h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        
        <div className='button-container'>
          {loading ? (
            <div className="spinner"></div>) : (<>
              <button type="submit" className='login-button'>Register</button>
              <button type="button" onClick={goToLogin} className='login-button'>Login</button>
            </>
          )}
        </div>
      </form>

      </div>
    </div>
  );
};

export default Register;