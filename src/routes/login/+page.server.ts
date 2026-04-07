import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { verifyAdminCredentials, usingDevDefaultPassword } from '$lib/server/admin-auth';
import { createAdminSession } from '$lib/server/session';
import { env } from '$env/dynamic/private';
import { cookieSecureFromRequest } from '$lib/server/cookie-options';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.admin) {
		const r = url.searchParams.get('redirectTo');
		redirect(303, r && r.startsWith('/') && !r.startsWith('//') ? r : '/admin');
	}
	return {
		devDefaultLogin: usingDevDefaultPassword()
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const fd = await request.formData();
		const username = String(fd.get('username') ?? '');
		const password = String(fd.get('password') ?? '');

		const hasPassword =
			!!env.ADMIN_PASSWORD_HASH?.trim() || !!env.ADMIN_PASSWORD?.trim();
		if (process.env.NODE_ENV === 'production' && !hasPassword) {
			return fail(503, {
				message:
					'服务器未配置管理员密码：请在 .env 中设置 ADMIN_PASSWORD 或 ADMIN_PASSWORD_HASH 并重启 Node 进程。'
			});
		}

		if (!verifyAdminCredentials(username, password)) {
			await new Promise((r) => setTimeout(r, 400));
			return fail(400, { message: '账号或密码错误' });
		}

		let token: string;
		try {
			token = createAdminSession(username);
		} catch {
			return fail(500, { message: '服务器未配置 SESSION_SECRET（生产环境必填）' });
		}

		cookies.set('club_session', token, {
			path: '/',
			httpOnly: true,
			secure: cookieSecureFromRequest(request),
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7
		});

		const r = url.searchParams.get('redirectTo');
		redirect(303, r && r.startsWith('/') && !r.startsWith('//') ? r : '/admin');
	}
};
