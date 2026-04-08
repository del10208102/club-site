import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { usingDevDefaultPassword } from '$lib/server/admin-auth';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.admin) {
		const r = url.searchParams.get('redirectTo');
		redirect(303, r && r.startsWith('/') && !r.startsWith('//') ? r : '/admin');
	}
	return {
		devDefaultLogin: usingDevDefaultPassword()
	};
};
