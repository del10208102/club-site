import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { guestCookieName } from '$lib/server/guest-session';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete(guestCookieName(), { path: '/' });
	return json({ ok: true });
};
