import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyAdminCredentials } from '$lib/server/admin-auth';
import { createAdminSession } from '$lib/server/session';
import { env } from '$env/dynamic/private';
import { cookieSecureFromRequest } from '$lib/server/cookie-options';

/** JSON 登录：避免在部分反代环境下表单 POST 触发 SvelteKit CSRF 403（与访客 /api/auth/guest/login 一致）。 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json().catch(() => ({}));
	const username = typeof body.username === 'string' ? body.username : '';
	const password = typeof body.password === 'string' ? body.password : '';

	const hasPassword =
		!!env.ADMIN_PASSWORD_HASH?.trim() || !!env.ADMIN_PASSWORD?.trim();
	if (process.env.NODE_ENV === 'production' && !hasPassword) {
		error(
			503,
			'服务器未配置管理员密码：请在 .env 中设置 ADMIN_PASSWORD 或 ADMIN_PASSWORD_HASH 并重启 Node 进程。'
		);
	}

	if (!verifyAdminCredentials(username, password)) {
		await new Promise((r) => setTimeout(r, 400));
		error(400, '账号或密码错误');
	}

	let token: string;
	try {
		token = createAdminSession(username);
	} catch {
		error(500, '服务器未配置 SESSION_SECRET（生产环境必填）');
	}

	cookies.set('club_session', token, {
		path: '/',
		httpOnly: true,
		secure: cookieSecureFromRequest(request),
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7
	});

	const rawRedirect = typeof body.redirectTo === 'string' ? body.redirectTo : '';
	const redirectTo =
		rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/admin';

	return json({ ok: true, redirectTo });
};
