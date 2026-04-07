import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { guestCookieName } from '$lib/server/guest-session';
import { cookieSecureFromRequest } from '$lib/server/cookie-options';

/** 删除 Cookie 时须与 set 时 path/secure/sameSite 一致，否则浏览器不会清除（常见于 HTTPS 反代）。 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	cookies.delete(guestCookieName(), {
		path: '/',
		secure: cookieSecureFromRequest(request),
		sameSite: 'lax'
	});
	return json({ ok: true });
};
