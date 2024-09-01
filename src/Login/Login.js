import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import './Login.css';

const Login = () => {
  //stati
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();
  //handler per il login utente controllo mail e password
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User loggato con successo');
      navigate('/home');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  //handler per il login di google
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const username = user.email.split('@')[0];
      //aggiorna DB per avere un username 
      await set(ref(db, 'users/' + user.uid), {
        name: username,
        email: user.email,
      });

      console.log('user loggato con google e salvato correttamente sul db');
      navigate('/home');

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  //handler per il reset della password
  const handlePasswordReset = async () => {
    if (!email) {
      setError('Inserisci la tua mail per resettare la password');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setError(null);
    } catch (error) {
      setError(error.message);
    }

  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-page">
      <header className="home-bar">
        <h1>AnyMusic</h1>
      </header>
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Login</h2>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="email-input"
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
            className="password-input"
          />
          {error && <p className="error-message">{error}</p>}
          {resetEmailSent && <p className="success-message">Password Reset inviata per mail controlla la tua casella di posta</p>}
          <div className="button-container">
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <button type="submit" className="login-button">Login</button>
                <button type="button" onClick={goToRegister} className="register-button">Register</button>
              </>
            )}
          </div>
          <button type="button" onClick={handlePasswordReset} className="forgot-password-button">Ho dimenticato la password</button>
          <hr className="divider" />
          <div className="or-container">
            <center>
              <span className="or-text">OR</span>
            </center>
          </div>
          <div className="google-login-container">
            <center>
              <button type="button" onClick={handleGoogleLogin} className="google-login-button">Login with Google</button>
            </center>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
