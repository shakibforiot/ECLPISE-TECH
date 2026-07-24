import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

/**
 * Supplied Firebase project configuration.
 *
 * A Realtime Database URL is required by getDatabase(). If this project's
 * RTDB was created in another region, replace databaseURL with its console
 * value before deployment.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyAdFUigpJxj-yqzuxWSbqFSyvoK1jMfSr4',
  authDomain: 'sellling-4f079.firebaseapp.com',
  databaseURL: 'https://sellling-4f079-default-rtdb.firebaseio.com',
  projectId: 'sellling-4f079',
  storageBucket: 'sellling-4f079.firebasestorage.app',
  messagingSenderId: '1066936718220',
  appId: '1:1066936718220:web:228ae640bc186c62d27ca9',
  measurementId: 'G-9XWVTDT23F',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export { firebaseConfig };
export default app;