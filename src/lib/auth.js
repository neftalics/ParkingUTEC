export function checkRole(event, requiredRole) {
    const user = event.locals?.user; // Uso de optional chaining para evitar errores si `locals` es undefined
    if (!user || user.role !== requiredRole) {
      return {
        status: 403,
        body: 'Forbidden',
      };
    }
    return null;
  }