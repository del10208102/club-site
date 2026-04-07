import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { verifyAdminCredentials, usingDevDefaultPassword } from '$lib/server/admin-auth';
import { createAdminSession } from '$lib/server/session';

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
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7
		});

		const r = url.searchParams.get('redirectTo');
		redirect(303, r && r.startsWith('/') && !r.startsWith('//') ? r : '/admin');
	}
};
