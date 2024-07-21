import { admin, db } from '$lib/firebaseAdmin';

export async function handle({ event, resolve }) {
console.log('Handling request for:', event.url.pathname);

const authHeader = event.request.headers.get('authorization');
console.log('Authorization header:', authHeader);

if (authHeader) {
const token = authHeader.split('Bearer ')[1];
try {
	const decodedToken = await admin.auth().verifyIdToken(token);
	event.locals.user = decodedToken;

	// Obtén el rol del usuario desde Firestore
	const userRoleDoc = await db.collection('users').doc(decodedToken.uid).get();
	if (userRoleDoc.exists) {
	const userRole = userRoleDoc.data().Role;
	event.locals.userRole = userRole;
	console.log('User role:', userRole);

	// Redirige a la página de inicio si es admin y está en la página de login
	if (userRole === 'admin' && event.url.pathname === '/Login') {
		console.log('User is admin, redirecting to Home');
		return Response.redirect(new URL('/Home', event.url));
	}
	} else {
	event.locals.userRole = null;
	}
} catch (error) {
	console.error('Error verifying token:', error);
	event.locals.user = null;
	event.locals.userRole = null;
}
} else {
event.locals.user = null;
event.locals.userRole = null;
}

// Redirige a la página de login si no está autenticado
if (!event.locals.user) {
console.log('No user found, redirecting to Login');
if (event.url.pathname !== '/Login') {
	return Response.redirect(new URL('/Login', event.url));
}
} else {
// Redirige a la página de inicio si está autenticado y no es admin
if (event.url.pathname === '/Login') {
	console.log('User authenticated , redirecting to Home');
	return Response.redirect(new URL('/Home', event.url));
}
}

const response = await resolve(event);

// Configura encabezados de seguridad
response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');

return response;
}
