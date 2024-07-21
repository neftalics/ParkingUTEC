import { resetTimeout, userActivityTimeout } from './login';

export const monitorUserActivity = () => {
    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    const resetUserActivityTimeout = () => {
        resetTimeout();
    };
    
    const addEventListeners = () => {
        events.forEach(event => {
            window.addEventListener(event, resetUserActivityTimeout);
        });
    };
    
    const removeEventListeners = () => {
        events.forEach(event => {
            window.removeEventListener(event, resetUserActivityTimeout);
        });
    };
    
    addEventListeners();
    
    // El temporizador de inactividad del usuario se gestiona en `resetTimeout`
    // No es necesario almacenar el ID del temporizador en el store, simplemente
    // usa `clearTimeout` en `resetTimeout`.

    return () => {
        removeEventListeners();
        // En lugar de limpiar `userActivityTimeout`, simplemente asegúrate de que `resetTimeout`
        // maneja el tiempo de espera adecuadamente.
    };
};
