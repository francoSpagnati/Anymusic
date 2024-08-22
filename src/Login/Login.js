import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully');
      navigate('/home');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Estrai la parte prima della chiocciola dall'email per ottenere il nome utente
      const username = user.email.split('@')[0];
      
      // Salva l'utente nel database
      await set(ref(db, 'users/' + user.uid), {
        name: username,
        email: user.email,
      });
      
      console.log('User logged in with Google and added to database successfully');
      navigate('/home');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
          <hr className="divider" />
          <div className="or-container">
          <center>
            <span className="or-text">OR</span>
            </center>
          </div>
          <div className="google-login-container">
          <center>
            <button type="button" onClick={handleGoogleLogin} className="google-login-button">
              Login with Google
            </button>
            </center>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;