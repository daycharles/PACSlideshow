import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './modalStyle.css';
import PACLogo from './images/PACLogo.jpg';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleShowSignupModal = () => setShowSignupModal(true);
  const handleCloseSignupModal = () => setShowSignupModal(false);

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newEmail, newPassword);
      const user = userCredential.user;
      handleAddUser();
      handleCloseSignupModal();
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const docRef = await addDoc(usersCollection, {
        name: 'John Doe',
        email: 'john.doe@example.com'
      });
      console.log('Document written with ID: ', docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, username, password);
      setLoggedIn(true);
    } catch (error) {
      alert("Invalid login " + error);
      console.error('Error logging in:', error);
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const handleImageChange = (e) => {
    const fileList = Array.from(e.target.files);
    const fileURLs = fileList.map((file) => URL.createObjectURL(file));
    setImages([...images, ...fileURLs]);
  };

  const startSlideshow = () => {
    setIsFullscreen(true);
    document.documentElement.requestFullscreen().catch(console.error);
    document.body.style.overflow = 'hidden';  // Hide scrollbar on body
  };  

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const onDragStart = (e, index) => {
    e.dataTransfer.setData("srcIndex", index);
  };

  const onDrop = (e, targetIndex) => {
    const srcIndex = e.dataTransfer.getData("srcIndex");
    const reorderedImages = [...images];
    [reorderedImages[srcIndex], reorderedImages[targetIndex]] = [reorderedImages[targetIndex], reorderedImages[srcIndex]];
    setImages(reorderedImages);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        document.body.style.overflow = 'auto';  // Show scrollbar on body
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    let timer;
    if (isFullscreen && images.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isFullscreen, images]);

  if (!loggedIn) {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="login-container text-center w-50">
          <div className="login-logo-placeholder">
          <img src={PACLogo} alt='PAC Logo' style={{height:'150px', width:'150px'}}/>
          </div>
          <h1>Login</h1>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <button className="btn btn-primary" onClick={handleLogin}>
            Login
          </button>
          <button className="btn btn-default" onClick={handleShowSignupModal}>Sign Up</button>
          <Modal show={showSignupModal} onHide={handleCloseSignupModal}>
            <Modal.Header className='modal-header' closeButton>
              <Modal.Title>Sign Up</Modal.Title>
            </Modal.Header>
            <Modal.Body className='modal-body'>
              <input type='text' placeholder='Email' value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className='input-field' />
              <input type='password' placeholder='Password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className='input-field' />
            </Modal.Body>
            <Modal.Footer className='modal-footer'>
              <Button variant='primary' className='signup-button'>Sign Up</Button>
            </Modal.Footer>
          </Modal>
        </div>
        <div>
          
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="taskbar">
      <div className="logo-placeholder">
      <img src={PACLogo} alt='PAC Logo' style={{height:'50px', width:'50px'}}/>
      </div>
      <div className="user-info">
        <span>{username}</span>
        <span className="logout-button" onClick={handleLogout}>
          Logout
        </span>
      </div>
    </div>
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="text-center w-50">
          <h1>Slideshow App</h1>
          <input type="file" multiple onChange={handleImageChange} className="d-none" id="fileInput" />
          <button className="btn btn-primary" onClick={() => document.getElementById('fileInput').click()}>
            Upload Images
          </button>
          <div className="image-container">
            {images.map((src, index) => (
              <div
                className="image-box"
                key={index}
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, index)}
              >
                <img src={src} alt={`Slide ${index}`} className="image-thumb" />
                <div className="delete-icon" onClick={() => removeImage(index)}>
                  ×
                </div>
              </div>
            ))}
          </div>
          {images.length > 0 && (
            <button className="btn btn-success mt-3" onClick={startSlideshow}>
              Start Slideshow
            </button>
          )}
          {isFullscreen && (
            <div className="fullscreen">
              <img src={images[currentIndex]} alt={`Slide ${currentIndex}`} className="slideshow-image" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
