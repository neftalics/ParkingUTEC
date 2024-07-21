import { checkRole } from '$lib/auth';

export const load = async (event) => { // Asegúrate de que `event` se pase correctamente
  console.log('Load event:', event); // Agrega esta línea para depuración

  const roleCheck = checkRole(event, 'admin');
  if (roleCheck) {
    return roleCheck;
  }

  return {
    props: {
      message: 'Welcome, Admin!',
    }
  };
};
