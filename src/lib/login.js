import { writable } from 'svelte/store';
import { goto } from '$app/navigation';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export const currentUser = writable(null);
export const errorMessage = writable('');
export const userActivityTimeout = writable(null);
export const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutos

export const resetTimeout = () => {
  userActivityTimeout.update(timeout => {
    clearTimeout(timeout);
    return setTimeout(() => {
      auth.signOut().then(() => {
        currentUser.set(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
        goto('/Login');
      }).catch(error => {
        console.error('Error al cerrar sesión: ', error);
      });
    }, SESSION_TIMEOUT);
  });
};

export const initializeAuth = () => {
  const unsubscribe = auth.onAuthStateChanged(user => {
    console.log('Usuario autenticado:', user); // Verifica el usuario autenticado

    if (user) {
      if (user.email.endsWith('@utec.edu.pe')) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user' // Puedes actualizar el rol aquí
        };
        currentUser.set(userData);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        resetTimeout();
        if (window.location.pathname !== '/Home') {
          goto('/Home');
        }
      } else {
        auth.signOut();
        resetTimeout();
        localStorage.removeItem('user');
        currentUser.set(null);
        errorMessage.set('El dominio de su correo electrónico no está permitido.');
      }
    } else {
      resetTimeout();
      localStorage.removeItem('user');
      currentUser.set(null);
      if (window.location.pathname !== '/Login') {
        goto('/Login');
      }
    }
  });

  return unsubscribe;
};

export const handleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user.email.endsWith('@utec.edu.pe')) {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'user'
      };
      currentUser.set(userData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      resetTimeout();
      goto('/Home');
    } else {
      await auth.signOut();
      errorMessage.set('El dominio de su correo electrónico no está permitido.');
    }
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    errorMessage.set('Error al iniciar sesión. Por favor, intente de nuevo.');
  }
};

export const handleLogout = async () => {
  try {
    await auth.signOut();
    currentUser.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    clearTimeout(userActivityTimeout);
    goto('/Login');
    console.log('Usuario cerró sesión');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    errorMessage.set('Error al cerrar sesión.');
  }
};
