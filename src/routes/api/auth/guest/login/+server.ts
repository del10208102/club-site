import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import bcrypt from 'bcryptjs';
import { getGuestByUsername } from '$lib/server/store';
import { createGuestSession, guestCookieName } from '$lib/server/guest-session';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json().catch(() => ({}));
	const username = typeof body.username === 'string' ? body.username : '';
	const password = typeof body.password === 'string' ? body.password : '';
	if (!username.trim() || !password) error(400, '请输入用户名和密码');

	const user = getGuestByUsername(username);
	await new Promise((r) => setTimeout(r, 400));
	if (!user || !bcrypt.compareSync(password, user.password_hash)) {
		error(400, '用户名或密码错误');
	}

	let token: string;
	try {
		token = createGuestSession(user.id);
	} catch {
		error(500, '服务器未配置 SESSION_SECRET（生产环境必填）');
	}

	cookies.set(guestCookieName(), token, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30
	});

	return json({ ok: true, username: user.username });
};
