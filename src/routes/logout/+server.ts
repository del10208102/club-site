import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cookieSecureFromRequest } from '$lib/server/cookie-options';

export const GET: RequestHandler = ({ request, cookies }) => {
	cookies.delete('club_session', {
		path: '/',
		secure: cookieSecureFromRequest(request),
		sameSite: 'lax'
	});
	redirect(303, '/');
};
