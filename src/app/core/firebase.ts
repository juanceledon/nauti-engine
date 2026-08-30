import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: 'AIzaSyBYIZxBJJxspO3-aV0026SWeG0yPiZ8eUs',
  authDomain: 'nauti-backend.firebaseapp.com',
  projectId: 'nauti-backend',
  storageBucket: 'nauti-backend.firebasestorage.app',
  messagingSenderId: '333078302263',
  appId: '1:333078302263:web:5bd19416b77325198d39b2',
  measurementId: 'G-FS0Z0CDE41',
};

const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
