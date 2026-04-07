import { readAdminSession } from '$lib/server/session';
import { readGuestSession, guestCookieName } from '$lib/server/guest-session';
import { getGuestById } from '$lib/server/store';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const s = readAdminSession(event.cookies.get('club_session'));
	event.locals.admin = s.ok;
	event.locals.adminUser = s.username;

	const gs = readGuestSession(event.cookies.get(guestCookieName()));
	if (gs.ok) {
		const u = getGuestById(gs.userId);
		if (u) {
			event.locals.guest = { id: u.id, username: u.username };
		} else {
			event.locals.guest = null;
		}
	} else {
		event.locals.guest = null;
	}

	return resolve(event);
};
