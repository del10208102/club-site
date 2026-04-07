import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import bcrypt from 'bcryptjs';
import { addGuestUser, getGuestByUsername } from '$lib/server/store';
import { validateGuestUsername, validateGuestPassword } from '$lib/server/guest-auth';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	const username = typeof body.username === 'string' ? body.username : '';
	const password = typeof body.password === 'string' ? body.password : '';

	const uErr = validateGuestUsername(username);
	if (uErr) error(400, uErr);
	const pErr = validateGuestPassword(password);
	if (pErr) error(400, pErr);

	if (getGuestByUsername(username)) error(400, '该用户名已被注册');

	const password_hash = bcrypt.hashSync(password, 10);
	const id = addGuestUser(username, password_hash);
	return json({ ok: true, id });
};
